import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Platform, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, font, radius, shadows } from './theme';
import { Header, Card, Avatar, SectionTitle } from './components';
import { setToken } from './api';
import { ActionSheet } from './dialog';
import AdminLogin from './screens/AdminLogin';
import AdminDashboard from './screens/AdminDashboard';
import ManageBooks from './screens/ManageBooks';
import BookForm from './screens/BookForm';
import ManageCategories from './screens/ManageCategories';
import ManageUsers from './screens/ManageUsers';
import ManageReservations from './screens/ManageReservations';
import ReservationForm from './screens/ReservationForm';
import ManageSeats from './screens/ManageSeats';
import Reports from './screens/Reports';
import NotificationsMgmt from './screens/NotificationsMgmt';

function More({ nav }: any) {
  const menuItems: Array<{ label: string; screen: string; icon: keyof typeof Ionicons.glyphMap; desc: string }> = [
    { label: 'Manage Categories', screen: 'Categories', icon: 'pricetags-outline', desc: 'Organize book genres and topics' },
    { label: 'Manage Users', screen: 'Users', icon: 'people-outline', desc: 'User accounts, roles & status' },
    { label: 'Reports & Statistics', screen: 'Reports', icon: 'bar-chart-outline', desc: 'Occupancy graphs & peak hours' },
    { label: 'Notifications Management', screen: 'Notifications', icon: 'notifications-outline', desc: 'Broadcast announcements to app' },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Header title="More Options" subtitle="System controls & management" />
      <ScrollView contentContainerStyle={{ padding: spacing.md, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <Card style={s.adminProfileCard}>
          <Avatar name="Library Admin" size={48} />
          <View style={{ marginLeft: spacing.sm + 4, flex: 1 }}>
            <Text style={{ fontSize: font.h3, fontWeight: '700', color: colors.text }}>Library Administrator</Text>
            <Text style={{ fontSize: font.small, color: colors.textSecondary, marginTop: 2 }}>admin@library.com</Text>
          </View>
        </Card>

        <SectionTitle title="Administration" style={{ marginTop: spacing.sm }} />

        {menuItems.map((item) => (
          <Card key={item.screen} onPress={() => nav.navigate(item.screen)} style={s.menuCard}>
            <View style={s.menuIconBox}>
              <Ionicons name={item.icon} size={22} color={colors.primary} />
            </View>
            <View style={{ flex: 1, marginLeft: spacing.sm }}>
              <Text style={{ color: colors.text, fontSize: font.body, fontWeight: '600' }}>{item.label}</Text>
              <Text style={{ color: colors.textSecondary, fontSize: font.small, marginTop: 2 }}>{item.desc}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
          </Card>
        ))}

        <SectionTitle title="Account" style={{ marginTop: spacing.md }} />

        <Card onPress={() => { setToken(null); nav.reset('Login'); }} style={s.logoutCard}>
          <View style={s.logoutIconBox}>
            <Ionicons name="log-out-outline" size={22} color={colors.error} />
          </View>
          <View style={{ flex: 1, marginLeft: spacing.sm }}>
            <Text style={{ color: colors.error, fontSize: font.body, fontWeight: '700' }}>Log Out</Text>
            <Text style={{ color: colors.textSecondary, fontSize: font.small, marginTop: 2 }}>Sign out of admin session</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.error} />
        </Card>
      </ScrollView>
    </View>
  );
}

const SCREENS: Record<string, any> = {
  Login: AdminLogin,
  Dashboard: AdminDashboard,
  Books: ManageBooks,
  BookForm,
  Categories: ManageCategories,
  Users: ManageUsers,
  Reservations: ManageReservations,
  ReservationForm,
  Seats: ManageSeats,
  Reports,
  Notifications: NotificationsMgmt,
  More,
};

const TABS: Array<{ name: string; label: string; icon: keyof typeof Ionicons.glyphMap }> = [
  { name: 'Dashboard', label: 'Home', icon: 'grid-outline' },
  { name: 'Books', label: 'Books', icon: 'book-outline' },
  { name: 'Reservations', label: 'Bookings', icon: 'calendar-outline' },
  { name: 'Seats', label: 'Seats', icon: 'easel-outline' },
  { name: 'More', label: 'More', icon: 'menu-outline' },
];

export default function AdminApp() {
  const [stack, setStack] = useState<any[]>([{ name: 'Login' }]);
  const current = stack[stack.length - 1];

  const nav = {
    navigate: (name: any, params: any) => setStack((s: any) => [...s, { name, params }]),
    goBack: () => setStack((s: any) => (s.length > 1 ? s.slice(0, -1) : s)),
    reset: (name: any) => setStack([{ name }]),
  };

  const Screen = SCREENS[current.name];
  const showTabs = current.name !== 'Login';
  const activeTab = stack[0].name;

  return (
    <View style={s.outerContainer}>
      <View style={s.appFrame}>
        <View style={{ flex: 1 }}>
          <Screen key={`${stack.length}-${current.name}`} nav={nav} params={current.params} />
        </View>
        <ActionSheet />
        {showTabs && (
          <View style={s.tabsWrapper}>
            <View style={s.tabs}>
              {TABS.map((tab) => {
                const isActive = activeTab === tab.name;
                return (
                  <TouchableOpacity
                    key={tab.name}
                    style={s.tab}
                    onPress={() => nav.reset(tab.name)}
                    activeOpacity={0.7}
                    accessibilityRole="button"
                    accessibilityState={{ selected: isActive }}
                    accessibilityLabel={tab.label}
                  >
                    <View style={[s.tabIconBg, isActive && s.tabIconBgActive]}>
                      <Ionicons
                        name={isActive ? (tab.icon.replace('-outline', '') as any) : tab.icon}
                        size={20}
                        color={isActive ? colors.primary : colors.textSecondary}
                      />
                    </View>
                    <Text
                      style={[
                        s.tabLabel,
                        {
                          color: isActive ? colors.primary : colors.textSecondary,
                          fontWeight: isActive ? '700' : '500',
                        },
                      ]}
                    >
                      {tab.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: '#EAEFF5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  appFrame: {
    flex: 1,
    width: '100%',
    maxWidth: Platform.OS === 'web' ? 480 : undefined,
    backgroundColor: colors.background,
    overflow: 'hidden',
    ...(Platform.OS === 'web'
      ? {
          shadowColor: '#1C283B',
          shadowOffset: { width: 0, height: 12 },
          shadowOpacity: 0.15,
          shadowRadius: 30,
        }
      : {}),
  },
  adminProfileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
  },
  menuCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md - 2,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  menuIconBox: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md - 2,
    paddingHorizontal: spacing.md,
    borderColor: 'rgba(240, 79, 85, 0.2)',
  },
  logoutIconBox: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.errorLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabsWrapper: {
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    ...shadows.md,
  },
  tabs: {
    flexDirection: 'row',
    paddingTop: 8,
    paddingBottom: Platform.OS === 'ios' ? 24 : 10,
    backgroundColor: colors.card,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabIconBg: {
    width: 40,
    height: 28,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  tabIconBgActive: {
    backgroundColor: colors.primaryLight,
  },
  tabLabel: {
    fontSize: font.xs,
    letterSpacing: -0.1,
  },
});
