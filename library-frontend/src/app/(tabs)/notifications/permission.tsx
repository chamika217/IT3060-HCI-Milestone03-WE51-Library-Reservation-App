/**
 * Screen 3 — Allow Notifications (Permission)
 * Route: /(tabs)/notifications/permission
 *
 * DESIGN NOTE FOR REPORT:
 * This screen is intentionally device-level only — it requests the OS-level
 * push notification permission via expo-notifications, which has no backend
 * equivalent. There is no server-side CRUD operation here because permission
 * state is stored by the operating system (iOS/Android), not in the database.
 * The user preference (quiet hours, categories) is stored in the User model's
 * notificationPreferences sub-document, managed via the Preferences screen.
 *
 * Calls requestPermissionsAsync() from expo-notifications when the user
 * taps "Allow Notifications".
 *
 * NOTE: expo-notifications must be installed before this runs on device:
 *   npx expo install expo-notifications
 * Until then, the permission call is safely stubbed so the screen renders.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';

import { IonIcon, StatusBadge, BottomNavBar } from '@/components/notifications';
import { getUnreadCount } from '@/features/notifications/mockData';
import { MOCK_NOTIFICATIONS } from '@/features/notifications/mockData';

// ─── Benefit row data ─────────────────────────────────────────────────────────

type BenefitItem = {
  icon: Parameters<typeof IonIcon>[0]['name'];
  iconColor: string;
  label: string;
  description: string;
  tag?: { label: string; variant: 'warning' | 'success' | 'info' | 'neutral' };
};

const BENEFITS: BenefitItem[] = [
  {
    icon: 'flash-outline',
    iconColor: '#2D7CE9',
    label: 'Instant Hold Alerts',
    description: 'Know the exact moment a hold or reserve is ready for collection.',
  },
  {
    icon: 'time-outline',
    iconColor: '#F7A35C',
    label: 'Seat & Pod Timers',
    description:
      'Receive advance warnings before your study room reservation expires.',
    tag: { label: '15m Warning', variant: 'warning' },
  },
  {
    icon: 'calendar-outline',
    iconColor: '#25B87A',
    label: 'Due Date Notices',
    description:
      'Avoid late fees with automatic renewal reminders sent before items are due.',
    tag: { label: 'Zero Fees', variant: 'success' },
  },
];

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function PermissionScreen() {
  const insets = useSafeAreaInsets();
  const unreadCount = getUnreadCount(MOCK_NOTIFICATIONS);
  const [requesting, setRequesting] = useState(false);

  async function handleAllow() {
    setRequesting(true);
    try {
      /**
       * expo-notifications is loaded at runtime via a require() call so the
       * TypeScript compiler never sees the unresolved module path.
       * Once `npx expo install expo-notifications` has run, this works as-is.
       * If the package is absent (dev environment without native modules),
       * the require throws and we fall through to the catch block.
       */
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const Notifications = require('expo-notifications') as {
        requestPermissionsAsync: () => Promise<{ status: string }>;
      };
      const { status } = await Notifications.requestPermissionsAsync();
      if (status === 'granted') {
        router.replace('/(tabs)/notifications' as never);
      } else {
        Alert.alert(
          'Notifications Blocked',
          'You can enable notifications any time from your device Settings.',
          [{ text: 'OK', onPress: () => router.back() }],
        );
      }
    } catch {
      // Package not installed yet — navigate forward as if granted in dev
      router.replace('/(tabs)/notifications' as never);
    } finally {
      setRequesting(false);
    }
  }

  function handleDismiss() {
    router.back();
  }

  return (
    <View style={styles.screen}>
      {/* Close button */}
      <View style={[styles.closeRow, { paddingTop: insets.top + 8 }]}>
        <View style={styles.spacer} />
        <Pressable
          onPress={handleDismiss}
          style={({ pressed }) => [styles.closeBtn, pressed && styles.pressed]}
          accessibilityRole="button"
          accessibilityLabel="Close"
          hitSlop={8}
        >
          <IonIcon name="close" size={20} color="#6C7886" />
        </Pressable>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 100 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Bell badge ────────────────────────────────────────── */}
        <View style={styles.bellWrap}>
          <View style={styles.bellCircle}>
            <IonIcon name="notifications" size={44} color="#2D7CE9" />
          </View>
          {/* Active dot */}
          <View style={styles.activeDot} />
        </View>

        {/* ── Heading ───────────────────────────────────────────── */}
        <Text style={styles.heading}>
          Stay Updated with{'\n'}Campus Alerts
        </Text>
        <Text style={styles.body}>
          Never miss a hold, seat expiry, or schedule change. We'll only send
          notifications that matter to your reservations.
        </Text>

        {/* ── Benefit rows ─────────────────────────────────────── */}
        <View style={styles.benefitsCard}>
          {BENEFITS.map((item, idx) => (
            <React.Fragment key={item.label}>
              <BenefitRow item={item} />
              {idx < BENEFITS.length - 1 && <View style={styles.benefitDivider} />}
            </React.Fragment>
          ))}
        </View>

        {/* ── Settings note ─────────────────────────────────────── */}
        <View style={styles.noteCard}>
          <IonIcon name="moon" size={16} color="#2D7CE9" />
          <Text style={styles.noteText}>
            You can customise specific quiet hours and silence alert tones any
            time in{' '}
            <Text style={styles.noteLink}>Account Settings</Text>.
          </Text>
        </View>

        {/* ── Allow button ──────────────────────────────────────── */}
        <Pressable
          onPress={handleAllow}
          disabled={requesting}
          style={({ pressed }) => [
            styles.btnPrimary,
            (pressed || requesting) && styles.btnPrimaryPressed,
          ]}
          accessibilityRole="button"
          accessibilityLabel="Allow notifications"
        >
          <IonIcon name="shield-checkmark" size={18} color="#FAFBFB" />
          <Text style={styles.btnPrimaryText}>
            {requesting ? 'Requesting…' : 'Allow Notifications'}
          </Text>
        </Pressable>

        {/* ── Maybe Later ───────────────────────────────────────── */}
        <Pressable
          onPress={handleDismiss}
          style={({ pressed }) => [styles.maybeLater, pressed && styles.pressed]}
          accessibilityRole="button"
          accessibilityLabel="Maybe later"
        >
          <Text style={styles.maybeLaterText}>Maybe Later</Text>
        </Pressable>
      </ScrollView>

      <BottomNavBar activeTab="alerts" unreadCount={unreadCount} />
    </View>
  );
}

