import { Stack } from 'expo-router';
export default function BooksLayout() {
  return <Stack screenOptions={{ headerTintColor: '#17213A', headerStyle: { backgroundColor: '#FFF' } }}>
    <Stack.Screen name="index" options={{ title: 'Search catalogue' }} />
    <Stack.Screen name="[id]" options={{ title: 'Book details' }} />
    <Stack.Screen name="reservations" options={{ title: 'My reservations' }} />
  </Stack>;
}
