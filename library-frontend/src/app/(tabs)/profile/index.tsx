import { useState } from 'react';
import { Text, View } from 'react-native';
import { router } from 'expo-router';
import { Badge, Button, Card, Icon, Message, Screen, u } from '@/components/library/ui';
import { palette as c } from '@/constants/design-system';
import { useLibrary } from '@/state/library';
export default function Profile() {
  const { demo, name, user, logout } = useLibrary(); const [busy, setBusy] = useState(false), [error, setError] = useState('');
  async function signOut() { setBusy(true); setError(''); try { await logout(); router.replace('/login'); } catch { setError('Could not revoke the session. Check your connection and retry.'); } finally { setBusy(false); } }
  return (
    <Screen title="Profile" tab="profile" demo={demo}>
      <Card style={{ padding: 22, gap: 18 }}>
        <View style={u.row}>
          <View style={{ width: 56, height: 56, borderRadius: 8, backgroundColor: c.primarySoft, alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="user" size={27} color={c.primary} />
          </View>
          <View style={{ flex: 1, gap: 8 }}>
            <Text style={u.title}>{demo ? name : user?.name || 'Library reader'}</Text>
            <Badge tone={demo ? 'info' : user ? 'success' : 'warning'}>{demo ? 'DEMO ACCOUNT' : user ? 'LIBRARY MEMBER' : 'GUEST'}</Badge>
          </View>
        </View>
        <View style={u.divider} />
        {user ? (
          <View style={{ gap: 14 }}>
            <View style={u.row}><Icon name="mail" color={c.secondary} size={17} /><Text style={[u.body, { flex: 1 }]}>{user.email}</Text></View>
            <View style={u.row}><Icon name="credit-card" color={c.secondary} size={17} /><Text style={[u.body, { flex: 1 }]}>Student / staff ID: {user.studentId}</Text></View>
            <View style={u.row}><Icon name="briefcase" color={c.secondary} size={17} /><Text style={[u.body, { flex: 1 }]}>{user.department}</Text></View>
          </View>
        ) : (
          <Text style={u.body}>{demo ? 'This sample account is for exploring the design. Demo changes last for this session only.' : 'Sign in to manage your library account.'}</Text>
        )}
      </Card>
      {!!error && <Message error>{error}</Message>}
      <Button busy={busy} outline onPress={signOut}>{demo ? 'Leave demo' : user ? 'Sign out' : 'Sign in'}</Button>
    </Screen>
  );
}
