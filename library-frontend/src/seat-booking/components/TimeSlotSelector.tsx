import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { Colors } from '../constants/designSystem';
import { DateOption, TimeSlotOption } from '../types/seatBooking';

interface TimeSlotSelectorProps {
  dateOption: DateOption;
  slots: TimeSlotOption[];
  selectedSlotId: string;
  onSelectSlot: (slotId: string) => void;
}

export const TimeSlotSelector: React.FC<TimeSlotSelectorProps> = ({
  dateOption,
  slots,
  selectedSlotId,
  onSelectSlot,
}) => {
  const getDateDisplay = () => {
    const d = new Date();
    if (dateOption === 'tomorrow') {
      d.setDate(d.getDate() + 1);
    }
    const dayStr = d.toLocaleDateString('en-US', { weekday: 'short' });
    const monthStr = d.toLocaleDateString('en-US', { month: 'short' });
    const num = d.getDate();
    return `${dateOption === 'today' ? 'Today' : 'Tomorrow'}, ${dayStr} ${num} ${monthStr}`;
  };

  return (
    <View style={styles.container}>
      {/* Date Summary bar carried over from Screen 02 */}
      <View style={styles.dateBanner}>
        <Ionicons name="calendar-outline" size={16} color={Colors.primary} />
        <Text style={styles.dateLabelText}>Booking Date:</Text>
        <Text style={styles.dateValueText}>{getDateDisplay()}</Text>
      </View>

      {/* Slots Header */}
      <View style={styles.headerRow}>
        <Text style={styles.sectionTitle}>Booking Windows</Text>
        <View style={styles.maxBadge}>
          <Text style={styles.maxBadgeText}>Max 2 slots</Text>
        </View>
      </View>

      {/* Radio list of time slots */}
      <View style={styles.slotsList}>
        {slots.map((slot) => {
          const isSelected = slot.id === selectedSlotId;

          return (
            <TouchableOpacity
              key={slot.id}
              style={[
                styles.slotCard,
                isSelected ? styles.slotCardActive : styles.slotCardInactive,
              ]}
              onPress={() => onSelectSlot(slot.id)}
              activeOpacity={0.8}
            >
              {/* Radio Indicator */}
              <View style={styles.radioOuter}>
                {isSelected && <View style={styles.radioInner} />}
              </View>

              {/* Slot Details */}
              <View style={styles.slotDetails}>
                <Text style={styles.timeRangeText}>{slot.timeRange}</Text>
                <Text style={styles.taglineText}>{slot.tagline}</Text>
              </View>

              {/* Status Badge */}
              <View
                style={[
                  styles.statusPill,
                  isSelected ? styles.statusPillActive : styles.statusPillOpen,
                ]}
              >
                <Text
                  style={[
                    styles.statusPillText,
                    isSelected ? styles.statusTextActive : styles.statusTextOpen,
                  ]}
                >
                  {isSelected ? 'ACTIVE' : 'OPEN'}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  dateBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: 20,
    marginBottom: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: Colors.primarySoft,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D0E2FB',
  },
  dateLabelText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  dateValueText: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.textDark,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.textDark,
    letterSpacing: -0.2,
  },
  maxBadge: {
    backgroundColor: '#F0F4F8',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  maxBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  slotsList: {
    paddingHorizontal: 20,
    gap: 10,
  },
  slotCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    backgroundColor: Colors.card,
  },
  slotCardActive: {
    borderColor: Colors.primary,
    borderWidth: 1.5,
    backgroundColor: '#F7FAFF',
  },
  slotCardInactive: {
    borderColor: Colors.border,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.primary,
  },
  slotDetails: {
    flex: 1,
  },
  timeRangeText: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.textDark,
    marginBottom: 2,
  },
  taglineText: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusPillActive: {
    backgroundColor: Colors.primary,
  },
  statusPillOpen: {
    backgroundColor: '#F0F4F8',
  },
  statusPillText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  statusTextActive: {
    color: '#FFFFFF',
  },
  statusTextOpen: {
    color: Colors.textSecondary,
  },
});
