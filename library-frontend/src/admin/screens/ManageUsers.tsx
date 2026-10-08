import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, font, radius } from '../theme';
import { Header, Card, Button, StatusBadge, Chip, Loading, ErrorBox, Empty, SearchBar, Avatar } from '../components';
import { notify, confirmAction } from '../dialog';
import useLoad from '../useLoad';
import api, { errMsg } from '../api';

const ROLES = ['Student', 'Staff', 'Admin'];

export default function ManageUsers({ nav }: any) {
  const [q, setQ] = useState('');
  const { data, loading, error, reload } = useLoad('/users', { search: q });

  const update = async (u: any, patch: any) => {
    try {
      await api.put(`/users/${u._id}`, patch);
      reload();
    } catch (e) {
      notify('Error', errMsg(e));
    }
  };

  const remove = async (u: any) => {
    const ok = await confirmAction('Delete user', `Delete ${u.name}?`, 'Delete', true);
    if (!ok) return;
    try {
      await api.delete(`/users/${u._id}`);
      reload();
    } catch (e) {
      notify('Error', errMsg(e));
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Header title="Manage Users" subtitle="User directory, roles & status" onBack={nav.goBack} />

      <View style={{ paddingHorizontal: spacing.md, paddingTop: spacing.md }}>
        <SearchBar placeholder="Search user name or email..." value={q} onChangeText={setQ} />
      </View>

      {loading ? (
        <Loading message="Loading users..." />
      ) : error ? (
        <ErrorBox message={error} onRetry={reload} />
      ) : (
        <FlatList
          data={data}
          keyExtractor={(u: any) => u._id}
          contentContainerStyle={{ padding: spacing.md, paddingBottom: 40 }}
          ListEmptyComponent={<Empty text="No users found" icon="people-outline" />}
          renderItem={({ item: u }: any) => (
            <Card style={s.userCard}>
              <View style={s.cardTop}>
                <Avatar name={u.name} size={44} />
                <View style={{ flex: 1, marginLeft: spacing.sm + 4 }}>
                  <Text style={s.userName}>{u.name}</Text>
                  <Text style={s.userEmail}>{u.email}</Text>
                </View>
                <StatusBadge status={u.status} />
              </View>

              <Text style={s.roleLabel}>Assigned Role</Text>
              <View style={s.roleChipsRow}>
                {ROLES.map((r) => (
                  <Chip
                    key={r}
                    label={r}
                    active={u.role === r}
                    onPress={() => update(u, { role: r })}
                  />
                ))}
              </View>

              <View style={s.cardActions}>
                <Button
                  title={u.status === 'Active' ? 'Deactivate' : 'Activate'}
                  variant={u.status === 'Active' ? 'outline' : 'success'}
                  size="sm"
                  icon={u.status === 'Active' ? 'pause-circle-outline' : 'checkmark-circle-outline'}
                  style={{ flex: 1, marginRight: spacing.sm }}
                  onPress={() => update(u, { status: u.status === 'Active' ? 'Inactive' : 'Active' })}
                />
                <Button
                  title="Delete User"
                  variant="danger"
                  size="sm"
                  icon="trash-outline"
                  style={{ flex: 1 }}
                  onPress={() => remove(u)}
                />
              </View>
            </Card>
          )}
        />
      )}
    </View>
  );
}

const s = StyleSheet.create({
  userCard: {
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
    letterSpacing: -0.2,
  },
  userEmail: {
    fontSize: font.small,
    color: colors.textSecondary,
    marginTop: 2,
  },
  roleLabel: {
    fontSize: font.xs,
    fontWeight: '600',
    color: colors.textSecondary,
    marginTop: spacing.md,
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  roleChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: spacing.sm,
  },
  cardActions: {
    flexDirection: 'row',
    marginTop: spacing.xs,
  },
});
