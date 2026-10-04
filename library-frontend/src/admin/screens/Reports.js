import React from 'react';
import { View, Text, ScrollView, Alert } from 'react-native';
import { colors, spacing, font } from '../theme';
import { Header, Card, Button, Loading, ErrorBox } from '../components';
import useLoad from '../useLoad';
import api, { errMsg } from '../api';

const fmt = (h) => `${h % 12 || 12}${h >= 12 ? 'p' : 'a'}`;

export default function Reports({ nav }) {
  const peak = useLoad('/stats/peak-hours', {}, 5000);
  const sum = useLoad('/stats/summary', {}, 5000);
  const saved = useLoad('/stats/reports');

  if (peak.loading || sum.loading) return <Loading />;
  if (peak.error && !peak.data) return <ErrorBox message={peak.error} onRetry={peak.reload} />;
  const hours = peak.data;
  const max = Math.max(1, ...hours.map((h) => h.count));
  const busiest = hours.reduce((a, b) => (b.count > a.count ? b : a), hours[0]);

  const snapshot = async () => {
    try { await api.post('/stats/reports', {}); saved.reload(); Alert.alert('Saved', 'Report snapshot saved'); }
    catch (e) { Alert.alert('Error', errMsg(e)); }
  };
  const del = async (id) => { await api.delete(`/stats/reports/${id}`); saved.reload(); };

  return (
    <View style={{ flex: 1 }}>
      <Header title="Reports & Statistics" onBack={nav.goBack} />
      <ScrollView contentContainerStyle={{ padding: spacing.md }}>
        <Card>
          <Text style={{ color: colors.textSecondary }}>Seat occupancy today</Text>
          <Text style={{ fontSize: 26, fontWeight: '800', color: colors.text }}>{sum.data.occupiedSeats} / {sum.data.totalSeats}</Text>
          <Text style={{ color: colors.textSecondary }}>Busiest hour: {busiest.count ? `${fmt(busiest.hour)} (${busiest.count} bookings)` : 'no data'}</Text>
        </Card>
        <Card>
          <Text style={{ fontWeight: '700', color: colors.text, marginBottom: spacing.sm }}>Bookings by hour</Text>
          <View style={{ flexDirection: 'row', alignItems: 'flex-end', height: 150 }}>
            {hours.map((h) => (
              <View key={h.hour} style={{ flex: 1, alignItems: 'center', justifyContent: 'flex-end' }}>
                <Text style={{ fontSize: 10, color: colors.textSecondary }}>{h.count}</Text>
                <View style={{ width: '60%', height: Math.max(3, (h.count / max) * 110), backgroundColor: h.hour === busiest.hour && h.count ? colors.warning : colors.primary, borderRadius: 4 }} />
                <Text style={{ fontSize: 9, color: colors.text, marginTop: 4 }}>{fmt(h.hour)}</Text>
              </View>
            ))}
          </View>
        </Card>
        <Button title="Save report snapshot" onPress={snapshot} />
        <Text style={{ fontSize: font.h2, fontWeight: '700', color: colors.text, marginVertical: spacing.md }}>Saved reports</Text>
        {(saved.data || []).map((r) => (
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
