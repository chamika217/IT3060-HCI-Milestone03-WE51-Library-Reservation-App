/**
 * Screen 4 — Notification Preferences
 * Route: /(tabs)/notifications/preferences
 *
 * Local state mirrors NotificationPreferences shape.
 * onSave is wired to call PUT /api/notifications/preferences when
 * a real API layer is added.
 */

import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';

import {
  ScreenHeader,
  ToggleRow,
  BottomNavBar,
  IonIcon,
  StatusBadge,
} from '@/components/notifications';
import { NotificationPreferences } from '@/features/notifications/types';
import { getAuthUserId, getNotifications, getUserProfile, updateNotificationPreferences } from '@/services/api';
import { useLibrary } from '@/state/library';

// ─── Default preferences ──────────────────────────────────────────────────────

const DEFAULT_PREFS: NotificationPreferences = {
  pushEnabled:          true,
  bookHolds:            true,
  seatBookings:         true,
  dueDateReminders:     true,
  cancellationNotices:  true,
  emailSummaries:       false,
  quietHoursEnabled:    true,
};

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function PreferencesScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useLibrary();
  const userId = user?.id;
  const [unreadCount, setUnreadCount] = useState(0);

  const [prefs, setPrefs] = useState<NotificationPreferences>(DEFAULT_PREFS);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [lastSynced, setLastSynced] = useState('');
  const [loadError, setLoadError] = useState('');

  const loadPreferences = useCallback(async () => {
    setLoading(true);
    setLoadError('');
    try {
      const accountId = userId || await getAuthUserId();
      const [profile, notifications] = await Promise.all([
        getUserProfile(accountId),
        getNotifications(accountId),
      ]);
      const stored = profile.notificationPreferences;
      setPrefs({
        pushEnabled: stored.pushEnabled,
        bookHolds: stored.bookHolds,
        seatBookings: stored.seatAlerts,
        dueDateReminders: stored.dueDateReminders,
        cancellationNotices: stored.cancellationNotices,
        emailSummaries: stored.emailSummaries,
        quietHoursEnabled: stored.quietHoursEnabled,
      });
      setUnreadCount(notifications.filter(item => item.status === 'unread').length);
      setLastSynced(new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }));
    } catch (cause) {
      setLoadError(cause instanceof Error ? cause.message : 'Could not load preferences.');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useFocusEffect(useCallback(() => {
    void loadPreferences();
  }, [loadPreferences]));

  function update<K extends keyof NotificationPreferences>(
    key: K,
    value: NotificationPreferences[K],
  ) {
    setPrefs((prev) => ({ ...prev, [key]: value }));
  }

  /** Count how many category toggles are active */
  const activeCategories = [
    prefs.bookHolds,
    prefs.seatBookings,
    prefs.dueDateReminders,
    prefs.cancellationNotices,
    prefs.emailSummaries,
  ].filter(Boolean).length;

  async function handleSave() {
    if (loading || saving) return;
    setSaving(true);
    try {
      const accountId = userId || await getAuthUserId();
      await updateNotificationPreferences(accountId, {
        pushEnabled: prefs.pushEnabled,
        bookHolds: prefs.bookHolds,
        seatAlerts: prefs.seatBookings,
        dueDateReminders: prefs.dueDateReminders,
        cancellationNotices: prefs.cancellationNotices,
        emailSummaries: prefs.emailSummaries,
        quietHoursEnabled: prefs.quietHoursEnabled,
      });
      setLastSynced(new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }));
      Alert.alert('Saved', 'Your notification preferences have been updated.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (cause) {
      Alert.alert('Error', cause instanceof Error ? cause.message : 'Could not save preferences. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  // Whether category toggles should be interactive
  const categoriesEnabled = prefs.pushEnabled;

  return (
    <View style={styles.screen}>
      <ScreenHeader
        title="Notification Preferences"
        onBack={() => router.back()}
        rightSlot={
          <View style={styles.syncStatus}>
            <View style={styles.syncDot} />
            <Text style={styles.syncText}>Sync Active</Text>
          </View>
        }
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 100 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {!!loadError && <Text accessibilityRole="alert" style={{ color: '#F04F55', fontSize: 13 }}>{loadError}</Text>}
        {/* ── Sub-heading ──────────────────────────────────────── */}
        <View style={styles.subheadBlock}>
          <Text style={styles.subheadTitle}>Settings • University ID #204918</Text>
          <Text style={styles.subheadBody}>
            Manage channels and notification alerts
          </Text>
        </View>

        {/* ── Master toggle ────────────────────────────────────── */}
        <View style={styles.section}>
          <ToggleRow
            label="Push Notifications"
            description="Master toggle for device delivery"
            value={prefs.pushEnabled}
            onValueChange={(v) => update('pushEnabled', v)}
          />
        </View>

        {/* ── Alert categories ─────────────────────────────────── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionLabel}>ALERT CATEGORIES</Text>
            <StatusBadge
              label={`${activeCategories} active`}
              variant={activeCategories > 0 ? 'info' : 'neutral'}
              size="sm"
            />
          </View>

          <View style={styles.sectionCard}>
            <ToggleRow
              label="Book Holds & Pickups"
              description="Alerts when reserved books are ready"
              value={prefs.bookHolds}
              onValueChange={(v) => update('bookHolds', v)}
              disabled={!categoriesEnabled}
            />
            <View style={styles.rowDivider} />
            <ToggleRow
              label="Seat Booking Alerts"
              description="15m expiration warnings and check-in reminders"
              value={prefs.seatBookings}
              onValueChange={(v) => update('seatBookings', v)}
              disabled={!categoriesEnabled}
            />
            <View style={styles.rowDivider} />
            <ToggleRow
              label="Due Date Reminders"
              description="Advance notices 48h and 24h before items are due"
              value={prefs.dueDateReminders}
              onValueChange={(v) => update('dueDateReminders', v)}
              disabled={!categoriesEnabled}
            />
            <View style={styles.rowDivider} />
            <ToggleRow
              label="Cancellation Notices"
              description="Auto-release notifications for expired bookings"
              value={prefs.cancellationNotices}
              onValueChange={(v) => update('cancellationNotices', v)}
              disabled={!categoriesEnabled}
            />
            <View style={styles.rowDivider} />
            <ToggleRow
              label="Email Summaries"
              description="Send daily activity digest to your university email"
              value={prefs.emailSummaries}
              onValueChange={(v) => update('emailSummaries', v)}
              disabled={!categoriesEnabled}
            />
          </View>
        </View>

        {/* ── Quiet modes ──────────────────────────────────────── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionLabel}>QUIET MODES & SCHEDULE</Text>
            <StatusBadge label="Recommended" variant="success" size="sm" />
          </View>

          <View style={styles.sectionCard}>
            {/* Quiet hours toggle */}
            <ToggleRow
              label="Quiet Hours during Exams"
              description={
                'Mutes audio chimes from 22:00 to 07:00.\nUrgent hold expirations are delivered silently.'
              }
              value={prefs.quietHoursEnabled}
              onValueChange={(v) => update('quietHoursEnabled', v)}
              tag={{ label: 'Active Term', variant: 'info' }}
            />

            {/* Finals window row */}
            <View style={styles.rowDivider} />
            <View style={styles.finalsRow}>
              <View style={styles.finalsLeft}>
                <IonIcon name="moon" size={16} color="#2D7CE9" />
                <View style={styles.finalsTextBlock}>
                  <Text style={styles.finalsLabel}>Finals Window</Text>
                  <Text style={styles.finalsTime}>10:00 PM – 7:00 AM</Text>
                </View>
              </View>
              <Pressable
                style={({ pressed }) => [
                  styles.adjustBtn,
                  pressed && styles.pressed,
                ]}
                accessibilityRole="button"
                accessibilityLabel="Adjust quiet hours"
              >
                <Text style={styles.adjustBtnText}>Adjust</Text>
              </Pressable>
            </View>
          </View>
        </View>

        {/* ── Footer note ───────────────────────────────────────── */}
        <View style={styles.footerNote}>
          <IonIcon name="sync" size={14} color="#6C7886" />
          <Text style={styles.footerNoteText}>
          {loading ? 'Loading saved preferences…' : `Synced with your account • Last updated at ${lastSynced || 'not yet synced'}`}
          </Text>
        </View>

        {/* ── Save button ───────────────────────────────────────── */}
        <Pressable
          onPress={handleSave}
          disabled={saving || loading}
          style={({ pressed }) => [
            styles.btnSave,
            (pressed || saving || loading) && styles.btnSavePressed,
          ]}
          accessibilityRole="button"
          accessibilityLabel="Save preferences"
        >
          <Text style={styles.btnSaveText}>
            {loading ? 'Loading…' : saving ? 'Saving…' : 'Save Preferences'}
          </Text>
        </Pressable>
      </ScrollView>

      <BottomNavBar activeTab="alerts" unreadCount={unreadCount} />
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F5F7F7',
  },

  // Sync status (header right slot)
  syncStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  syncDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#25B87A',
  },
  syncText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#25B87A',
  },

  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    gap: 16,
  },

  // Sub-heading
  subheadBlock: {
    gap: 3,
  },
  subheadTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1C283B',
  },
  subheadBody: {
    fontSize: 13,
    color: '#6C7886',
  },

  // Sections
  section: {
    gap: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6C7886',
    letterSpacing: 0.8,
  },
  sectionCard: {
    backgroundColor: '#FAFBFB',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#DDE2E6',
    overflow: 'hidden',
    shadowColor: '#1C283B',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  rowDivider: {
    height: 1,
    backgroundColor: '#F0F2F4',
    marginHorizontal: 16,
  },

  // Finals window row
  finalsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  finalsLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  finalsTextBlock: {
    gap: 2,
  },
  finalsLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1C283B',
  },
  finalsTime: {
    fontSize: 12,
    color: '#6C7886',
  },
  adjustBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2D7CE9',
  },
  adjustBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2D7CE9',
  },

  // Footer note
  footerNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    justifyContent: 'center',
  },
  footerNoteText: {
    fontSize: 12,
    color: '#6C7886',
    textAlign: 'center',
  },

  // Save button
  btnSave: {
    backgroundColor: '#2D7CE9',
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
  },
  btnSavePressed: {
    opacity: 0.8,
  },
  btnSaveText: {
    color: '#FAFBFB',
    fontWeight: '700',
    fontSize: 15,
  },

  pressed: {
    opacity: 0.75,
  },
});
