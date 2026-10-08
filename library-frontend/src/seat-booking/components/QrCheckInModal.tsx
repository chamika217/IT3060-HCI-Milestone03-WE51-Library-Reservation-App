import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import QRCode from 'react-native-qrcode-svg';
import React, { useMemo, useState } from 'react';
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CampusBreadcrumb } from './CampusBreadcrumb';
import { ReadingRoomsHeader } from './ReadingRoomsHeader';
import { Colors, Shadows } from '../constants/designSystem';
import { ALL_LIBRARY_SLOTS, MOCK_ROOMS } from '../mock/roomsData';
import { useBookingStore } from '../store/bookingStore';

// ─────────────────────────────────────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────────────────────────────────────

interface QrCheckInModalProps {
  visible: boolean;
  /** Seat identifier, e.g. "B-14" or "Seat B-14". */
  seatNumber?: string;
  roomName?: string;
  timeRange?: string;
  dateLabel?: string;
  passCode?: string;
  token?: string;
  pin?: string;
  onClose: () => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Derive a stable 4-digit PIN from a booking ID string.
 * Uses a simple djb2-style hash so the same booking always produces the same PIN.
 */
function derivePinFromId(bookingId: string): string {
  let hash = 5381;
  for (let i = 0; i < bookingId.length; i++) {
    hash = (hash * 33) ^ bookingId.charCodeAt(i);
    hash = hash >>> 0; // keep unsigned 32-bit
  }
  const pin = (hash % 9000) + 1000; // range 1000-9999
  return String(pin);
}

/**
 * Build the scannable QR payload as a compact JSON string.
 * Standard QR readers will display this as readable text on any smartphone.
 */
function buildQrPayload(params: {
  bookingId: string;
  seatNumber: string;
  roomName: string;
  roomCode: string;
  date: string;
  timeRange: string;
  pin: string;
}): string {
  return JSON.stringify({
    system: 'SLIIT-LIBRARY',
    bookingId: params.bookingId,
    seat: params.seatNumber,
    room: params.roomName,
    roomCode: params.roomCode,
    date: params.date,
    slot: params.timeRange,
    pin: params.pin,
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export const QrCheckInModal: React.FC<QrCheckInModalProps> = ({
  visible,
  seatNumber: propSeat,
  roomName: propRoomName,
  timeRange: propTimeRange,
  dateLabel: propDateLabel,
  onClose,
}) => {
  const router = useRouter();
  const [pinCopied, setPinCopied] = useState(false);

  const { getActiveBookings } = useBookingStore();

  // ── Resolve booking data ──────────────────────────────────────────────────
  // Prefer live booking from the store; fall back to props for cases where
  // the modal is opened with static data (e.g. past bookings preview).
  const resolvedData = useMemo(() => {
    const activeBookings = getActiveBookings();

    // Try to find the booking that matches the prop seat number
    const cleanPropSeat = (propSeat ?? '').replace(/^Seat\s*/i, '');
    const match =
      activeBookings.find(
        (b) =>
          b.seatNumber === cleanPropSeat ||
          b.seatNumber === `Seat ${cleanPropSeat}` ||
          b.seatNumber === propSeat
      ) ?? activeBookings[0]; // fall back to first active booking

    if (match) {
      const room = MOCK_ROOMS.find((r) => r.code === match.roomCode);
      const slot = ALL_LIBRARY_SLOTS.find((s) => s.id === match.slotId);
      const seatNum = match.seatNumber.replace(/^Seat\s*/i, '');
      const pin = derivePinFromId(match.id);
      const date = match.dateOption === 'tomorrow' ? 'Tomorrow' : 'Today';
      const timeRange = slot?.timeRange ?? match.timeRange;
      const roomName = room?.name ?? propRoomName ?? 'Study Area';
      const roomCode = match.roomCode;
      const token = `KSN-${seatNum}-${match.id.slice(-6).toUpperCase()}`;

      return {
        bookingId: match.id,
        seatNumber: seatNum,
        roomName,
        roomCode,
        date,
        timeRange,
        pin,
        token,
        fromStore: true,
      };
    }

    // No live booking — use props as-is (graceful fallback)
    const fallbackSeat = (propSeat ?? 'B-17').replace(/^Seat\s*/i, '');
    const fallbackPin = '0000';
    return {
      bookingId: 'DEMO',
      seatNumber: fallbackSeat,
      roomName: propRoomName ?? 'Individual Study Area',
      roomCode: 'L2-NORTH',
      date: propDateLabel ?? 'Today',
      timeRange: propTimeRange ?? '02:30 PM – 04:30 PM',
      pin: fallbackPin,
      token: `KSN-${fallbackSeat}-DEMO`,
      fromStore: false,
    };
  }, [getActiveBookings, propSeat, propRoomName, propTimeRange, propDateLabel]);

  const {
    bookingId,
    seatNumber,
    roomName,
    roomCode,
    date,
    timeRange,
    pin,
    token,
  } = resolvedData;

  // ── QR payload (changes whenever booking data changes) ────────────────────
  const qrPayload = useMemo(
    () => buildQrPayload({ bookingId, seatNumber, roomName, roomCode, date, timeRange, pin }),
    [bookingId, seatNumber, roomName, roomCode, date, timeRange, pin]
  );

  const cleanSeatLabel = `Seat ${seatNumber}`;

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleCopyPin = () => {
    setPinCopied(true);
    Alert.alert('PIN Copied!', `Check-In PIN ${pin} copied to clipboard.`);
    setTimeout(() => setPinCopied(false), 2000);
  };

  const handleTurnstileScan = () => {
    Alert.alert(
      'Turnstile Check-In Verified! ✅',
      `Welcome to ${roomName}!\nTurnstile Gate #L2-N unlocked for ${cleanSeatLabel}.`
    );
  };

  const handleReleaseExtend = () => {
    Alert.alert(
      'Seat Management',
      `${cleanSeatLabel} is active until ${timeRange.split('–')[1]?.trim() ?? 'end of slot'}.`,
      [
        {
          text: 'Extend Seat',
          onPress: () => {
            onClose();
            router.push({
              pathname: '/seats/extend-reservation',
              params: { seatNumber, roomName, timeRange },
            });
          },
        },
        {
          text: 'Release Early',
          style: 'destructive',
          onPress: () => {
            onClose();
            router.push({
              pathname: '/seats/early-release',
              params: { seatNumber, roomName, timeRange },
            });
          },
        },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen">
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <ReadingRoomsHeader
          onNotificationPress={() => Alert.alert('Notifications', 'No new alerts.')}
          onProfilePress={() => Alert.alert('Profile', 'Student Account #2026-IT')}
        />

        <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          <CampusBreadcrumb
            campusName="VERIFICATION"
            spacesCount="SCREEN 05"
            title="Seat Check–in Pass"
            subtitle="Scan your QR code at the entrance."
            onBackPress={onClose}
          />

          {/* Verified status bar */}
          <View style={styles.verifiedCard}>
            <View style={styles.verifiedLeft}>
              <Ionicons name="checkmark-circle" size={18} color={Colors.success} />
              <Text style={styles.verifiedText}>CAMPUS PASS VERIFIED</Text>
            </View>
            <View style={styles.activePill}>
              <Text style={styles.activePillText}>Active</Text>
            </View>
          </View>

          {/* QR Code card */}
          <View style={styles.qrCard}>
            {/* Ready to Scan pill */}
            <View style={styles.scanPillContainer}>
              <View style={styles.readyPill}>
                <View style={styles.greenDot} />
                <Text style={styles.readyPillText}>Ready to Scan</Text>
              </View>
            </View>

            {/* ── Real scannable QR code ── */}
            <View style={styles.qrFrame}>
              {/* Corner brackets — decorative, on top of the QR */}
              <View style={[styles.cornerBracket, styles.topLeftBracket]} />
              <View style={[styles.cornerBracket, styles.topRightBracket]} />
              <View style={[styles.cornerBracket, styles.bottomLeftBracket]} />
              <View style={[styles.cornerBracket, styles.bottomRightBracket]} />

              <View style={styles.qrInner}>
                <QRCode
                  value={qrPayload}
                  size={160}
                  color={Colors.textDark}
                  backgroundColor="#FFFFFF"
                  quietZone={6}
                />
              </View>
            </View>

            {/* Token label */}
            <Text style={styles.tokenText}>
              TOKEN: <Text style={styles.tokenBoldText}>{token}</Text>
            </Text>

            {/* OR ENTER PIN divider */}
            <View style={styles.orDividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.orDividerText}>OR ENTER PIN</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* 4-digit PIN boxes */}
            <View style={styles.pinBoxesRow}>
              {pin.slice(0, 4).split('').map((digit, idx) => (
                <View key={idx} style={styles.pinBox}>
                  <Text style={styles.pinDigitText}>{digit}</Text>
                </View>
              ))}
              <TouchableOpacity
                style={styles.copyPinBox}
                onPress={handleCopyPin}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={pinCopied ? 'checkmark' : 'copy-outline'}
                  size={16}
                  color={pinCopied ? Colors.success : Colors.textDark}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Allocated station card */}
          <View style={styles.allocatedCard}>
            <View style={styles.allocatedTopRow}>
              <View>
                <Text style={styles.allocatedLabel}>ALLOCATED STATION</Text>
                <Text style={styles.stationTitle}>{cleanSeatLabel}</Text>
                <Text style={styles.stationSubtitle}>{roomName} (Level 1)</Text>
              </View>

              <View style={styles.slotGroup}>
                <Text style={styles.allocatedLabel}>SLOT WINDOW</Text>
                <Text style={styles.slotTimeText}>{timeRange}</Text>
                <View style={styles.hoursBadge}>
                  <Text style={styles.hoursBadgeText}>2.0 Hours</Text>
                </View>
              </View>
            </View>

            <View style={styles.graceDivider} />

            <View style={styles.graceRow}>
              <View style={styles.graceLeft}>
                <Ionicons name="hourglass-outline" size={14} color={Colors.warning} />
                <Text style={styles.graceLabel}>Date:</Text>
              </View>
              <Text style={styles.graceTimerText}>{date}</Text>
            </View>
          </View>

          {/* Action buttons */}
          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={styles.scanButton}
              onPress={handleTurnstileScan}
              activeOpacity={0.8}
            >
              <Ionicons name="checkmark-circle-outline" size={18} color={Colors.textDark} />
              <Text style={styles.scanButtonText}>Scan at Turnstile</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.releaseButton}
              onPress={handleReleaseExtend}
              activeOpacity={0.8}
            >
              <Ionicons name="headset-outline" size={18} color="#FFFFFF" />
              <Text style={styles.releaseButtonText}>Seat Releases and Extends</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

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
  // Verified bar
  verifiedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 20,
    marginBottom: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: Colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.soft,
  },
  verifiedLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  verifiedText: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.textDark,
    letterSpacing: 0.6,
  },
  activePill: {
    backgroundColor: Colors.successSoft,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  activePillText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.success,
  },
  // QR card
  qrCard: {
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 20,
    backgroundColor: Colors.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    ...Shadows.card,
  },
  scanPillContainer: {
    marginBottom: 16,
  },
  readyPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.successSoft,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  greenDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.success,
  },
  readyPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.success,
  },
  // QR frame with decorative corner brackets
  qrFrame: {
    width: 210,
    height: 210,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginBottom: 16,
  },
  cornerBracket: {
    position: 'absolute',
    width: 22,
    height: 22,
    borderColor: Colors.primary,
    zIndex: 1,
  },
  topLeftBracket: {
    top: 8,
    left: 8,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderTopLeftRadius: 4,
  },
  topRightBracket: {
    top: 8,
    right: 8,
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderTopRightRadius: 4,
  },
  bottomLeftBracket: {
    bottom: 8,
    left: 8,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderBottomLeftRadius: 4,
  },
  bottomRightBracket: {
    bottom: 8,
    right: 8,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderBottomRightRadius: 4,
  },
  qrInner: {
    padding: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
  },
  // Token & PIN
  tokenText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textSecondary,
    letterSpacing: 1.2,
    marginBottom: 14,
  },
  tokenBoldText: {
    color: Colors.textDark,
    fontWeight: '800',
  },
  orDividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    gap: 8,
    marginBottom: 14,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5EBF0',
  },
  orDividerText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 1,
  },
  pinBoxesRow: {
    flexDirection: 'row',
    gap: 8,
  },
  pinBox: {
    width: 44,
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinDigitText: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textDark,
  },
  copyPinBox: {
    width: 44,
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Allocated station card
  allocatedCard: {
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 16,
    backgroundColor: Colors.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.card,
  },
  allocatedTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  allocatedLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: Colors.textSecondary,
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  stationTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textDark,
  },
  stationSubtitle: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  slotGroup: {
    alignItems: 'flex-end',
  },
  slotTimeText: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.textDark,
  },
  hoursBadge: {
    backgroundColor: Colors.primarySoft,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginTop: 4,
  },
  hoursBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.primary,
  },
  graceDivider: {
    height: 1,
    backgroundColor: '#F0F3F6',
    marginVertical: 10,
  },
  graceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  graceLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  graceLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  graceTimerText: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.textDark,
  },
  // Action buttons
  actionsContainer: {
    marginHorizontal: 20,
    marginBottom: 24,
    gap: 10,
  },
  scanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: 14,
    borderRadius: 14,
    ...Shadows.soft,
  },
  scanButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textDark,
  },
  releaseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 14,
    ...Shadows.soft,
  },
  releaseButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
