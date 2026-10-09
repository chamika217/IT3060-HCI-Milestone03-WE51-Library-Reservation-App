import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { Colors, Shadows } from '../constants/designSystem';
import { ReservationItem } from '../types/seatBooking';

interface ReservationCardProps {
  reservation: ReservationItem;
  onChangeSeat?: (reservation: ReservationItem) => void;
  onCancelBooking?: (reservation: ReservationItem) => void;
  onViewPass?: (reservation: ReservationItem) => void;
}

export const ReservationCard: React.FC<ReservationCardProps> = ({
  reservation,
  onChangeSeat,
  onCancelBooking,
  onViewPass,
}) => {
  return (
    <View style={styles.cardContainer}>
      {/* Status Banner Row */}
      <View style={styles.statusRow}>
        <View style={styles.upcomingPill}>
          <View style={styles.greenDot} />
          <Text style={styles.upcomingPillText}>UPCOMING RESERVATION</Text>
        </View>

        {reservation.startsInLabel && (
          <View style={styles.startsInBadge}>
            <Text style={styles.startsInBadgeText}>{reservation.startsInLabel}</Text>
          </View>
        )}
      </View>

      {/* Seat Title & Room Level */}
      <View style={styles.titleRow}>
        <View>
          <Text style={styles.seatTitle}>{reservation.seatNumber}</Text>
          <Text style={styles.roomSubtitle}>
            Level {reservation.roomLevel} {reservation.roomName}
          </Text>
        </View>

        <TouchableOpacity style={styles.bookmarkButton} activeOpacity={0.7}>
          <Ionicons name="bookmark-outline" size={18} color={Colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Details Grid */}
      <View style={styles.detailsGrid}>
        <View style={styles.detailCol}>
          <Text style={styles.detailLabel}>SESSION WINDOW</Text>
          <Text style={styles.detailValue}>
            {reservation.dateLabel}, {reservation.timeRange}
          </Text>
          <Text style={styles.detailSubValue}>{reservation.durationLabel}</Text>
        </View>

        <View style={styles.detailCol}>
          <Text style={styles.detailLabel}>AMENITIES</Text>
          <Text style={styles.detailValue}>{reservation.amenitiesLabel}</Text>
        </View>
      </View>

      {/* Fast Gate Check-In Pass Box */}
      <TouchableOpacity
        style={styles.fastGateBox}
        onPress={() => onViewPass?.(reservation)}
        activeOpacity={0.8}
      >
        <View style={styles.qrIconBadge}>
          <Ionicons name="qr-code-outline" size={20} color={Colors.primary} />
        </View>

        <View style={styles.fastGateInfo}>
          <View style={styles.passHeaderRow}>
            <Text style={styles.fastGateTitle}>Fast Gate Check-In</Text>
            <View style={styles.codeTag}>
              <Text style={styles.codeTagText}>#{reservation.passCode}</Text>
            </View>
          </View>
          <Text style={styles.fastGateSub}>
            Scan ticket at Turnstile 2 or desk tag upon arrival.
          </Text>
        </View>
      </TouchableOpacity>

      {/* Action Buttons Row */}
      <View style={styles.actionsRow}>
        <TouchableOpacity
          style={styles.changeSeatButton}
          onPress={() => onChangeSeat?.(reservation)}
          activeOpacity={0.7}
        >
          <Ionicons name="swap-horizontal-outline" size={15} color={Colors.primary} />
          <Text style={styles.changeSeatText}>Change Seat</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => onCancelBooking?.(reservation)}
          activeOpacity={0.7}
        >
          <Ionicons name="close-circle-outline" size={15} color={Colors.error} />
          <Text style={styles.cancelText}>Cancel Booking</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
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
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  upcomingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  greenDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.success,
  },
  upcomingPillText: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.textSecondary,
    letterSpacing: 0.6,
  },
  startsInBadge: {
    backgroundColor: Colors.primarySoft,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#D4E5FA',
  },
  startsInBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primary,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  seatTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.textDark,
  },
  roomSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  bookmarkButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#F3F5F7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailsGrid: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    gap: 12,
    marginBottom: 14,
  },
  detailCol: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: Colors.textSecondary,
    letterSpacing: 0.5,
    marginBottom: 3,
  },
  detailValue: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.textDark,
  },
  detailSubValue: {
    fontSize: 10,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  fastGateBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    backgroundColor: Colors.primarySoft,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D0E1F9',
    marginBottom: 14,
  },
  qrIconBadge: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#D0E1F9',
  },
  fastGateInfo: {
    flex: 1,
  },
  passHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  fastGateTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.textDark,
  },
  codeTag: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  codeTagText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  fastGateSub: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  changeSeatButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  changeSeatText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textDark,
  },
  cancelButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: Colors.errorSoft,
    borderWidth: 1,
    borderColor: '#FCD8DA',
  },
  cancelText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.error,
  },
});
