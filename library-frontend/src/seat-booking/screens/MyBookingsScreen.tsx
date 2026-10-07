import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
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
import { MOCK_ACTIVE_RESERVATION } from '../mock/roomsData';
import { ReservationItem } from '../types/seatBooking';

const BACKEND_CANCEL_URL = 'http://localhost:5000/api/reservations';

export default function MyBookingsScreen() {
  const params = useLocalSearchParams<{
    seatNumber?: string;
    timeRange?: string;
    dateOption?: string;
    roomName?: string;
  }>();

  const [activeTabSegment, setActiveTabSegment] = useState<'active' | 'past'>('active');
  const [bottomTab, setBottomTab] = useState<TabName>('Bookings');
  const [qrModalVisible, setQrModalVisible] = useState<boolean>(false);

  // Compute active reservation from route params or fallback to initial mock reservation
  const activeReservation: ReservationItem = useMemo(() => {
    if (params.seatNumber) {
      const cleanNum = params.seatNumber.startsWith('Seat') ? params.seatNumber : `Seat ${params.seatNumber}`;
      return {
        _id: `res-${params.seatNumber}`,
        seatNumber: cleanNum,
        roomName: params.roomName || 'Individual Study Area',
        roomLevel: 1,
        roomCode: 'L2-NORTH',
        dateLabel: params.dateOption === 'tomorrow' ? 'Tomorrow' : 'Today',
        timeRange: params.timeRange || '02:30 PM – 04:30 PM',
        durationLabel: '2 Hours Reserved',
        amenitiesLabel: 'AC Outlet + LAN',
        status: 'upcoming',
        passCode: '9982',
        startsInLabel: 'Starts in 22 mins',
        deskDeliveryBook: 'Software Architecture: Foundations',
      };
    }
    return MOCK_ACTIVE_RESERVATION;
  }, [params.seatNumber, params.timeRange, params.dateOption, params.roomName]);

  const [userCancelledId, setUserCancelledId] = useState<string | null>(null);
  const [selectedPassReservation, setSelectedPassReservation] = useState<ReservationItem | null>(null);

  const reservations = useMemo(() => {
    if (userCancelledId === activeReservation._id) {
      return [];
    }
    return [activeReservation];
  }, [activeReservation, userCancelledId]);

  const handleChangeSeat = (reservation: ReservationItem) => {
    Alert.alert(
      'Change Seat Reservation',
      `Modify seat or time slot for ${reservation.seatNumber}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Select New Seat',
          onPress: () => {
            router.push('/seats/matrix');
          },
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
            try {
              await fetch(`${BACKEND_CANCEL_URL}/${reservation._id}/cancel`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user: '650000000000000000000001' }),
              });
            } catch {
              // Ignore backend offline errors
            }

            setUserCancelledId(reservation._id);
            Alert.alert('Booking Cancelled', 'Your reservation has been successfully cancelled.');
          },
        },
      ]
    );
  };

  const handleViewPass = (reservation: ReservationItem) => {
    setSelectedPassReservation(reservation);
    setQrModalVisible(true);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      {/* Top Header */}
      <ReadingRoomsHeader
        onNotificationPress={() => Alert.alert('Notifications', 'No new alerts.')}
        onProfilePress={() => Alert.alert('Profile', 'Student Account #2026-IT')}
      />

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Breadcrumb Header */}
        <CampusBreadcrumb
          campusName="SLIIT LIBRARY"
          spacesCount="MALABE"
          title="Your Reservations"
          subtitle="Manage upcoming library desk slots and check-in passes."
          onBackPress={() => router.back()}
        />

        {/* Segmented Active / Past Tabs */}
        <View style={styles.segmentedContainer}>
          <TouchableOpacity
            style={[
              styles.segmentPill,
              activeTabSegment === 'active' && styles.segmentActive,
            ]}
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
                activeTabSegment === 'active'
                  ? styles.segmentTextActive
                  : styles.segmentTextInactive,
              ]}
            >
              Active ({reservations.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.segmentPill,
              activeTabSegment === 'past' && styles.segmentActive,
            ]}
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
                activeTabSegment === 'past'
                  ? styles.segmentTextActive
                  : styles.segmentTextInactive,
              ]}
            >
              Past History (4)
            </Text>
          </TouchableOpacity>
        </View>

        {/* Gate Sensor Status Bar */}
        <View style={styles.sensorBar}>
          <View style={styles.sensorInfo}>
            <Ionicons name="checkmark-circle-outline" size={16} color={Colors.success} />
            <Text style={styles.sensorText}>GATE SENSOR STATUS</Text>
          </View>

          <View style={styles.sensorDetails}>
            <Text style={styles.terminalText}>SLIIT-WIFI-04 • Terminal #L2-N</Text>
            <View style={styles.onlineBadge}>
              <View style={styles.greenDot} />
              <Text style={styles.onlineText}>ONLINE</Text>
            </View>
          </View>
        </View>

        {/* Active Reservations List */}
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
              <Ionicons name="calendar-clear-outline" size={32} color={Colors.textSecondary} />
              <Text style={styles.emptyTitle}>No Active Reservations</Text>
              <Text style={styles.emptySubtitle}>
                You currently have no upcoming seat bookings. Explore study rooms to select a desk!
              </Text>
            </View>
          )
        ) : (
          <View style={styles.pastContainer}>
            <Text style={styles.pastTitle}>Past Booking History</Text>
            <View style={styles.pastRow}>
              <Text style={styles.pastSeat}>Seat A-04 (Oct 20, 09:00 - 11:00)</Text>
              <Text style={styles.completedTag}>COMPLETED</Text>
            </View>
            <View style={styles.pastRow}>
              <Text style={styles.pastSeat}>Seat B-12 (Oct 18, 13:00 - 15:00)</Text>
              <Text style={styles.completedTag}>COMPLETED</Text>
            </View>
            <View style={styles.pastRow}>
              <Text style={styles.pastSeat}>Seat A-02 (Oct 14, 10:00 - 12:00)</Text>
              <Text style={styles.completedTag}>COMPLETED</Text>
            </View>
          </View>
        )}

        {/* Campus Attendance Policy Card */}
        <View style={styles.policyCard}>
          <View style={styles.policyTitleRow}>
            <Ionicons name="information-circle-outline" size={16} color={Colors.primary} />
            <Text style={styles.policyTitle}>CAMPUS ATTENDANCE POLICY</Text>
          </View>

          <View style={styles.bulletItem}>
            <Text style={styles.bulletDot}>•</Text>
            <Text style={styles.bulletText}>
              Check in within <Text style={styles.boldText}>15 minutes</Text> of reservation start to avoid automated release.
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

      {/* Sticky Bottom Action Button */}
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

      {/* QR Check-In Pass Modal (Screen 05) */}
      <QrCheckInModal
        visible={qrModalVisible}
        seatNumber={selectedPassReservation?.seatNumber || activeReservation.seatNumber}
        roomName={selectedPassReservation?.roomName || activeReservation.roomName}
        timeRange={selectedPassReservation?.timeRange || activeReservation.timeRange}
        dateLabel={selectedPassReservation?.dateLabel || activeReservation.dateLabel}
        passCode={selectedPassReservation?.passCode || '9982'}
        token={`KSN-${(selectedPassReservation?.seatNumber || activeReservation.seatNumber).replace(/Seat\s*/i, '')}-9982`}
        pin="8492"
        onClose={() => setQrModalVisible(false)}
      />

      {/* Bottom Nav */}
      <SeatBottomNav activeTab={bottomTab} onTabPress={setBottomTab} />
    </SafeAreaView>
  );
}

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
  emptyCard: {
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 30,
    backgroundColor: Colors.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textDark,
    marginTop: 4,
  },
  emptySubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
  pastContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 16,
    backgroundColor: Colors.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 10,
  },
  pastTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.textDark,
    marginBottom: 4,
  },
  pastRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F3F6',
  },
  pastSeat: {
    fontSize: 12,
    color: Colors.textDark,
    fontWeight: '600',
  },
  completedTag: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.textSecondary,
    backgroundColor: '#F0F4F8',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
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
