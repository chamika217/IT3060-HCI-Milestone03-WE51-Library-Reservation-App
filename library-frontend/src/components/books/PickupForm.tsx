import { useRef, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { booksApi } from '@/services/books-api';
import type { Book, Reservation } from '@/types/book';
import { styles as s } from './styles';
function dates() {
  const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Colombo', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
  return Array.from({ length: 8 }, (_, i) => new Date(Date.parse(today + 'T00:00:00Z') + i * 86400000).toISOString().slice(0, 10));
}
export default function PickupForm({ book, onReserved }: { book: Book; onReserved: (reservation: Reservation) => void }) {
  const options = dates();
  const [date, setDate] = useState(options[1]);
  const [window, setWindow] = useState('9-11 AM');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const pending = useRef(false);
  async function submit() {
    if (pending.current) return;
    pending.current = true; setBusy(true); setError('');
    try { onReserved((await booksApi.reserve(book.id, date, window)).reservation); }
    catch (e) { setError(e instanceof Error ? e.message : 'Reservation failed. Please try again.'); }
    finally { pending.current = false; setBusy(false); }
  }
  return <View style={s.card}><Text style={s.heading}>Reserve for pickup</Text><Text style={s.copy}>Pickup dates use Sri Lanka time.</Text>
    <Text style={s.heading}>Pickup date</Text><View style={s.chips}>{options.map(item => <Pressable key={item} accessibilityRole="button" accessibilityState={{ selected: date === item }} onPress={() => setDate(item)} style={[s.chip, date === item && s.selected]}><Text style={s.copy}>{item}</Text></Pressable>)}</View>
    <Text style={s.heading}>Pickup window</Text><View style={s.chips}>{['9-11 AM', '12-2 PM', '4-6 PM'].map(item => <Pressable key={item} accessibilityRole="button" accessibilityState={{ selected: window === item }} onPress={() => setWindow(item)} style={[s.chip, window === item && s.selected]}><Text style={s.copy}>{item}</Text></Pressable>)}</View>
    {!!error && <Text accessibilityRole="alert" style={s.error}>{error}</Text>}
    <Pressable accessibilityRole="button" disabled={busy || !book.available} onPress={submit} style={[s.button, (busy || !book.available) && s.disabled]}><Text style={s.buttonText}>{busy ? 'Reserving…' : book.available ? 'Reserve book' : 'Currently unavailable'}</Text></Pressable>
  </View>;
}