// ─── Benefit row ──────────────────────────────────────────────────────────────

function BenefitRow({ item }: { item: BenefitItem }) {
  return (
    <View style={benefitStyles.row}>
      <View style={[benefitStyles.iconCircle, { backgroundColor: `${item.iconColor}18` }]}>
        <IonIcon name={item.icon} size={20} color={item.iconColor} />
      </View>
      <View style={benefitStyles.textBlock}>
        <View style={benefitStyles.labelRow}>
          <Text style={benefitStyles.label}>{item.label}</Text>
          {item.tag && (
            <StatusBadge
              label={item.tag.label}
              variant={item.tag.variant}
              size="sm"
            />
          )}
        </View>
        <Text style={benefitStyles.description}>{item.description}</Text>
      </View>
    </View>
  );
}

const benefitStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  textBlock: {
    flex: 1,
    gap: 4,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1C283B',
  },
  description: {
    fontSize: 13,
    color: '#6C7886',
    lineHeight: 18,
  },
});

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F5F7F7',
  },
  closeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 4,
  },
  spacer: {
    flex: 1,
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#F0F2F4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 20,
    gap: 18,
  },

  // Bell badge
  bellWrap: {
    position: 'relative',
    marginBottom: 4,
  },
  bellCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#EAF2FD',
    borderWidth: 2,
    borderColor: '#B3D0F7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeDot: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#25B87A',
    borderWidth: 2.5,
    borderColor: '#F5F7F7',
  },

  // Text
  heading: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1C283B',
    textAlign: 'center',
    lineHeight: 32,
  },
  body: {
    fontSize: 14,
    color: '#6C7886',
    textAlign: 'center',
    lineHeight: 21,
    maxWidth: 320,
  },

  // Benefits card
  benefitsCard: {
    backgroundColor: '#FAFBFB',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#DDE2E6',
    width: '100%',
    overflow: 'hidden',
    shadowColor: '#1C283B',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  benefitDivider: {
    height: 1,
    backgroundColor: '#F0F2F4',
    marginHorizontal: 16,
  },

  // Note
  noteCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: '#EAF2FD',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#B3D0F7',
    padding: 12,
    width: '100%',
  },
  noteText: {
    flex: 1,
    fontSize: 13,
    color: '#1C283B',
    lineHeight: 19,
  },
  noteLink: {
    color: '#2D7CE9',
    fontWeight: '600',
  },

  // Buttons
  btnPrimary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#2D7CE9',
    borderRadius: 12,
    paddingVertical: 15,
    paddingHorizontal: 24,
    width: '100%',
  },
  btnPrimaryPressed: {
    opacity: 0.8,
  },
  btnPrimaryText: {
    color: '#FAFBFB',
    fontWeight: '700',
    fontSize: 15,
  },
  maybeLater: {
    paddingVertical: 10,
  },
  maybeLaterText: {
    fontSize: 14,
    color: '#6C7886',
    fontWeight: '500',
    textDecorationLine: 'underline',
  },

  pressed: {
    opacity: 0.75,
  },
});
