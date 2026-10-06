/**
 * Screen 1 — Notifications List  (+ empty state)
 * Route: /(tabs)/notifications/
 *
 * Data: real API via getNotifications() — was MOCK_NOTIFICATIONS array.
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';

import {
  NotificationCard,
  BottomNavBar,
  IonIcon,
  StatusBadge,
} from '@/components/notifications';
import { filterByTab, getUnreadCount } from '@/features/notifications/mockData';
import { Notification } from '@/features/notifications/types';
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from '@/services/api';
import { TEST_USER_ID } from '@/constants/testAuth';

// ─── Filter tab type ──────────────────────────────────────────────────────────

type FilterTab = 'all' | 'books' | 'seats' | 'system';

const FILTER_TABS: { key: FilterTab; label: string }[] = [
  { key: 'all',    label: 'All'    },
  { key: 'books',  label: 'Books'  },
  { key: 'seats',  label: 'Seats'  },
  { key: 'system', label: 'System' },
];

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function NotificationsScreen() {
  const insets = useSafeAreaInsets();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [activeTab,     setActiveTab]     = useState<FilterTab>('all');
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState<string | null>(null);

  // ── Fetch ──────────────────────────────────────────────────────────────
  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getNotifications(TEST_USER_ID);
      setNotifications(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load notifications.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const unreadCount = getUnreadCount(notifications);
  const filtered    = filterByTab(notifications, activeTab);

  const counts: Record<FilterTab, number> = {
    all:    notifications.length,
    books:  filterByTab(notifications, 'books').length,
    seats:  filterByTab(notifications, 'seats').length,
    system: filterByTab(notifications, 'system').length,
  };

  // ── Mark all read ──────────────────────────────────────────────────────
  async function handleMarkAllRead() {
    // Optimistic update
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, status: 'read' as const })),
    );
    try {
      await markAllNotificationsRead(TEST_USER_ID);
    } catch {
      // Revert on failure by re-fetching
      fetchNotifications();
    }
  }

  // ── Card tap — navigate + optimistically mark read ─────────────────────
  function handleCardPress(id: string) {
    // Optimistic: flip to read immediately in the list
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === id ? { ...n, status: 'read' as const } : n,
      ),
    );
    // Fire-and-forget — sync with server in the background
    markNotificationRead(String(id)).catch(() => {
      // Non-critical: if it fails the next fetch will correct state
    });
    router.push(`/(tabs)/notifications/${id}` as never);
  }

  function handleQuickAction(id: string) {
    // Stub — wire to PUT /api/seats/:id/extend
    console.log('Quick action for notification', id);
  }

  // ── Loading state ──────────────────────────────────────────────────────
  if (loading) {
    return (
      <View style={styles.screen}>
        <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.heading}>Notifications</Text>
              <Text style={styles.subheading}>Loading…</Text>
            </View>
          </View>
        </View>
        <View style={styles.centeredFill}>
          <ActivityIndicator size="large" color="#2D7CE9" />
        </View>
        <BottomNavBar activeTab="alerts" unreadCount={0} />
      </View>
    );
  }

  // ── Error state ────────────────────────────────────────────────────────
  if (error) {
    return (
      <View style={styles.screen}>
        <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
          <View style={styles.headerTop}>
            <Text style={styles.heading}>Notifications</Text>
          </View>
        </View>
        <View style={styles.centeredFill}>
          <IonIcon name="alert-circle-outline" size={40} color="#F04F55" />
          <Text style={styles.errorText}>{error}</Text>
          <Pressable
            onPress={fetchNotifications}
            style={({ pressed }) => [styles.retryBtn, pressed && styles.pressed]}
            accessibilityRole="button"
          >
            <Text style={styles.retryBtnText}>Try Again</Text>
          </Pressable>
        </View>
        <BottomNavBar activeTab="alerts" unreadCount={0} />
      </View>
    );
  }

  const isEmpty = filtered.length === 0;

  return (
    <View style={styles.screen}>
      {/* ── Top header ─────────────────────────────────────────────────── */}
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.heading}>Notifications</Text>
            {unreadCount > 0 ? (
              <Text style={styles.subheading}>
                {unreadCount} new alert{unreadCount !== 1 ? 's' : ''} today
              </Text>
            ) : (
              <Text style={styles.subheading}>You're all caught up</Text>
            )}
          </View>
          <Pressable
            onPress={() => router.push('/(tabs)/notifications/preferences' as never)}
            style={({ pressed }) => [styles.headerIcon, pressed && styles.pressed]}
            accessibilityLabel="Notification preferences"
            accessibilityRole="button"
          >
            <IonIcon name="filter" size={20} color="#2D7CE9" />
          </Pressable>
        </View>

        {/* Filter tabs */}
        <View style={styles.filterRow}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterScroll}
          >
            {FILTER_TABS.map((tab) => {
              const active = tab.key === activeTab;
              return (
                <Pressable
                  key={tab.key}
                  onPress={() => setActiveTab(tab.key)}
                  style={[styles.filterTab, active && styles.filterTabActive]}
                  accessibilityRole="tab"
                  accessibilityState={{ selected: active }}
                >
                  <Text
                    style={[
                      styles.filterTabText,
                      active && styles.filterTabTextActive,
                    ]}
                  >
                    {tab.label}
                  </Text>
                  {counts[tab.key] > 0 && (
                    <View
                      style={[
                        styles.tabBadge,
                        active && styles.tabBadgeActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.tabBadgeText,
                          active && styles.tabBadgeTextActive,
                        ]}
                      >
                        {counts[tab.key]}
                      </Text>
                    </View>
                  )}
                </Pressable>
              );
            })}
          </ScrollView>

          {/* Mark all read */}
          {unreadCount > 0 && (
            <Pressable
              onPress={handleMarkAllRead}
              style={({ pressed }) => [
                styles.markRead,
                pressed && styles.pressed,
              ]}
              accessibilityRole="button"
              accessibilityLabel="Mark all notifications as read"
            >
              <Text style={styles.markReadText}>Mark all read</Text>
            </Pressable>
          )}
        </View>
      </View>

      {/* ── Content ───────────────────────────────────────────────────── */}
      {isEmpty ? (
        <EmptyState />
      ) : (
        <ScrollView
          style={styles.list}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: insets.bottom + 100 },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {filtered.map((n) => (
            <NotificationCard
              key={n.id}
              notification={n}
              onPress={() => handleCardPress(n.id)}
              onQuickAction={() => handleQuickAction(n.id)}
            />
          ))}
        </ScrollView>
      )}

      {/* ── Bottom nav ─────────────────────────────────────────────────── */}
      <BottomNavBar activeTab="alerts" unreadCount={unreadCount} />
    </View>
  );
}

