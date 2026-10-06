import React, { useState } from 'react';
import { View, Text, FlatList, Alert } from 'react-native';
import { colors, spacing, font } from '../theme';
import { Header, Card, Button, Input, StatusBadge, Loading, ErrorBox, Empty } from '../components';
import useLoad from '../useLoad';
import api, { errMsg } from '../api';

export default function ManageBooks({ nav }: any) {
  const [q, setQ] = useState('');
  const { data, loading, error, reload } = useLoad('/books', { search: q });

  const remove = (b: any) => Alert.alert('Delete book', `Delete "${b.title}"?`, [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Delete', style: 'destructive', onPress: async () => {
      try { await api.delete(`/books/${b._id}`); reload(); } catch (e) { Alert.alert('Error', errMsg(e)); }
    } },
  ]);

  return (
    <View style={{ flex: 1 }}>
      <Header title="Manage Books" />
      <View style={{ padding: spacing.md, paddingBottom: 0 }}>
        <Input placeholder="Search title, author, ISBN" value={q} onChangeText={setQ} />
        <Button title="+ Add New Book" onPress={() => nav.navigate('BookForm')} />
      </View>
      {loading ? <Loading /> : error ? <ErrorBox message={error} onRetry={reload} /> : (
        <FlatList
          data={data} keyExtractor={(b: any) => b._id} contentContainerStyle={{ padding: spacing.md }}
          ListEmptyComponent={<Empty text="No books found" />}
          renderItem={({ item: b }: any) => (
            <Card onPress={() => nav.navigate('BookForm', { book: b })}>
              <Text style={{ fontSize: font.body + 2, fontWeight: '700', color: colors.text }}>{b.title}</Text>
              <Text style={{ color: colors.textSecondary }}>{b.author} • {b.category?.name || 'Uncategorised'}</Text>
              <Text style={{ color: colors.textSecondary, marginBottom: spacing.sm }}>ISBN {b.isbn} • {b.available}/{b.copies} available</Text>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <StatusBadge status={b.available > 0 ? 'Available' : 'Occupied'} />
                <Button title="Delete" variant="danger" style={{ paddingVertical: 6 }} onPress={() => remove(b)} />
              </View>
            </Card>
          )}
        />
      )}
    </View>
  );
}
