import { useRef, useState, useEffect } from 'react';
import { Pressable, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Badge, Button, Icon, Message, Screen, Section, u } from '@/components/library/ui';
import BookCover from '@/components/library/BookCover';
import { useLibrary } from '@/state/library';
import { booksApi } from '@/services/books-api';
import { palette as c } from '@/constants/design-system';
import type { Book } from '@/types/book';
function dates() { const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Colombo', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date()); return Array.from({ length: 8 }, (_, i) => new Date(Date.parse(today + 'T00:00:00Z') + i * 86400000).toISOString().slice(0, 10)); }
function weekday(date: string) { return new Intl.DateTimeFormat('en', { timeZone: 'Asia/Colombo', weekday: 'short' }).format(new Date(date + 'T12:00:00+05:30')); }
export default function Reserve() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { books, demo, user, reserve } = useLibrary();
  const [loadedBook, setLoadedBook] = useState<Book | null>(null);
  const book = demo ? books.find(item => item.id === id) : loadedBook;
  const days = dates();
  const [date, setDate] = useState(days[1]);
  const [pickupWindow, setPickupWindow] = useState('9-11 AM');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const pending = useRef(false);

  useEffect(() => {
    if (demo) return;
    let active = true;
    booksApi.detail(id).then(data => { if (active) setLoadedBook(data.book); })
      .catch(() => { if (active) setError('Cannot load this book. Return to the catalogue and try again.'); });
    return () => { active = false; };
  }, [id, demo]);

  async function submit() {
    if (pending.current || !book) return;
    if (!demo && !user) {
      router.push({ pathname: '/login', params: { returnTo: 'reserve', id: book.id } });
      return;
    }
    pending.current = true;
    setBusy(true);
    setError('');
    try {
      await reserve(book.id, date, pickupWindow);
      router.replace('/books/confirmation');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Reservation failed.');
    } finally {
      pending.current = false;
      setBusy(false);
    }
  }

  return (
    <Screen title="Reserve a book" back="/books" tab="search" demo={demo}>
      {!book ? <Message>{error || 'Loading your selected book…'}</Message> : <>
        <View style={[u.row, { paddingBottom: 18, borderBottomWidth: 1, borderBottomColor: c.border }]}>
          <BookCover book={book} />
          <View style={{ flex: 1, gap: 6 }}>
            <Badge tone="info">YOUR SELECTION</Badge>
            <Text style={u.heading}>{book.title}</Text>
            <Text style={u.small}>{book.author}</Text>
          </View>
        </View>

        <Section title="Pickup point" />
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: c.primarySoft, borderLeftWidth: 3, borderLeftColor: c.primary, padding: 16 }}>
          <Icon name="map-pin" color={c.primary} />
          <View style={{ flex: 1, gap: 4 }}>
            <Text style={u.heading}>Library service desk</Text>
            <Text style={u.small}>Bring your student or staff card and pickup code.</Text>
          </View>
        </View>

        <View style={{ gap: 12 }}>
          <Section title="Choose a date" />
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {days.map(day => {
              const selected = date === day;
              return (
                <Pressable
                  key={day}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: selected }}
                  onPress={() => setDate(day)}
                  style={{ flexGrow: 1, flexBasis: 72, minWidth: 68, minHeight: 64, padding: 8, alignItems: 'center', justifyContent: 'center', gap: 5, backgroundColor: selected ? c.primarySoft : 'transparent', borderBottomWidth: selected ? 3 : 1, borderBottomColor: selected ? c.primary : c.border }}
                >
                  <Text style={[u.caption, selected && { color: c.primary }]}>{weekday(day)}</Text>
                  <Text style={[u.label, { color: selected ? c.primary : c.text }]}>{day.slice(5)}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={{ gap: 12 }}>
          <Section title="Pickup window" />
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {['9-11 AM', '12-2 PM', '4-6 PM'].map(item => {
              const selected = pickupWindow === item;
              return (
                <Pressable
                  key={item}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: selected }}
                  onPress={() => setPickupWindow(item)}
                  style={{ flexGrow: 1, flexBasis: 130, minHeight: 50, paddingHorizontal: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: selected ? c.primarySoft : 'transparent', borderBottomWidth: selected ? 3 : 1, borderBottomColor: selected ? c.primary : c.border }}
                >
                  <Text style={[u.small, selected && { color: c.primary, fontWeight: '700' }]}>{item}</Text>
                </Pressable>
              );
            })}
          </View>
          <Text style={u.caption}>All pickup dates and times use Sri Lanka time.</Text>
        </View>

        <Message>{demo ? 'This creates a demo reservation only. No physical book will be held.' : 'Your copy is secured only after the library confirms this request.'}</Message>
        {!demo && !user && <Message error>Please sign in to reserve this book.</Message>}
        {!!error && <Message error>{error}</Message>}
        <Button busy={busy} disabled={!book.available} icon={user || demo ? 'check' : 'arrow-right'} onPress={submit}>{!user && !demo ? 'Sign in to reserve' : demo ? 'Confirm demo reservation' : 'Confirm reservation'}</Button>
      </>}
    </Screen>
  );
}
