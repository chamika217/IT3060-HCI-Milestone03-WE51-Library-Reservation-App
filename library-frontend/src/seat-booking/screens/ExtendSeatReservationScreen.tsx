import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
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

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
interface ExtensionOption {
  label: string;
  delta: string;
  hours: string;
  newEndTime: string;
  status: 'available' | 'unavailable';
  statusLabel: string;
  clash?: string;
  recommended?: boolean;
}

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
export default function ExtendSeatReservationScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    seatNumber?: string;
    roomName?: string;
    timeRange?: string;
  }>();

  const seatNumber = params.seatNumber ?? 'B-14';
  const roomName = params.roomName ?? 'Individual Study Area L1';
  const timeRange = params.timeRange ?? '10:30 AM - 12:30 PM';

  const [selectedOption, setSelectedOption] = useState<number>(1); // default +1 Hour (recommended)
  const [countdown, setCountdown] = useState(34 * 60 + 18); // 34:18 in seconds
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const extensionOptions: ExtensionOption[] = [
    {
      label: '+30 Minutes',
      delta: '+0.5h',
      hours: '+ 0.5h',
      newEndTime: '01:00 PM',
      status: 'available',
      statusLabel: 'No Clash',
    },
    {
      label: '+1 Hour',
      delta: '+1.0h',
      hours: '+1.0h',
      newEndTime: '01:30 PM',
      status: 'available',
      statusLabel: 'Recommended',
      recommended: true,
    },
    {
      label: '+2 Hours',
      delta: '+2.0h',
      hours: '+2.0h',
      newEndTime: '02:30 PM',
      status: 'unavailable',
      statusLabel: 'CLASH',
      clash: 'Unavailable (Seat reserved by CS student at 01:30 PM)',
    },
  ];

  // Countdown timer
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const handleConfirm = () => {
    const chosen = extensionOptions[selectedOption];
    if (chosen.status === 'unavailable') {
      Alert.alert('Clash Detected', chosen.clash ?? 'This slot has a booking clash.');
      return;
    }
    Alert.alert(
      'Reservation Extended ✅',
      `Seat ${seatNumber} extended by ${chosen.label}.\nNew end time: ${chosen.newEndTime}`,
      [{ text: 'OK', onPress: () => router.back() }]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>Home</Text>
        </View>
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
        {/* ── Breadcrumb ── */}
        <View style={styles.breadcrumb}>
          <View style={styles.breadcrumbLeft}>
            <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
              <Ionicons name="chevron-back" size={16} color={Colors.textDark} />
              <Text style={styles.backText}>BACK</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.breadcrumbTag}>
            <View style={styles.orangeDot} />
            <Text style={styles.breadcrumbTagText}>ACTIVE SESSION • EXTENSION</Text>
          </View>
        </View>

        {/* ── Page Title ── */}
        <View style={styles.pageTitleContainer}>
          <Ionicons name="time-outline" size={22} color={Colors.primary} style={{ marginRight: 8 }} />
          <View>
            <Text style={styles.pageTitle}>Extend Seat Reservation</Text>
            <Text style={styles.pageSubtitle}>
              Request extra time for{' '}
              <Text style={styles.seatBold}>Seat {seatNumber}</Text>
              {' '}before auto-release or slot expiration.
            </Text>
          </View>
        </View>

        {/* ── Active Session Status Card ── */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardSectionLabel}>ACTIVE SESSION STATUS</Text>
            <Text style={styles.campusPill}>SLIIT-LIB-L1</Text>
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

          {/* Countdown Banner */}
          <View style={styles.countdownBanner}>
            <View style={styles.countdownLeft}>
              <View style={styles.countdownIconCircle}>
                <Ionicons name="hourglass-outline" size={18} color="#FFFFFF" />
              </View>
              <View>
                <Text style={styles.countdownSubLabel}>AUTO-RELEASE COUNTDOWN</Text>
                <Text style={styles.countdownTimer}>{formatCountdown(countdown)}</Text>
                <Text style={styles.countdownRemaining}>REMAINING</Text>
              </View>
            </View>
            <View style={styles.slotActivePill}>
              <Text style={styles.slotActivePillText}>SLOT ACTIVE</Text>
            </View>
          </View>
        </View>

        {/* ── Extension Options ── */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardSectionLabel}>SELECT EXTENSION DURATION</Text>
            <Text style={styles.stepLabel}>Step 2 of 2</Text>
          </View>

          {extensionOptions.map((option, idx) => {
            const isSelected = selectedOption === idx;
            const isUnavailable = option.status === 'unavailable';

            return (
              <TouchableOpacity
                key={idx}
                style={[
                  styles.optionCard,
                  isSelected && !isUnavailable && styles.optionCardSelected,
                  isUnavailable && styles.optionCardUnavailable,
                ]}
                onPress={() => !isUnavailable && setSelectedOption(idx)}
                activeOpacity={isUnavailable ? 1 : 0.8}
              >
                <View style={styles.optionLeft}>
                  {/* Radio dot */}
                  <View style={[
                    styles.radioDot,
                    isSelected && !isUnavailable && styles.radioDotSelected,
                    isUnavailable && styles.radioDotDisabled,
                  ]}>
                    {isSelected && !isUnavailable && (
                      <View style={styles.radioDotInner} />
                    )}
                  </View>

                  <View>
                    <View style={styles.optionTitleRow}>
                      <Text style={[
                        styles.optionTitle,
                        isUnavailable && styles.optionTitleUnavailable,
                      ]}>
                        {option.label}
                      </Text>
                      <Text style={styles.optionDelta}>{option.delta}</Text>
                    </View>

                    {isUnavailable && option.clash ? (
                      <View style={styles.clashRow}>
                        <Ionicons name="calendar-outline" size={11} color={Colors.error} />
                        <Text style={styles.clashText}>{option.clash}</Text>
                      </View>
                    ) : (
                      <Text style={styles.optionEndTime}>
                        New End Time: {option.newEndTime}
                      </Text>
                    )}
                  </View>
                </View>

                <View style={styles.optionRight}>
                  {isUnavailable ? (
                    <View style={styles.clashPill}>
                      <Text style={styles.clashPillText}>CLASH</Text>
                    </View>
                  ) : (
                    <View>
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
          })}
        </View>

        {/* ── Extension Policy ── */}
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

        {/* ── Action Buttons ── */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity style={styles.confirmBtn} onPress={handleConfirm} activeOpacity={0.85}>
            <Ionicons name="refresh-circle-outline" size={18} color="#FFFFFF" />
            <Text style={styles.confirmBtnText}>
              Confirm & Extend Time ({extensionOptions[selectedOption]?.label ?? ''})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.keepCurrentBtn} onPress={() => router.back()} activeOpacity={0.7}>
            <Text style={styles.keepCurrentText}>
              Keep Current End Time ({timeRange.split('-')[1]?.trim() ?? '12:30 PM'})
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* ── Bottom Nav ── */}
      <SeatBottomNav
        activeTab="Home"
        onTabPress={(tab: TabName) => {
          if (tab === 'Home') router.push('/seats');
          else if (tab === 'Bookings') router.push('/seats/my-bookings');
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
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: Colors.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    ...Shadows.soft,
  },
  headerLeft: {},
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textDark,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconBtn: {
    padding: 2,
  },
  avatarCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Scroll
  scroll: {
    flex: 1,
  },
  // Breadcrumb
  breadcrumb: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 4,
  },
  breadcrumbLeft: {},
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  backText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textDark,
    letterSpacing: 0.5,
  },
  breadcrumbTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  orangeDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: Colors.warning,
  },
  breadcrumbTagText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.textSecondary,
    letterSpacing: 0.6,
  },
  // Page title
  pageTitleContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 16,
  },
  pageTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.textDark,
    letterSpacing: -0.3,
  },
  pageSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 3,
    lineHeight: 17,
  },
  seatBold: {
    fontWeight: '700',
    color: Colors.textDark,
  },
  // Generic card
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
    marginBottom: 12,
  },
  cardSectionLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: Colors.textSecondary,
    letterSpacing: 0.9,
  },
  campusPill: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.textDark,
    backgroundColor: Colors.neutralSoft,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  stepLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  seatBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    backgroundColor: Colors.primarySoft,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    marginBottom: 8,
  },
  seatBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
  },
  windowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 14,
  },
  windowText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  // Countdown
  countdownBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.primary,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  countdownLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  countdownIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  countdownSubLabel: {
    fontSize: 8,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.75)',
    letterSpacing: 0.8,
  },
  countdownTimer: {
    fontSize: 26,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  countdownRemaining: {
    fontSize: 8,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.75)',
    letterSpacing: 0.8,
  },
  slotActivePill: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  slotActivePillText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  // Option cards
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: '#FFFFFF',
    marginBottom: 10,
  },
  optionCardSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primarySoft,
  },
  optionCardUnavailable: {
    borderColor: Colors.border,
    backgroundColor: Colors.neutralSoft,
    opacity: 0.85,
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    flex: 1,
  },
  radioDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  radioDotSelected: {
    borderColor: Colors.primary,
  },
  radioDotDisabled: {
    borderColor: Colors.border,
    backgroundColor: '#F0F4F8',
  },
  radioDotInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.primary,
  },
  optionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  optionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.textDark,
  },
  optionTitleUnavailable: {
    color: Colors.textSecondary,
  },
  optionDelta: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textSecondary,
    backgroundColor: Colors.neutralSoft,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 5,
  },
  optionEndTime: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 3,
  },
  clashRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 4,
    marginTop: 3,
    maxWidth: 200,
  },
  clashText: {
    fontSize: 11,
    color: Colors.error,
    flex: 1,
    flexWrap: 'wrap',
  },
  optionRight: {
    alignItems: 'flex-end',
    minWidth: 72,
  },
  availableText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.success,
    textAlign: 'right',
  },
  recommendedText: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.success,
    textAlign: 'right',
    marginTop: 1,
  },
  noClashText: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.success,
    textAlign: 'right',
    marginTop: 1,
  },
  clashPill: {
    backgroundColor: Colors.errorSoft,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.error,
  },
  clashPillText: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.error,
    letterSpacing: 0.4,
  },
  // Policy card
  policyCard: {
    marginHorizontal: 16,
    marginBottom: 14,
    padding: 14,
    backgroundColor: Colors.neutralSoft,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  policyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 6,
  },
  policyTitle: {
    fontSize: 9,
    fontWeight: '800',
    color: Colors.textSecondary,
    letterSpacing: 0.8,
  },
  policyText: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  policyBold: {
    fontWeight: '700',
    color: Colors.textDark,
  },
  // Action buttons
  actionsContainer: {
    marginHorizontal: 16,
    marginBottom: 24,
    gap: 10,
  },
  confirmBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 16,
    ...Shadows.soft,
  },
  confirmBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  keepCurrentBtn: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  keepCurrentText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
});
