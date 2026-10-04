import React, { useState } from 'react';
import { View, Text, ScrollView, Alert } from 'react-native';
import { colors, spacing } from '../theme';
import { Header, Card, Button, Input, Loading, ErrorBox, Empty } from '../components';
import useLoad from '../useLoad';
import api, { errMsg } from '../api';

export default function ManageCategories({ nav }) {
  const { data, loading, error, reload } = useLoad('/categories');
  const [name, setName] = useState('');
  const [editing, setEditing] = useState(null);

  const save = async () => {
    if (!name.trim()) return Alert.alert('Missing name', 'Enter a category name');
    try {
      if (editing) await api.put(`/categories/${editing._id}`, { name });
      else await api.post('/categories', { name });
      setName(''); setEditing(null); reload();
    } catch (e) { Alert.alert('Error', errMsg(e)); }
  };
  const remove = (c) => Alert.alert('Delete category', `Delete "${c.name}"?`, [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Delete', style: 'destructive', onPress: async () => { await api.delete(`/categories/${c._id}`); reload(); } },
  ]);

  return (
    <View style={{ flex: 1 }}>
      <Header title="Manage Categories" onBack={nav.goBack} />
      <ScrollView contentContainerStyle={{ padding: spacing.md }}>
        <Input label={editing ? `Rename "${editing.name}"` : 'New category'} value={name} onChangeText={setName} placeholder="e.g. Science" />
        <View style={{ flexDirection: 'row', marginBottom: spacing.md }}>
          <Button title={editing ? 'Update' : 'Add'} style={{ flex: 1 }} onPress={save} />
          {editing && <Button title="Cancel" variant="outline" style={{ flex: 1, marginLeft: spacing.sm }} onPress={() => { setEditing(null); setName(''); }} />}
        </View>
        {loading ? <Loading /> : error ? <ErrorBox message={error} onRetry={reload} /> : !data.length ? <Empty text="No categories" /> :
          data.map((c) => (
            <Card key={c._id} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ color: colors.text, fontWeight: '600', flex: 1 }}>{c.name}</Text>
              <Button title="Edit" variant="outline" style={{ paddingVertical: 6, marginRight: spacing.sm }} onPress={() => { setEditing(c); setName(c.name); }} />
              <Button title="Delete" variant="danger" style={{ paddingVertical: 6 }} onPress={() => remove(c)} />
            </Card>
          ))}
      </ScrollView>
    </View>
  );
}
