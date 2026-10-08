import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Colors, Shadows } from '../constants/designSystem';
import { SeatItem } from '../types/seatBooking';

interface SeatDetailCardProps {
  seat: SeatItem | null;
  roomName?: string;
  roomLevel?: number;
}

export const SeatDetailCard: React.FC<SeatDetailCardProps> = ({
  seat,
  roomName = 'Individual Study Area',
  roomLevel = 1,
}) => {
  if (!seat) {
    return (
      <View style={styles.placeholderContainer}>
        <Ionicons name="hand-left-outline" size={24} color={Colors.primary} />
        <View style={styles.placeholderTextGroup}>
          <Text style={styles.placeholderTitle}>Select a Seat on Map</Text>
          <Text style={styles.placeholderSubtitle}>
            Tap any available desk (white box) on the layout grid above to pick your desk.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.cardContainer}>
      {/* Header Row */}
      <View style={styles.topRow}>
        <View style={styles.titleGroup}>
          <Text style={styles.seatTitle}>Seat {seat.seatNumber} Selected</Text>
          <View style={styles.availableBadge}>
            <Text style={styles.availableBadgeText}>
              {seat.status === 'taken' ? 'OCCUPIED NOW' : 'AVAILABLE'}
            </Text>
          </View>
        </View>

        <View style={styles.accessGroup}>
          <Text style={styles.accessLabel}>ACCESS</Text>
          <Text style={styles.accessValue}>SLIIT Students</Text>
        </View>
      </View>

      <Text style={styles.locationSubtitle}>
        Level {roomLevel} • {roomName}
      </Text>

      {/* Amenity Spec Pills */}
      <View style={styles.specsRow}>
        {/* Power Socket */}
        <View style={styles.specPill}>
          <Ionicons name="flash-outline" size={14} color={Colors.primary} />
          <View>
            <Text style={styles.specLabel}>POWER</Text>
            <Text style={styles.specValue}>{seat.powerSocket || '230V Socket'}</Text>
          </View>
        </View>

        {/* USB Port */}
        <View style={styles.specPill}>
          <Ionicons name="hardware-chip-outline" size={14} color={Colors.primary} />
          <View>
            <Text style={styles.specLabel}>USB PORT</Text>
            <Text style={styles.specValue}>{seat.usbPort || '65W Type-C'}</Text>
          </View>
        </View>

        {/* Acoustics */}
        <View style={styles.specPill}>
          <Ionicons name="volume-mute-outline" size={14} color={Colors.primary} />
          <View>
            <Text style={styles.specLabel}>ACOUSTICS</Text>
            <Text style={styles.specValue}>{seat.acoustics || 'Silent Zone'}</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  placeholderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 16,
    backgroundColor: '#F0F5FD',
    borderRadius: 18,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#B8D3F8',
  },
  placeholderTextGroup: {
    flex: 1,
  },
  placeholderTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.textDark,
    marginBottom: 2,
  },
  placeholderSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 16,
  },
  cardContainer: {
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
    marginBottom: 4,
  },
  titleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  seatTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textDark,
  },
  availableBadge: {
    backgroundColor: Colors.successSoft,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  availableBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.success,
  },
  accessGroup: {
    alignItems: 'flex-end',
  },
  accessLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: Colors.textSecondary,
    letterSpacing: 0.5,
  },
  accessValue: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textDark,
  },
  locationSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 14,
  },
  specsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  specPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.primarySoft,
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#D8E6F8',
  },
  specLabel: {
    fontSize: 8,
    fontWeight: '700',
    color: Colors.textSecondary,
    letterSpacing: 0.5,
  },
  specValue: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textDark,
  },
});
