import React, { useState } from 'react';
import { View, Text, FlatList, Alert } from 'react-native';
import { colors, spacing } from '../theme';
import { Header, Card, Button, Input, StatusBadge, Chip, Loading, ErrorBox, Empty } from '../components';
import useLoad from '../useLoad';
import api, { errMsg } from '../api';

const ROLES = ['Student', 'Staff', 'Admin'];

export default function ManageUsers({ nav }) {
  const [q, setQ] = useState('');
  const { data, loading, error, reload } = useLoad('/users', { search: q });

  const update = async (u, patch) => {
    try { await api.put(`/users/${u._id}`, patch); reload(); } catch (e) { Alert.alert('Error', errMsg(e)); }
  };
  const remove = (u) => Alert.alert('Delete user', `Delete ${u.name}?`, [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Delete', style: 'destructive', onPress: async () => {
      try { await api.delete(`/users/${u._id}`); reload(); } catch (e) { Alert.alert('Error', errMsg(e)); }
    } },
  ]);

  return (
    <View style={{ flex: 1 }}>
      <Header title="Manage Users" onBack={nav.goBack} />
      <View style={{ padding: spacing.md, paddingBottom: 0 }}>
        <Input placeholder="Search name or email" value={q} onChangeText={setQ} />
      </View>
      {loading ? <Loading /> : error ? <ErrorBox message={error} onRetry={reload} /> : (
        <FlatList data={data} keyExtractor={(u) => u._id} contentContainerStyle={{ padding: spacing.md }}
          ListEmptyComponent={<Empty text="No users" />}
          renderItem={({ item: u }) => (
            <Card>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontWeight: '700', color: colors.text }}>{u.name}</Text>
                  <Text style={{ color: colors.textSecondary }}>{u.email}</Text>
                </View>
                <StatusBadge status={u.status} />
              </View>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: spacing.sm }}>
                {ROLES.map((r) => <Chip key={r} label={r} active={u.role === r} onPress={() => update(u, { role: r })} />)}
              </View>
              <View style={{ flexDirection: 'row' }}>
                <Button title={u.status === 'Active' ? 'Deactivate' : 'Activate'} variant={u.status === 'Active' ? 'outline' : 'success'} style={{ flex: 1, marginRight: spacing.sm }}
                  onPress={() => update(u, { status: u.status === 'Active' ? 'Inactive' : 'Active' })} />
                <Button title="Delete" variant="danger" style={{ flex: 1 }} onPress={() => remove(u)} />
              </View>
            </Card>
          )} />
      )}
    </View>
  );
}
