import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { Colors } from '../constants/designSystem';
import { DateOption } from '../types/seatBooking';

interface DateSelectorPillsProps {
  selectedDate: DateOption;
  onSelectDate: (date: DateOption) => void;
}

export const DateSelectorPills: React.FC<DateSelectorPillsProps> = ({
  selectedDate,
  onSelectDate,
}) => {
  // Format today and tomorrow dates
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);

  const formatDateLabel = (d: Date) => {
    const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
    const monthName = d.toLocaleDateString('en-US', { month: 'short' });
    const dayNum = d.getDate();
    return `${dayName}, ${monthName} ${dayNum}`;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>SELECT BOOKING DATE</Text>
      <View style={styles.pillsRow}>
        <TouchableOpacity
          style={[
            styles.pill,
            selectedDate === 'today' ? styles.pillActive : styles.pillInactive,
          ]}
          onPress={() => onSelectDate('today')}
          activeOpacity={0.8}
        >
          <Text
            style={[
              styles.pillTitle,
              selectedDate === 'today' ? styles.textActive : styles.textInactive,
            ]}
          >
            Today
          </Text>
          <Text
            style={[
              styles.pillSubtitle,
              selectedDate === 'today' ? styles.textActiveSub : styles.textInactiveSub,
            ]}
          >
            {formatDateLabel(today)}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.pill,
            selectedDate === 'tomorrow' ? styles.pillActive : styles.pillInactive,
          ]}
          onPress={() => onSelectDate('tomorrow')}
          activeOpacity={0.8}
        >
          <Text
            style={[
              styles.pillTitle,
              selectedDate === 'tomorrow' ? styles.textActive : styles.textInactive,
            ]}
          >
            Tomorrow
          </Text>
          <Text
            style={[
              styles.pillSubtitle,
              selectedDate === 'tomorrow' ? styles.textActiveSub : styles.textInactiveSub,
            ]}
          >
            {formatDateLabel(tomorrow)}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    marginBottom: 14,
  },
  label: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.textSecondary,
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  pillsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  pill: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  pillInactive: {
    backgroundColor: Colors.card,
    borderColor: Colors.border,
  },
  pillTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  pillSubtitle: {
    fontSize: 11,
    fontWeight: '500',
  },
  textActive: {
    color: '#FFFFFF',
  },
  textInactive: {
    color: Colors.textDark,
  },
  textActiveSub: {
    color: '#E0EEFF',
  },
  textInactiveSub: {
    color: Colors.textSecondary,
  },
});
