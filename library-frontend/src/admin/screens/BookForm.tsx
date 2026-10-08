import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, font, radius } from '../theme';
import { Header, Button, Input, Chip, Card, SectionTitle } from '../components';
import { notify, confirmAction } from '../dialog';
import useLoad from '../useLoad';
import api, { errMsg } from '../api';

export default function BookForm({ nav, params }: any) {
  const book = params?.book;
  const edit = !!book;
  const cats = useLoad('/categories');
  const [f, setF] = useState({
    title: book?.title || '',
    author: book?.author || '',
    isbn: book?.isbn || '',
    copies: String(book?.copies ?? 1),
    category: book?.category?._id || '',
  });

  const set = (k: string) => (v: string) => setF((x: any) => ({ ...x, [k]: v }));

  const save = async () => {
    if (!f.title.trim() || !f.author.trim() || !f.isbn.trim()) {
      return notify('Missing details', 'Title, author and ISBN are required');
    }
    const copies = Number(f.copies);
    if (!Number.isInteger(copies) || copies < 0) {
      return notify('Invalid copies', 'Copies must be a whole number');
    }
    const payload = { ...f, copies };
    try {
      if (edit) await api.put(`/books/${book._id}`, payload);
      else await api.post('/books', payload);
      nav.goBack();
    } catch (e) {
      notify('Could not save', errMsg(e));
    }
  };

  const remove = async () => {
    const ok = await confirmAction('Delete book', 'This cannot be undone.', 'Delete', true);
    if (!ok) return;
    try {
      await api.delete(`/books/${book._id}`);
      nav.goBack();
    } catch (e) {
      notify('Error', errMsg(e));
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Header
        title={edit ? 'Edit Book' : 'Add New Book'}
        subtitle={edit ? 'Update book details in catalog' : 'Register a new book in catalog'}
        onBack={nav.goBack}
      />
      <ScrollView contentContainerStyle={{ padding: spacing.md, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <Card style={s.formCard}>
          <SectionTitle title="Book Details" style={{ marginTop: 0 }} />

          <Input
            label="Title *"
            value={f.title}
            onChangeText={set('title')}
            placeholder="e.g. Introduction to Algorithms"
            leftIcon="book-outline"
          />

          <Input
            label="Author *"
            value={f.author}
            onChangeText={set('author')}
            placeholder="e.g. Thomas H. Cormen"
            leftIcon="person-outline"
          />

          <Input
            label="ISBN *"
            value={f.isbn}
            onChangeText={set('isbn')}
            keyboardType="numeric"
            placeholder="e.g. 9780262033848"
            leftIcon="barcode-outline"
          />

          <Input
            label="Copies Available *"
            value={f.copies}
            onChangeText={set('copies')}
            keyboardType="numeric"
            placeholder="e.g. 5"
            leftIcon="copy-outline"
          />

          <Text style={s.label}>Category</Text>
          <View style={s.chipsRow}>
            {(cats.data || []).length === 0 ? (
              <Text style={{ color: colors.textSecondary, fontSize: font.small }}>No categories available</Text>
            ) : (
              (cats.data || []).map((c: any) => (
                <Chip
                  key={c._id}
                  label={c.name}
                  active={f.category === c._id}
                  icon="pricetag-outline"
                  onPress={() => set('category')(f.category === c._id ? '' : c._id)}
                />
              ))
            )}
          </View>
        </Card>

        <Button
          title={edit ? 'Save Changes' : 'Save Book'}
          onPress={save}
          icon={edit ? 'checkmark-circle-outline' : 'add-circle-outline'}
          style={{ marginBottom: spacing.sm }}
        />

        {edit && (
          <Button
            title="Delete Book"
            variant="danger"
            icon="trash-outline"
            style={{ marginBottom: spacing.sm }}
            onPress={remove}
          />
        )}

        <Button title="Cancel" variant="outline" onPress={nav.goBack} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  formCard: {
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  label: {
    color: colors.text,
    fontSize: font.small,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: spacing.sm,
  },
});
