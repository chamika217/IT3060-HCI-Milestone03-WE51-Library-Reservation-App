import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { colors, spacing, font } from '../theme';
import { Header, Card, Button, StatusBadge, Loading, ErrorBox } from '../components';
import useLoad from '../useLoad';

const Stat = ({ label, value }) => (
  <Card style={{ width: '48%' }}>
    <Text style={{ color: colors.textSecondary, fontSize: font.small }}>{label}</Text>
    <Text style={{ color: colors.text, fontSize: 26, fontWeight: '800' }}>{value}</Text>
  </Card>
);

export default function AdminDashboard({ nav }) {
  const sum = useLoad('/stats/summary', {}, 3000);
  const recent = useLoad('/stats/recent', {}, 3000);
  if (sum.loading) return <Loading />;
  if (sum.error && !sum.data) return <ErrorBox message={sum.error} onRetry={sum.reload} />;
  const d = sum.data;

  return (
    <View style={{ flex: 1 }}>
      <Header title="Dashboard" />
      <ScrollView contentContainerStyle={{ padding: spacing.md }}>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
          <Stat label="Total Books" value={d.totalBooks} />
          <Stat label="Total Users" value={d.totalUsers} />
          <Stat label="Today's Reservations" value={d.todayReservations} />
          <Stat label="Seats Occupied" value={`${d.occupiedSeats}/${d.totalSeats}`} />
        </View>
        <View style={{ flexDirection: 'row', marginVertical: spacing.sm }}>
          <Button title={`Pending (${d.pending})`} variant="outline" style={{ flex: 1, marginRight: spacing.sm }} onPress={() => nav.reset('Reservations')} />
          <Button title="Reports" style={{ flex: 1 }} onPress={() => nav.navigate('Reports')} />
        </View>
        <Text style={{ fontSize: font.h2, fontWeight: '700', color: colors.text, marginVertical: spacing.sm }}>Recent Activity</Text>
        {(recent.data || []).map((r) => (
          <Card key={r._id} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ color: colors.text, flex: 1, marginRight: 8 }}>{r.text}</Text>
            <StatusBadge status={r.status} />
          </Card>
        ))}
      </ScrollView>
    </View>
  );
}
