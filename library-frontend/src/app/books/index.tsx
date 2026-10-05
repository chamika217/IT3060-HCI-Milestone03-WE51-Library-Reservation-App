import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, Text, View, useWindowDimensions } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { Button, Field, Icon, Message, Screen, Section, u } from '@/components/library/ui';
import { useLibrary, useFilteredBooks } from '@/state/library';
import BookResult from '@/components/library/BookResult';
export default function Results() {
  const wide = useWindowDimensions().width >= 900;
  const library = useLibrary(); const { demo, query, setQuery, filters } = library; const ref = useRef(library); useEffect(() => { ref.current = library; }, [library]);
  const results = useFilteredBooks(); const [loading, setLoading] = useState(false), [error, setError] = useState('');
  const load = useCallback(async () => { setLoading(true); setError(''); try { await ref.current.list(); } catch { setError('Cannot load the catalogue. Check the API connection and try again.'); } finally { setLoading(false); } }, []);
  useFocusEffect(useCallback(() => { void load(); }, [load]));
  return <Screen title="Search catalogue" subtitle="FIND YOUR NEXT CHAPTER" tab="search" demo={demo} action={<Pressable accessibilityRole="button" accessibilityLabel="Open filters" onPress={() => router.push('/books/filters')} style={u.iconButton}><Icon name="sliders" /></Pressable>}><Text style={u.title}>A book for every curiosity.</Text><Field label="SEARCH THE CATALOGUE" value={query} onChangeText={setQuery} placeholder="Title, author, ISBN or category" /><View style={u.between}><Text style={u.small}>{results.length} titles{query ? ' for “' + query + '”' : ' to explore'}</Text><Pressable onPress={() => router.push('/books/filters')}><Text style={u.link}>Filters · {(filters.available ? 1 : 0) + (filters.category !== 'All' ? 1 : 0)}</Text></Pressable></View>{loading && <ActivityIndicator />}{!!error && <><Message error>{error}</Message><Button outline onPress={load}>Retry</Button></>}{!error && <><Section title="Search results" /><View style={{ flexDirection: wide ? 'row' : 'column', flexWrap: 'wrap', gap: 16 }}>{results.map(book => <View key={book.id} style={{ width: wide ? '48%' : '100%' }}><BookResult book={book} /></View>)}</View>{!loading && results.length === 0 && <View style={[u.card, { alignItems: 'center', paddingVertical: 32 }]}><Icon name="search" size={32} /><Text style={u.heading}>No matching books</Text><Text style={u.body}>Try another title or clear your filters.</Text><Button outline onPress={() => { setQuery(''); library.setFilters({ category: 'All', available: false }); }}>Clear search</Button></View>}</>}</Screen>;
}
