import { Text } from 'react-native';
import { router } from 'expo-router';
import { Badge, Button, Card, Icon, Screen, u } from '@/components/library/ui';
import { useLibrary } from '@/state/library';
import { setBookSessionToken } from '@/services/books-api';
export default function Profile() { const { demo, name, setDemo } = useLibrary(); return <Screen title="Profile" tab="profile" demo={demo}><Card><Icon name="user" size={32} /><Text style={u.title}>{demo ? name : 'Library reader'}</Text><Badge>{demo ? 'DEMO ACCOUNT' : 'CAMPUS PORTAL'}</Badge><Text style={u.body}>{demo ? 'This sample account is for exploring the high-fidelity design. Demo changes last for this session only.' : 'Connect your university account to manage your library activity.'}</Text></Card><Button outline onPress={() => { setDemo(false); setBookSessionToken(null); router.replace('/login'); }}>{demo ? 'Leave demo' : 'Back to sign in'}</Button></Screen>; }
