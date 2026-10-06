import { Text, View, useWindowDimensions } from 'react-native';
import { router } from 'expo-router';
import { Badge, Button, Icon, Message, Screen, u } from '@/components/library/ui';
import BookCover from '@/components/library/BookCover';
import { palette as c } from '@/constants/design-system';
import { useLibrary } from '@/state/library';
export default function Confirmation() {
  const { demo, confirmation: item } = useLibrary();
  const wide = useWindowDimensions().width >= 900;
  return (
    <Screen title="Reservation confirmation" back="/books" tab="holds" demo={demo}>
      {!item ? (
        <>
          <Message>Open My reservations to view your current holds.</Message>
          <Button onPress={() => router.replace('/books/reservations')}>My reservations</Button>
        </>
      ) : (
        <View style={{ width: '100%', maxWidth: 1080, minWidth: 0, alignSelf: 'center', gap: 28 }}>
          <View style={{ gap: 10, paddingBottom: 20, borderBottomWidth: 1, borderColor: c.border }}>
            <View style={u.row}>
              <View style={{ width: 30, height: 30, borderRadius: 15, backgroundColor: c.successSoft, alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="check" size={16} color={c.success} />
              </View>
              <Badge tone="success">{demo ? 'DEMO CONFIRMED' : 'CONFIRMED'}</Badge>
            </View>
            <Text style={u.display}>Your reservation is ready.</Text>
            <Text style={u.body}>{demo ? 'This is a sample reservation. No physical book has been held.' : 'Keep your pickup code ready when you visit.'}</Text>
          </View>

          <View style={{ flexDirection: wide ? 'row' : 'column', gap: wide ? 40 : 28, alignItems: 'stretch' }}>
            <View style={{ flex: wide ? 6 : undefined, minWidth: 0, gap: 20 }}>
              <Text style={u.eyebrow}>BOOK RESERVED</Text>
              <View style={[u.row, { alignItems: 'flex-start' }]}>
                <BookCover book={item} />
                <View style={{ flex: 1, minWidth: 0, gap: 6 }}>
                  <Text style={u.heading}>{item.title}</Text>
                  <Text style={u.body}>{item.author}</Text>
                </View>
              </View>

              <View style={{ height: 1, backgroundColor: c.border }} />
              <Text style={u.eyebrow}>COLLECTION DETAILS</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 20 }}>
                <View style={{ flex: 1, minWidth: 130, gap: 5 }}>
                  <Icon name="map-pin" size={17} color={c.primary} />
                  <Text style={u.caption}>PICKUP POINT</Text>
                  <Text style={u.body}>Library service desk</Text>
                </View>
                <View style={{ flex: 1, minWidth: 130, gap: 5 }}>
                  <Icon name="calendar" size={17} color={c.primary} />
                  <Text style={u.caption}>DATE & WINDOW</Text>
                  <Text style={u.heading}>{item.pickupDate}</Text>
                  <Text style={u.body}>{item.pickupWindow} · Sri Lanka time</Text>
                </View>
              </View>
            </View>

            <View style={{ flex: wide ? 4 : undefined, minWidth: 0, backgroundColor: c.primarySoft, borderLeftWidth: 4, borderLeftColor: c.primary, padding: wide ? 26 : 20, justifyContent: 'center', gap: 14 }}>
              <View style={u.row}><Icon name="hash" size={19} color={c.primary} /><Text style={[u.eyebrow, { color: c.primary }]}>COLLECTION CODE</Text></View>
              <Text selectable style={{ color: c.text, fontSize: 28, fontWeight: '800' }}>{item.pickupCode}</Text>
              <Text style={u.small}>Show this code and your student or staff ID at the desk.</Text>
            </View>
          </View>

          <View style={{ flexDirection: wide ? 'row' : 'column', gap: 12 }}>
            <View style={{ flex: 1 }}><Button icon="archive" onPress={() => router.replace('/books/reservations')}>View my reservations</Button></View>
            <View style={{ flex: 1 }}><Button outline onPress={() => router.replace('/books')}>Continue exploring</Button></View>
          </View>
        </View>
      )}
    </Screen>
  );
}
