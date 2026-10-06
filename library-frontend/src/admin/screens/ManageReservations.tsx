import React, { useState } from 'react';
import { View, Text, FlatList, Alert } from 'react-native';
import { colors, spacing } from '../theme';
import { Header, Card, Button, StatusBadge, Chip, Loading, ErrorBox, Empty } from '../components';
import useLoad from '../useLoad';
import api, { errMsg } from '../api';

const TABS = ['Pending', 'Confirmed', 'Cancelled'];

export default function ManageReservations({ nav, params }: any) {
  const [tab, setTab] = useState('Pending');
  const { data, loading, error, reload } = useLoad('/reservations', { status: tab }, 5000);

  const setStatus = async (r: any, status: any) => {
    try { await api.put(`/reservations/${r._id}`, { status }); reload(); } catch (e) { Alert.alert('Error', errMsg(e)); }
  };

  const ask = (r: any, status: any) => Alert.alert(`${status === 'Confirmed' ? 'Confirm' : 'Cancel'} reservation`, 'Are you sure?', [
    { text: 'No', style: 'cancel' }, { text: 'Yes', onPress: () => setStatus(r, status) },
  ]);

  const deleteReservation = (r: any) => Alert.alert('Delete reservation', 'This will permanently remove the reservation.', [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Delete', style: 'destructive', onPress: async () => { try { await api.delete(`/reservations/${r._id}`); reload(); } catch (e) { Alert.alert('Error', errMsg(e)); } } },
  ]);

  return (
    <View style={{ flex: 1 }}>
      <Header title="Manage Reservations" right={<Button title="+ New" variant="outline" style={{ paddingVertical: 6, paddingHorizontal: spacing.sm }} onPress={() => nav.navigate('ReservationForm', { onCreated: reload })} />} />
      <View style={{ flexDirection: 'row', padding: spacing.md, paddingBottom: 0 }}>
        {TABS.map((t: any) => <Chip key={t} label={t} active={tab === t} onPress={() => setTab(t)} />)}
      </View>
      {loading ? <Loading /> : error ? <ErrorBox message={error} onRetry={reload} /> : (
        <FlatList data={data} keyExtractor={(r: any) => r._id} contentContainerStyle={{ padding: spacing.md }}
          ListEmptyComponent={<Empty text={`No ${tab.toLowerCase()} reservations`} />}
          renderItem={({ item: r }: any) => (
            <Card>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ fontWeight: '700', color: colors.text, flex: 1 }}>{r.user?.name || 'Unknown user'}</Text>
                <StatusBadge status={r.status} />
              </View>
              <Text style={{ color: colors.textSecondary }}>{r.type === 'Book' ? r.book?.title : `Seat ${r.seat?.label}`}</Text>
              <Text style={{ color: colors.textSecondary, marginBottom: spacing.sm }}>{new Date(r.startTime).toLocaleString()}</Text>
              {r.status === 'Pending' && (
                <View style={{ flexDirection: 'row' }}>
                  <Button title="Confirm" variant="success" style={{ flex: 1 }} onPress={() => ask(r, 'Confirmed')} />
                  <View style={{ width: spacing.lg }} />
                  <Button title="Cancel" variant="danger" style={{ flex: 1 }} onPress={() => ask(r, 'Cancelled')} />
                </View>
              )}
              {r.status === 'Confirmed' && <Button title="Cancel reservation" variant="danger" onPress={() => ask(r, 'Cancelled')} />}
              {r.status === 'Cancelled' && <Button title="Delete" variant="danger" onPress={() => deleteReservation(r)} />}
            </Card>
          )} />
      )}
    </View>
  );
}
