/**
 * Screen 8 — Settings
 * Route: /(tabs)/profile/settings
 *
 * Notification preference toggles sync to PUT /api/users/:id/preferences.
 * Device-level toggles (dark mode, reading display, in-app banners) remain local.
 */

import React, { useState, useEffect } from 'react';
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

import {
  ScreenHeader,
  ToggleRow,
  BottomNavBar,
  MenuRow,
  SectionCard,
  Divider,
  IonIcon,
} from '@/components/shared';
import { getUserProfile, updateNotificationPreferences } from '@/services/api';
import { ApiNotificationPreferences } from '@/features/notifications/types';
import { TEST_USER_ID } from '@/constants/testAuth';

// Default prefs shown before the API responds
const DEFAULT_PREFS: ApiNotificationPreferences = {
  pushEnabled:         true,
  bookHolds:           true,
  seatAlerts:          true,
  dueDateReminders:    true,
  cancellationNotices: true,
  emailSummaries:      false,
  quietHoursEnabled:   true,
};

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();

  // ── Device-local toggles (no API) ────────────────────────────────────────
  const [darkMode,     setDarkMode]     = useState(false);
  const [readingMode,  setReadingMode]  = useState(true);
  const [inAppBanners, setInAppBanners] = useState(true);

  // ── Server-backed notification prefs ─────────────────────────────────────
  const [prefs,         setPrefs]         = useState<ApiNotificationPreferences>(DEFAULT_PREFS);
  const [unreadCount,   setUnreadCount]   = useState(0);

  useEffect(() => {
    getUserProfile(TEST_USER_ID)
      .then((p) => {
        setPrefs(p.notificationPreferences);
        setUnreadCount(p.stats.alerts);
      })
      .catch(() => {}); // non-critical — fall back to defaults silently
  }, []);

  /**
   * Optimistically update a single pref key, then sync to the server.
   * On failure: revert the optimistic change.
   */
  function handlePrefChange<K extends keyof ApiNotificationPreferences>(
    key: K,
    value: ApiNotificationPreferences[K],
  ) {
    const previous = prefs;
    const updated  = { ...prefs, [key]: value };
    setPrefs(updated); // optimistic
    updateNotificationPreferences(TEST_USER_ID, { [key]: value }).catch(() => {
      setPrefs(previous); // revert on failure
      Alert.alert('Sync Failed', 'Could not save preference. Please try again.');
    });
  }

  function handleSignOut() {
    Alert.alert(
      'Log Out',
      'Sign out of your campus account on this device?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Log Out', style: 'destructive', onPress: () => {} },
      ],
    );
  }

  return (
    <View style={styles.screen}>
      <ScreenHeader title="Settings" onBack={() => router.back()} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Preferences & campus account ─────────────────────── */}
        <SectionCard label="PREFERENCES & CAMPUS ACCOUNT">
          <ToggleRow
            label="Dark Mode"
            description="High contrast dark theme"
            value={darkMode}
            onValueChange={setDarkMode}
          />
          <View style={styles.rowDivider} />
          <ToggleRow
            label="Reading Display"
            description="Eye comfort mode & warm light"
            value={readingMode}
            onValueChange={setReadingMode}
          />
        </SectionCard>

        {/* ── Notifications & channels ─────────────────────────── */}
        <SectionCard label="NOTIFICATIONS & CHANNELS">
          <MenuRow
            icon="notifications-outline"
            iconColor="#F7A35C"
            label="Notification Settings"
            description="Manage book holds and seat alerts"
            onPress={() => router.push('/(tabs)/notifications/preferences' as never)}
          />
          <Divider />
          <ToggleRow
            label="Push Notifications"
            description="Master toggle for device delivery"
            value={prefs.pushEnabled}
            onValueChange={(v) => handlePrefChange('pushEnabled', v)}
          />
          <View style={styles.rowDivider} />
          <ToggleRow
            label="Book Holds & Pickups"
            description="Alerts when reserved books are ready"
            value={prefs.bookHolds}
            onValueChange={(v) => handlePrefChange('bookHolds', v)}
            disabled={!prefs.pushEnabled}
          />
          <View style={styles.rowDivider} />
          <ToggleRow
            label="Seat Booking Alerts"
            description="15m expiration warnings"
            value={prefs.seatAlerts}
            onValueChange={(v) => handlePrefChange('seatAlerts', v)}
            disabled={!prefs.pushEnabled}
          />
          <View style={styles.rowDivider} />
          <ToggleRow
            label="Quick In-App Banners"
            description="Real-time room ready updates"
            value={inAppBanners}
            onValueChange={setInAppBanners}
          />
        </SectionCard>

        {/* ── General & locale ─────────────────────────────────── */}
        <SectionCard label="GENERAL & LOCALE">
          <MenuRow
            icon="globe-outline"
            iconColor="#6C7886"
            label="Language"
            description="Display language for all screens"
            rightSlot={<Text style={styles.valueText}>English (US)</Text>}
            onPress={() => {}}
          />
        </SectionCard>

        {/* ── Account & security ───────────────────────────────── */}
        <SectionCard label="ACCOUNT & SECURITY">
          <MenuRow
            icon="id-card-outline"
            iconColor="#2D7CE9"
            label="Digital Student Credential"
            description="Syncs instantly with turnstile scanners & library circulation"
            onPress={() => {}}
          />
          <Divider />
          <MenuRow
            icon="key-outline"
            iconColor="#F7A35C"
            label="Change Password"
            description="Last updated 30 days ago"
            onPress={() => {}}
          />
          <Divider />
          <MenuRow
            icon="shield-checkmark"
            iconColor="#25B87A"
            label="Privacy & Security"
            description="Two-factor authentication active"
            onPress={() => {}}
          />
        </SectionCard>

        {/* ── Assistance ───────────────────────────────────────── */}
        <SectionCard label="ASSISTANCE">
          <MenuRow
            icon="help-circle-outline"
            iconColor="#6C7886"
            label="Help & Support"
            description="FAQs and staff contact details"
            onPress={() => router.push('/(tabs)/profile/help' as never)}
          />
        </SectionCard>

        {/* ── Footer ───────────────────────────────────────────── */}
        <View style={styles.footer}>
          <IonIcon name="shield-checkmark" size={13} color="#6C7886" />
          <Text style={styles.footerText}>University ID v15.0 • Secure Session</Text>
        </View>

        {/* ── Log out ──────────────────────────────────────────── */}
        <Pressable
          onPress={handleSignOut}
          style={({ pressed }) => [styles.signOutBtn, pressed && styles.pressed]}
          accessibilityRole="button"
          accessibilityLabel="Log out of campus account"
        >
          <IonIcon name="log-out-outline" size={18} color="#F04F55" />
          <Text style={styles.signOutText}>Log Out of Campus Account</Text>
        </Pressable>
      </ScrollView>

      <BottomNavBar activeTab="profile" unreadCount={unreadCount} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen:        { flex: 1, backgroundColor: '#F5F7F7' },
  scroll:        { flex: 1 },
  scrollContent: { padding: 16, gap: 16 },
  rowDivider:    { height: 1, backgroundColor: '#F0F2F4', marginHorizontal: 16 },
  valueText:     { fontSize: 13, color: '#6C7886', fontWeight: '500' },
  footer:        { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, paddingVertical: 4 },
  footerText:    { fontSize: 12, color: '#6C7886', textAlign: 'center' },
  signOutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, backgroundColor: '#FDEAEA', borderRadius: 12,
    borderWidth: 1, borderColor: '#F8BBBE', paddingVertical: 14,
  },
  signOutText: { color: '#F04F55', fontWeight: '700', fontSize: 15 },
  pressed:     { opacity: 0.75 },
});
