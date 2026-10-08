import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, font, radius, shadows } from '../theme';
import { Header, Card, Button, StatusBadge, Loading, ErrorBox, SectionTitle, IconCircle } from '../components';
import { notify } from '../dialog';
import useLoad from '../useLoad';
import api, { errMsg } from '../api';

interface StatProps {
  label: string;
  value: string | number;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  subtext?: string;
  onPress?: () => void;
}

const StatCard = ({ label, value, icon, color, subtext, onPress }: StatProps) => (
  <Card style={s.statCard} onPress={onPress}>
    <View style={s.statHeader}>
      <IconCircle icon={icon} color={color} size={40} />
      <Text style={s.statValue}>{value}</Text>
    </View>
    <Text style={s.statLabel}>{label}</Text>
    {subtext ? <Text style={s.statSubtext}>{subtext}</Text> : null}
  </Card>
);

export default function AdminDashboard({ nav }: any) {
  const sum = useLoad('/stats/summary', {}, 3000);
  const recent = useLoad('/stats/recent', {}, 3000);
  const announcements = useLoad('/announcements', {}, 3000);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([sum.reload(), recent.reload(), announcements.reload()]);
    setRefreshing(false);
  }, [sum, recent, announcements]);

  if (sum.loading && !sum.data) return <Loading message="Loading dashboard..." />;
  if (sum.error && !sum.data) return <ErrorBox message={sum.error} onRetry={sum.reload} />;
  const d = sum.data || {};

  const generateReport = async () => {
    try {
      await api.post('/stats/reports', { title: `Auto report ${new Date().toLocaleString()}` });
      notify('Report generated', 'The report has been saved successfully.');
      nav.navigate('Reports');
    } catch (e) {
      notify('Report failed', errMsg(e));
    }
  };

  const removeAnnouncement = async (id: string) => {
    try {
      await api.delete(`/announcements/${id}`);
      announcements.reload();
    } catch (e) {
      notify('Error', errMsg(e));
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Header
        title="Admin Dashboard"
        subtitle="Welcome back, Administrator"
        variant="dashboard"
        right={
          <TouchableOpacity
            onPress={onRefresh}
            style={s.headerRefreshBtn}
            activeOpacity={0.8}
            accessibilityLabel="Refresh dashboard"
          >
            <Ionicons name="refresh" size={18} color="#FFFFFF" />
          </TouchableOpacity>
        }
      />

      <ScrollView
        contentContainerStyle={{ padding: spacing.md, paddingBottom: 40 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} tintColor={colors.primary} />}
        showsVerticalScrollIndicator={false}
      >
        <SectionTitle title="Overview" subtitle="Real-time library statistics" />

        <View style={s.statGrid}>
          <StatCard
            label="Total Books"
            value={d.totalBooks ?? 0}
            icon="book"
            color={colors.primary}
            subtext="Catalog items"
            onPress={() => nav.reset('Books')}
          />
          <StatCard
            label="Total Users"
            value={d.totalUsers ?? 0}
            icon="people"
            color={colors.success}
            subtext="Active accounts"
            onPress={() => nav.navigate('Users')}
          />
          <StatCard
            label="Today's Reservations"
            value={d.todayReservations ?? 0}
            icon="calendar"
            color={colors.warning}
            subtext="Bookings today"
            onPress={() => nav.reset('Reservations')}
          />
          <StatCard
            label="Seats Occupied"
            value={`${d.occupiedSeats ?? 0}/${d.totalSeats ?? 0}`}
            icon="easel"
            color={colors.error}
            subtext="Current capacity"
            onPress={() => nav.reset('Seats')}
          />
        </View>

        <SectionTitle title="Quick Actions" />

        <View style={s.actionRow}>
          <Button
            title={`Pending (${d.pending ?? 0})`}
            variant="outline"
            icon="time-outline"
            style={{ flex: 1, marginRight: spacing.sm }}
            onPress={() => nav.reset('Reservations')}
          />
          <Button
            title="Reports"
            icon="bar-chart-outline"
            style={{ flex: 1 }}
            onPress={() => nav.navigate('Reports')}
          />
        </View>

        <Button
          title="Generate Instant Report"
          icon="document-text-outline"
          variant="secondary"
          onPress={generateReport}
          style={{ marginBottom: spacing.md }}
        />

        <SectionTitle
          title="Announcements"
          subtitle="Active library notices"
          right={
            <TouchableOpacity onPress={() => nav.navigate('Notifications')}>
              <Text style={{ color: colors.primary, fontSize: font.small, fontWeight: '700' }}>Manage</Text>
            </TouchableOpacity>
          }
        />

        {(announcements.data || []).filter((a: any) => a.active !== false).slice(0, 3).length === 0 ? (
          <Card style={s.emptyNoticeCard}>
            <Ionicons name="notifications-off-outline" size={20} color={colors.textSecondary} style={{ marginRight: 8 }} />
            <Text style={{ color: colors.textSecondary, fontSize: font.small }}>No active announcements</Text>
          </Card>
        ) : (
          (announcements.data || [])
            .filter((a: any) => a.active !== false)
            .slice(0, 3)
            .map((a: any) => (
              <Card key={a._id} style={s.announcementCard}>
                <View style={s.announcementIcon}>
                  <Ionicons name="megaphone-outline" size={18} color={colors.warning} />
                </View>
                <View style={{ flex: 1, marginRight: spacing.sm }}>
                  <Text style={{ color: colors.text, fontWeight: '700', fontSize: font.body }}>{a.title}</Text>
                  <Text style={{ color: colors.textSecondary, fontSize: font.small, marginTop: 2 }}>{a.message}</Text>
                </View>
                <TouchableOpacity
                  onPress={() => removeAnnouncement(a._id)}
                  style={s.deleteBtn}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons name="close" size={18} color={colors.error} />
                </TouchableOpacity>
              </Card>
            ))
        )}

        <SectionTitle title="Recent Activity" subtitle="Latest reservations and updates" />

        {(!recent.data || recent.data.length === 0) ? (
          <Card style={s.emptyNoticeCard}>
            <Ionicons name="time-outline" size={20} color={colors.textSecondary} style={{ marginRight: 8 }} />
            <Text style={{ color: colors.textSecondary, fontSize: font.small }}>No recent activity logged</Text>
          </Card>
        ) : (
          (recent.data || []).map((r: any) => (
            <Card key={r._id} style={s.activityCard}>
              <View style={s.activityIcon}>
                <Ionicons name="pulse-outline" size={18} color={colors.primary} />
              </View>
              <Text style={s.activityText}>{r.text}</Text>
              <StatusBadge status={r.status} />
            </Card>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  headerRefreshBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  statCard: {
    width: '48%',
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -0.5,
  },
  statLabel: {
    color: colors.text,
    fontSize: font.small,
    fontWeight: '600',
    marginTop: 4,
  },
  statSubtext: {
    color: colors.textSecondary,
    fontSize: font.xs,
    marginTop: 2,
  },
  actionRow: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },
  emptyNoticeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
  },
  announcementCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm + 4,
    paddingHorizontal: spacing.md,
  },
  announcementIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.warningLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  deleteBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.errorLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm + 4,
    paddingHorizontal: spacing.md,
  },
  activityIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  activityText: {
    color: colors.text,
    fontSize: font.body,
    fontWeight: '500',
    flex: 1,
    marginRight: spacing.sm,
  },
});
