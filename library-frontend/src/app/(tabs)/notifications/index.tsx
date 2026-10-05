import { Text } from 'react-native';
import { Card, Icon, Screen, u } from '@/components/library/ui';
import { useLibrary } from '@/state/library';
export default function Notifications() { const { demo } = useLibrary(); return <Screen title="Notifications" tab="alerts" demo={demo}><Text style={u.title}>You’re all caught up.</Text><Card style={{ alignItems: 'center', paddingVertical: 32 }}><Icon name="bell" size={32} /><Text style={u.heading}>No notifications</Text><Text style={u.body}>Check My reservations for your pickup details.</Text></Card></Screen>; }
