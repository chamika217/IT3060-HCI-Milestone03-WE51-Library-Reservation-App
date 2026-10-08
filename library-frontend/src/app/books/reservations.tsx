import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { Badge, Button, Card, Icon, Message, Screen, Section, u } from '@/components/library/ui';
import { palette as c } from '@/constants/design-system';
import { useLibrary } from '@/state/library';
import type { Reservation } from '@/types/book';
import BookCover from '@/components/library/BookCover';

function dates() {
  const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Colombo', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
  return Array.from({ length: 8 }, (_, i) => new Date(Date.parse(today + 'T00:00:00Z') + i * 86400000).toISOString().slice(0, 10));
}

export default function Holds() {
  const library = useLibrary();
  const ref = useRef(library);
  useEffect(() => { ref.current = library; }, [library]);
  const [items, setItems] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [confirm, setConfirm] = useState<string | null>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const [editDate, setEditDate] = useState('');
  const [editWindow, setEditWindow] = useState('9-11 AM');
  const [busy, setBusy] = useState(false);
  const availableDates = dates();

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try { setItems(await ref.current.listHolds()); }
    catch (e) { setError(e instanceof Error ? e.message : 'Cannot load reservations.'); }
    finally { setLoading(false); }
  }, []);
  useFocusEffect(useCallback(() => { void load(); }, [load]));

  function startEdit(item: Reservation) {
    setEditing(item.reservationId);
    setEditDate(availableDates.includes(item.pickupDate) ? item.pickupDate : availableDates[0]);
    setEditWindow(item.pickupWindow);
    setConfirm(null);
    setError('');
  }

  async function saveEdit(id: string) {
    setBusy(true);
    setError('');
    try {
      const updated = await library.updateReservation(id, editDate, editWindow);
      setItems(current => current.map(item => item.reservationId === id ? updated : item));
      setEditing(null);
    } catch (e) { setError(e instanceof Error ? e.message : 'Could not update pickup details.'); }
    finally { setBusy(false); }
  }

  async function cancel(id: string) {
    setBusy(true);
    setError('');
    try {
      await library.cancel(id);
      setItems(current => current.filter(item => item.reservationId !== id));
      setConfirm(null);
      setEditing(null);
    } catch (e) { setError(e instanceof Error ? e.message : 'Cancellation failed.'); }
    finally { setBusy(false); }
  }

  return (
    <Screen title="My reservations" subtitle="YOUR ACCOUNT SHELF" tab="holds" demo={library.demo}>
      <View style={{ backgroundColor: c.successSoft, borderLeftWidth: 4, borderLeftColor: c.success, padding: 24, gap: 8 }}>
        <Text style={[u.eyebrow, { color: c.success }]}>A little reading, lined up.</Text>
        <Text style={u.title}>{items.length} active {items.length === 1 ? 'reservation' : 'reservations'}</Text>
        <Text style={u.body}>Your books. Your pickup details. All here.</Text>
      </View>
      {loading && <ActivityIndicator />}
      {!!error && <><Message error>{error}</Message><Button outline onPress={load}>Retry</Button></>}
      <Section title="Upcoming pickups" />
      {items.map(item => <Card key={item.reservationId}>
        <Badge tone="success">{library.demo ? 'DEMO HOLD' : 'RESERVED'}</Badge>
        <View style={u.row}>
          <BookCover book={item} />
          <View style={{ flex: 1, gap: 6 }}><Text style={u.heading}>{item.title}</Text><Text style={u.small}>{item.author}</Text></View>
        </View>
        <View style={u.divider} />
        {editing === item.reservationId ? <View style={{ gap: 14 }}>
          <Text style={u.heading}>Change pickup details</Text>
          <Text style={u.caption}>Choose a date within the next seven days (Sri Lanka time).</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {availableDates.map(day => {
              const selected = editDate === day;
              return <Pressable key={day} accessibilityRole="radio" accessibilityState={{ checked: selected }} onPress={() => setEditDate(day)} style={{ minWidth: 72, minHeight: 48, paddingHorizontal: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: selected ? c.primarySoft : 'transparent', borderWidth: 1, borderColor: selected ? c.primary : c.border, borderRadius: 8 }}>
                <Text style={[u.small, selected && { color: c.primary, fontWeight: '700' }]}>{day.slice(5)}</Text>
              </Pressable>;
            })}
          </View>
          <Text style={u.caption}>PICKUP WINDOW</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {['9-11 AM', '12-2 PM', '4-6 PM'].map(window => {
              const selected = editWindow === window;
              return <Pressable key={window} accessibilityRole="radio" accessibilityState={{ checked: selected }} onPress={() => setEditWindow(window)} style={{ flexGrow: 1, minWidth: 100, minHeight: 46, paddingHorizontal: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: selected ? c.primarySoft : 'transparent', borderWidth: 1, borderColor: selected ? c.primary : c.border, borderRadius: 8 }}>
                <Text style={[u.small, selected && { color: c.primary, fontWeight: '700' }]}>{window}</Text>
              </Pressable>;
            })}
          </View>
          <Button busy={busy} onPress={() => saveEdit(item.reservationId)}>Save pickup details</Button>
          <Button outline disabled={busy} onPress={() => setEditing(null)}>Keep current details</Button>
        </View> : <>
          <Text style={u.body}>{item.pickupDate} · {item.pickupWindow}</Text>
          <Text selectable style={[u.heading, { color: c.success }]}>{item.pickupCode}</Text>
          {confirm === item.reservationId ? <>
            <Message>Cancel this hold and release the copy for another reader?</Message>
            <Button busy={busy} onPress={() => cancel(item.reservationId)}>Confirm cancellation</Button>
            <Button outline disabled={busy} onPress={() => setConfirm(null)}>Keep my reservation</Button>
          </> : <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 20 }}>
            <Pressable accessibilityRole="button" onPress={() => startEdit(item)}><Text style={u.link}>Change pickup</Text></Pressable>
            <Pressable accessibilityRole="button" onPress={() => setConfirm(item.reservationId)}><Text style={[u.link, { color: c.error }]}>Cancel reservation</Text></Pressable>
          </View>}
        </>}
      </Card>)}
      {!loading && !error && !items.length && <Card style={{ alignItems: 'center', paddingVertical: 32 }}>
        <Icon name="bookmark" size={36} color={c.success} />
        <Text style={u.heading}>Your next read is waiting.</Text>
        <Text style={[u.body, { textAlign: 'center' }]}>You have no active holds. Explore the catalogue and reserve an available title.</Text>
        <Button onPress={() => router.push('/books')}>Find a book</Button>
      </Card>}
    </Screen>
  );
}