// ─── Empty state (rendered inline when filtered list is empty) ────────────────

function EmptyState() {
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      style={styles.emptyScroll}
      contentContainerStyle={[
        styles.emptyContent,
        { paddingBottom: insets.bottom + 100 },
      ]}
      showsVerticalScrollIndicator={false}
    >
      {/* Bell circle */}
      <View style={styles.emptyBellWrap}>
        <View style={styles.emptyBellCircle}>
          <IonIcon name="notifications-outline" size={40} color="#6C7886" />
        </View>
        <View style={styles.emptyAllClearBadge}>
          <Text style={styles.emptyAllClearText}>ALL CLEAR</Text>
        </View>
      </View>

      <Text style={styles.emptyHeading}>No Notifications</Text>
      <Text style={styles.emptyBody}>
        You're completely caught up! When you reserve books, study seats, or
        receive recall notices, they will appear right here.
      </Text>

      {/* CTA buttons */}
      <Pressable
        onPress={() => router.push('/books' as never)}
        style={({ pressed }) => [
          styles.btnPrimary,
          pressed && styles.pressed,
        ]}
        accessibilityRole="button"
      >
        <Text style={styles.btnPrimaryText}>Search Library Catalog</Text>
      </Pressable>

      <Pressable
        onPress={() => router.push('/seats' as never)}
        style={({ pressed }) => [
          styles.btnSecondary,
          pressed && styles.pressed,
        ]}
        accessibilityRole="button"
      >
        <Text style={styles.btnSecondaryText}>Book a Study Room</Text>
      </Pressable>

      {/* Live campus hub card */}
      <Pressable
        style={({ pressed }) => [styles.hubCard, pressed && styles.pressed]}
        accessibilityRole="button"
        accessibilityLabel="Live campus hub"
      >
        <View style={styles.hubLeft}>
          <View style={styles.hubDot} />
          <View>
            <Text style={styles.hubLabel}>LIVE CAMPUS HUB</Text>
            <Text style={styles.hubBody}>
              Main Floor open until Midnight • 142 studying
            </Text>
          </View>
        </View>
        <IonIcon name="chevron-forward" size={18} color="#6C7886" />
      </Pressable>

      {/* Quiet corners section */}
      <View style={styles.cornersSection}>
        <View style={styles.cornersSectionHeader}>
          <Text style={styles.cornersSectionLabel}>QUIET READING CORNERS</Text>
          <Pressable accessibilityRole="button">
            <Text style={styles.mapViewLink}>Map View</Text>
          </Pressable>
        </View>

        <View style={styles.locationCards}>
          <LocationCard
            name="East Wing Atrium"
            features="Natural Light"
            level="Level 3"
            zone="Quiet Zone"
          />
          <LocationCard
            name="Media Pods"
            features="Power Sockets"
            level="Level 1"
            zone="Collab Area"
          />
        </View>
      </View>
    </ScrollView>
  );
}

