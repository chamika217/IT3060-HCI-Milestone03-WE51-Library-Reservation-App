import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CampusBreadcrumb } from '../components/CampusBreadcrumb';
import { DeskDeliverySearch } from '../components/DeskDeliverySearch';
import { ReadingRoomsHeader } from '../components/ReadingRoomsHeader';
import { SeatBottomNav, TabName } from '../components/SeatBottomNav';
import { TimeSlotSelector } from '../components/TimeSlotSelector';
import { Colors, Shadows } from '../constants/designSystem';
import { getCalculatedTimeSlots } from '../mock/roomsData';
import { useBookingStore } from '../store/bookingStore';
import { BookItem, DateOption } from '../types/seatBooking';
import { API_BASE_URL } from '@/services/books-api';

const BACKEND_RESERVATIONS_URL = `${API_BASE_URL}/seat-reservations`;

export default function ConfirmReservationScreen() {
  const params = useLocalSearchParams<{
    seatNumber?: string;
    dateOption?: DateOption;
    roomName?: string;
    roomCode?: string;
    replacingBookingId?: string;
  }>();

  const seatNumber = params.seatNumber || 'B-14';
  const dateOption: DateOption = params.dateOption === 'tomorrow' ? 'tomorrow' : 'today';
  const roomName = params.roomName || 'Individual Study Area';
  const roomCode = params.roomCode || 'L2-NORTH';
  /** Non-empty = seat-change flow; old booking is cancelled atomically on confirm. */
  const replacingBookingId = params.replacingBookingId ?? '';

  const { addBooking, cancelBooking } = useBookingStore();

  const timeSlots = getCalculatedTimeSlots(dateOption);
  const initialValidSlotId =
    timeSlots.find((s) => s.status !== 'expired')?.id || timeSlots[0]?.id || 't-1430';

  const [selectedSlotId, setSelectedSlotId] = useState<string>(initialValidSlotId);
  const [agreed, setAgreed] = useState<boolean>(true);
  const [deliveryBook, setDeliveryBook] = useState<BookItem | undefined>();
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<TabName>('Bookings');

  const selectedSlot = timeSlots.find((s) => s.id === selectedSlotId) || timeSlots[0];

  const handleConfirmReservation = async () => {
    if (!agreed) {
      if (Platform.OS === 'web') {
        window.alert('Check-In Agreement Required\n\nPlease accept the 15-minute check-in policy before confirming your reservation.');
      } else {
        Alert.alert(
          'Check-In Agreement Required',
          'Please accept the 15-minute check-in policy before confirming your reservation.'
        );
      }
      return;
    }

    if (selectedSlot?.status === 'expired') {
      if (Platform.OS === 'web') {
        window.alert('Invalid Slot\n\nThis slot has already passed for today. Please pick a current or upcoming slot.');
      } else {
        Alert.alert(
          'Invalid Slot',
          'This slot has already passed for today. Please pick a current or upcoming slot.'
        );
      }
      return;
    }

    setSubmitting(true);

    // Try posting to the backend (silent on failure so app works offline)
    try {
      const now = new Date();
      if (dateOption === 'tomorrow') now.setDate(now.getDate() + 1);
      const startTime = new Date(now.setHours(14, 30, 0, 0)).toISOString();
      const endTime   = new Date(now.setHours(16, 30, 0, 0)).toISOString();

      await fetch(BACKEND_RESERVATIONS_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user: '650000000000000000000001',
          seat: '650000000000000000000002',
          startTime,
          endTime,
          deskDelivery: {
            requested: Boolean(deliveryBook),
            bookTitle: deliveryBook?.title,
          },
        }),
      });
    } catch {
      // Offline — continue with local state
    }

    setSubmitting(false);

    // If this is a seat-change, cancel the old booking atomically first
    if (replacingBookingId) {
      cancelBooking(replacingBookingId);
    }

    // Record the new booking in the shared store (drives occupancy + seat matrix)
    addBooking({
      roomCode,
      seatNumber,
      slotId: selectedSlotId,
      dateOption,
      timeRange: selectedSlot?.timeRange || '02:30 PM – 04:30 PM',
    });

    // Navigate immediately to MyBookingsScreen so user sees their confirmed booking
    router.replace({
      pathname: '/seats/my-bookings',
      params: {
        seatNumber,
        roomName,
        dateOption,
        timeRange: selectedSlot?.timeRange || '02:30 PM – 04:30 PM',
      },
    });
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      {/* Header */}
      <ReadingRoomsHeader />

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Breadcrumb */}
        <CampusBreadcrumb
          campusName="RESERVATION"
          spacesCount="SCREEN 03"
          title="Confirm Reservation"
          subtitle="Configure your booking slots and textbook delivery."
          onBackPress={() => router.back()}
        />

        {/* Seat Station Header Card */}
        <View style={styles.seatStationCard}>
          <View style={styles.topRow}>
            <Text style={styles.podTag}>POD // DESK SEC-2B</Text>
            <View style={styles.activePill}>
              <View style={styles.greenDot} />
              <Text style={styles.activePillText}>Active Station</Text>
            </View>
          </View>

          <View style={styles.seatTitleRow}>
            <View>
              <Text style={styles.seatTitle}>Seat {seatNumber}</Text>
              <Text style={styles.seatSubtitle}>Level 1 • {roomName}</Text>
            </View>
            <View style={styles.chairIconBadge}>
              <Ionicons name="hardware-chip-outline" size={20} color={Colors.primary} />
            </View>
          </View>

          <View style={styles.tagsRow}>
            <View style={styles.tagPill}>
              <Ionicons name="flash-outline" size={12} color={Colors.primary} />
              <Text style={styles.tagText}>Dual AC Socket</Text>
            </View>
            <View style={styles.tagPill}>
              <Ionicons name="volume-mute-outline" size={12} color={Colors.primary} />
              <Text style={styles.tagText}>0 dB Protocol</Text>
            </View>
            <View style={styles.tagPill}>
              <Ionicons name="sunny-outline" size={12} color={Colors.primary} />
              <Text style={styles.tagText}>East Atrium</Text>
            </View>
          </View>
        </View>

        {/* Time Slot Selector */}
        <TimeSlotSelector
          dateOption={dateOption}
          slots={timeSlots}
          selectedSlotId={selectedSlotId}
          onSelectSlot={setSelectedSlotId}
        />

        {/* Optional Desk Delivery */}
        <DeskDeliverySearch
          seatNumber={seatNumber}
          onToggleDelivery={(_enabled, book) => setDeliveryBook(book)}
        />

        {/* Check-in Agreement */}
        <TouchableOpacity
          style={styles.agreementRow}
          onPress={() => setAgreed(!agreed)}
          activeOpacity={0.8}
        >
          <Ionicons
            name={agreed ? 'checkbox' : 'square-outline'}
            size={20}
            color={agreed ? Colors.primary : Colors.textSecondary}
          />
          <Text style={styles.agreementText}>
            I agree to check in within 15 minutes of slot start time. Unclaimed desks are
            returned to the pool.
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Confirm Button */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[styles.confirmButton, submitting && styles.buttonDisabled]}
          onPress={handleConfirmReservation}
          disabled={submitting}
          activeOpacity={0.8}
        >
          <Ionicons name="checkmark-circle-outline" size={20} color="#FFFFFF" />
          <Text style={styles.confirmButtonText}>
            {submitting
              ? 'Confirming...'
              : replacingBookingId
              ? `Confirm Seat Change to ${seatNumber}`
              : `Confirm & Reserve Seat ${seatNumber}`}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Bottom Nav */}
      <SeatBottomNav activeTab={activeTab} onTabPress={setActiveTab} />
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
  seatStationCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 16,
    backgroundColor: Colors.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.card,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  podTag: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.textSecondary,
    letterSpacing: 0.8,
  },
  activePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: Colors.successSoft,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  greenDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.success,
  },
  activePillText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.success,
  },
  seatTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  seatTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.textDark,
  },
  seatSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  chairIconBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tagPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.searchBg,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  tagText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textDark,
  },
  agreementRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginHorizontal: 20,
    marginBottom: 20,
  },
  agreementText: {
    flex: 1,
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 16,
  },
  bottomBar: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: Colors.card,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    ...Shadows.soft,
  },
  confirmButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 14,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  confirmButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
