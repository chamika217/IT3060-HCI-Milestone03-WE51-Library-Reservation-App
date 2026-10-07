import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, font, radius } from '../theme';
import { Header, Card, Button, StatusBadge, Loading, ErrorBox, Empty, SearchBar, Fab } from '../components';
import { notify, confirmAction } from '../dialog';
import useLoad from '../useLoad';
import api, { errMsg } from '../api';

export default function ManageBooks({ nav }: any) {
  const [q, setQ] = useState('');
  const { data, loading, error, reload } = useLoad('/books', { search: q });

  const remove = async (b: any) => {
    const ok = await confirmAction('Delete book', `Delete "${b.title}"?`, 'Delete', true);
    if (!ok) return;
    try {
      await api.delete(`/books/${b._id}`);
      reload();
    } catch (e) {
      notify('Error', errMsg(e));
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Header
        title="Manage Books"
        subtitle="Catalog & Inventory Control"
        right={
          <Button
            title="+ Add Book"
            size="sm"
            icon="add"
            onPress={() => nav.navigate('BookForm')}
          />
        }
      />

      <View style={{ paddingHorizontal: spacing.md, paddingTop: spacing.md }}>
        <SearchBar
          placeholder="Search title, author, or ISBN..."
          value={q}
          onChangeText={setQ}
        />
      </View>

      {loading ? (
        <Loading message="Fetching catalog..." />
      ) : error ? (
        <ErrorBox message={error} onRetry={reload} />
      ) : (
        <FlatList
          data={data}
          keyExtractor={(b: any) => b._id}
          contentContainerStyle={{ padding: spacing.md, paddingBottom: 80 }}
          ListEmptyComponent={<Empty text="No books found in catalog" icon="book-outline" actionLabel="Add New Book" onAction={() => nav.navigate('BookForm')} />}
          renderItem={({ item: b }: any) => (
            <Card onPress={() => nav.navigate('BookForm', { book: b })} style={s.bookCard}>
              <View style={s.cardHeader}>
                <View style={s.bookCoverIcon}>
                  <Ionicons name="book-outline" size={24} color={colors.primary} />
                </View>
                <View style={s.bookInfo}>
                  <Text style={s.bookTitle} numberOfLines={1}>
                    {b.title}
                  </Text>
                  <Text style={s.bookAuthor} numberOfLines={1}>
                    {b.author}
                  </Text>
                  <View style={s.categoryTag}>
                    <Ionicons name="pricetag-outline" size={12} color={colors.primary} style={{ marginRight: 4 }} />
                    <Text style={s.categoryText}>{b.category?.name || 'Uncategorized'}</Text>
                  </View>
                </View>
              </View>

              <View style={s.divider} />

              <View style={s.cardFooter}>
                <View>
                  <Text style={s.metaText}>ISBN {b.isbn}</Text>
                  <Text style={s.stockText}>
                    <Text style={{ fontWeight: '700', color: colors.text }}>{b.available}</Text> of {b.copies} available
                  </Text>
                </View>

                <View style={s.footerActions}>
                  <StatusBadge status={b.available > 0 ? 'Available' : 'Occupied'} />
                  <TouchableOpacity
                    onPress={() => remove(b)}
                    style={s.deleteIconButton}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    accessibilityLabel={`Delete ${b.title}`}
                  >
                    <Ionicons name="trash-outline" size={18} color={colors.error} />
                  </TouchableOpacity>
                </View>
              </View>
            </Card>
          )}
        />
      )}

      <Fab onPress={() => nav.navigate('BookForm')} icon="add" label="Add Book" />
    </View>
  );
}

const s = StyleSheet.create({
  bookCard: {
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bookCoverIcon: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(45, 124, 233, 0.15)',
  },
  bookInfo: {
    flex: 1,
  },
  bookTitle: {
    fontSize: font.h3,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: -0.2,
  },
  bookAuthor: {
    fontSize: font.small,
    color: colors.textSecondary,
    marginTop: 2,
  },
  categoryTag: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: colors.primarySubtle,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.xs,
    marginTop: 6,
  },
  categoryText: {
    fontSize: font.xs,
    color: colors.primary,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.sm + 2,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metaText: {
    fontSize: font.xs,
    color: colors.textSecondary,
  },
  stockText: {
    fontSize: font.small,
    color: colors.textSecondary,
    marginTop: 2,
  },
  footerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deleteIconButton: {
    width: 34,
    height: 34,
    borderRadius: radius.md,
    backgroundColor: colors.errorLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.sm,
  },
});
