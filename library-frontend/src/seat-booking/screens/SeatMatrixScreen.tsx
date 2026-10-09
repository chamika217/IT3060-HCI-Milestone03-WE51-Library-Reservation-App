import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
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
import { DateSelectorPills } from '../components/DateSelectorPills';
import { ReadingRoomsHeader } from '../components/ReadingRoomsHeader';
import { SeatBottomNav, TabName } from '../components/SeatBottomNav';
import { SeatDetailCard } from '../components/SeatDetailCard';
import { SeatMatrixGrid } from '../components/SeatMatrixGrid';
import { SeatMatrixLegend } from '../components/SeatMatrixLegend';
import { Colors, Shadows } from '../constants/designSystem';
import { generatePodSections, MOCK_ROOMS } from '../mock/roomsData';
import { useBookingStore } from '../store/bookingStore';
import { DateOption, PodSection, SeatItem } from '../types/seatBooking';

export default function SeatMatrixScreen() {
  const params = useLocalSearchParams<{ roomCode?: string; roomName?: string; replacingBookingId?: string }>();
  const roomCode = params.roomCode || 'L2-NORTH';
  const roomName = params.roomName || 'Individual Study Area';
  const replacingBookingId = params.replacingBookingId ?? '';

  const { isSeatTaken } = useBookingStore();

  const [selectedDate, setSelectedDate] = useState<DateOption>('today');
  const [selectedSeat, setSelectedSeat] = useState<SeatItem | null>(null);
  const [activeTab, setActiveTab] = useState<TabName>('Search');

  // Find matched room capacity; fall back to 60
  const roomCapacity = useMemo(() => {
    const found = MOCK_ROOMS.find((r) => r.code === roomCode);
    return found?.totalSeats ?? 60;
  }, [roomCode]);

  /**
   * Build the full pod grid from room capacity, then mark each seat as
   * 'taken' if any slot for that seat on the selected date has been booked.
   */
  const podSections: PodSection[] = useMemo(() => {
    const sections = generatePodSections(roomCapacity, roomCode);
    const ALL_SLOT_IDS = ['t-0800','t-1000','t-1030','t-1230','t-1430','t-1630','t-1800'];
    return sections.map((section) => ({
      ...section,
      seats: section.seats.map((seat) => {
        const taken = ALL_SLOT_IDS.some((slotId) =>
          isSeatTaken(roomCode, seat.seatNumber, slotId, selectedDate)
        );
        return taken ? { ...seat, status: 'taken' as const } : seat;
      }),
    }));
  }, [roomCapacity, roomCode, isSeatTaken, selectedDate]);

  const totalSeatsBadge = `${roomCapacity} SEATS`;

  const handleSelectSeat = (seat: SeatItem) => {
    if (selectedSeat?._id === seat._id) {
      setSelectedSeat(null);
    } else {
      setSelectedSeat(seat);
    }
  };

  const handleConfirmSeat = () => {
    if (!selectedSeat) {
      Alert.alert('Please Select a Seat', 'Tap an available seat on the map grid to proceed.');
      return;
    }
    router.push({
      pathname: '/seats/confirm',
      params: {
        seatNumber: selectedSeat.seatNumber,
        dateOption: selectedDate,
        roomName: roomName,
        roomCode: roomCode,
        powerSocket: selectedSeat.powerSocket || '230V Socket',
        usbPort: selectedSeat.usbPort || '65W Type-C',
        acoustics: selectedSeat.acoustics || 'Silent Zone',
        // Forward the ID of the booking being replaced (empty string = fresh booking)
        replacingBookingId,
      },
    });
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
          campusName="LIBRARY MAP"
          spacesCount="SCREEN 02"
          title="Select Your Seat"
          subtitle={`Level 1 — ${roomName}`}
          onBackPress={() => router.back()}
        />

        {/* Date Selector (Today vs Tomorrow) */}
        <DateSelectorPills
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
        />

        {/* Legend Bar */}
        <SeatMatrixLegend />

        {/* Seat Layout Grid — dynamic capacity, live statuses */}
        <SeatMatrixGrid
          locationTitle={`Level 1 ${roomName}`}
          totalSeatsBadge={totalSeatsBadge}
          podSections={podSections}
          selectedSeatId={selectedSeat?._id || null}
          onSelectSeat={handleSelectSeat}
        />

        {/* Selected Seat Details Card / Instruction Placeholder */}
        <SeatDetailCard
          seat={selectedSeat}
          roomName={roomName}
          roomLevel={1}
        />
      </ScrollView>

      {/* Sticky Bottom Action Button */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[styles.confirmButton, !selectedSeat && styles.confirmButtonDisabled]}
          onPress={handleConfirmSeat}
          disabled={!selectedSeat}
          activeOpacity={0.8}
        >
          <Ionicons
            name={selectedSeat ? 'checkmark-circle-outline' : 'hand-left-outline'}
            size={20}
            color="#FFFFFF"
          />
          <Text style={styles.confirmButtonText}>
            {selectedSeat
              ? `Confirm & Book Seat ${selectedSeat.seatNumber}`
              : 'Select a Desk on Map to Continue'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Bottom Nav Bar */}
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
  confirmButtonDisabled: {
    backgroundColor: '#94A3B8',
    opacity: 0.8,
  },
  confirmButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
