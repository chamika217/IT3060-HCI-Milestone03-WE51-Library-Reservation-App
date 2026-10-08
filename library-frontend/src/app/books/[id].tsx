import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { Badge, Button, Card, Icon, Message, Screen, Section, u } from '@/components/library/ui';
import BookCover from '@/components/library/BookCover';
import { palette as c } from '@/constants/design-system';
import { useLibrary } from '@/state/library';
import { booksApi } from '@/services/books-api';
import type { Book } from '@/types/book';
import { SHELF_AISLES } from '@/constants/shelf-aisles';
export default function Details() {
  const { id } = useLocalSearchParams<{ id: string }>(); const library = useLibrary(); const ref = useRef(library); useEffect(() => { ref.current = library; }, [library]);
  const [book, setBook] = useState<Book | null>(null), [error, setError] = useState(''), [loading, setLoading] = useState(true);
  const bookAisle = book ? SHELF_AISLES.find(aisle => aisle.categories.includes(book.category)) : undefined;
  const load = useCallback(async () => { setLoading(true); setError(''); try { const next = ref.current.demo ? ref.current.books.find(b => b.id === id) : (await booksApi.detail(id)).book; if (!next) throw new Error('Book not found.'); setBook(next); } catch (e) { setError(e instanceof Error ? e.message : 'Cannot load book.'); } finally { setLoading(false); } }, [id]);
  useFocusEffect(useCallback(() => { void load(); }, [load]));
  return (
    <Screen title="Book details" back="/books" tab="search" demo={library.demo}>
      {loading ? <ActivityIndicator /> : error ? <>
        <Message error>{error}</Message>
        <Button outline onPress={load}>Retry</Button>
      </> : book && <>
        <View style={[u.row, { alignItems: 'flex-start' }]}>
          <BookCover book={book} large />
          <View style={{ flex: 1, gap: 10 }}>
            <Badge tone={book.available ? 'success' : 'warning'}>{book.available ? book.copies + ' AVAILABLE TO RESERVE' : 'CURRENTLY UNAVAILABLE'}</Badge>
            <Text style={u.title}>{book.title}</Text>
            <Text style={u.body}>{book.author}</Text>
            <Text style={u.caption}>{book.category}</Text>
          </View>
        </View>

        <Card>
          <Section title="Synopsis & overview" />
          <Text style={u.body}>{book.description}</Text>
          <View style={u.divider} />
          <Text style={u.small}>ISBN: {book.isbn || 'Not recorded'}</Text>
          <Text style={u.small}>Category: {book.category}</Text>
        </Card>

        <Section title="Shelf guide" />
        <View style={{ gap: 12 }}>
          <View style={u.between}>
            <View style={{ flex: 1, gap: 4 }}>
              <Text style={u.heading}>{library.demo ? 'Floor 2 · Main stacks' : 'Browse by category aisle'}</Text>
              <Text style={u.small}>Category guide only. Ask library staff to confirm the exact shelf.</Text>
            </View>
            <Badge tone="info">{library.demo ? 'SAMPLE LAYOUT' : 'CATEGORY GUIDE'}</Badge>
          </View>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', columnGap: 12 }}>
            {SHELF_AISLES.map(aisle => {
              const selected = bookAisle?.id === aisle.id;
              return (
                <Pressable
                  key={aisle.id}
                  accessibilityRole="button"
                  accessibilityLabel={`Browse books in aisle ${aisle.id}, ${aisle.label}`}
                  accessibilityState={{ selected }}
                  onPress={() => router.push({ pathname: '/books', params: { aisle: aisle.id } })}
                  style={{ flexGrow: 1, flexBasis: 150, minWidth: 0, minHeight: 76, paddingHorizontal: 12, paddingVertical: 12, justifyContent: 'center', gap: 6, backgroundColor: selected ? c.primarySoft : 'transparent', borderBottomWidth: selected ? 3 : 1, borderBottomColor: selected ? c.primary : c.border }}
                >
                  <View style={u.between}>
                    <Text style={[u.label, { color: selected ? c.primary : c.text }]}>{aisle.id}</Text>
                    {selected && <Icon name="map-pin" size={14} color={c.primary} />}
                  </View>
                  <Text style={u.small}>{aisle.label}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <Card>
          <Section title="Before you reserve" />
          <Text style={u.body}>Choose a pickup date and window. A collection code is created when your reservation is recorded.</Text>
          <Text style={u.small}>Show the code and your student or staff ID at the service desk.</Text>
        </Card>
        <Button disabled={!book.available} icon="bookmark" onPress={() => router.push({ pathname: '/books/reserve', params: { id: book.id } })}>
          {book.available ? 'Reserve this book' : 'Currently unavailable'}
        </Button>
      </>}
    </Screen>
  );
}