function LocationCard({
  name,
  features,
  level,
  zone,
}: {
  name: string;
  features: string;
  level: string;
  zone: string;
}) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.locationCard,
        pressed && styles.pressed,
      ]}
      accessibilityRole="button"
      accessibilityLabel={`${name}, ${features}, ${level}, ${zone}`}
    >
      <IonIcon name="location-outline" size={18} color="#2D7CE9" />
      <View style={styles.locationBody}>
        <Text style={styles.locationName}>{name}</Text>
        <Text style={styles.locationMeta}>
          {features} • {level}
        </Text>
      </View>
      <StatusBadge label={zone} variant="neutral" size="sm" />
    </Pressable>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F5F7F7',
  },

  // Header
  header: {
    backgroundColor: '#FAFBFB',
    borderBottomWidth: 1,
    borderBottomColor: '#DDE2E6',
    paddingHorizontal: 16,
    paddingBottom: 0,
    shadowColor: '#1C283B',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    zIndex: 10,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingBottom: 12,
  },
  heading: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1C283B',
    lineHeight: 28,
  },
  subheading: {
    fontSize: 13,
    color: '#6C7886',
    lineHeight: 18,
    marginTop: 2,
  },
  headerIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EAF2FD',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Filter tabs
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterScroll: {
    flexDirection: 'row',
    gap: 4,
    paddingVertical: 10,
  },
  filterTab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#F0F2F4',
  },
  filterTabActive: {
    backgroundColor: '#2D7CE9',
  },
  filterTabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6C7886',
  },
  filterTabTextActive: {
    color: '#FAFBFB',
  },
  tabBadge: {
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#DDE2E6',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  tabBadgeActive: {
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  tabBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#6C7886',
  },
  tabBadgeTextActive: {
    color: '#FAFBFB',
  },
  markRead: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexShrink: 0,
  },
  markReadText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2D7CE9',
  },

  // List
  list: {
    flex: 1,
  },
  listContent: {
    padding: 16,
    gap: 12,
  },

  // Empty state
  emptyScroll: {
    flex: 1,
  },
  emptyContent: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 40,
    gap: 16,
  },
  emptyBellWrap: {
    position: 'relative',
    marginBottom: 8,
  },
  emptyBellCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#F0F2F4',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#DDE2E6',
  },
  emptyAllClearBadge: {
    position: 'absolute',
    top: -6,
    alignSelf: 'center',
    backgroundColor: '#25B87A',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  emptyAllClearText: {
    color: '#FAFBFB',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  emptyHeading: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1C283B',
    textAlign: 'center',
  },
  emptyBody: {
    fontSize: 14,
    color: '#6C7886',
    textAlign: 'center',
    lineHeight: 21,
  },
  btnPrimary: {
    backgroundColor: '#2D7CE9',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 24,
    width: '100%',
    alignItems: 'center',
    marginTop: 4,
  },
  btnPrimaryText: {
    color: '#FAFBFB',
    fontWeight: '700',
    fontSize: 15,
  },
  btnSecondary: {
    borderWidth: 1.5,
    borderColor: '#2D7CE9',
    borderRadius: 12,
    paddingVertical: 13,
    paddingHorizontal: 24,
    width: '100%',
    alignItems: 'center',
  },
  btnSecondaryText: {
    color: '#2D7CE9',
    fontWeight: '700',
    fontSize: 15,
  },
  hubCard: {
    backgroundColor: '#FAFBFB',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#DDE2E6',
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 8,
  },
  hubLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  hubDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#25B87A',
  },
  hubLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#6C7886',
    letterSpacing: 0.6,
    marginBottom: 2,
  },
  hubBody: {
    fontSize: 13,
    color: '#1C283B',
    fontWeight: '500',
  },

  // Quiet corners
  cornersSection: {
    width: '100%',
    gap: 10,
    marginTop: 4,
  },
  cornersSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cornersSectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6C7886',
    letterSpacing: 0.8,
  },
  mapViewLink: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2D7CE9',
  },
  locationCards: {
    gap: 8,
  },
  locationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#FAFBFB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#DDE2E6',
    padding: 12,
  },
  locationBody: {
    flex: 1,
    gap: 2,
  },
  locationName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1C283B',
  },
  locationMeta: {
    fontSize: 12,
    color: '#6C7886',
  },

  pressed: {
    opacity: 0.75,
  },

  // Loading / error states
  centeredFill: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
    padding: 24,
  },
  errorText: {
    fontSize: 14,
    color: '#F04F55',
    textAlign: 'center',
    lineHeight: 20,
  },
  retryBtn: {
    backgroundColor: '#2D7CE9',
    borderRadius: 10,
    paddingVertical: 11,
    paddingHorizontal: 28,
  },
  retryBtnText: {
    color: '#FAFBFB',
    fontWeight: '700',
    fontSize: 14,
  },
});
