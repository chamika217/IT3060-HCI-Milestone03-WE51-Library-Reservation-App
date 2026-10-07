import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { Colors, Shadows } from '../constants/designSystem';
import { PodSection, SeatItem } from '../types/seatBooking';

interface SeatMatrixGridProps {
  locationTitle?: string;
  totalSeatsBadge?: string;
  podSections: PodSection[];
  selectedSeatId: string | null;
  onSelectSeat: (seat: SeatItem) => void;
}

export const SeatMatrixGrid: React.FC<SeatMatrixGridProps> = ({
  locationTitle = 'Level 1 Individual Study Area',
  totalSeatsBadge = '400+ SEATS',
  podSections,
  selectedSeatId,
  onSelectSeat,
}) => {
  const renderSeatBox = (seat: SeatItem) => {
    const isChosen = seat._id === selectedSeatId || seat.status === 'chosen';
    const isReserved = seat.status === 'reserved';
    const isTaken = seat.status === 'taken';

    let boxStyle = styles.seatBoxAvailable;
    let textColor = Colors.textDark;
    let iconName: keyof typeof Ionicons.glyphMap = 'person-outline';
    let iconColor = Colors.textSecondary;

    if (isChosen) {
      boxStyle = styles.seatBoxChosen;
      textColor = '#FFFFFF';
      iconName = 'checkmark';
      iconColor = '#FFFFFF';
    } else if (isReserved) {
      boxStyle = styles.seatBoxReserved;
      textColor = Colors.warning;
      iconName = 'lock-closed';
      iconColor = Colors.warning;
    } else if (isTaken) {
      boxStyle = styles.seatBoxTaken;
      textColor = Colors.textSecondary;
      iconName = 'person';
      iconColor = Colors.textSecondary;
    }

    return (
      <TouchableOpacity
        key={seat._id}
        style={[styles.seatBox, boxStyle]}
        onPress={() => !isReserved && onSelectSeat(seat)}
        disabled={isReserved}
        activeOpacity={0.7}
      >
        <Text style={[styles.seatNumberText, { color: textColor }]}>
          {seat.seatNumber}
        </Text>
        <Ionicons name={iconName} size={11} color={iconColor} />
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.cardContainer}>
      {/* Location Banner */}
      <View style={styles.locationHeader}>
        <View style={styles.locationTitleGroup}>
          <Ionicons name="sunny-outline" size={16} color={Colors.warning} />
          <Text style={styles.locationTitle}>{locationTitle}</Text>
        </View>
        <View style={styles.seatsBadge}>
          <Text style={styles.seatsBadgeText}>{totalSeatsBadge}</Text>
        </View>
      </View>

      {/* Pod Sections */}
      {podSections.map((pod, pIdx) => (
        <React.Fragment key={pIdx}>
          <View style={styles.podHeaderRow}>
            <View style={styles.podTitleGroup}>
              <Text style={styles.podNameText}>{pod.podName}</Text>
              <Text style={styles.podDot}>•</Text>
              <Text style={styles.podRangeText}>{pod.seatRangeLabel}</Text>
            </View>
            {pod.subtitle ? (
              <Text style={styles.podSubtitle}>{pod.subtitle}</Text>
            ) : pod.badge ? (
              <View style={styles.silentBadge}>
                <Text style={styles.silentBadgeText}>{pod.badge}</Text>
              </View>
            ) : null}
          </View>

          {/* Seats Row */}
          <View style={styles.gridRow}>
            {pod.seats.map((seat) => renderSeatBox(seat))}
          </View>

          {/* Divider between pods */}
          {pIdx === 0 && (
            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>ACOUSTIC PASSAGE</Text>
              <View style={styles.dividerLine} />
            </View>
          )}
        </React.Fragment>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 16,
    backgroundColor: Colors.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.card,
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F3F6',
  },
  locationTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  locationTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textDark,
  },
  seatsBadge: {
    backgroundColor: '#F0F4F8',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  seatsBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.textSecondary,
    letterSpacing: 0.5,
  },
  podHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
    marginBottom: 10,
  },
  podTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  podNameText: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.textDark,
    letterSpacing: 0.5,
  },
  podDot: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  podRangeText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  podSubtitle: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  silentBadge: {
    backgroundColor: Colors.successSoft,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  silentBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.success,
  },
  gridRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
  },
  seatBox: {
    width: 44,
    height: 48,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  seatBoxAvailable: {
    backgroundColor: '#FFFFFF',
    borderColor: '#D8E0E8',
  },
  seatBoxChosen: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  seatBoxTaken: {
    backgroundColor: '#F0F3F6',
    borderColor: '#E2E8F0',
  },
  seatBoxReserved: {
    backgroundColor: Colors.warningSoft,
    borderColor: '#FDE4CE',
  },
  seatNumberText: {
    fontSize: 10,
    fontWeight: '700',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginVertical: 10,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5EBF0',
  },
  dividerText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#A0ABBA',
    letterSpacing: 1,
  },
});
