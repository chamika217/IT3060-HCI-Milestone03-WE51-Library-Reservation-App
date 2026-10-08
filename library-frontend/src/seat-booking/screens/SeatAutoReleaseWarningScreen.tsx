import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SeatBottomNav, TabName } from '../components/SeatBottomNav';
import { Colors, Shadows } from '../constants/designSystem';
import { ALL_LIBRARY_SLOTS, MOCK_ROOMS } from '../mock/roomsData';
import { useBookingStore } from '../store/bookingStore';
import { Booking } from '../types/seatBooking';

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────
/** The warning activates this many seconds before slot end. */
const WARNING_WINDOW_SECS = 10 * 60; // 10 minutes

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────
function formatMM_SS(totalSeconds: number): string {
  const s = Math.max(0, totalSeconds);
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
}

function minutesToClock(totalMinutes: number): string {
  const clamped = ((totalMinutes % (24 * 60)) + 24 * 60) % (24 * 60);
  const h = Math.floor(clamped / 60);
  const m = clamped % 60;
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h > 12 ? h - 12 : h === 0 ? 12 : h;
  return `${String(h12).padStart(2, '0')}:${String(m).padStart(2, '0')} ${ampm}`;
}

/** Compute how many whole seconds remain until `endMinutes` wall clock. */
function secsUntilEnd(endMinutes: number): number {
  const now = new Date();
  const nowSecs = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
  const endSecs = endMinutes * 60;
  return Math.max(0, endSecs - nowSecs);
}

// ─────────────────────────────────────────────────────────────────────────────
// Circular progress ring  (pure RN, no SVG lib needed)
// Uses the two-semi-circle rotation trick:
//   – The left half is always clipped to show 0–180°
//   – The right half is rotated from 0° (hidden) to 180° (full)
//   – Combining them gives a smooth 0–360° arc
// ─────────────────────────────────────────────────────────────────────────────
interface CircularTimerProps {
  progress: number; // 0.0 → 1.0 (1.0 = full ring = time remaining)
  remainingSecs: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  trackColor?: string;
}

