import React from 'react';
import { View, Text, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { colors, spacing, font } from '../theme';
import { Header, Card, Button, StatusBadge, Loading, ErrorBox } from '../components';
import useLoad from '../useLoad';
import api, { errMsg } from '../api';

const Stat = ({ label, value }: any) => (
  <Card style={{ width: '48%' }}>
    <Text style={{ color: colors.textSecondary, fontSize: font.small }}>{label}</Text>
    <Text style={{ color: colors.text, fontSize: 26, fontWeight: '800' }}>{value}</Text>
  </Card>
);

export default function AdminDashboard({ nav }: any) {
  const sum = useLoad('/stats/summary', {}, 3000);
  const recent = useLoad('/stats/recent', {}, 3000);
  const announcements = useLoad('/announcements', {}, 3000);

  if (sum.loading) return <Loading />;
  if (sum.error && !sum.data) return <ErrorBox message={sum.error} onRetry={sum.reload} />;
  const d = sum.data || {};

  const generateReport = async () => {
    try {
      await api.post('/stats/reports', { title: `Auto report ${new Date().toLocaleString()}` });
      Alert.alert('Report generated', 'The report has been saved successfully.');
      nav.navigate('Reports');
    } catch (e) { Alert.alert('Report failed', errMsg(e)); }
  };

  const removeAnnouncement = async (id: string) => {
    try {
      await api.delete(`/announcements/${id}`);
      announcements.reload();
    } catch (e) { Alert.alert('Error', errMsg(e)); }
  };

  return (
    <View style={{ flex: 1 }}>
      <Header title="Dashboard" />
      <ScrollView contentContainerStyle={{ padding: spacing.md }}>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
          <Stat label="Total Books" value={d.totalBooks ?? 0} />
          <Stat label="Total Users" value={d.totalUsers ?? 0} />
          <Stat label="Today's Reservations" value={d.todayReservations ?? 0} />
          <Stat label="Seats Occupied" value={`${d.occupiedSeats ?? 0}/${d.totalSeats ?? 0}`} />
        </View>
        <View style={{ flexDirection: 'row', marginVertical: spacing.sm }}>
          <Button title={`Pending (${d.pending ?? 0})`} variant="outline" style={{ flex: 1, marginRight: spacing.sm }} onPress={() => nav.reset('Reservations')} />
          <Button title="Reports" style={{ flex: 1 }} onPress={() => nav.navigate('Reports')} />
        </View>
        <Button title="Generate Report" onPress={generateReport} />
        <Text style={{ fontSize: font.h2, fontWeight: '700', color: colors.text, marginVertical: spacing.sm }}>Announcements</Text>
        {(announcements.data || []).filter((a: any) => a.active !== false).slice(0, 3).map((a: any) => (
          <Card key={a._id} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View style={{ flex: 1, marginRight: spacing.sm }}>
              <Text style={{ color: colors.text, fontWeight: '600' }}>{a.title}</Text>
              <Text style={{ color: colors.textSecondary }}>{a.message}</Text>
            </View>
            <TouchableOpacity onPress={() => removeAnnouncement(a._id)} style={{ padding: spacing.sm }}>
              <Text style={{ color: colors.error, fontWeight: '700' }}>X</Text>
            </TouchableOpacity>
          </Card>
        ))}
        <Text style={{ fontSize: font.h2, fontWeight: '700', color: colors.text, marginVertical: spacing.sm }}>Recent Activity</Text>
        {(recent.data || []).map((r: any) => (
          <Card key={r._id} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ color: colors.text, flex: 1, marginRight: 8 }}>{r.text}</Text>
            <StatusBadge status={r.status} />
          </Card>
        ))}
      </ScrollView>
    </View>
  );
}
