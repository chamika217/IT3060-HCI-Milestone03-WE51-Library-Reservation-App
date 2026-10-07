import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SeatBottomNav, TabName } from '../components/SeatBottomNav';
import { Colors, Shadows } from '../constants/designSystem';

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────
function formatCountdown(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

// ─────────────────────────────────────────────
// Screen
// ─────────────────────────────────────────────
export default function SeatAutoReleaseWarningScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    seatNumber?: string;
    roomName?: string;
    timeRange?: string;
  }>();

  const seatNumber = params.seatNumber ?? 'B-14';
  const roomName = params.roomName ?? 'Individual Study Area L1';
  const timeRange = params.timeRange ?? '10:30 AM - 12:30 PM';

  // Grace timer – starts at 4 min 31 sec
  const INITIAL_SECONDS = 4 * 60 + 31;
  const [graceSeconds, setGraceSeconds] = useState(INITIAL_SECONDS);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setGraceSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Grace expires at startTime + 15 min
  const graceExpiresLabel = (() => {
    const start = timeRange.split('-')[0]?.trim() ?? '10:30 AM';
    return `15-min grace expires at ${start.replace(/(\d+):(\d+)/, (_, h, m) => {
      const date = new Date();
      date.setHours(parseInt(h, 10), parseInt(m, 10) + 15, 0);
      const hh = date.getHours();
      const mm = String(date.getMinutes()).padStart(2, '0');
      const ampm = hh >= 12 ? 'PM' : 'AM';
      return `${hh > 12 ? hh - 12 : hh}:${mm} ${ampm}`;
    })}`;
  })();

  const isExpired = graceSeconds === 0;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      {/* ── Header ── */}
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
            {/* Active alert badge */}
            <View style={styles.alertBadge} />
          </TouchableOpacity>
          <View style={styles.avatarCircle}>
            <Ionicons name="person" size={16} color="#FFFFFF" />
          </View>
        </View>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* ── Breadcrumb ── */}
        <View style={styles.breadcrumb}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={16} color={Colors.textDark} />
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
          <Text style={styles.breadcrumbTag}>ALERTS • SCREEN 06</Text>
        </View>

        {/* ── Page Title ── */}
        <View style={styles.pageTitleContainer}>
          <Text style={styles.pageTitle}>Seat Auto–Release Warning</Text>
          <Text style={styles.pageSubtitle}>
            Your reserved seat will be automatically released to other students if you do not
            check in before expiration.
          </Text>
        </View>

        {/* ── Grace Timer Card ── */}
        <View style={[styles.card, styles.graceCard, isExpired && styles.graceCardExpired]}>
          {/* Top row */}
          <View style={styles.graceTopRow}>
            <View style={styles.graceTopLeft}>
              <Ionicons
                name="checkmark-circle-outline"
                size={15}
                color={isExpired ? Colors.error : Colors.success}
              />
              <Text style={[styles.graceActiveLabel, isExpired && styles.graceActiveLabelExpired]}>
                {isExpired ? 'GRACE PERIOD EXPIRED' : 'LIVE GRACE TIMER ACTIVE'}
              </Text>
            </View>
            <View style={[styles.timerPill, isExpired && styles.timerPillExpired]}>
              <View style={[styles.timerDot, isExpired && styles.timerDotExpired]} />
              <Text style={[styles.timerPillText, isExpired && styles.timerPillTextExpired]}>
                {isExpired ? 'EXPIRED' : `${formatCountdown(graceSeconds)} Left`}
              </Text>
            </View>
          </View>

          {/* Description */}
          <Text style={styles.graceDesc}>
            Synchronized with Library Access Gate:{' '}
            <Text style={styles.graceDescBold}>{roomName}</Text>
          </Text>
          <Text style={styles.graceDescBold}>(Seat {seatNumber})</Text>

          {/* Progress bar */}
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                {
                  width: isExpired
                    ? '100%'
                    : `${Math.max(0, 100 - (graceSeconds / INITIAL_SECONDS) * 100)}%`,
                },
                isExpired && styles.progressFillExpired,
              ]}
            />
          </View>
        </View>

        {/* ── Reservation Details ── */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardSectionLabel}>RESERVATION DETAILS</Text>
            <Text style={styles.actionRequiredLabel}>Action required</Text>
          </View>

          {/* Seat row */}
          <View style={styles.detailRow}>
            <View style={styles.detailIconBox}>
              <Ionicons name="desktop-outline" size={16} color={Colors.primary} />
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailTitle}>Seat {seatNumber} (Silent Zone)</Text>
              <Text style={styles.detailSub}>Individual Study Area • Level 1</Text>
            </View>
            <View style={styles.detailBadge}>
              <Text style={styles.detailBadgeText}>L2-{seatNumber}</Text>
            </View>
          </View>

          {/* Time row */}
          <View style={styles.detailRow}>
            <View style={styles.detailIconBox}>
              <Ionicons name="time-outline" size={16} color={Colors.primary} />
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailTitle}>{timeRange}</Text>
              <Text style={styles.detailSub}>{graceExpiresLabel}</Text>
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
                  ? 'Seat forfeited — reservation released'
                  : `${formatCountdown(graceSeconds)} remaining before forfeit`}
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
              3 consecutive unattended reservations automatically restrict booking privileges for 7 days.
            </Text>
          </View>
        </View>

        {/* ── Action Buttons ── */}
        <View style={styles.actionsContainer}>
          {/* Release Seat */}
          <TouchableOpacity
            style={styles.releaseBtn}
            onPress={() =>
              router.push({
                pathname: '/seats/early-release',
                params: { seatNumber, roomName, timeRange },
              })
            }
            activeOpacity={0.85}
          >
            <Ionicons name="close-circle-outline" size={17} color={Colors.error} />
            <Text style={styles.releaseBtnText}>Release Seat (Cancel Reservation)</Text>
          </TouchableOpacity>

          {/* Extend Seat Reservation */}
          <TouchableOpacity
            style={styles.extendBtn}
            onPress={() =>
              router.push({
                pathname: '/seats/extend-reservation',
                params: { seatNumber, roomName, timeRange },
              })
            }
            activeOpacity={0.85}
          >
            <Text style={styles.extendBtnText}>Extend Seat Reservation</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* ── Bottom Nav ── */}
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

