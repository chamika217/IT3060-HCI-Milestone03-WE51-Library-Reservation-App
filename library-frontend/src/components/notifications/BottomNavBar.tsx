/**
 * BottomNavBar — persistent bottom navigation used across all notification
 * screens (and intended to match the global nav once the other tab groups
 * build their screens).
 *
 * Tabs: Home · Search · Bookings · Alerts · Profile
 * The "Alerts" tab shows a badge when `unreadCount > 0`.
 *
 * Each tab points to the app's canonical Expo Router route.
 */

import React from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, usePathname } from 'expo-router';
import { IonIcon, IonIconName } from './IonIcon';
import { useScreenColors } from '@/hooks/useScreenColors';

interface NavTab {
  key: string;
  label: string;
  icon: IonIconName;
  iconActive: IonIconName;
  /** Target route. */
  href: string;
}

const TABS: NavTab[] = [
  { key: 'home',     label: 'Home',     icon: 'home-outline',     iconActive: 'home',     href: '/home' },
  { key: 'search',   label: 'Search',   icon: 'search',           iconActive: 'search',   href: '/books' },
  { key: 'bookings', label: 'Bookings', icon: 'calendar-outline', iconActive: 'calendar', href: '/seats' },
  { key: 'alerts',   label: 'Alerts',   icon: 'notifications-outline', iconActive: 'notifications', href: '/notifications' },
  { key: 'profile',  label: 'Profile',  icon: 'person-outline',   iconActive: 'person',   href: '/profile' },
];

interface BottomNavBarProps {
  activeTab?: string;
  unreadCount?: number;
}

export function BottomNavBar({ activeTab = 'alerts', unreadCount = 0 }: BottomNavBarProps) {
  const insets = useSafeAreaInsets();
  const pathname = usePathname();
  const C = useScreenColors();

  // Derive active tab from pathname if not explicitly provided
  function isActive(tab: NavTab) {
    if (activeTab) return tab.key === activeTab;
    return pathname.startsWith(tab.href);
  }

  return (
    <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, 8), backgroundColor: C.card, borderTopColor: C.border }]}>
      {TABS.map((tab) => {
        const active = isActive(tab);
        const color = active ? C.primary : C.textSecondary;

        return (
          <Pressable
            key={tab.key}
            onPress={() => router.replace(tab.href as never)}
            style={({ pressed }) => [styles.tab, pressed && styles.tabPressed]}
            accessibilityRole="tab"
            accessibilityLabel={tab.label}
            accessibilityState={{ selected: active }}
          >
            {/* Icon + badge wrapper */}
            <View style={styles.iconWrap}>
              <IonIcon
                name={active ? tab.iconActive : tab.icon}
                size={24}
                color={color}
              />
              {/* Unread badge on Alerts tab */}
              {tab.key === 'alerts' && unreadCount > 0 && (
                <View style={[styles.badge, { borderColor: C.card }]}>
                  <Text style={styles.badgeText}>
                    {unreadCount > 99 ? '99+' : String(unreadCount)}
                  </Text>
                </View>
              )}
            </View>
            <Text style={[styles.label, { color }]}>{tab.label}</Text>
            {active && <View style={[styles.activeIndicator, { backgroundColor: C.primary }]} />}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#FAFBFB',
    borderTopWidth: 1,
    borderTopColor: '#DDE2E6',
    paddingTop: 8,
    boxShadow: '0px -2px 8px rgba(28, 40, 59, 0.06)',
    // Elevate above content on Android
    zIndex: 100,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    gap: 3,
    paddingVertical: 4,
  },
  tabPressed: {
    opacity: 0.7,
  },
  iconWrap: {
    position: 'relative',
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -6,
    backgroundColor: '#F04F55',
    borderRadius: 99,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
    borderWidth: 1.5,
    borderColor: '#FAFBFB',
  },
  badgeText: {
    color: '#FAFBFB',
    fontSize: 9,
    fontWeight: '700',
    lineHeight: Platform.OS === 'android' ? 14 : 12,
  },
  label: {
    fontSize: 10,
    fontWeight: '500',
    lineHeight: 13,
  },
  activeIndicator: {
    position: 'absolute',
    top: 0,
    width: 24,
    height: 3,
    backgroundColor: '#2D7CE9',
    borderBottomLeftRadius: 3,
    borderBottomRightRadius: 3,
  },
});
