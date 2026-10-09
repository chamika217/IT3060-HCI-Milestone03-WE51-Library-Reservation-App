import React from 'react';
import { View, Text, ScrollView, Alert, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, font, radius } from '../theme';
import { Header, Card, Button, Loading, ErrorBox, SectionTitle, IconCircle } from '../components';
import useLoad from '../useLoad';
import api, { errMsg } from '../api';

const fmt = (h: any) => `${h % 12 || 12}${h >= 12 ? 'p' : 'a'}`;

export default function Reports({ nav }: any) {
  const peak = useLoad('/stats/peak-hours', {}, 5000);
  const sum = useLoad('/stats/summary', {}, 5000);
  const saved = useLoad('/stats/reports');

  if (peak.loading || sum.loading) return <Loading message="Generating statistics..." />;
  if (peak.error && !peak.data) return <ErrorBox message={peak.error} onRetry={peak.reload} />;

  const hours = peak.data || [];
  const max = Math.max(1, ...hours.map((h: any) => h.count));
  const busiest = hours.reduce((a: any, b: any) => (b.count > a.count ? b : a), hours[0] || { hour: 8, count: 0 });

  const snapshot = async () => {
    try {
      await api.post('/stats/reports', {});
      saved.reload();
      Alert.alert('Saved', 'Report snapshot saved successfully.');
    } catch (e) {
      Alert.alert('Error', errMsg(e));
    }
  };

  const del = async (id: any) => {
    try {
      await api.delete(`/stats/reports/${id}`);
      saved.reload();
    } catch (e) {
      Alert.alert('Error', errMsg(e));
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Header title="Reports & Statistics" subtitle="Analytics, occupancy & peak hours" onBack={nav.goBack} />
      <ScrollView contentContainerStyle={{ padding: spacing.md, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <Card style={s.summaryCard}>
          <View style={s.summaryTop}>
            <IconCircle icon="bar-chart" color={colors.primary} size={44} />
            <View style={{ flex: 1, marginLeft: spacing.sm + 4 }}>
              <Text style={s.summaryLabel}>Seat Occupancy Today</Text>
              <Text style={s.summaryValue}>
                {sum.data?.occupiedSeats ?? 0} <Text style={s.summaryTotal}>/ {sum.data?.totalSeats ?? 0} seats</Text>
              </Text>
            </View>
          </View>
          <View style={s.summaryDivider} />
          <View style={s.summaryMetaRow}>
            <Ionicons name="time-outline" size={16} color={colors.warning} style={{ marginRight: 6 }} />
            <Text style={s.summaryMetaText}>
              Busiest Hour:{' '}
              <Text style={{ fontWeight: '700', color: colors.text }}>
                {busiest.count ? `${fmt(busiest.hour)} (${busiest.count} bookings)` : 'No activity data'}
              </Text>
            </Text>
          </View>
        </Card>

        <SectionTitle title="Bookings by Hour" subtitle="Distribution of reservations throughout the day" />

        <Card style={s.chartCard}>
          <View style={s.chartGridLines}>
            <View style={s.gridLine} />
            <View style={s.gridLine} />
            <View style={s.gridLine} />
          </View>

          <View style={s.chartBarsContainer}>
            {hours.map((h: any) => {
              const isPeak = h.hour === busiest.hour && h.count > 0;
              const barHeight = Math.max(16, (h.count / max) * 110);

              return (
                <View key={h.hour} style={s.barColumn}>
                  <Text style={[s.barValueText, isPeak && { color: colors.warning, fontWeight: '700' }]}>
                    {h.count}
                  </Text>
                  <View style={s.barTrack}>
                    <View
                      style={[
                        s.barFill,
                        {
                          height: barHeight,
                          backgroundColor: isPeak ? colors.warning : colors.primary,
                        },
                      ]}
                    />
                  </View>
                  <Text style={[s.barHourText, isPeak && { color: colors.warning, fontWeight: '700' }]}>
                    {h.hour}
                  </Text>
                </View>
              );
            })}
          </View>
        </Card>

        <Button
          title="Save Report Snapshot"
          icon="save-outline"
          onPress={snapshot}
          style={{ marginBottom: spacing.md }}
        />

        <SectionTitle title="Saved Report Snapshots" subtitle={`${saved.data?.length || 0} snapshots recorded`} />

        {(!saved.data || saved.data.length === 0) ? (
          <Card style={s.emptyCard}>
            <Ionicons name="document-text-outline" size={24} color={colors.textSecondary} style={{ marginRight: 8 }} />
            <Text style={{ color: colors.textSecondary, fontSize: font.small }}>No saved report snapshots</Text>
          </Card>
        ) : (
          (saved.data || []).map((r: any) => (
            <Card key={r._id} style={s.reportItemCard}>
              <View style={{ flex: 1, marginRight: spacing.sm }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Ionicons name="calendar-outline" size={14} color={colors.primary} style={{ marginRight: 4 }} />
                  <Text style={s.reportDate}>{new Date(r.createdAt).toLocaleString()}</Text>
                </View>
                <Text style={s.reportSubtext}>
                  Seats {r.data.summary.occupiedSeats}/{r.data.summary.totalSeats} occupied • {r.data.summary.todayReservations} today
                </Text>
              </View>
              <Button
                title="Delete"
                variant="danger"
                size="sm"
                icon="trash-outline"
                onPress={() => del(r._id)}
              />
            </Card>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  summaryCard: {
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  summaryTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: font.small,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  summaryValue: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -0.5,
    marginTop: 2,
  },
  summaryTotal: {
    fontSize: font.body,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  summaryDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.sm + 2,
  },
  summaryMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryMetaText: {
    fontSize: font.small,
    color: colors.textSecondary,
  },
  chartCard: {
    padding: spacing.md,
    marginBottom: spacing.md,
    position: 'relative',
  },
  chartGridLines: {
    position: 'absolute',
    top: 24,
    left: spacing.md,
    right: spacing.md,
    height: 110,
    justifyContent: 'space-between',
  },
  gridLine: {
    height: 1,
    backgroundColor: 'rgba(221, 226, 230, 0.6)',
  },
  chartBarsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 160,
    paddingTop: spacing.sm,
  },
  barColumn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    height: '100%',
  },
  barValueText: {
    color: colors.textSecondary,
    fontSize: font.xs,
    marginBottom: 4,
    fontWeight: '600',
  },
  barTrack: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'flex-end',
    height: 115,
  },
  barFill: {
    width: '64%',
    borderRadius: radius.xs,
  },
  barHourText: {
    fontSize: font.xs,
    color: colors.text,
    marginTop: 6,
    fontWeight: '500',
  },
  emptyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
  },
  reportItemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm + 4,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  reportDate: {
    color: colors.text,
    fontWeight: '700',
    fontSize: font.body,
  },
  reportSubtext: {
    color: colors.textSecondary,
    fontSize: font.small,
    marginTop: 3,
  },
});