// ─────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  // ── Header ──
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: Colors.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    ...Shadows.soft,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerIconBox: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: Colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#D0E1F9',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.textDark,
    letterSpacing: -0.2,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F0F3F7',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  alertBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: Colors.error,
    borderWidth: 1.5,
    borderColor: Colors.card,
  },
  avatarCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  // ── Scroll ──
  scroll: {
    flex: 1,
  },
  // ── Breadcrumb ──
  breadcrumb: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 4,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  backText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textDark,
  },
  breadcrumbTag: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.textSecondary,
    letterSpacing: 0.7,
  },
  // ── Page Title ──
  pageTitleContainer: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 16,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.textDark,
    letterSpacing: -0.4,
    marginBottom: 6,
  },
  pageSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 19,
  },
  // ── Generic Card ──
  card: {
    marginHorizontal: 16,
    marginBottom: 14,
    padding: 16,
    backgroundColor: Colors.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.card,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  cardSectionLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: Colors.textSecondary,
    letterSpacing: 0.9,
  },
  // ── Grace Card ──
  graceCard: {
    borderColor: Colors.success,
    borderWidth: 1.5,
  },
  graceCardExpired: {
    borderColor: Colors.error,
  },
  graceTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  graceTopLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  graceActiveLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.success,
    letterSpacing: 0.6,
  },
  graceActiveLabelExpired: {
    color: Colors.error,
  },
  timerPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: Colors.errorSoft,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#F9C8CA',
  },
  timerPillExpired: {
    backgroundColor: '#F0F4F8',
    borderColor: Colors.border,
  },
  timerDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.error,
  },
  timerDotExpired: {
    backgroundColor: Colors.textSecondary,
  },
  timerPillText: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.error,
  },
  timerPillTextExpired: {
    color: Colors.textSecondary,
  },
  graceDesc: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 19,
  },
  graceDescBold: {
    fontWeight: '700',
    color: Colors.textDark,
    fontSize: 13,
  },
  progressTrack: {
    marginTop: 14,
    height: 5,
    backgroundColor: '#F0F3F6',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.error,
    borderRadius: 3,
  },
  progressFillExpired: {
    backgroundColor: Colors.error,
  },
  // ── Action Required ──
  actionRequiredLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.error,
  },
  // ── Detail Rows ──
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  detailRowLast: {
    borderBottomWidth: 0,
    paddingBottom: 0,
  },
  detailIconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: Colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  detailIconBoxWarning: {
    backgroundColor: Colors.errorSoft,
  },
  detailContent: {
    flex: 1,
  },
  detailTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textDark,
    marginBottom: 2,
  },
  detailSub: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  autoReleaseRemaining: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.error,
  },
  detailBadge: {
    backgroundColor: Colors.neutralSoft,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    flexShrink: 0,
  },
  detailBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textDark,
  },
  gracePlusBadge: {
    backgroundColor: Colors.successSoft,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#B8ECDA',
    flexShrink: 0,
  },
  gracePlusBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.success,
  },
  // ── Advisory ──
  bylawsLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.textSecondary,
    letterSpacing: 0.3,
  },
  advisoryBody: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
    backgroundColor: Colors.primarySoft,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#C5D9F7',
  },
  advisoryText: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 18,
    flex: 1,
  },
  advisoryBold: {
    fontWeight: '700',
    color: Colors.textDark,
  },
  // ── Actions ──
  actionsContainer: {
    marginHorizontal: 16,
    marginBottom: 24,
    gap: 10,
  },
  releaseBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: Colors.error,
    paddingVertical: 15,
    borderRadius: 16,
    ...Shadows.soft,
  },
  releaseBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.error,
  },
  extendBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 16,
    ...Shadows.soft,
  },
  extendBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
