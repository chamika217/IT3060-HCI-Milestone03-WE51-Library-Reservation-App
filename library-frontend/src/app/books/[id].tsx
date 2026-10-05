import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { Link, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { booksApi } from '@/services/books-api';
import type { Book, Reservation } from '@/types/book';
import { styles as s } from '@/components/books/styles';
import PickupForm from '@/components/books/PickupForm';
export default function BookDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [book, setBook] = useState<Book | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [revision, setRevision] = useState(0);
  const [confirmation, setConfirmation] = useState<Reservation | null>(null);
  useFocusEffect(useCallback(() => {
    let active = true; setLoading(true); setError(''); setConfirmation(null);
    booksApi.detail(id).then(data => { if (active) setBook(data.book); }).catch(e => { if (active) setError(e instanceof Error ? e.message : 'Cannot load book.'); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [id, revision]));
  return <ScrollView style={s.page} contentContainerStyle={s.content}>
    <Link href="/books" style={s.link}>Back to catalogue</Link>
    {loading ? <ActivityIndicator /> : error ? <><Text style={s.error}>{error}</Text><Pressable style={s.button} onPress={() => setRevision(v => v + 1)}><Text style={s.buttonText}>Retry</Text></Pressable></> : book ? <>
      <View style={s.card}><View style={s.row}><View style={[s.cover, { backgroundColor: book.color }]}><Text style={s.coverLetter}>{book.title[0]}</Text></View><View style={s.grow}><Text style={s.title}>{book.title}</Text><Text style={s.copy}>{book.author}</Text></View></View>
        <Text style={s.copy}>{book.copies} copies available</Text><Text style={s.copy}>Category: {book.category}</Text><Text style={s.copy}>ISBN: {book.isbn || 'Not recorded'}</Text><Text style={s.heading}>About this book</Text><Text style={s.copy}>{book.description}</Text></View>
      {confirmation ? <View style={s.card}><Text style={s.heading}>Reservation confirmed</Text><Text style={s.copy}>{confirmation.pickupDate} · {confirmation.pickupWindow}</Text><Text style={s.title}>{confirmation.pickupCode}</Text><Link href="/books/reservations" style={s.link}>View my reservations</Link></View> : <PickupForm key={book.id} book={book} onReserved={r => { setConfirmation(r); setBook(r); }} />}
    </> : null}
  </ScrollView>;
}
