import { Text, View } from 'react-native';
import { router } from 'expo-router';
import { Badge, Button, Icon, Message, Screen, u } from '@/components/library/ui';
import { palette as c } from '@/constants/design-system';
import { useLibrary } from '@/state/library';
export default function Confirmation() {
  const { demo, confirmation: item } = useLibrary();
  return (
    <Screen title="Reservation confirmation" back="/books" tab="holds" demo={demo}>
      {!item ? (
        <>
          <Message>Open My reservations to view your current holds.</Message>
          <Button onPress={() => router.replace('/books/reservations')}>My reservations</Button>
        </>
      ) : (
        <View style={{ width: '100%', maxWidth: 960, alignSelf: 'center', gap: 28 }}>
          <View style={{ alignItems: 'center', gap: 14, paddingVertical: 12 }}>
            <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: c.successSoft, alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="check" size={28} color={c.success} />
            </View>
            <View style={{ alignItems: 'center' }}>
              <Badge tone="success">{demo ? 'DEMO CONFIRMED' : 'CONFIRMED'}</Badge>
            </View>
            <Text style={[u.title, { textAlign: 'center' }]}>Your next read is reserved.</Text>
            <Text style={[u.body, { textAlign: 'center' }]}>{demo ? 'You have completed the sample reservation flow.' : 'Keep your pickup code ready when you visit.'}</Text>
          </View>

          <View style={{ borderTopWidth: 1, borderBottomWidth: 1, borderColor: c.border, paddingVertical: 20, gap: 18 }}>
            <View style={{ gap: 6 }}>
              <Text style={u.eyebrow}>RESERVED TITLE</Text>
              <Text style={u.heading}>{item.title}</Text>
              <Text style={u.body}>{item.author}</Text>
            </View>
            <View style={u.divider} />
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 24 }}>
              <View style={{ flex: 1, minWidth: 150, gap: 5 }}>
                <Text style={u.eyebrow}>PICKUP POINT</Text>
                <Text style={u.body}>Library service desk</Text>
              </View>
              <View style={{ flex: 1, minWidth: 150, gap: 5 }}>
                <Text style={u.eyebrow}>DATE</Text>
                <Text style={u.heading}>{item.pickupDate}</Text>
              </View>
              <View style={{ flex: 1, minWidth: 150, gap: 5 }}>
                <Text style={u.eyebrow}>PICKUP WINDOW</Text>
                <Text style={u.body}>{item.pickupWindow} · Sri Lanka time</Text>
              </View>
            </View>
          </View>

          <View style={{ backgroundColor: c.primarySoft, borderLeftWidth: 4, borderLeftColor: c.primary, padding: 24, gap: 10 }}>
            <View style={u.row}><Icon name="hash" size={19} color={c.primary} /><Text style={[u.eyebrow, { color: c.primary }]}>YOUR PICKUP CODE</Text></View>
            <Text selectable style={{ color: c.text, fontSize: 28, fontWeight: '800' }}>{item.pickupCode}</Text>
            <Text style={u.small}>Bring this code and your student or staff ID.</Text>
          </View>

          <View style={{ gap: 12 }}>
            <Button icon="archive" onPress={() => router.replace('/books/reservations')}>View my reservations</Button>
            <Button outline onPress={() => router.replace('/books')}>Continue exploring</Button>
          </View>
        </View>
      )}
    </Screen>
  );
}
