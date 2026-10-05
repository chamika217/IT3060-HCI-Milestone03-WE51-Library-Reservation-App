import { Text, View } from 'react-native';
import { router } from 'expo-router';
import { Button, Card, Icon, Screen, u } from '@/components/library/ui';
import { palette as c } from '@/constants/design-system';
import { useLibrary } from '@/state/library';
export default function Onboarding() {
  const { startDemo } = useLibrary();
  return <Screen title="LibraReserve" subtitle="YOUR CAMPUS. YOUR LIBRARY.">
    <View style={{ backgroundColor: c.primarySoft, borderRadius: 24, padding: 32, gap: 24, alignItems: 'center', marginTop: 8 }}><View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 8, height: 110 }}>{[74, 105, 86, 64].map((height, i) => <View key={i} style={{ height, width: 38, borderRadius: 6, backgroundColor: i === 1 ? c.primary : c.card, borderWidth: 1, borderColor: c.border, alignItems: 'center', justifyContent: 'center', transform: [{ rotate: i === 3 ? '10deg' : '0deg' }] }}><View style={{ height: 3, width: 20, backgroundColor: i === 1 ? c.white : c.primary, borderRadius: 2 }} /></View>)}</View><Text style={[u.eyebrow, { color: c.primary }]}>A smarter way to borrow</Text></View>
    <View style={{ gap: 12, alignItems: 'center' }}><Text style={[u.display, { textAlign: 'center' }]}>Your next chapter, without the wait.</Text><Text style={[u.body, { textAlign: 'center' }]}>Find a book you love. Reserve a copy. Make more time for what matters.</Text></View>
    {([{ icon: 'search', title: 'Find it in seconds', copy: 'Search titles, authors and subjects in one place.' }, { icon: 'map-pin', title: 'Know before you go', copy: 'Check availability and explore book details.' }, { icon: 'bookmark', title: 'Reserve with confidence', copy: 'Choose a pickup time that works for you.' }] as const).map((item, i) => <Card key={item.title}><View style={u.row}><View style={{ padding: 12, backgroundColor: c.primarySoft, borderRadius: 12 }}><Icon name={item.icon} /></View><View style={{ flex: 1, gap: 4 }}><Text style={[u.heading, { fontSize: 14 }]}>{item.title}</Text><Text style={u.small}>{item.copy}</Text></View><Text style={u.caption}>0{i + 1}</Text></View></Card>)}
    <Button icon="arrow-right" onPress={() => router.push('/login')}>Get started</Button><Button outline onPress={() => { startDemo(); router.replace('/home'); }}>Explore the demo</Button><Text style={[u.caption, { textAlign: 'center' }]}>Built for curious minds. Designed for campus life.</Text>
  </Screen>;
}
