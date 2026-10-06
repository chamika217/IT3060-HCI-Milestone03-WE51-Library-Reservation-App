import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { colors, spacing, font } from './theme';
import { Header, Card } from './components';
import { setToken } from './api';
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
  const items = [['Manage Categories', 'Categories'], ['Manage Users', 'Users'], ['Reports & Statistics', 'Reports'], ['Notifications Management', 'Notifications']];
  return (
    <View style={{ flex: 1 }}>
      <Header title="More" />
      <ScrollView contentContainerStyle={{ padding: spacing.md }}>
        {items.map(([label, screen]) => (
          <Card key={screen} onPress={() => nav.navigate(screen)}>
            <Text style={{ color: colors.text, fontSize: font.body, fontWeight: '600' }}>{label}  ›</Text>
          </Card>
        ))}
        <Card onPress={() => { setToken(null); nav.reset('Login'); }}>
          <Text style={{ color: colors.error, fontWeight: '700' }}>Log out</Text>
        </Card>
      </ScrollView>
    </View>
  );
}

const SCREENS: Record<string, any> = {
  Login: AdminLogin, Dashboard: AdminDashboard, Books: ManageBooks, BookForm, Categories: ManageCategories,
  Users: ManageUsers, Reservations: ManageReservations, ReservationForm, Seats: ManageSeats, Reports, Notifications: NotificationsMgmt, More,
};
const TABS = [['Dashboard', 'Home'], ['Books', 'Books'], ['Reservations', 'Bookings'], ['Seats', 'Seats'], ['More', 'More']];

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
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ flex: 1 }}>
        <Screen key={`${stack.length}-${current.name}`} nav={nav} params={current.params} />
      </View>
      {showTabs && (
        <View style={s.tabs}>
          {TABS.map(([name, label]) => (
            <TouchableOpacity key={name} style={s.tab} onPress={() => nav.reset(name)}>
              <Text style={{ color: activeTab === name ? colors.primary : colors.textSecondary, fontWeight: activeTab === name ? '700' : '500', fontSize: font.small }}>{label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  tabs: { flexDirection: 'row', backgroundColor: colors.card, borderTopWidth: 1, borderTopColor: colors.border, paddingBottom: 14 },
  tab: { flex: 1, alignItems: 'center', paddingVertical: 14 },
});
