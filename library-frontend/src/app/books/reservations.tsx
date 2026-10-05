import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { Link, useFocusEffect } from 'expo-router';
import { booksApi } from '@/services/books-api';
import type { Reservation } from '@/types/book';
import { styles as s } from '@/components/books/styles';
export default function ReservationsScreen() {
  const [items, setItems] = useState<Reservation[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [revision, setRevision] = useState(0);
  const [pending, setPending] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<string | null>(null);
  useFocusEffect(useCallback(() => {
    let active = true; setLoading(true); setError('');
    booksApi.reservations().then(data => { if (active) setItems(data.reservations); }).catch(e => { if (active) setError(e instanceof Error ? e.message : 'Cannot load reservations.'); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
    // revision deliberately restarts loading when the user chooses Retry.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [revision]));
  async function cancel(id: string) {
    setPending(id); setError('');
    try { await booksApi.cancel(id); setItems(current => current.filter(r => r.reservationId !== id)); setConfirm(null); }
    catch (e) { setError(e instanceof Error ? e.message : 'Cancellation failed.'); }
    finally { setPending(null); }
  }
  return <ScrollView style={s.page} contentContainerStyle={s.content}><Text style={s.title}>My reservations</Text><Link href="/books" style={s.link}>Search books</Link>
    {loading && <ActivityIndicator />}{!!error && <><Text accessibilityRole="alert" style={s.error}>{error}</Text><Pressable onPress={() => setRevision(v => v + 1)}><Text style={s.link}>Retry</Text></Pressable></>}
    {!loading && !error && !items.length && <Text style={s.copy}>No reservations yet. Choose an available book from the catalogue.</Text>}
    {items.map(item => <View key={item.reservationId} style={s.card}><Text style={s.heading}>{item.title}</Text><Text style={s.copy}>{item.pickupDate} · {item.pickupWindow}</Text><Text style={s.heading}>Pickup code: {item.pickupCode}</Text>
      {confirm === item.reservationId ? <><Text style={s.copy}>Cancel this reservation and return the copy to the catalogue?</Text><Pressable disabled={pending !== null} onPress={() => cancel(item.reservationId)} style={s.button}><Text style={s.buttonText}>{pending ? 'Cancelling…' : 'Confirm cancellation'}</Text></Pressable><Pressable onPress={() => setConfirm(null)}><Text style={s.link}>Keep reservation</Text></Pressable></> : <Pressable onPress={() => setConfirm(item.reservationId)}><Text style={s.link}>Cancel reservation</Text></Pressable>}
    </View>)}
  </ScrollView>;
}
