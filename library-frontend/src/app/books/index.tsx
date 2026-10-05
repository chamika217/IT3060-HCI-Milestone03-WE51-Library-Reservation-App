import { useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, Text, TextInput, View } from 'react-native';
import { Link, router } from 'expo-router';
import BookCard from '@/components/books/BookCard';
import { styles as s } from '@/components/books/styles';
import { useBooks } from '@/hooks/use-books';
export default function SearchBooksScreen() {
  const { books, loading, error, retry } = useBooks();
  const [query, setQuery] = useState('');
  const [availableOnly, setAvailableOnly] = useState(false);
  const results = useMemo(() => books.filter(b => (!availableOnly || b.available) && `${b.title} ${b.author} ${b.isbn} ${b.category}`.toLowerCase().includes(query.trim().toLowerCase())), [books, query, availableOnly]);
  return <View style={s.page}><FlatList data={error ? [] : results} keyExtractor={item => item.id} contentContainerStyle={s.content}
    ListHeaderComponent={<View style={{ gap: 14 }}><Text style={s.title}>Find your next book</Text><Text style={s.copy}>Search the library by title, author, ISBN or category.</Text>
      <Link href="/books/reservations" style={s.link}>My reservations</Link>
      <TextInput accessibilityLabel="Search books" value={query} onChangeText={setQuery} placeholder="Search books" placeholderTextColor="#66728C" style={s.input} />
      <Pressable accessibilityRole="checkbox" accessibilityState={{ checked: availableOnly }} onPress={() => setAvailableOnly(!availableOnly)} style={[s.chip, availableOnly && s.selected]}><Text style={s.copy}>{availableOnly ? '✓ ' : ''}Available books only</Text></Pressable>
      {loading ? <ActivityIndicator accessibilityLabel="Loading books" /> : <Text style={s.copy}>{results.length} of {books.length} books</Text>}
      {error ? <><Text accessibilityRole="alert" style={s.error}>{error}</Text><Pressable onPress={retry} style={s.button}><Text style={s.buttonText}>Retry</Text></Pressable></> : null}
    </View>}
    ListEmptyComponent={!loading && !error ? <Text style={s.copy}>No books found. Try another search or clear the filter.</Text> : null}
    renderItem={({ item }) => <BookCard book={item} onPress={() => router.push({ pathname: '/books/[id]', params: { id: item.id } })} />} /></View>;
}
