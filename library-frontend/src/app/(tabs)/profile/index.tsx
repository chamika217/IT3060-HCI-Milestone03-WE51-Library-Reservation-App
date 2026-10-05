import { useState } from 'react';
import { Text } from 'react-native';
import { router } from 'expo-router';
import { Badge, Button, Card, Icon, Message, Screen, u } from '@/components/library/ui';
import { useLibrary } from '@/state/library';
export default function Profile() {
  const { demo, name, user, logout } = useLibrary(); const [busy, setBusy] = useState(false), [error, setError] = useState('');
  async function signOut() { setBusy(true); setError(''); try { await logout(); router.replace('/login'); } catch { setError('Could not revoke the session. Check your connection and retry.'); } finally { setBusy(false); } }
  return <Screen title="Profile" tab="profile" demo={demo}><Card><Icon name="user" size={32} /><Text style={u.title}>{demo ? name : user?.name || 'Library reader'}</Text><Badge>{demo ? 'DEMO ACCOUNT' : user ? 'LIBRARY MEMBER' : 'GUEST'}</Badge>{user ? <><Text style={u.body}>{user.email}</Text><Text style={u.body}>Student / staff ID: {user.studentId}</Text><Text style={u.body}>{user.department}</Text></> : <Text style={u.body}>{demo ? 'This sample account is for exploring the design. Demo changes last for this session only.' : 'Sign in to manage your library account.'}</Text>}</Card>{!!error && <Message error>{error}</Message>}<Button busy={busy} outline onPress={signOut}>{demo ? 'Leave demo' : user ? 'Sign out' : 'Sign in'}</Button></Screen>;
}