const CircularTimer: React.FC<CircularTimerProps> = ({
  progress,
  remainingSecs,
  size = 160,
  strokeWidth = 10,
  color = Colors.error,
  trackColor = '#F0F3F6',
}) => {
  // Intentionally created once — re-creating Animated.Value would reset the animation.
  const animProgress = useMemo(() => new Animated.Value(progress), []);

  useEffect(() => {
    Animated.timing(animProgress, {
      toValue: progress,
      duration: 800,
      useNativeDriver: false,
    }).start();
  }, [progress, animProgress]);

  const half = size / 2;
  const innerSize = size - strokeWidth * 2;

  // Right half rotates from -180° (0% progress) to 0° (50% progress)
  const rightRotation = animProgress.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: ['-180deg', '0deg', '0deg'],
  });

  // Left half stays hidden until 50%, then rotates from -180° to 0°
  const leftRotation = animProgress.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: ['-180deg', '-180deg', '0deg'],
  });

  const isUrgent = remainingSecs < 60;
  const ringColor = isUrgent ? Colors.error : remainingSecs < 180 ? Colors.warning : color;
  const label = formatMM_SS(remainingSecs);

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      {/* Track ring */}
      <View
        style={{
          position: 'absolute',
          width: size,
          height: size,
          borderRadius: half,
          borderWidth: strokeWidth,
          borderColor: trackColor,
        }}
      />

      {/* Right semi-circle */}
      <View
        style={{
          position: 'absolute',
          width: size,
          height: size,
          borderRadius: half,
          overflow: 'hidden',
          left: 0,
          top: 0,
        }}
      >
        {/* Clip: show only right half */}
        <View style={{ position: 'absolute', right: 0, width: half, height: size, overflow: 'hidden' }}>
          <Animated.View
            style={{
              width: size,
              height: size,
              borderRadius: half,
              borderWidth: strokeWidth,
              borderColor: ringColor,
              position: 'absolute',
              left: 0,
              top: 0,
              transform: [{ rotate: rightRotation }],
            }}
          />
        </View>
      </View>

      {/* Left semi-circle */}
      <View
        style={{
          position: 'absolute',
          width: size,
          height: size,
          borderRadius: half,
          overflow: 'hidden',
          left: 0,
          top: 0,
        }}
      >
        {/* Clip: show only left half */}
        <View style={{ position: 'absolute', left: 0, width: half, height: size, overflow: 'hidden' }}>
          <Animated.View
            style={{
              width: size,
              height: size,
              borderRadius: half,
              borderWidth: strokeWidth,
              borderColor: ringColor,
              position: 'absolute',
              left: 0,
              top: 0,
              transform: [{ rotate: leftRotation }],
            }}
          />
        </View>
      </View>

      {/* Inner content */}
      <View
        style={{
          width: innerSize,
          height: innerSize,
          borderRadius: innerSize / 2,
          backgroundColor: Colors.card,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Ionicons
          name="hourglass-outline"
          size={18}
          color={isUrgent ? Colors.error : Colors.textSecondary}
          style={{ marginBottom: 2 }}
        />
        <Text style={[styles.timerLabel, isUrgent && styles.timerLabelUrgent]}>{label}</Text>
        <Text style={styles.timerSubLabel}>LEFT</Text>
      </View>
    </View>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Screen
// ─────────────────────────────────────────────────────────────────────────────
export default function SeatAutoReleaseWarningScreen() {
  const router = useRouter();
  const { getActiveBookings, getBookingEndMinutes, markCompleted, cancelBooking } =
    useBookingStore();

  // ── Resolve active booking ────────────────────────────────────────────────
  const activeBooking: Booking | undefined = useMemo(
    () => getActiveBookings()[0],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [getActiveBookings]
  );

  const slot = useMemo(
    () => (activeBooking ? ALL_LIBRARY_SLOTS.find((s) => s.id === activeBooking.slotId) : undefined),
    [activeBooking]
  );

  const room = useMemo(
    () => (activeBooking ? MOCK_ROOMS.find((r) => r.code === activeBooking.roomCode) : undefined),
    [activeBooking]
  );

  const endMinutes: number = useMemo(() => {
    if (!activeBooking) return 0;
    return getBookingEndMinutes(activeBooking) ?? (slot ? slot.endHour * 60 + slot.endMin : 0);
  }, [activeBooking, getBookingEndMinutes, slot]);

  const startMinutes: number = useMemo(
    () => (slot ? slot.startHour * 60 + slot.startMin : 0),
    [slot]
  );

  const seatNumber = activeBooking?.seatNumber.replace(/^Seat\s*/i, '') ?? '—';
  const roomName = room?.name ?? activeBooking?.roomCode ?? '—';
  const timeRange = slot?.timeRange ?? '—';
  const dateLabel = activeBooking?.dateOption === 'tomorrow' ? 'Tomorrow' : 'Today';
  const warningStartMins = endMinutes - 10; // warning activates 10 min before end

  // ── Real-time countdown ───────────────────────────────────────────────────
  const [remainingSecs, setRemainingSecs] = useState<number>(() => secsUntilEnd(endMinutes));
  const [isInWarningWindow, setIsInWarningWindow] = useState<boolean>(() => {
    const now = new Date();
    const nowMins = now.getHours() * 60 + now.getMinutes();
    return nowMins >= warningStartMins;
  });
  const [hasAutoReleased, setHasAutoReleased] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!activeBooking || hasAutoReleased) return;

    timerRef.current = setInterval(() => {
      const secs = secsUntilEnd(endMinutes);
      setRemainingSecs(secs);

      const now = new Date();
      const nowMins = now.getHours() * 60 + now.getMinutes();
      setIsInWarningWindow(nowMins >= warningStartMins);

      // Auto-release when countdown hits 0
      if (secs === 0 && !hasAutoReleased) {
        setHasAutoReleased(true);
        if (timerRef.current) clearInterval(timerRef.current);
        markCompleted(activeBooking.id);
        Alert.alert(
          'Seat Auto-Released',
          `Seat ${seatNumber} has been automatically returned to the pool. Your booking has been moved to Past History.`,
          [{ text: 'OK', onPress: () => router.push('/seats/my-bookings') }]
        );
      }
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [activeBooking, endMinutes, warningStartMins, hasAutoReleased, markCompleted, seatNumber, router]);

  // ── Warning-window countdown (10-min window, seconds 600 → 0) ────────────
  const warningWindowSecs = isInWarningWindow
    ? Math.min(remainingSecs, WARNING_WINDOW_SECS)
    : WARNING_WINDOW_SECS;

  // Progress for the ring: 1.0 = full time remaining, 0.0 = expired
  const ringProgress = isInWarningWindow
    ? warningWindowSecs / WARNING_WINDOW_SECS
    : 1.0;

  // ── Session progress (linear bar at bottom of details card) ──────────────
  const totalSlotSecs = (endMinutes - startMinutes) * 60;
  const usedSecs = totalSlotSecs - remainingSecs;
  const sessionProgressPct =
    totalSlotSecs > 0 ? Math.min(100, Math.round((usedSecs / totalSlotSecs) * 100)) : 0;

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleCancelReservation = () => {
    if (!activeBooking) return;
    Alert.alert(
      'Cancel Reservation',
      `This will cancel your booking for Seat ${seatNumber} and return you to active session status.`,
      [
        { text: 'Keep Booking', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: () => {
            if (timerRef.current) clearInterval(timerRef.current);
            cancelBooking(activeBooking.id);
            router.push('/seats');
          },
        },
      ]
    );
  };

  const handleExtend = () => {
    router.push({
      pathname: '/seats/extend-reservation',
      params: { seatNumber, roomName, timeRange },
    });
  };

  // ── No-booking guard ──────────────────────────────────────────────────────
  if (!activeBooking) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.headerIconBox}>
              <Ionicons name="book-outline" size={18} color={Colors.primary} />
            </View>
            <Text style={styles.headerTitle}>Reservation Pass</Text>
          </View>
        </View>
        <View style={styles.noBookingContainer}>
          <View style={styles.noBookingIconCircle}>
            <Ionicons name="checkmark-circle-outline" size={36} color={Colors.success} />
          </View>
          <Text style={styles.noBookingTitle}>No Active Session</Text>
          <Text style={styles.noBookingSubtitle}>
            You have no active reservations. All clear!
          </Text>
          <TouchableOpacity
            style={styles.goHomeBtn}
            onPress={() => router.push('/seats')}
            activeOpacity={0.85}
          >
            <Text style={styles.goHomeBtnText}>Browse Study Rooms</Text>
          </TouchableOpacity>
        </View>
        <SeatBottomNav activeTab="Alerts" />
      </SafeAreaView>
    );
  }

  const isExpired = remainingSecs === 0;

  // ── Main render ───────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.headerIconBox}>
            <Ionicons name="book-outline" size={18} color={Colors.primary} />
          </View>
          <Text style={styles.headerTitle}>Reservation Pass</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.iconBtn}>
            <Ionicons name="notifications-outline" size={22} color={Colors.textDark} />
            <View style={styles.alertBadge} />
          </TouchableOpacity>
          <View style={styles.avatarCircle}>
            <Ionicons name="person" size={16} color="#FFFFFF" />
          </View>
        </View>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Breadcrumb */}
        <View style={styles.breadcrumb}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={16} color={Colors.textDark} />
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
          <Text style={styles.breadcrumbTag}>ALERTS • SCREEN 06</Text>
        </View>

        {/* Page title */}
        <View style={styles.pageTitleContainer}>
          <Text style={styles.pageTitle}>Seat Auto–Release Warning</Text>
          <Text style={styles.pageSubtitle}>
            {isExpired
              ? 'Your seat has been automatically released back to the pool.'
              : isInWarningWindow
              ? 'Your seat will be released in under 10 minutes. Act now to keep or extend it.'
              : 'Your reserved seat will be automatically released if you do not check in before expiration.'}
          </Text>
        </View>

        {/* ── Circular countdown card ── */}
        <View style={[
          styles.card,
          styles.graceCard,
          isExpired && styles.graceCardExpired,
          isInWarningWindow && !isExpired && styles.graceCardWarning,
        ]}>
          {/* Status row */}
          <View style={styles.graceTopRow}>
            <View style={styles.graceTopLeft}>
              <Ionicons
                name={isExpired ? 'alert-circle-outline' : 'radio-outline'}
                size={15}
                color={isExpired ? Colors.error : isInWarningWindow ? Colors.warning : Colors.success}
              />
              <Text style={[
                styles.graceActiveLabel,
                isExpired && styles.labelExpired,
                isInWarningWindow && !isExpired && styles.labelWarning,
              ]}>
                {isExpired
                  ? 'SEAT AUTO-RELEASED'
                  : isInWarningWindow
                  ? 'WARNING — SLOT ENDING SOON'
                  : 'LIVE TIMER ACTIVE'}
              </Text>
            </View>

            <View style={[
              styles.statusPill,
              isExpired ? styles.statusPillExpired
                : isInWarningWindow ? styles.statusPillWarning
                : styles.statusPillActive,
            ]}>
              <View style={[
                styles.statusDot,
                isExpired ? styles.dotExpired
                  : isInWarningWindow ? styles.dotWarning
                  : styles.dotActive,
              ]} />
              <Text style={[
                styles.statusPillText,
                isExpired ? styles.statusPillTextExpired
                  : isInWarningWindow ? styles.statusPillTextWarning
                  : styles.statusPillTextActive,
              ]}>
                {isExpired ? 'RELEASED' : isInWarningWindow ? 'URGENT' : 'ACTIVE'}
              </Text>
            </View>
          </View>

          {/* Gate sync label */}
          <Text style={styles.graceDesc}>
            Synchronized with Library Access Gate:{' '}
            <Text style={styles.graceDescBold}>{roomName}</Text>
          </Text>
          <Text style={styles.graceDescBold}>(Seat {seatNumber})</Text>

          {/* Circular timer */}
          <View style={styles.circularTimerRow}>
            <CircularTimer
              progress={ringProgress}
              remainingSecs={isInWarningWindow ? warningWindowSecs : remainingSecs}
              size={156}
              strokeWidth={10}
              color={isInWarningWindow ? Colors.warning : Colors.primary}
            />

            <View style={styles.timerSideInfo}>
              <View style={styles.timerInfoItem}>
                <Text style={styles.timerInfoLabel}>WARNING AT</Text>
                <Text style={styles.timerInfoValue}>{minutesToClock(warningStartMins)}</Text>
              </View>
              <View style={styles.timerInfoDivider} />
              <View style={styles.timerInfoItem}>
                <Text style={styles.timerInfoLabel}>SLOT ENDS</Text>
                <Text style={[styles.timerInfoValue, isExpired && { color: Colors.error }]}>
                  {minutesToClock(endMinutes)}
                </Text>
              </View>
              <View style={styles.timerInfoDivider} />
              <View style={styles.timerInfoItem}>
                <Text style={styles.timerInfoLabel}>DATE</Text>
                <Text style={styles.timerInfoValue}>{dateLabel}</Text>
              </View>
            </View>
          </View>

          {/* Session progress bar */}
          <View style={styles.sessionProgressSection}>
            <View style={styles.sessionProgressLabelRow}>
              <Text style={styles.sessionProgressLabel}>Session used</Text>
              <Text style={styles.sessionProgressPct}>{sessionProgressPct}%</Text>
            </View>
            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${sessionProgressPct}%` },
                  sessionProgressPct >= 90 && styles.progressFillUrgent,
                ]}
              />
            </View>
          </View>
        </View>

        {/* ── Reservation Details card ── */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardSectionLabel}>RESERVATION DETAILS</Text>
            <Text style={styles.actionRequiredLabel}>
              {isExpired ? 'Released' : 'Action required'}
            </Text>
          </View>

          {/* Seat row */}
          <View style={styles.detailRow}>
            <View style={styles.detailIconBox}>
              <Ionicons name="desktop-outline" size={16} color={Colors.primary} />
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailTitle}>Seat {seatNumber}</Text>
              <Text style={styles.detailSub}>{roomName} • Level {room?.level ?? 1}</Text>
            </View>
            <View style={styles.detailBadge}>
              <Text style={styles.detailBadgeText}>{room?.code ?? activeBooking.roomCode}</Text>
            </View>
          </View>

          {/* Time row */}
          <View style={styles.detailRow}>
            <View style={styles.detailIconBox}>
              <Ionicons name="time-outline" size={16} color={Colors.primary} />
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailTitle}>{timeRange}</Text>
              <Text style={styles.detailSub}>
                {`Warning at ${minutesToClock(warningStartMins)}`}
              </Text>
            </View>
            <View style={styles.detailBadge}>
              <Text style={styles.detailBadgeText}>2h Slot</Text>
            </View>
          </View>

          {/* Auto-release row */}
          <View style={[styles.detailRow, styles.detailRowLast]}>
            <View style={[styles.detailIconBox, styles.detailIconBoxWarning]}>
              <Ionicons name="alarm-outline" size={16} color={Colors.error} />
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailTitle}>Auto-Release Timeout</Text>
              <Text style={styles.autoReleaseRemaining}>
                {isExpired
                  ? 'Seat forfeited — reservation completed'
                  : `${formatMM_SS(remainingSecs)} remaining before forfeit`}
              </Text>
            </View>
            <View style={styles.gracePlusBadge}>
              <Text style={styles.gracePlusBadgeText}>+5m Grace</Text>
            </View>
          </View>
        </View>

        {/* ── Campus Advisory ── */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardSectionLabel}>CAMPUS ADVISORY</Text>
            <Text style={styles.bylawsLabel}>SLIIT Library Bylaws</Text>
          </View>
          <View style={styles.advisoryBody}>
            <Ionicons name="information-circle-outline" size={16} color={Colors.primary} />
            <Text style={styles.advisoryText}>
              <Text style={styles.advisoryBold}>Attendance Penalty: </Text>
              3 consecutive unattended reservations automatically restrict booking privileges
              for 7 days.
            </Text>
          </View>
        </View>

        {/* ── Action buttons ── */}
        {!isExpired && (
          <View style={styles.actionsContainer}>
            {/* Cancel reservation */}
            <TouchableOpacity
              style={styles.releaseBtn}
              onPress={handleCancelReservation}
              activeOpacity={0.85}
            >
              <Ionicons name="close-circle-outline" size={17} color={Colors.error} />
              <Text style={styles.releaseBtnText}>Cancel Reservation</Text>
            </TouchableOpacity>

            {/* Extend */}
            <TouchableOpacity
              style={styles.extendBtn}
              onPress={handleExtend}
              activeOpacity={0.85}
            >
              <Ionicons name="add-circle-outline" size={17} color="#FFFFFF" />
              <Text style={styles.extendBtnText}>Extend Seat Reservation</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Released state CTA */}
        {isExpired && (
          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={styles.extendBtn}
              onPress={() => router.push('/seats/my-bookings')}
              activeOpacity={0.85}
            >
              <Ionicons name="calendar-outline" size={17} color="#FFFFFF" />
              <Text style={styles.extendBtnText}>View Booking History</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Bottom nav */}
      <SeatBottomNav
        activeTab="Alerts"
        onTabPress={(tab: TabName) => {
          if (tab === 'Home') router.push('/seats');
          else if (tab === 'Bookings') router.push('/seats/my-bookings');
          else if (tab === 'Alerts') router.push('/seats/auto-release-warning');
        }}
      />
    </SafeAreaView>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  // Header
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 12,
    backgroundColor: Colors.card, borderBottomWidth: 1, borderBottomColor: Colors.border,
    ...Shadows.soft,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  headerIconBox: {
    width: 34, height: 34, borderRadius: 10,
    backgroundColor: Colors.primarySoft, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: '#D0E1F9',
  },
  headerTitle: { fontSize: 17, fontWeight: '700', color: Colors.textDark, letterSpacing: -0.2 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  iconBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: '#F0F3F7', alignItems: 'center', justifyContent: 'center',
    position: 'relative',
  },
  alertBadge: {
    position: 'absolute', top: 8, right: 8,
    width: 7, height: 7, borderRadius: 4,
    backgroundColor: Colors.error, borderWidth: 1.5, borderColor: Colors.card,
  },
  avatarCircle: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: '#1E293B', alignItems: 'center', justifyContent: 'center',
  },
  // Scroll
  scroll: { flex: 1 },
  // Breadcrumb
  breadcrumb: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 16, paddingBottom: 4,
  },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  backText: { fontSize: 13, fontWeight: '600', color: Colors.textDark },
  breadcrumbTag: { fontSize: 10, fontWeight: '700', color: Colors.textSecondary, letterSpacing: 0.7 },
  // Page title
  pageTitleContainer: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 16 },
  pageTitle: { fontSize: 24, fontWeight: '800', color: Colors.textDark, letterSpacing: -0.4, marginBottom: 6 },
  pageSubtitle: { fontSize: 13, color: Colors.textSecondary, lineHeight: 19 },
  // Cards
  card: {
    marginHorizontal: 16, marginBottom: 14, padding: 16,
    backgroundColor: Colors.card, borderRadius: 18, borderWidth: 1, borderColor: Colors.border,
    ...Shadows.card,
  },
  graceCard: { borderColor: Colors.success, borderWidth: 1.5 },
  graceCardWarning: { borderColor: Colors.warning },
  graceCardExpired: { borderColor: Colors.error },
  cardHeaderRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14,
  },
  cardSectionLabel: { fontSize: 9, fontWeight: '800', color: Colors.textSecondary, letterSpacing: 0.9 },
  // Grace top row
  graceTopRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10,
  },
  graceTopLeft: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  graceActiveLabel: { fontSize: 10, fontWeight: '800', color: Colors.success, letterSpacing: 0.6 },
  labelWarning: { color: Colors.warning },
  labelExpired: { color: Colors.error },
  // Status pill
  statusPill: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10, borderWidth: 1,
  },
  statusPillActive: { backgroundColor: Colors.successSoft, borderColor: '#B8ECDA' },
  statusPillWarning: { backgroundColor: Colors.warningSoft, borderColor: '#FAD4AA' },
  statusPillExpired: { backgroundColor: '#F0F4F8', borderColor: Colors.border },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  dotActive: { backgroundColor: Colors.success },
  dotWarning: { backgroundColor: Colors.warning },
  dotExpired: { backgroundColor: Colors.textSecondary },
  statusPillText: { fontSize: 11, fontWeight: '800' },
  statusPillTextActive: { color: Colors.success },
  statusPillTextWarning: { color: Colors.warning },
  statusPillTextExpired: { color: Colors.textSecondary },
  // Grace desc
  graceDesc: { fontSize: 13, color: Colors.textSecondary, lineHeight: 19 },
  graceDescBold: { fontWeight: '700', color: Colors.textDark, fontSize: 13 },
  // Circular timer
  circularTimerRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginTop: 16, marginBottom: 16,
  },
  timerSideInfo: {
    flex: 1, marginLeft: 20,
    backgroundColor: Colors.background, borderRadius: 14, padding: 12,
    borderWidth: 1, borderColor: Colors.border,
    gap: 2,
  },
  timerInfoItem: { paddingVertical: 6 },
  timerInfoLabel: {
    fontSize: 8, fontWeight: '800', color: Colors.textSecondary,
    letterSpacing: 0.8, marginBottom: 2,
  },
  timerInfoValue: { fontSize: 13, fontWeight: '800', color: Colors.textDark },
  timerInfoDivider: { height: 1, backgroundColor: Colors.border },
  // Timer inner labels
  timerLabel: { fontSize: 20, fontWeight: '800', color: Colors.textDark, letterSpacing: 0.5 },
  timerLabelUrgent: { color: Colors.error },
  timerSubLabel: { fontSize: 8, fontWeight: '700', color: Colors.textSecondary, letterSpacing: 1 },
  // Session progress
  sessionProgressSection: { marginTop: 4 },
  sessionProgressLabelRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6,
  },
  sessionProgressLabel: { fontSize: 11, fontWeight: '600', color: Colors.textSecondary },
  sessionProgressPct: { fontSize: 11, fontWeight: '800', color: Colors.textDark },
  progressTrack: { height: 6, backgroundColor: '#EEF2F6', borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: Colors.primary, borderRadius: 3 },
  progressFillUrgent: { backgroundColor: Colors.error },
  // Action required
  actionRequiredLabel: { fontSize: 11, fontWeight: '700', color: Colors.error },
  // Detail rows
  detailRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  detailRowLast: { borderBottomWidth: 0, paddingBottom: 0 },
  detailIconBox: {
    width: 38, height: 38, borderRadius: 10,
    backgroundColor: Colors.primarySoft, alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  detailIconBoxWarning: { backgroundColor: Colors.errorSoft },
  detailContent: { flex: 1 },
  detailTitle: { fontSize: 14, fontWeight: '700', color: Colors.textDark, marginBottom: 2 },
  detailSub: { fontSize: 11, color: Colors.textSecondary },
  autoReleaseRemaining: { fontSize: 11, fontWeight: '700', color: Colors.error },
  detailBadge: {
    backgroundColor: Colors.neutralSoft, paddingHorizontal: 9, paddingVertical: 5,
    borderRadius: 8, borderWidth: 1, borderColor: Colors.border, flexShrink: 0,
  },
  detailBadgeText: { fontSize: 11, fontWeight: '700', color: Colors.textDark },
  gracePlusBadge: {
    backgroundColor: Colors.successSoft, paddingHorizontal: 9, paddingVertical: 5,
    borderRadius: 8, borderWidth: 1, borderColor: '#B8ECDA', flexShrink: 0,
  },
  gracePlusBadgeText: { fontSize: 11, fontWeight: '700', color: Colors.success },
  // Advisory
  bylawsLabel: { fontSize: 10, fontWeight: '700', color: Colors.textSecondary, letterSpacing: 0.3 },
  advisoryBody: {
    flexDirection: 'row', gap: 10, alignItems: 'flex-start',
    backgroundColor: Colors.primarySoft, borderRadius: 12, padding: 12,
    borderWidth: 1, borderColor: '#C5D9F7',
  },
  advisoryText: { fontSize: 12, color: Colors.textSecondary, lineHeight: 18, flex: 1 },
  advisoryBold: { fontWeight: '700', color: Colors.textDark },
  // Actions
  actionsContainer: { marginHorizontal: 16, marginBottom: 24, gap: 10 },
  releaseBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: '#FFFFFF', borderWidth: 1.5, borderColor: Colors.error,
    paddingVertical: 15, borderRadius: 16, ...Shadows.soft,
  },
  releaseBtnText: { fontSize: 14, fontWeight: '700', color: Colors.error },
  extendBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: Colors.primary, paddingVertical: 16, borderRadius: 16, ...Shadows.soft,
  },
  extendBtnText: { fontSize: 14, fontWeight: '800', color: '#FFFFFF' },
  // No-booking guard
  noBookingContainer: {
    flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32, gap: 12,
  },
  noBookingIconCircle: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: Colors.successSoft, alignItems: 'center', justifyContent: 'center', marginBottom: 4,
  },
  noBookingTitle: { fontSize: 18, fontWeight: '800', color: Colors.textDark },
  noBookingSubtitle: { fontSize: 13, color: Colors.textSecondary, textAlign: 'center', lineHeight: 19 },
  goHomeBtn: {
    marginTop: 8, backgroundColor: Colors.primary,
    paddingHorizontal: 28, paddingVertical: 13, borderRadius: 12, ...Shadows.soft,
  },
  goHomeBtnText: { fontSize: 14, fontWeight: '700', color: '#FFFFFF' },
});
