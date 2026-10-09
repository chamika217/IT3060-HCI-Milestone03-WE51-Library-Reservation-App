import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, font, radius } from '../theme';
import { Header, Card, Button, StatusBadge, Chip, Loading, ErrorBox, Empty, Avatar } from '../components';
import { notify, confirmAction } from '../dialog';
import useLoad from '../useLoad';
import api, { errMsg } from '../api';

const TABS = ['Pending', 'Confirmed', 'Cancelled'];

export default function ManageReservations({ nav, params }: any) {
  const [tab, setTab] = useState('Pending');
  const { data, loading, error, reload } = useLoad('/reservations', { status: tab }, 5000);

  const setStatus = async (r: any, status: any) => {
    try {
      await api.put(`/reservations/${r._id}`, { status });
      reload();
    } catch (e) {
      notify('Error', errMsg(e));
    }
  };

  const ask = async (r: any, status: any) => {
    const label = status === 'Confirmed' ? 'Confirm' : 'Cancel';
    const ok = await confirmAction(`${label} reservation`, 'Are you sure?', label);
    if (ok) setStatus(r, status);
  };

  const deleteReservation = async (r: any) => {
    const ok = await confirmAction('Delete reservation', 'This will permanently remove the reservation.', 'Delete', true);
    if (!ok) return;
    try {
      await api.delete(`/reservations/${r._id}`);
      reload();
    } catch (e) {
      notify('Error', errMsg(e));
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Header
        title="Manage Reservations"
        subtitle="Review & manage user bookings"
        right={
          <Button
            title="+ New"
            size="sm"
            icon="add"
            onPress={() => nav.navigate('ReservationForm', { onCreated: reload })}
          />
        }
      />

      <View style={s.tabContainer}>
        {TABS.map((t) => (
          <Chip key={t} label={t} active={tab === t} onPress={() => setTab(t)} />
        ))}
      </View>

      {loading ? (
        <Loading message={`Fetching ${tab.toLowerCase()} reservations...`} />
      ) : error ? (
        <ErrorBox message={error} onRetry={reload} />
      ) : (
        <FlatList
          data={data}
          keyExtractor={(r: any) => r._id}
          contentContainerStyle={{ padding: spacing.md, paddingBottom: 40 }}
          ListEmptyComponent={<Empty text={`No ${tab.toLowerCase()} reservations`} icon="calendar-outline" />}
          renderItem={({ item: r }: any) => (
            <Card style={s.card}>
              <View style={s.cardTop}>
                <Avatar name={r.user?.name || 'Unknown'} size={40} />
                <View style={{ flex: 1, marginLeft: spacing.sm + 4 }}>
                  <Text style={s.userName}>{r.user?.name || 'Unknown User'}</Text>
                  <Text style={s.userEmail}>{r.user?.email || 'No email provided'}</Text>
                </View>
                <StatusBadge status={r.status} />
              </View>

              <View style={s.divider} />

              <View style={s.itemRow}>
                <View style={s.itemIconBox}>
                  <Ionicons
                    name={r.type === 'Book' ? 'book-outline' : 'easel-outline'}
                    size={20}
                    color={colors.primary}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.itemTitle}>
                    {r.type === 'Book' ? r.book?.title || 'Book reservation' : `Seat ${r.seat?.label || 'unassigned'}`}
                  </Text>
                  <View style={s.timeRow}>
                    <Ionicons name="time-outline" size={14} color={colors.textSecondary} style={{ marginRight: 4 }} />
                    <Text style={s.timeText}>{new Date(r.startTime).toLocaleString()}</Text>
                  </View>
                </View>
              </View>

              {r.status === 'Pending' && (
                <View style={s.pendingActions}>
                  <Button
                    title="Confirm"
                    variant="success"
                    icon="checkmark-circle-outline"
                    style={{ flex: 1 }}
                    onPress={() => ask(r, 'Confirmed')}
                  />
                  <View style={{ width: 24 }} />
                  <Button
                    title="Cancel"
                    variant="danger"
                    icon="close-circle-outline"
                    style={{ flex: 1 }}
                    onPress={() => ask(r, 'Cancelled')}
                  />
                </View>
              )}

              {r.status === 'Confirmed' && (
                <Button
                  title="Cancel Reservation"
                  variant="danger"
                  icon="close-circle-outline"
                  style={{ marginTop: spacing.sm }}
                  onPress={() => ask(r, 'Cancelled')}
                />
              )}

              {r.status === 'Cancelled' && (
                <Button
                  title="Delete Record"
                  variant="danger"
                  icon="trash-outline"
                  style={{ marginTop: spacing.sm }}
                  onPress={() => deleteReservation(r)}
                />
              )}
            </Card>
          )}
        />
      )}
    </View>
  );
}

const s = StyleSheet.create({
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.xs,
  },
  card: {
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userName: {
    fontSize: font.h3,
    fontWeight: '700',
    color: colors.text,
  },
  userEmail: {
    fontSize: font.small,
    color: colors.textSecondary,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.sm + 2,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemIconBox: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm + 4,
  },
  itemTitle: {
    fontSize: font.body,
    fontWeight: '600',
    color: colors.text,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  timeText: {
    fontSize: font.small,
    color: colors.textSecondary,
  },
  pendingActions: {
    flexDirection: 'row',
    marginTop: spacing.md,
  },
});
