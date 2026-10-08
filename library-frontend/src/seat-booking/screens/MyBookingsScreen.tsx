import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CampusBreadcrumb } from '../components/CampusBreadcrumb';
import { QrCheckInModal } from '../components/QrCheckInModal';
import { ReadingRoomsHeader } from '../components/ReadingRoomsHeader';
import { ReservationCard } from '../components/ReservationCard';
import { SeatBottomNav, TabName } from '../components/SeatBottomNav';
import { Colors, Shadows } from '../constants/designSystem';
import { ALL_LIBRARY_SLOTS, MOCK_ROOMS } from '../mock/roomsData';
import { useBookingStore } from '../store/bookingStore';
import { Booking, ReservationItem } from '../types/seatBooking';

const BACKEND_CANCEL_URL = 'http://localhost:5000/api/reservations';

// ─────────────────────────────────────────────────────────────────────────────
// Helper — convert a store Booking into the shape ReservationCard expects
// ─────────────────────────────────────────────────────────────────────────────
function bookingToReservationItem(b: Booking): ReservationItem {
  const room = MOCK_ROOMS.find((r) => r.code === b.roomCode);
  const slot = ALL_LIBRARY_SLOTS.find((s) => s.id === b.slotId);
  const cleanSeat = b.seatNumber.startsWith('Seat') ? b.seatNumber : `Seat ${b.seatNumber}`;

  return {
    _id: b.id,
    seatNumber: cleanSeat,
    roomName: room?.name ?? 'Study Area',
    roomLevel: room?.level ?? 1,
    roomCode: b.roomCode,
    dateLabel: b.dateOption === 'tomorrow' ? 'Tomorrow' : 'Today',
    timeRange: slot?.timeRange ?? b.timeRange,
    durationLabel: '2 Hours Reserved',
    amenitiesLabel: 'AC Outlet + LAN',
    status: 'upcoming',
    passCode: b.id.slice(-4).toUpperCase(),
    startsInLabel: b.dateOption === 'tomorrow' ? 'Tomorrow' : undefined,
    deskDeliveryBook: undefined,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Screen
// ─────────────────────────────────────────────────────────────────────────────
export default function MyBookingsScreen() {
  const { getActiveBookings, cancelBooking, getPastBookings } = useBookingStore();

  const [activeTabSegment, setActiveTabSegment] = useState<'active' | 'past'>('active');
  const [bottomTab, setBottomTab] = useState<TabName>('Bookings');
  const [qrModalVisible, setQrModalVisible] = useState<boolean>(false);
  const [selectedPassReservation, setSelectedPassReservation] =
    useState<ReservationItem | null>(null);

  // ── Active tab data ───────────────────────────────────────────────────────
  // Derived fresh on each render so expired slots disappear automatically.
  const activeBookings = getActiveBookings();
  const reservations: ReservationItem[] = useMemo(
    () => activeBookings.map(bookingToReservationItem),
    [activeBookings]
  );

  // ── Past tab data ─────────────────────────────────────────────────────────
  const pastBookings: Booking[] = useMemo(
    () => getPastBookings(),
    // Re-derive when tab switches so expired slots show up immediately
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [getPastBookings, activeTabSegment]
  );

  const slotEndLabel = (slotId: string) =>
    ALL_LIBRARY_SLOTS.find((s) => s.id === slotId)?.timeRange ?? '—';

  const dateBadge = (dateOption: string) =>
    dateOption === 'tomorrow' ? 'Tomorrow' : 'Today';

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleChangeSeat = (reservation: ReservationItem) => {
    Alert.alert(
      'Change Seat Reservation',
      `Select a new seat to replace ${reservation.seatNumber}. Your current booking will be cancelled automatically when you confirm the new one.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Select New Seat',
          onPress: () =>
            router.push({
              pathname: '/seats/matrix',
              params: {
                // Pass the active booking's original room so the grid stays
                // in the same room, and the booking ID so Confirm can replace it.
                roomCode: reservation.roomCode,
                roomName: reservation.roomName,
                replacingBookingId: reservation._id,
              },
            }),
        },
      ]
    );
  };

  const handleCancelBooking = (reservation: ReservationItem) => {
    Alert.alert(
      'Cancel Reservation?',
      `Are you sure you want to cancel your booking for ${reservation.seatNumber}? This space will be released to other students.`,
      [
        { text: 'Keep Booking', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            // Attempt backend cancel (silent on failure)
            try {
              await fetch(`${BACKEND_CANCEL_URL}/${reservation._id}/cancel`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user: '650000000000000000000001' }),
              });
            } catch {
              // Offline — continue anyway
            }

            cancelBooking(reservation._id);
            Alert.alert(
              'Booking Cancelled',
              'Your reservation has been successfully cancelled.'
            );
          },
        },
      ]
    );
  };

  const handleViewPass = (reservation: ReservationItem) => {
    setSelectedPassReservation(reservation);
    setQrModalVisible(true);
  };

  const handleTabPress = (tab: TabName) => {
    setBottomTab(tab);
    if (tab === 'Home') {
      router.push('/seats');
    } else if (tab === 'Alerts') {
      // Pass the first active booking's details if one exists
      const first = reservations[0];
      router.push({
        pathname: '/seats/auto-release-warning',
        params: first
          ? {
              seatNumber: first.seatNumber,
              roomName: first.roomName,
              timeRange: first.timeRange,
            }
          : {},
      });
    }
  };

  // QR modal falls back gracefully when there is no selected reservation
  const qrSeat = selectedPassReservation?.seatNumber ?? '';
  const qrRoom = selectedPassReservation?.roomName ?? '';
  const qrTime = selectedPassReservation?.timeRange ?? '';
  const qrDate = selectedPassReservation?.dateLabel ?? '';
  const qrPass = selectedPassReservation?.passCode ?? '0000';

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      {/* Header */}
      <ReadingRoomsHeader
        onNotificationPress={() => Alert.alert('Notifications', 'No new alerts.')}
        onProfilePress={() => Alert.alert('Profile', 'Student Account #2026-IT')}
      />

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Breadcrumb */}
        <CampusBreadcrumb
          campusName="SLIIT LIBRARY"
          spacesCount="MALABE"
          title="Your Reservations"
          subtitle="Manage upcoming library desk slots and check-in passes."
          onBackPress={() => router.back()}
        />

        {/* Segment selector */}
        <View style={styles.segmentedContainer}>
          <TouchableOpacity
            style={[styles.segmentPill, activeTabSegment === 'active' && styles.segmentActive]}
            onPress={() => setActiveTabSegment('active')}
            activeOpacity={0.8}
          >
            <Ionicons
              name="calendar-outline"
              size={14}
              color={activeTabSegment === 'active' ? Colors.primary : Colors.textSecondary}
            />
            <Text
              style={[
                styles.segmentText,
                activeTabSegment === 'active' ? styles.segmentTextActive : styles.segmentTextInactive,
              ]}
            >
              Active ({reservations.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.segmentPill, activeTabSegment === 'past' && styles.segmentActive]}
            onPress={() => setActiveTabSegment('past')}
            activeOpacity={0.8}
          >
            <Ionicons
              name="time-outline"
              size={14}
              color={activeTabSegment === 'past' ? Colors.primary : Colors.textSecondary}
            />
            <Text
              style={[
                styles.segmentText,
                activeTabSegment === 'past' ? styles.segmentTextActive : styles.segmentTextInactive,
              ]}
            >
              Past History ({pastBookings.length})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Gate sensor bar — only shown when there are active bookings */}
        {reservations.length > 0 && (
          <View style={styles.sensorBar}>
            <View style={styles.sensorInfo}>
              <Ionicons name="checkmark-circle-outline" size={16} color={Colors.success} />
              <Text style={styles.sensorText}>GATE SENSOR STATUS</Text>
            </View>
            <View style={styles.sensorDetails}>
              <Text style={styles.terminalText}>
                SLIIT-WIFI-04 • Terminal #{reservations[0].roomCode}
              </Text>
              <View style={styles.onlineBadge}>
                <View style={styles.greenDot} />
                <Text style={styles.onlineText}>ONLINE</Text>
              </View>
            </View>
          </View>
        )}

        {/* ── Active tab ── */}
        {activeTabSegment === 'active' ? (
          reservations.length > 0 ? (
            reservations.map((res) => (
              <ReservationCard
                key={res._id}
                reservation={res}
                onChangeSeat={handleChangeSeat}
                onCancelBooking={handleCancelBooking}
                onViewPass={handleViewPass}
              />
            ))
          ) : (
            <View style={styles.emptyCard}>
              <View style={styles.emptyIconCircle}>
                <Ionicons name="calendar-clear-outline" size={34} color={Colors.primary} />
              </View>
              <Text style={styles.emptyTitle}>No Active Reservations</Text>
              <Text style={styles.emptySubtitle}>
                You have no upcoming seat bookings. Browse available study rooms and reserve a desk.
              </Text>
              <TouchableOpacity
                style={styles.bookSeatBtn}
                onPress={() => router.push('/seats')}
                activeOpacity={0.85}
              >
                <Ionicons name="search-outline" size={16} color="#FFFFFF" />
                <Text style={styles.bookSeatBtnText}>Book a Seat</Text>
              </TouchableOpacity>
            </View>
          )
        ) : /* ── Past tab ── */
        pastBookings.length === 0 ? (
          <View style={styles.emptyCard}>
            <View style={styles.emptyIconCircle}>
              <Ionicons name="time-outline" size={34} color={Colors.primary} />
            </View>
            <Text style={styles.emptyTitle}>No Past Bookings Yet</Text>
            <Text style={styles.emptySubtitle}>
              Your completed and expired reservations will appear here automatically.
            </Text>
          </View>
        ) : (
          <View style={styles.pastContainer}>
            <View style={styles.pastHeaderRow}>
              <Text style={styles.pastTitle}>Past Booking History</Text>
              <Text style={styles.pastCount}>
                {pastBookings.length} record{pastBookings.length !== 1 ? 's' : ''}
              </Text>
            </View>

            {pastBookings.map((booking, idx) => {
              const isLast = idx === pastBookings.length - 1;
              const isCompleted = booking.dateOption === 'today';
              return (
                <View
                  key={booking.id}
                  style={[styles.pastRow, isLast && styles.pastRowLast]}
                >
                  <View style={styles.pastRowLeft}>
                    <View style={styles.pastIconBox}>
                      <Ionicons name="desktop-outline" size={14} color={Colors.textSecondary} />
                    </View>
                    <View>
                      <Text style={styles.pastSeat}>Seat {booking.seatNumber}</Text>
                      <Text style={styles.pastMeta}>
                        {dateBadge(booking.dateOption)} • {slotEndLabel(booking.slotId)}
                      </Text>
                    </View>
                  </View>
                  <View
                    style={[
                      styles.statusTagBase,
                      isCompleted ? styles.statusTagCompleted : styles.statusTagOngoing,
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusTagText,
                        isCompleted ? styles.statusTagTextCompleted : styles.statusTagTextOngoing,
                      ]}
                    >
                      {isCompleted ? 'COMPLETED' : 'CANCELLED'}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* Campus Attendance Policy */}
        <View style={styles.policyCard}>
          <View style={styles.policyTitleRow}>
            <Ionicons name="information-circle-outline" size={16} color={Colors.primary} />
            <Text style={styles.policyTitle}>CAMPUS ATTENDANCE POLICY</Text>
          </View>
          <View style={styles.bulletItem}>
            <Text style={styles.bulletDot}>•</Text>
            <Text style={styles.bulletText}>
              Check in within <Text style={styles.boldText}>15 minutes</Text> of reservation start
              to avoid automated release.
            </Text>
          </View>
          <View style={styles.bulletItem}>
            <Text style={styles.bulletDot}>•</Text>
            <Text style={styles.bulletText}>
              Two consecutive no-shows temporarily restrict online seat reservations for 48 hours.
            </Text>
          </View>
          <View style={styles.bulletItem}>
            <Text style={styles.bulletDot}>•</Text>
            <Text style={styles.bulletText}>
              Please vacate desk or check out early when finished so peers may use the space.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Sticky QR button — only when there are active reservations */}
      {reservations.length > 0 && (
        <View style={styles.bottomBar}>
          <TouchableOpacity
            style={styles.passButton}
            onPress={() => handleViewPass(reservations[0])}
            activeOpacity={0.8}
          >
            <Ionicons name="qr-code-outline" size={20} color="#FFFFFF" />
            <Text style={styles.passButtonText}>View QR Check-In Pass</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* QR Check-In Pass Modal */}
      <QrCheckInModal
        visible={qrModalVisible}
        seatNumber={qrSeat}
        roomName={qrRoom}
        timeRange={qrTime}
        dateLabel={qrDate}
        passCode={qrPass}
        token={`KSN-${qrSeat.replace(/Seat\s*/i, '')}-${qrPass}`}
        pin={qrPass.padStart(4, '0')}
        onClose={() => {
          setQrModalVisible(false);
          setSelectedPassReservation(null);
        }}
      />

      {/* Bottom Nav */}
      <SeatBottomNav activeTab={bottomTab} onTabPress={handleTabPress} />
    </SafeAreaView>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContainer: {
    flex: 1,
  },
  segmentedContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 4,
    backgroundColor: '#EEF2F6',
    borderRadius: 14,
    gap: 4,
  },
  segmentPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
  },
  segmentActive: {
    backgroundColor: '#FFFFFF',
    ...Shadows.soft,
  },
  segmentText: {
    fontSize: 12,
    fontWeight: '700',
  },
  segmentTextActive: {
    color: Colors.textDark,
  },
  segmentTextInactive: {
    color: Colors.textSecondary,
  },
  // Gate sensor bar
  sensorBar: {
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 12,
    backgroundColor: Colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.soft,
  },
  sensorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  sensorText: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.textSecondary,
    letterSpacing: 0.6,
  },
  sensorDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  terminalText: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.textDark,
  },
  onlineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.successSoft,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  greenDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: Colors.success,
  },
  onlineText: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.success,
  },
  // Empty state
  emptyCard: {
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 32,
    backgroundColor: Colors.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 10,
    ...Shadows.soft,
  },
  emptyIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.textDark,
  },
  emptySubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 19,
    maxWidth: 280,
  },
  bookSeatBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginTop: 6,
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    ...Shadows.soft,
  },
  bookSeatBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  // Past history
  pastContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 16,
    backgroundColor: Colors.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.soft,
  },
  pastHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  pastTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.textDark,
  },
  pastCount: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  pastRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F3F6',
  },
  pastRowLast: {
    borderBottomWidth: 0,
    paddingBottom: 0,
  },
  pastRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  pastIconBox: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: Colors.neutralSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pastSeat: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textDark,
  },
  pastMeta: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  statusTagBase: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    flexShrink: 0,
  },
  statusTagCompleted: {
    backgroundColor: Colors.successSoft,
  },
  statusTagOngoing: {
    backgroundColor: Colors.primarySoft,
  },
  statusTagText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  statusTagTextCompleted: {
    color: Colors.success,
  },
  statusTagTextOngoing: {
    color: Colors.primary,
  },
  // Policy card
  policyCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 16,
    backgroundColor: Colors.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.soft,
  },
  policyTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  policyTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.textDark,
    letterSpacing: 0.6,
  },
  bulletItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 6,
  },
  bulletDot: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '800',
  },
  bulletText: {
    flex: 1,
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 16,
  },
  boldText: {
    fontWeight: '700',
    color: Colors.textDark,
  },
  // Sticky QR bar
  bottomBar: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: Colors.card,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    ...Shadows.soft,
  },
  passButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 14,
  },
  passButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
