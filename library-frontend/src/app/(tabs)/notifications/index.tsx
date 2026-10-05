import { Text, View } from 'react-native';
import { router } from 'expo-router';
import { Button, Card, Icon, Screen, u } from '@/components/library/ui';
import { palette as c } from '@/constants/design-system';
import { useLibrary } from '@/state/library';
export default function Notifications() {
	const { demo } = useLibrary();

	return (
		<Screen title="Notifications" tab="alerts" demo={demo}>
			<View style={{ backgroundColor: c.primarySoft, borderLeftWidth: 4, borderLeftColor: c.primary, padding: 22, gap: 8 }}>
				<Text style={[u.eyebrow, { color: c.primary }]}>LIBRARY UPDATES</Text>
				<Text style={u.title}>You’re all caught up.</Text>
				<Text style={u.body}>New reservation and account updates will appear here.</Text>
			</View>
			<Card style={{ alignItems: 'center', paddingVertical: 32, gap: 14 }}>
				<View style={{ width: 56, height: 56, borderRadius: 8, backgroundColor: c.primarySoft, alignItems: 'center', justifyContent: 'center' }}>
					<Icon name="bell" size={26} color={c.primary} />
				</View>
				<Text style={u.heading}>No notifications</Text>
				<Text style={[u.body, { textAlign: 'center' }]}>Check your reservations for pickup dates and collection codes.</Text>
				<Button outline icon="archive" onPress={() => router.push('/books/reservations')}>View reservations</Button>
			</Card>
		</Screen>
	);
}
