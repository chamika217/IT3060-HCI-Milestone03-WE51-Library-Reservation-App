import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
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
/** Library closes at 20:00 — no extension may push a booking past this. */
const LIBRARY_CLOSE_MINUTES = 20 * 60; // 1200

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
interface ExtensionOption {
  label: string;
  deltaLabel: string;
  addMinutes: number;
  newEndMinutes: number;
  newEndTimeLabel: string;
  status: 'available' | 'clash';
  clashReason?: string;
  recommended?: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────
function minutesToLabel(totalMinutes: number): string {
  const clamped = ((totalMinutes % (24 * 60)) + 24 * 60) % (24 * 60);
  const h = Math.floor(clamped / 60);
  const m = clamped % 60;
  const ampm = h >= 12 ? 'PM' : 'AM';
  const displayH = h > 12 ? h - 12 : h === 0 ? 12 : h;
  return `${String(displayH).padStart(2, '0')}:${String(m).padStart(2, '0')} ${ampm}`;
}

function formatCountdown(totalSeconds: number): string {
  const s = Math.max(0, totalSeconds);
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Screen
// ─────────────────────────────────────────────────────────────────────────────
export default function ExtendSeatReservationScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    seatNumber?: string;
    roomName?: string;
    timeRange?: string;
  }>();

  const { getActiveBookings, getBookingEndMinutes, isSeatTaken, extendBooking } =
    useBookingStore();

  // ── Resolve active booking from store ─────────────────────────────────────
  const paramSeat = (params.seatNumber ?? '').replace(/^Seat\s*/i, '');

  const activeBooking: Booking | undefined = useMemo(() => {
    const all = getActiveBookings();
    if (paramSeat) {
      return (
        all.find((b) => b.seatNumber === paramSeat || b.seatNumber === `Seat ${paramSeat}`) ??
        all[0]
      );
    }
    return all[0];
  }, [getActiveBookings, paramSeat]);

  // Derive display values from the live booking; fall back to route params
  const seatNumber = activeBooking
    ? activeBooking.seatNumber.replace(/^Seat\s*/i, '')
    : paramSeat || 'B-14';

  const roomObj = useMemo(
    () => (activeBooking ? MOCK_ROOMS.find((r) => r.code === activeBooking.roomCode) : undefined),
    [activeBooking]
  );
  const roomName = roomObj?.name ?? params.roomName ?? 'Individual Study Area L1';

  const slot = useMemo(
    () => (activeBooking ? ALL_LIBRARY_SLOTS.find((s) => s.id === activeBooking.slotId) : undefined),
    [activeBooking]
  );
  const timeRange = slot?.timeRange ?? params.timeRange ?? '—';

  // Effective end time in wall-clock minutes (accounts for prior extensions)
  const endMinutes: number = useMemo(() => {
    if (activeBooking) {
      return getBookingEndMinutes(activeBooking) ?? (slot ? slot.endHour * 60 + slot.endMin : 0);
    }
    return 0;
  }, [activeBooking, getBookingEndMinutes, slot]);

  /**
   * True when the booking is on the final library slot (6:00 PM – 8:00 PM)
   * or any prior extension has already pushed the end to closing time.
   * Extensions are completely blocked in this state.
   */
  const isLastSlot: boolean = endMinutes >= LIBRARY_CLOSE_MINUTES;

