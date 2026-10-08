import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { Button, Icon, Message, Screen, Section, u } from '@/components/library/ui';
import { palette as c } from '@/constants/design-system';
import { useLibrary } from '@/state/library';

export default function Filters() {
  const library = useLibrary();
  const { demo, books, query, filters, setFilters } = library;
  const libraryRef = useRef(library);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [category, setCategory] = useState(filters.category);
  const [available, setAvailable] = useState(filters.available);
  useEffect(() => { libraryRef.current = library; }, [library]);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      await libraryRef.current.list();
    } catch {
      setError('Cannot load filter options. Check the API connection and try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { void load(); }, [load]));
  const categories = ['All', ...new Set(books.map(book => book.category))];
  const count = books.filter(book =>
    (!available || book.available) &&
    (category === 'All' || book.category === category) &&
    (book.title + ' ' + book.author + ' ' + book.isbn + ' ' + book.category)
      .toLowerCase().includes(query.trim().toLowerCase()),
  ).length;

  return (
    <Screen
      title="Refine your search"
      back="/books"
      tab="search"
      demo={demo}
      action={<Pressable onPress={() => { setCategory('All'); setAvailable(false); }}><Text style={u.link}>Reset</Text></Pressable>}
    >
      {loading && <ActivityIndicator />}
      {!!error && <><Message error>{error}</Message><Button outline onPress={load}>Retry</Button></>}
      {!loading && !error && <>
      <View style={{ gap: 8 }}>
        <Text style={u.title}>Find just what you need.</Text>
        <Text style={u.body}>Narrow results by subject and availability.</Text>
      </View>

      <View style={{ gap: 12 }}>
        <Section title="Subject & category" />
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {categories.map(item => {
            const selected = category === item;
            return (
              <Pressable
                key={item}
                accessibilityRole="radio"
                accessibilityState={{ checked: selected }}
                onPress={() => setCategory(item)}
                style={{ minHeight: 42, paddingHorizontal: 14, justifyContent: 'center', backgroundColor: selected ? c.primarySoft : 'transparent', borderBottomWidth: selected ? 2 : 1, borderBottomColor: selected ? c.primary : c.border }}
              >
                <Text style={[u.small, selected && { color: c.primary, fontWeight: '700' }]}>{item}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={{ gap: 12 }}>
        <Section title="Availability" />
        <Pressable
          accessibilityRole="checkbox"
          accessibilityState={{ checked: available }}
          onPress={() => setAvailable(!available)}
          style={{ minHeight: 64, paddingVertical: 12, borderTopWidth: 1, borderBottomWidth: 1, borderColor: c.border, flexDirection: 'row', alignItems: 'center', gap: 12 }}
        >
          <View style={{ width: 22, height: 22, borderWidth: 1, borderColor: available ? c.primary : c.border, backgroundColor: available ? c.primary : c.card, borderRadius: 4, alignItems: 'center', justifyContent: 'center' }}>
            {available && <Icon name="check" size={14} color={c.white} />}
          </View>
          <View style={{ flex: 1, gap: 4 }}>
            <Text style={[u.heading, { fontSize: 14 }]}>Available now</Text>
            <Text style={u.small}>Only show books with copies on shelf.</Text>
          </View>
        </Pressable>
      </View>

      <View style={{ flexDirection: 'row', gap: 10, alignItems: 'flex-start' }}>
        <Icon name="info" color={c.secondary} size={16} />
        <Text style={[u.small, { flex: 1 }]}>Availability can change as other readers reserve books. A copy is secured after confirmation.</Text>
      </View>

      <Button icon="check" onPress={() => { setFilters({ category, available }); router.replace('/books'); }}>Show {count} results</Button>
      </>}
    </Screen>
  );
}
