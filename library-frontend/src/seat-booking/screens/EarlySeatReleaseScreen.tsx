import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
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

import { SeatBottomNav, TabName } from '../components/SeatBottomNav';
import { Colors, Shadows } from '../constants/designSystem';
import { ALL_LIBRARY_SLOTS, MOCK_ROOMS } from '../mock/roomsData';
import { useBookingStore } from '../store/bookingStore';
import { Booking } from '../types/seatBooking';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
interface ChecklistItem {
  id: number;
  label: string;
  checked: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────
function formatDuration(totalMinutes: number): string {
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  if (h > 0 && m > 0) return `${h}h ${m}m`;
  if (h > 0) return `${h}h`;
  return `${m}m`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Screen
// ─────────────────────────────────────────────────────────────────────────────
export default function EarlySeatReleaseScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    seatNumber?: string;
    roomName?: string;
    timeRange?: string;
  }>();

  const { getActiveBookings, getBookingEndMinutes, markCompleted } = useBookingStore();

  // ── Resolve booking ───────────────────────────────────────────────────────
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

  const seatNumber = activeBooking
    ? activeBooking.seatNumber.replace(/^Seat\s*/i, '')
    : paramSeat || 'B-14';

  const slot = useMemo(
    () => (activeBooking ? ALL_LIBRARY_SLOTS.find((s) => s.id === activeBooking.slotId) : undefined),
    [activeBooking]
  );

  const roomObj = useMemo(
    () => (activeBooking ? MOCK_ROOMS.find((r) => r.code === activeBooking.roomCode) : undefined),
    [activeBooking]
  );

  const roomName = roomObj?.name ?? params.roomName ?? 'Level 1 Individual Study Area';
  const timeRange = slot?.timeRange ?? params.timeRange ?? '—';

  // ── Dynamic session progress ──────────────────────────────────────────────
  const sessionProgress = useMemo(() => {
    if (!slot) return { usedMins: 0, remainingMins: 0, totalMins: 120, progressPct: 0 };

    const now = new Date();
    const nowMins = now.getHours() * 60 + now.getMinutes();
    const startMins = slot.startHour * 60 + slot.startMin;
    const endMins = activeBooking
      ? (getBookingEndMinutes(activeBooking) ?? slot.endHour * 60 + slot.endMin)
      : slot.endHour * 60 + slot.endMin;
    const totalMins = endMins - startMins;
    const usedMins = Math.max(0, Math.min(nowMins - startMins, totalMins));
    const remainingMins = Math.max(0, endMins - nowMins);
    const progressPct = totalMins > 0 ? Math.min(100, Math.round((usedMins / totalMins) * 100)) : 0;

    return { usedMins, remainingMins, totalMins, progressPct };
  }, [slot, activeBooking, getBookingEndMinutes]);

  // ── Checklist ─────────────────────────────────────────────────────────────
  const [checklist, setChecklist] = useState<ChecklistItem[]>([
    { id: 1, label: 'Cleaned desk surface of personal items',              checked: false },
    { id: 2, label: 'Turned off desk lamp and unplugged devices',          checked: false },
    { id: 3, label: 'Returned borrowed textbook / media to Level 2 service cart', checked: false },
  ]);

  const completedCount = checklist.filter((i) => i.checked).length;
  const totalCount = checklist.length;

  const toggleCheckItem = (id: number) => {
    setChecklist((prev) =>
      prev.map((item) => (item.id === id ? { ...item, checked: !item.checked } : item))
    );
  };

