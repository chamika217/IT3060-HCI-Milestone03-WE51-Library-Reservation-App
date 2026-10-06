import React from 'react';
import { View, Text, ScrollView, Alert } from 'react-native';
import { colors, spacing, font, radius } from '../theme';
import { Header, Card, Button, Loading, ErrorBox } from '../components';
import useLoad from '../useLoad';
import api, { errMsg } from '../api';

const fmt = (h: any) => `${h % 12 || 12}${h >= 12 ? 'p' : 'a'}`;

export default function Reports({ nav }: any) {
  const peak = useLoad('/stats/peak-hours', {}, 5000);
  const sum = useLoad('/stats/summary', {}, 5000);
  const saved = useLoad('/stats/reports');

  if (peak.loading || sum.loading) return <Loading />;
  if (peak.error && !peak.data) return <ErrorBox message={peak.error} onRetry={peak.reload} />;
  const hours = peak.data || [];
  const max = Math.max(1, ...hours.map((h: any) => h.count));
  const busiest = hours.reduce((a: any, b: any) => (b.count > a.count ? b : a), hours[0] || { hour: 8, count: 0 });

  const snapshot = async () => {
    try { await api.post('/stats/reports', {}); saved.reload(); Alert.alert('Saved', 'Report snapshot saved'); }
    catch (e) { Alert.alert('Error', errMsg(e)); }
  };
  const del = async (id: any) => { try { await api.delete(`/stats/reports/${id}`); saved.reload(); } catch (e) { Alert.alert('Error', errMsg(e)); } };

  return (
    <View style={{ flex: 1 }}>
      <Header title="Reports & Statistics" onBack={nav.goBack} />
      <ScrollView contentContainerStyle={{ padding: spacing.md }}>
        <Card>
          <Text style={{ color: colors.textSecondary }}>Seat occupancy today</Text>
          <Text style={{ fontSize: 26, fontWeight: '800', color: colors.text }}>{sum.data?.occupiedSeats ?? 0} / {sum.data?.totalSeats ?? 0}</Text>
          <Text style={{ color: colors.textSecondary }}>Busiest hour: {busiest.count ? `${fmt(busiest.hour)} (${busiest.count} bookings)` : 'no data'}</Text>
        </Card>
        <Card>
          <Text style={{ fontWeight: '700', color: colors.text, marginBottom: spacing.sm }}>Bookings by hour</Text>
          <View style={{ flexDirection: 'row', alignItems: 'flex-end', height: 180, paddingTop: spacing.sm }}>
            {hours.map((h: any) => (
              <View key={h.hour} style={{ flex: 1, alignItems: 'center', justifyContent: 'flex-end', height: '100%' }}>
                <Text style={{ color: colors.textSecondary, fontSize: 10, marginBottom: spacing.xs }}>{h.count}</Text>
                <View style={{ width: '62%', height: Math.max(18, (h.count / max) * 120), backgroundColor: h.hour === busiest.hour && h.count ? colors.warning : colors.primary, borderRadius: radius.sm, justifyContent: 'center', alignItems: 'center' }}>
                  <Text style={{ color: colors.card, fontSize: 9, fontWeight: '700' }}>{h.count}</Text>
                </View>
                <Text style={{ fontSize: 9, color: colors.text, marginTop: spacing.xs }}>{h.hour}</Text>
              </View>
            ))}
          </View>
        </Card>
        <Button title="Save report snapshot" onPress={snapshot} />
        <Text style={{ fontSize: font.h2, fontWeight: '700', color: colors.text, marginVertical: spacing.md }}>Saved reports</Text>
        {(saved.data || []).map((r: any) => (
          <Card key={r._id} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View style={{ flex: 1 }}>
              <Text style={{ color: colors.text, fontWeight: '600' }}>{new Date(r.createdAt).toLocaleString()}</Text>
              <Text style={{ color: colors.textSecondary, fontSize: font.small }}>Seats {r.data.summary.occupiedSeats}/{r.data.summary.totalSeats} • Reservations today {r.data.summary.todayReservations}</Text>
            </View>
            <Button title="Delete" variant="danger" style={{ paddingVertical: 6 }} onPress={() => del(r._id)} />
          </Card>
        ))}
      </ScrollView>
    </View>
  );
}
