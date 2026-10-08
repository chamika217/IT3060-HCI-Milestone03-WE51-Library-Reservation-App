import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Colors, Shadows } from '../constants/designSystem';
import { CampusDensity } from '../types/seatBooking';

interface OverallDensityCardProps {
  data?: CampusDensity;
}

export const OverallDensityCard: React.FC<OverallDensityCardProps> = ({
  data = {
    occupiedPercent: 58,
    openSeats: 94,
    statusLabel: 'Active',
    buildingName: 'Live occupancy across Malabe Main Library Complex New Building.',
  },
}) => {
  return (
    <View style={styles.cardContainer}>
      {/* Top Header Row */}
      <View style={styles.headerRow}>
        <View style={styles.titleGroup}>
          <Ionicons name="checkmark-circle-outline" size={18} color={Colors.primary} />
          <Text style={styles.headerTitle}>OVERALL CAMPUS DENSITY</Text>
        </View>

        <View style={styles.statusBadge}>
          <View style={styles.greenDot} />
          <Text style={styles.statusText}>{data.statusLabel}</Text>
        </View>
      </View>

      {/* Description text */}
      <Text style={styles.descriptionText}>{data.buildingName}</Text>

      {/* Capacity info row */}
      <View style={styles.capacityRow}>
        <Text style={styles.capacityLabel}>Building Capacity</Text>
        <Text style={styles.capacityValue}>
          <Text style={styles.percentText}>{data.occupiedPercent}% Occupied </Text>
          <Text style={styles.openSeatsText}>({data.openSeats} Seats Open)</Text>
        </Text>
      </View>

      {/* Progress Track */}
      <View style={styles.progressTrack}>
        <View style={[styles.progressBar, { width: `${data.occupiedPercent}%` }]} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    marginHorizontal: 20,
    marginTop: 12,
    marginBottom: 16,
    padding: 16,
    backgroundColor: Colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.card,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  titleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  headerTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textDark,
    letterSpacing: 0.5,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: Colors.successSoft,
  },
  greenDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.success,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.success,
  },
  descriptionText: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 14,
    lineHeight: 16,
  },
  capacityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  capacityLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  capacityValue: {
    fontSize: 12,
  },
  percentText: {
    fontWeight: '700',
    color: Colors.textDark,
  },
  openSeatsText: {
    fontWeight: '600',
    color: Colors.textDark,
  },
  progressTrack: {
    height: 8,
    backgroundColor: Colors.trackBg,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 4,
  },
});