  // ── Real-time remaining countdown ─────────────────────────────────────────
  const [remainingSeconds, setRemainingSeconds] = useState<number>(() => {
    const now = new Date();
    const nowMins = now.getHours() * 60 + now.getMinutes();
    return Math.max(0, (endMinutes - nowMins) * 60 - now.getSeconds());
  });

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    timerRef.current = setInterval(() => {
      const now = new Date();
      const nowMins = now.getHours() * 60 + now.getMinutes();
      const secs = Math.max(0, (endMinutes - nowMins) * 60 - now.getSeconds());
      setRemainingSeconds(secs);
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [endMinutes]);

  // ── Clash-checked extension options ───────────────────────────────────────
  const extensionOptions: ExtensionOption[] = useMemo(() => {
    const deltas = [
      { label: '+30 Minutes', deltaLabel: '+0.5h', addMinutes: 30 },
      { label: '+1 Hour',     deltaLabel: '+1.0h', addMinutes: 60, recommended: true },
      { label: '+2 Hours',    deltaLabel: '+2.0h', addMinutes: 120 },
    ];

    return deltas.map((d, idx) => {
      const newEnd = endMinutes + d.addMinutes;
      const newEndTimeLabel = minutesToLabel(newEnd);

      let clashReason: string | undefined;

      // ── Rule 1: cannot extend past library closing time (20:00) ──────────
      if (newEnd > LIBRARY_CLOSE_MINUTES) {
        clashReason = `Library closes at 08:00 PM — extension would exceed closing time`;
      }

      // ── Rule 2: another student has the same seat in the overlap window ───
      if (!clashReason && activeBooking) {
        const clashingSlot = ALL_LIBRARY_SLOTS.find((s) => {
          const slotStart = s.startHour * 60 + s.startMin;
          const inWindow = slotStart >= endMinutes && slotStart < newEnd;
          if (!inWindow) return false;
          return isSeatTaken(
            activeBooking.roomCode,
            activeBooking.seatNumber,
            s.id,
            activeBooking.dateOption
          );
        });
        if (clashingSlot) {
          clashReason = `Next slot reserved at ${minutesToLabel(
            clashingSlot.startHour * 60 + clashingSlot.startMin
          )}`;
        }
      }

      return {
        ...d,
        newEndMinutes: newEnd,
        newEndTimeLabel,
        status: clashReason ? 'clash' : 'available',
        clashReason,
        recommended: idx === 1 && !clashReason ? true : undefined,
      } as ExtensionOption;
    });
  }, [endMinutes, activeBooking, isSeatTaken]);

  // Default selection — first available option
  const [selectedOption, setSelectedOption] = useState<number>(() => {
    const firstAvailable = extensionOptions.findIndex((o) => o.status === 'available');
    return firstAvailable >= 0 ? firstAvailable : 0;
  });

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleConfirm = () => {
    // Hard block — final slot of the day
    if (isLastSlot) {
      Alert.alert(
        'Extension Not Allowed',
        'The library closes at 08:00 PM. Reservations on the final session slot (6:00 PM – 8:00 PM) cannot be extended.'
      );
      return;
    }
    const chosen = extensionOptions[selectedOption];
    if (!chosen || chosen.status === 'clash') {
      Alert.alert(
        'Cannot Extend',
        chosen?.clashReason ?? 'This extension has a booking clash.'
      );
      return;
    }
    if (!activeBooking) {
      Alert.alert('No Active Booking', 'No active booking found to extend.');
      return;
    }
    extendBooking(activeBooking.id, chosen.addMinutes);
    Alert.alert(
      'Reservation Extended ✅',
      `Seat ${seatNumber} extended by ${chosen.label}.\nNew end time: ${chosen.newEndTimeLabel}`,
      [{ text: 'OK', onPress: () => router.back() }]
    );
  };

  const currentEndLabel = minutesToLabel(endMinutes);

  // ── No active booking guard ───────────────────────────────────────────────
  if (!activeBooking) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Extend Reservation</Text>
          <TouchableOpacity style={styles.iconBtn} onPress={() => router.back()}>
            <Ionicons name="close" size={22} color={Colors.textDark} />
          </TouchableOpacity>
        </View>
        <View style={styles.noBookingContainer}>
          <View style={styles.noBookingIconCircle}>
            <Ionicons name="calendar-clear-outline" size={36} color={Colors.primary} />
          </View>
          <Text style={styles.noBookingTitle}>No Active Booking</Text>
          <Text style={styles.noBookingSubtitle}>
            You have no active reservation to extend. Book a seat first.
          </Text>
          <TouchableOpacity
            style={styles.goBookBtn}
            onPress={() => router.push('/seats')}
            activeOpacity={0.85}
          >
            <Text style={styles.goBookBtnText}>Browse Study Rooms</Text>
          </TouchableOpacity>
        </View>
        <SeatBottomNav activeTab="Home" />
      </SafeAreaView>
    );
  }

  // ── Main render ───────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Home</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.iconBtn}>
            <Ionicons name="notifications-outline" size={22} color={Colors.textDark} />
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
            <Text style={styles.backText}>BACK</Text>
          </TouchableOpacity>
          <View style={styles.breadcrumbTag}>
            <View style={styles.orangeDot} />
            <Text style={styles.breadcrumbTagText}>ACTIVE SESSION • EXTENSION</Text>
          </View>
        </View>

        {/* Page title */}
        <View style={styles.pageTitleContainer}>
          <Ionicons name="time-outline" size={22} color={Colors.primary} style={{ marginRight: 8 }} />
          <View style={{ flex: 1 }}>
            <Text style={styles.pageTitle}>Extend Seat Reservation</Text>
            <Text style={styles.pageSubtitle}>
              Request extra time for{' '}
              <Text style={styles.seatBold}>Seat {seatNumber}</Text>
              {' '}before auto-release or slot expiration.
            </Text>
          </View>
        </View>

        {/* Active Session Status */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardSectionLabel}>ACTIVE SESSION STATUS</Text>
            <Text style={styles.campusPill}>{roomObj?.code ?? 'SLIIT-LIB'}</Text>
          </View>

          <View style={styles.seatBadge}>
            <Ionicons name="desktop-outline" size={14} color={Colors.primary} />
            <Text style={styles.seatBadgeText}>
              Seat {seatNumber} ({roomName})
            </Text>
          </View>

          <View style={styles.windowRow}>
            <Ionicons name="time-outline" size={13} color={Colors.textSecondary} />
            <Text style={styles.windowText}>Current Window: {timeRange}</Text>
          </View>

          {/* Live Countdown */}
          <View style={[styles.countdownBanner, remainingSeconds < 300 && styles.countdownBannerUrgent]}>
            <View style={styles.countdownLeft}>
              <View style={styles.countdownIconCircle}>
                <Ionicons name="hourglass-outline" size={18} color="#FFFFFF" />
              </View>
              <View>
                <Text style={styles.countdownSubLabel}>AUTO-RELEASE COUNTDOWN</Text>
                <Text style={styles.countdownTimer}>{formatCountdown(remainingSeconds)}</Text>
                <Text style={styles.countdownRemaining}>REMAINING</Text>
              </View>
            </View>
            <View style={styles.slotActivePill}>
              <Text style={styles.slotActivePillText}>
                {remainingSeconds > 0 ? 'SLOT ACTIVE' : 'EXPIRED'}
              </Text>
            </View>
          </View>
        </View>

        {/* Extension Options — blocked on final slot, otherwise interactive */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardSectionLabel}>SELECT EXTENSION DURATION</Text>
            <Text style={styles.stepLabel}>Step 2 of 2</Text>
          </View>

          {isLastSlot ? (
            /* ── Final-slot locked banner ── */
            <View style={styles.lockedBanner}>
              <View style={styles.lockedIconCircle}>
                <Ionicons name="lock-closed" size={22} color={Colors.error} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.lockedTitle}>Extension Not Available</Text>
                <Text style={styles.lockedBody}>
                  Your booking is on the{' '}
                  <Text style={styles.lockedBold}>final session slot (6:00 PM – 8:00 PM)</Text>.
                  {' '}The library closes at 08:00 PM and extensions past closing time are not
                  permitted by SLIIT Library policy.
                </Text>
              </View>
            </View>
          ) : (
            extensionOptions.map((option, idx) => {
              const isSelected = selectedOption === idx;
              const isClash = option.status === 'clash';

              return (
                <TouchableOpacity
                  key={idx}
                  style={[
                    styles.optionCard,
                    isSelected && !isClash && styles.optionCardSelected,
                    isClash && styles.optionCardUnavailable,
                  ]}
                  onPress={() => !isClash && setSelectedOption(idx)}
                  activeOpacity={isClash ? 1 : 0.8}
                  disabled={isClash}
                >
                  <View style={styles.optionLeft}>
                    <View style={[
                      styles.radioDot,
                      isSelected && !isClash && styles.radioDotSelected,
                      isClash && styles.radioDotDisabled,
                    ]}>
                      {isSelected && !isClash && <View style={styles.radioDotInner} />}
                    </View>

                    <View style={{ flex: 1 }}>
                      <View style={styles.optionTitleRow}>
                        <Text style={[styles.optionTitle, isClash && styles.optionTitleUnavailable]}>
                          {option.label}
                        </Text>
                        <Text style={styles.optionDelta}>{option.deltaLabel}</Text>
                      </View>

                      {isClash ? (
                        <View style={styles.clashRow}>
                          <Ionicons name="warning-outline" size={11} color={Colors.error} />
                          <Text style={styles.clashText}>
                            Extension Unavailable: {option.clashReason}
                          </Text>
                        </View>
                      ) : (
                        <Text style={styles.optionEndTime}>
                          New End Time: {option.newEndTimeLabel}
                        </Text>
                      )}
                    </View>
                  </View>

                  <View style={styles.optionRight}>
                    {isClash ? (
                      <View style={styles.clashPill}>
                        <Text style={styles.clashPillText}>CLASH</Text>
                      </View>
                    ) : (
                      <View style={{ alignItems: 'flex-end' }}>
                        <Text style={styles.availableText}>● Available</Text>
                        {option.recommended && (
                          <Text style={styles.recommendedText}>Recommended</Text>
                        )}
                        {!option.recommended && (
                          <Text style={styles.noClashText}>No Clash</Text>
                        )}
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </View>

        {/* Extension Policy */}
        <View style={styles.policyCard}>
          <View style={styles.policyHeader}>
            <Ionicons name="shield-checkmark-outline" size={14} color={Colors.textSecondary} />
            <Text style={styles.policyTitle}>EXTENSION POLICY</Text>
          </View>
          <Text style={styles.policyText}>
            SLIIT Library policy permits up to{' '}
            <Text style={styles.policyBold}>2 extensions per day</Text>
            {' '}subject to subsequent desk reservations. Unclaimed extensions count against booking quota.
          </Text>
        </View>

        {/* Actions */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={[
              styles.confirmBtn,
              (isLastSlot || extensionOptions[selectedOption]?.status === 'clash') && styles.confirmBtnDisabled,
            ]}
            onPress={handleConfirm}
            activeOpacity={0.85}
            disabled={isLastSlot}
          >
            <Ionicons
              name={isLastSlot ? 'lock-closed-outline' : 'refresh-circle-outline'}
              size={18}
              color="#FFFFFF"
            />
            <Text style={styles.confirmBtnText}>
              {isLastSlot
                ? 'Extension Not Available — Final Slot'
                : `Confirm & Extend Time (${extensionOptions[selectedOption]?.label ?? ''})`}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.keepCurrentBtn} onPress={() => router.back()} activeOpacity={0.7}>
            <Text style={styles.keepCurrentText}>Keep Current End Time ({currentEndLabel})</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <SeatBottomNav
        activeTab="Home"
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
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 14,
    backgroundColor: Colors.card, borderBottomWidth: 1, borderBottomColor: Colors.border,
    ...Shadows.soft,
  },
  headerTitle: { fontSize: 18, fontWeight: '800', color: Colors.textDark },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  iconBtn: { padding: 2 },
  avatarCircle: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center',
  },
  scroll: { flex: 1 },
  breadcrumb: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 16, paddingBottom: 4,
  },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  backText: { fontSize: 13, fontWeight: '700', color: Colors.textDark, letterSpacing: 0.5 },
  breadcrumbTag: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  orangeDot: { width: 7, height: 7, borderRadius: 3.5, backgroundColor: Colors.warning },
  breadcrumbTagText: { fontSize: 10, fontWeight: '700', color: Colors.textSecondary, letterSpacing: 0.6 },
  pageTitleContainer: {
    flexDirection: 'row', alignItems: 'flex-start',
    paddingHorizontal: 20, paddingTop: 10, paddingBottom: 16,
  },
  pageTitle: { fontSize: 20, fontWeight: '800', color: Colors.textDark, letterSpacing: -0.3 },
  pageSubtitle: { fontSize: 12, color: Colors.textSecondary, marginTop: 3, lineHeight: 17 },
  seatBold: { fontWeight: '700', color: Colors.textDark },
  card: {
    marginHorizontal: 16, marginBottom: 14, padding: 16,
    backgroundColor: Colors.card, borderRadius: 18, borderWidth: 1, borderColor: Colors.border,
    ...Shadows.card,
  },
  cardHeaderRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12,
  },
  cardSectionLabel: { fontSize: 9, fontWeight: '800', color: Colors.textSecondary, letterSpacing: 0.9 },
  campusPill: {
    fontSize: 10, fontWeight: '700', color: Colors.textDark,
    backgroundColor: Colors.neutralSoft, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6,
  },
  stepLabel: { fontSize: 10, fontWeight: '600', color: Colors.textSecondary },
  seatBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start',
    backgroundColor: Colors.primarySoft, paddingHorizontal: 10, paddingVertical: 5,
    borderRadius: 8, marginBottom: 8,
  },
  seatBadgeText: { fontSize: 12, fontWeight: '700', color: Colors.primary },
  windowRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 14 },
  windowText: { fontSize: 12, color: Colors.textSecondary },
  countdownBanner: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: Colors.primary, borderRadius: 14, paddingHorizontal: 16, paddingVertical: 12,
  },
  countdownBannerUrgent: { backgroundColor: Colors.error },
  countdownLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  countdownIconCircle: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.25)', alignItems: 'center', justifyContent: 'center',
  },
  countdownSubLabel: { fontSize: 8, fontWeight: '700', color: 'rgba(255,255,255,0.75)', letterSpacing: 0.8 },
  countdownTimer: { fontSize: 26, fontWeight: '800', color: '#FFFFFF', letterSpacing: 1 },
  countdownRemaining: { fontSize: 8, fontWeight: '700', color: 'rgba(255,255,255,0.75)', letterSpacing: 0.8 },
  slotActivePill: {
    backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 10, paddingVertical: 5,
    borderRadius: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.4)',
  },
  slotActivePillText: { fontSize: 9, fontWeight: '800', color: '#FFFFFF', letterSpacing: 0.5 },
  optionCard: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 14, paddingVertical: 14,
    borderRadius: 14, borderWidth: 1.5, borderColor: Colors.border,
    backgroundColor: '#FFFFFF', marginBottom: 10,
  },
  optionCardSelected: { borderColor: Colors.primary, backgroundColor: Colors.primarySoft },
  optionCardUnavailable: { borderColor: Colors.border, backgroundColor: Colors.neutralSoft, opacity: 0.85 },
  optionLeft: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, flex: 1 },
  radioDot: {
    width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: Colors.border,
    alignItems: 'center', justifyContent: 'center', marginTop: 2,
  },
  radioDotSelected: { borderColor: Colors.primary },
  radioDotDisabled: { borderColor: Colors.border, backgroundColor: '#F0F4F8' },
  radioDotInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.primary },
  optionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  optionTitle: { fontSize: 15, fontWeight: '800', color: Colors.textDark },
  optionTitleUnavailable: { color: Colors.textSecondary },
  optionDelta: {
    fontSize: 11, fontWeight: '600', color: Colors.textSecondary,
    backgroundColor: Colors.neutralSoft, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 5,
  },
  optionEndTime: { fontSize: 11, color: Colors.textSecondary, marginTop: 3 },
  clashRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 4, marginTop: 3, maxWidth: 210 },
  clashText: { fontSize: 11, color: Colors.error, flex: 1, flexWrap: 'wrap' },
  optionRight: { alignItems: 'flex-end', minWidth: 72 },
  availableText: { fontSize: 11, fontWeight: '700', color: Colors.success, textAlign: 'right' },
  recommendedText: { fontSize: 10, fontWeight: '600', color: Colors.success, textAlign: 'right', marginTop: 1 },
  noClashText: { fontSize: 10, fontWeight: '600', color: Colors.success, textAlign: 'right', marginTop: 1 },
  clashPill: {
    backgroundColor: Colors.errorSoft, paddingHorizontal: 8, paddingVertical: 4,
    borderRadius: 6, borderWidth: 1, borderColor: Colors.error,
  },
  clashPillText: { fontSize: 10, fontWeight: '800', color: Colors.error, letterSpacing: 0.4 },
  policyCard: {
    marginHorizontal: 16, marginBottom: 14, padding: 14,
    backgroundColor: Colors.neutralSoft, borderRadius: 14, borderWidth: 1, borderColor: Colors.border,
  },
  policyHeader: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 6 },
  policyTitle: { fontSize: 9, fontWeight: '800', color: Colors.textSecondary, letterSpacing: 0.8 },
  policyText: { fontSize: 12, color: Colors.textSecondary, lineHeight: 18 },
  policyBold: { fontWeight: '700', color: Colors.textDark },
  actionsContainer: { marginHorizontal: 16, marginBottom: 24, gap: 10 },
  confirmBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: Colors.primary, paddingVertical: 16, borderRadius: 16, ...Shadows.soft,
  },
  confirmBtnDisabled: { backgroundColor: Colors.textSecondary },
  confirmBtnText: { fontSize: 14, fontWeight: '800', color: '#FFFFFF' },
  keepCurrentBtn: { alignItems: 'center', paddingVertical: 12 },
  keepCurrentText: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary },
  // No-booking guard
  noBookingContainer: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 32, gap: 12,
  },
  noBookingIconCircle: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: Colors.primarySoft, alignItems: 'center', justifyContent: 'center',
    marginBottom: 4,
  },
  noBookingTitle: { fontSize: 18, fontWeight: '800', color: Colors.textDark },
  noBookingSubtitle: {
    fontSize: 13, color: Colors.textSecondary, textAlign: 'center', lineHeight: 19,
  },
  goBookBtn: {
    marginTop: 8, backgroundColor: Colors.primary,
    paddingHorizontal: 28, paddingVertical: 13, borderRadius: 12, ...Shadows.soft,
  },
  goBookBtnText: { fontSize: 14, fontWeight: '700', color: '#FFFFFF' },
  // ── Final-slot locked banner ──
  lockedBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
    backgroundColor: Colors.errorSoft,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: Colors.error,
    padding: 16,
  },
  lockedIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    borderWidth: 1,
    borderColor: '#FAC8CA',
  },
  lockedTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.error,
    marginBottom: 6,
  },
  lockedBody: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  lockedBold: {
    fontWeight: '700',
    color: Colors.textDark,
  },
});
