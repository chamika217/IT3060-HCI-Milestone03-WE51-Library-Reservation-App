import React, { useState } from 'react';
import { View, Text, ScrollView, Alert } from 'react-native';
import { colors, spacing } from '../theme';
import { Header, Button, Input, Chip } from '../components';
import useLoad from '../useLoad';
import api, { errMsg } from '../api';

export default function BookForm({ nav, params }) {
  const book = params?.book;
  const edit = !!book;
  const cats = useLoad('/categories');
  const [f, setF] = useState({
    title: book?.title || '', author: book?.author || '', isbn: book?.isbn || '',
    copies: String(book?.copies ?? 1), category: book?.category?._id || '',
  });
  const set = (k) => (v) => setF((x) => ({ ...x, [k]: v }));

  const save = async () => {
    if (!f.title.trim() || !f.author.trim() || !f.isbn.trim()) return Alert.alert('Missing details', 'Title, author and ISBN are required');
    const copies = Number(f.copies);
    if (!Number.isInteger(copies) || copies < 0) return Alert.alert('Invalid copies', 'Copies must be a whole number');
    const payload = { ...f, copies };
    try {
      if (edit) await api.put(`/books/${book._id}`, payload);
      else await api.post('/books', payload);
      nav.goBack();
    } catch (e) { Alert.alert('Could not save', errMsg(e)); }
  };

  const remove = () => Alert.alert('Delete book', 'This cannot be undone.', [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Delete', style: 'destructive', onPress: async () => {
      try { await api.delete(`/books/${book._id}`); nav.goBack(); } catch (e) { Alert.alert('Error', errMsg(e)); }
    } },
  ]);

  return (
    <View style={{ flex: 1 }}>
      <Header title={edit ? 'Edit Book' : 'Add New Book'} onBack={nav.goBack} />
      <ScrollView contentContainerStyle={{ padding: spacing.md }}>
        <Input label="Title *" value={f.title} onChangeText={set('title')} />
        <Input label="Author *" value={f.author} onChangeText={set('author')} />
        <Input label="ISBN *" value={f.isbn} onChangeText={set('isbn')} keyboardType="numeric" />
        <Input label="Copies *" value={f.copies} onChangeText={set('copies')} keyboardType="numeric" />
        <Text style={{ color: colors.textSecondary, marginBottom: 6 }}>Category</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: spacing.md }}>
          {(cats.data || []).map((c) => <Chip key={c._id} label={c.name} active={f.category === c._id} onPress={() => set('category')(f.category === c._id ? '' : c._id)} />)}
        </View>
        <Button title={edit ? 'Save Changes' : 'Save Book'} onPress={save} />
        {edit && <Button title="Delete Book" variant="danger" style={{ marginTop: spacing.md }} onPress={remove} />}
        <Button title="Cancel" variant="outline" style={{ marginTop: spacing.md }} onPress={nav.goBack} />
      </ScrollView>
    </View>
  );
}
