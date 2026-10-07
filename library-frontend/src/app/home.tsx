import { useCallback, useEffect, useRef, useState } from 'react';
import { router, useFocusEffect } from 'expo-router';
import { Pressable, Text, View, useWindowDimensions } from 'react-native';
import { Badge, Card, Icon, Message, Screen, Section, u } from '@/components/library/ui';
import { palette as c } from '@/constants/design-system';
import { useLibrary } from '@/state/library';
import BookResult from '@/components/library/BookResult';
export default function Home() {
  const library = useLibrary();
  const { demo, name, books, holds, user } = library;
  const ref = useRef(library);
  const [error, setError] = useState('');
  const [serviceInfo, setServiceInfo] = useState('');
  const wide = useWindowDimensions().width >= 900;

  useEffect(() => { ref.current = library; }, [library]);
  useFocusEffect(useCallback(() => {
    if (!ref.current.demo) Promise.all([ref.current.list(), ...(ref.current.user ? [ref.current.listHolds()] : [])]).catch(() => setError('Some library data could not be loaded. Open Search or Holds to retry.'));
  }, []));

  const services = [
    { title: 'Search Books', copy: 'Stacks & shelf map', icon: 'search' as const, color: c.primary, surface: c.primarySoft, onPress: () => router.push('/books') },
    { title: 'Borrowing guide', copy: 'Reserve, collect and manage books', icon: 'book-open' as const, color: c.warning, surface: c.warningSoft, onPress: () => setServiceInfo('Choose an available title, select a pickup date and window, then show your collection code and student or staff ID at the library service desk.') },
    { title: 'My reservations', copy: user ? `${holds.length} active pickup ${holds.length === 1 ? 'request' : 'requests'}` : 'Sign in to view pickup dates and codes', icon: 'archive' as const, color: c.success, surface: c.successSoft, onPress: () => router.push(user ? '/books/reservations' : '/login') },
    { title: 'Reader profile', copy: user?.studentId ? `Library ID · ${user.studentId}` : 'Sign in to view your library profile', icon: 'credit-card' as const, color: c.text, surface: c.card, onPress: () => router.push(user ? '/profile' : '/login') },
  ];

  return (
    <Screen title="LibraReserve" subtitle="CAMPUS LIBRARY PORTAL" tab="home" demo={demo}>
      <View style={{ backgroundColor: c.primarySoft, borderLeftWidth: 4, borderLeftColor: c.primary, padding: wide ? 32 : 22, gap: 18 }}>
        <Text style={[u.eyebrow, { color: c.primary }]}>YOUR CAMPUS LIBRARY</Text>
        <Text style={u.display}>{demo || user ? `Welcome, ${name}` : 'Find your next read.'}</Text>
        <Text style={u.body}>Explore the collection, check availability, and plan a visit to the library.</Text>
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push('/books')}
          style={({ pressed }) => [{ alignSelf: 'flex-start', minHeight: 48, paddingHorizontal: 18, borderRadius: 8, backgroundColor: c.primary, flexDirection: 'row', alignItems: 'center', gap: 10 }, pressed && { opacity: 0.82 }]}
        >
          <Icon name="search" size={17} color={c.white} />
          <Text style={{ color: c.white, fontSize: 13, fontWeight: '700' }}>Search the catalogue</Text>
          <Icon name="arrow-right" size={16} color={c.white} />
        </Pressable>
      </View>

      {!!error && <Message error>{error}</Message>}

      <Section title="Your library at a glance" />
      <View style={{ flexDirection: wide ? 'row' : 'column', gap: 12 }}>
        <Card style={{ flex: 1 }}>
          <View style={u.row}><Icon name="book-open" color={c.primary} /><Text style={u.small}>Catalogue titles</Text></View>
          <Text style={u.display}>{books.length}</Text>
        </Card>
        <Card style={{ flex: 1 }}>
          <View style={u.row}><Icon name="bookmark" color={c.success} /><Text style={u.small}>Your active holds</Text></View>
          <Text style={u.display}>{user || demo ? holds.length : '—'}</Text>
        </Card>
      </View>

      <Section title="Quick services" />
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
        {services.map(item => (
          <Pressable
            key={item.title}
            accessibilityRole="button"
            onPress={item.onPress}
            style={({ pressed }) => [u.card, { flexGrow: 1, flexBasis: wide ? '46%' : '100%', minWidth: wide ? 240 : 0, backgroundColor: item.surface, borderColor: c.border, minHeight: 132 }, pressed && { opacity: 0.82 }]}
          >
            <View style={u.between}>
              <View style={{ width: 34, height: 34, borderRadius: 8, backgroundColor: c.white, alignItems: 'center', justifyContent: 'center' }}>
                <Icon name={item.icon} color={item.color} size={18} />
              </View>
              {item.title === 'My reservations' && <Badge tone={user ? 'success' : 'info'}>{user ? `${holds.length} ACTIVE` : 'SIGN IN'}</Badge>}
              {item.title === 'Reader profile' && <Badge tone={user ? 'success' : 'info'}>{user ? 'MEMBER' : 'SIGN IN'}</Badge>}
              {item.title === 'Borrowing guide' && <Badge tone="info">HOW IT WORKS</Badge>}
            </View>
            <Text style={u.heading}>{item.title}</Text>
            <Text style={u.small}>{item.copy}</Text>
          </Pressable>
        ))}
      </View>
      {!!serviceInfo && <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 10, backgroundColor: c.warningSoft, padding: 14 }}><Icon name="info" color={c.warning} size={17} /><Text style={[u.small, { flex: 1 }]}>{serviceInfo}</Text><Pressable accessibilityRole="button" accessibilityLabel="Dismiss message" onPress={() => setServiceInfo('')}><Icon name="x" color={c.secondary} size={17} /></Pressable></View>}

      <Section title={demo ? 'Discover the collection' : 'Explore your library'} action="See all" onPress={() => router.push('/books')} />
      {books.length ? books.slice(0, 3).map(book => <BookResult key={book.id} book={book} />) : (
        <Card>
          <Text style={u.body}>Open the catalogue to check the latest titles and availability.</Text>
        </Card>
      )}

      <Card>
        <View style={u.between}><Icon name="help-circle" color={c.warning} /><Badge tone="info">LIBRARY SUPPORT</Badge></View>
        <Text style={u.heading}>Need a hand?</Text>
        <Text style={u.body}>Visit the circulation desk for help with borrowing, account access or locating a title.</Text>
      </Card>
    </Screen>
  );
}
