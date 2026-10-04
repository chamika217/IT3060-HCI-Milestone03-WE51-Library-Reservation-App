import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { colors, spacing, font } from '../theme';
import { Header, Card, Button, Input, Loading, ErrorBox } from '../components';
import useLoad from '../useLoad';
import api, { errMsg } from '../api';

const COLOR = { Available: colors.success, Occupied: colors.error, Reserved: colors.warning, Maintenance: colors.textSecondary };

export default function ManageSeats({ nav }) {
  const { data, loading, error, reload } = useLoad('/seats', {}, 3000);
  const [label, setLabel] = useState('');

  const setStatus = async (s, status) => {
    try { await api.put(`/seats/${s._id}`, { status }); reload(); } catch (e) { Alert.alert('Error', errMsg(e)); }
  };
  const open = (s) => Alert.alert(`Seat ${s.label}`, `Current: ${s.status}`, [
    { text: 'Set Available', onPress: () => setStatus(s, 'Available') },
    { text: 'Set Maintenance', onPress: () => setStatus(s, 'Maintenance') },
    { text: 'Delete seat', style: 'destructive', onPress: async () => { await api.delete(`/seats/${s._id}`); reload(); } },
    { text: 'Close', style: 'cancel' },
  ]);
  const add = async () => {
    if (!label.trim()) return Alert.alert('Missing label', 'Enter a seat label e.g. D1');
    try { await api.post('/seats', { label: label.trim().toUpperCase() }); setLabel(''); reload(); }
    catch (e) { Alert.alert('Error', errMsg(e)); }
  };

  return (
    <View style={{ flex: 1 }}>
      <Header title="Manage Seats" />
      {loading ? <Loading /> : error && !data ? <ErrorBox message={error} onRetry={reload} /> : (
        <ScrollView contentContainerStyle={{ padding: spacing.md }}>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: spacing.md }}>
            {Object.entries(COLOR).map(([k, c]) => (
              <View key={k} style={{ flexDirection: 'row', alignItems: 'center', marginRight: 12 }}>
                <View style={{ width: 12, height: 12, borderRadius: 3, backgroundColor: c, marginRight: 4 }} />
                <Text style={{ fontSize: font.small, color: colors.textSecondary }}>{k}</Text>
              </View>
            ))}
          </View>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            {data.map((s) => (
              <TouchableOpacity key={s._id} onPress={() => open(s)}
                style={{ width: '18%', margin: '1%', aspectRatio: 1, borderRadius: 10, backgroundColor: COLOR[s.status], alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ color: '#fff', fontWeight: '700' }}>{s.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={{ color: colors.textSecondary, marginVertical: spacing.sm, fontSize: font.small }}>Tap a seat to change status or delete it.</Text>
          <Card>
            <Input label="Add new seat" value={label} onChangeText={setLabel} placeholder="e.g. D1" autoCapitalize="characters" />
            <Button title="Add Seat" onPress={add} />
          </Card>
        </ScrollView>
      )}
    </View>
  );
}