  // ── Vacate handler ────────────────────────────────────────────────────────
  const handleVacate = () => {
    Alert.alert(
      'Confirm Early Release',
      `Are you sure you want to vacate Seat ${seatNumber} early? This will free the seat for other students.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Yes, Release',
          style: 'destructive',
          onPress: () => {
            if (activeBooking) {
              // Move to Past History + free the seat in the matrix
              markCompleted(activeBooking.id);
            }
            Alert.alert(
              'Seat Released ✅',
              `Seat ${seatNumber} has been released early. Thank you for freeing up the space!`,
              [{ text: 'OK', onPress: () => router.push('/seats/my-bookings') }]
            );
          },
        },
      ]
    );
  };

  // ── No active booking guard ───────────────────────────────────────────────
  if (!activeBooking) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Early Release</Text>
          <TouchableOpacity style={styles.iconBtn} onPress={() => router.back()}>
            <Ionicons name="close" size={22} color={Colors.textDark} />
          </TouchableOpacity>
        </View>
        <View style={styles.noBookingContainer}>
          <View style={styles.noBookingIconCircle}>
            <Ionicons name="exit-outline" size={36} color={Colors.primary} />
          </View>
          <Text style={styles.noBookingTitle}>No Active Session</Text>
          <Text style={styles.noBookingSubtitle}>
            You have no active seat to release. Book a seat to get started.
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
            <View style={styles.blueDot} />
            <Text style={styles.breadcrumbTagText}>RESERVATION • RELEASE</Text>
          </View>
        </View>

        {/* Page title */}
        <View style={styles.pageTitleContainer}>
          <Text style={styles.pageTitle}>Early Seat Release</Text>
          <Text style={styles.pageSubtitle}>
            Vacate your seat early to free up campus library study space for other students.
          </Text>
        </View>

        {/* Active Reservation Summary */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardSectionLabel}>ACTIVE RESERVATION SUMMARY</Text>
            <View style={styles.liveSessionPill}>
              <View style={styles.greenDot} />
              <Text style={styles.liveSessionText}>LIVE SESSION</Text>
            </View>
          </View>

          {/* Station row */}
          <View style={styles.stationRow}>
            <View style={styles.stationIconBox}>
              <Ionicons name="desktop-outline" size={20} color={Colors.primary} />
            </View>
            <View>
              <Text style={styles.stationMeta}>STATION</Text>
              <Text style={styles.stationName}>Seat {seatNumber}</Text>
              <Text style={styles.stationSub}>{roomName}</Text>
            </View>
          </View>

          {/* Window + dynamic progress */}
          <View style={styles.sessionStatsRow}>
            <View style={styles.sessionStatItem}>
              <Text style={styles.sessionStatLabel}>CURRENT WINDOW</Text>
              <Text style={styles.sessionStatValue}>{timeRange.replace(' – ', '\n')}</Text>
            </View>
            <View style={styles.sessionStatDivider} />
            <View style={styles.sessionStatItem}>
              <Text style={styles.sessionStatLabel}>SESSION PROGRESS</Text>
              <Text style={styles.sessionStatValue}>
                {formatDuration(sessionProgress.usedMins)} Used
              </Text>
              <Text style={styles.sessionStatSub}>
                • {formatDuration(sessionProgress.remainingMins)} Left
              </Text>
            </View>
          </View>

          {/* Dynamic progress bar */}
          <View style={styles.progressSection}>
            <View style={styles.progressLabelRow}>
              <Text style={styles.progressLabel}>Time used</Text>
              <Text style={styles.progressPct}>{sessionProgress.progressPct}%</Text>
            </View>
            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${sessionProgress.progressPct}%` },
                  sessionProgress.progressPct >= 80 && styles.progressFillUrgent,
                ]}
              />
            </View>
          </View>
        </View>

        {/* Benefits of Early Release */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardSectionLabel}>BENEFITS OF EARLY RELEASE</Text>
            <View style={styles.pointsPill}>
              <Ionicons name="star-outline" size={11} color={Colors.primary} />
              <Text style={styles.pointsPillText}>+5 Campus Points</Text>
            </View>
          </View>
          <View style={styles.benefitBody}>
            <Ionicons name="diamond-outline" size={14} color={Colors.primary} style={{ marginTop: 1 }} />
            <Text style={styles.benefitText}>
              Releasing desks early helps peers waiting in queue and maintains your positive booking
              reliability standing.
            </Text>
          </View>
        </View>

        {/* Check-Out Checklist */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardSectionLabel}>CHECK-OUT CHECKLIST</Text>
            <Text style={[
              styles.checklistProgress,
              completedCount === totalCount && styles.checklistProgressComplete,
            ]}>
              {completedCount}/{totalCount} COMPLETED
            </Text>
          </View>

          {checklist.map((item, idx) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.checklistItem,
                idx === checklist.length - 1 && styles.checklistItemLast,
              ]}
              onPress={() => toggleCheckItem(item.id)}
              activeOpacity={0.7}
            >
              <View style={[styles.checkbox, item.checked && styles.checkboxChecked]}>
                {item.checked && <Ionicons name="checkmark" size={13} color="#FFFFFF" />}
              </View>
              <Text style={[styles.checklistLabel, item.checked && styles.checklistLabelChecked]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Actions */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.vacateBtn}
            onPress={handleVacate}
            activeOpacity={0.85}
          >
            <Ionicons name="exit-outline" size={18} color="#FFFFFF" />
            <Text style={styles.vacateBtnText}>VACATE & RELEASE SEAT EARLY</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cancelBtn}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Text style={styles.cancelBtnText}>CANCEL & RETURN TO MY BOOKING</Text>
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
  blueDot: { width: 7, height: 7, borderRadius: 3.5, backgroundColor: Colors.primary },
  breadcrumbTagText: { fontSize: 10, fontWeight: '700', color: Colors.textSecondary, letterSpacing: 0.6 },
  pageTitleContainer: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 16 },
  pageTitle: { fontSize: 24, fontWeight: '800', color: Colors.textDark, letterSpacing: -0.4, marginBottom: 5 },
  pageSubtitle: { fontSize: 13, color: Colors.textSecondary, lineHeight: 19 },
  card: {
    marginHorizontal: 16, marginBottom: 14, padding: 16,
    backgroundColor: Colors.card, borderRadius: 18, borderWidth: 1, borderColor: Colors.border,
    ...Shadows.card,
  },
  cardHeaderRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12,
  },
  cardSectionLabel: { fontSize: 9, fontWeight: '800', color: Colors.textSecondary, letterSpacing: 0.9 },
  liveSessionPill: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: Colors.successSoft, paddingHorizontal: 9, paddingVertical: 4, borderRadius: 8,
  },
  greenDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.success },
  liveSessionText: { fontSize: 9, fontWeight: '800', color: Colors.success, letterSpacing: 0.5 },
  stationRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: Colors.background, borderRadius: 12, padding: 12, marginBottom: 12,
    borderWidth: 1, borderColor: Colors.border,
  },
  stationIconBox: {
    width: 42, height: 42, borderRadius: 10,
    backgroundColor: Colors.primarySoft, alignItems: 'center', justifyContent: 'center',
  },
  stationMeta: { fontSize: 9, fontWeight: '700', color: Colors.textSecondary, letterSpacing: 0.6, marginBottom: 1 },
  stationName: { fontSize: 16, fontWeight: '800', color: Colors.textDark },
  stationSub: { fontSize: 11, color: Colors.textSecondary, marginTop: 1 },
  sessionStatsRow: {
    flexDirection: 'row', alignItems: 'stretch',
    backgroundColor: Colors.background, borderRadius: 12, borderWidth: 1, borderColor: Colors.border,
    marginBottom: 12, overflow: 'hidden',
  },
  sessionStatItem: { flex: 1, padding: 10 },
  sessionStatDivider: { width: 1, backgroundColor: Colors.border },
  sessionStatLabel: { fontSize: 9, fontWeight: '700', color: Colors.textSecondary, letterSpacing: 0.7, marginBottom: 4 },
  sessionStatValue: { fontSize: 13, fontWeight: '800', color: Colors.textDark, lineHeight: 18 },
  sessionStatSub: { fontSize: 11, color: Colors.textSecondary, marginTop: 1 },
  progressSection: { marginTop: 4 },
  progressLabelRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6,
  },
  progressLabel: { fontSize: 11, fontWeight: '600', color: Colors.textSecondary },
  progressPct: { fontSize: 11, fontWeight: '800', color: Colors.textDark },
  progressTrack: {
    height: 7, backgroundColor: '#EEF2F6', borderRadius: 4, overflow: 'hidden',
  },
  progressFill: {
    height: '100%', backgroundColor: Colors.primary, borderRadius: 4,
  },
  progressFillUrgent: { backgroundColor: Colors.error },
  pointsPill: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: Colors.primarySoft, paddingHorizontal: 9, paddingVertical: 4,
    borderRadius: 8, borderWidth: 1, borderColor: '#C5D9F7',
  },
  pointsPillText: { fontSize: 10, fontWeight: '700', color: Colors.primary },
  benefitBody: {
    flexDirection: 'row', gap: 8, alignItems: 'flex-start',
    backgroundColor: Colors.background, borderRadius: 12, padding: 12,
    borderWidth: 1, borderColor: Colors.border,
  },
  benefitText: { fontSize: 12, color: Colors.textSecondary, lineHeight: 18, flex: 1 },
  checklistProgress: { fontSize: 10, fontWeight: '700', color: Colors.textSecondary, letterSpacing: 0.4 },
  checklistProgressComplete: { color: Colors.success },
  checklistItem: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 10,
    paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  checklistItemLast: { borderBottomWidth: 0, paddingBottom: 0 },
  checkbox: {
    width: 22, height: 22, borderRadius: 6, borderWidth: 1.5, borderColor: Colors.border,
    alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF',
    marginTop: 1, flexShrink: 0,
  },
  checkboxChecked: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  checklistLabel: { fontSize: 13, color: Colors.textDark, flex: 1, lineHeight: 19 },
  checklistLabelChecked: { color: Colors.textSecondary },
  actionsContainer: { marginHorizontal: 16, marginBottom: 24, gap: 10 },
  vacateBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: Colors.primary, paddingVertical: 16, borderRadius: 16, ...Shadows.soft,
  },
  vacateBtnText: { fontSize: 13, fontWeight: '800', color: '#FFFFFF', letterSpacing: 0.3 },
  cancelBtn: { alignItems: 'center', paddingVertical: 12 },
  cancelBtnText: { fontSize: 12, fontWeight: '700', color: Colors.textSecondary, letterSpacing: 0.4 },
  // No-booking guard
  noBookingContainer: {
    flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32, gap: 12,
  },
  noBookingIconCircle: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: Colors.primarySoft, alignItems: 'center', justifyContent: 'center', marginBottom: 4,
  },
  noBookingTitle: { fontSize: 18, fontWeight: '800', color: Colors.textDark },
  noBookingSubtitle: { fontSize: 13, color: Colors.textSecondary, textAlign: 'center', lineHeight: 19 },
  goBookBtn: {
    marginTop: 8, backgroundColor: Colors.primary,
    paddingHorizontal: 28, paddingVertical: 13, borderRadius: 12, ...Shadows.soft,
  },
  goBookBtnText: { fontSize: 14, fontWeight: '700', color: '#FFFFFF' },
});
