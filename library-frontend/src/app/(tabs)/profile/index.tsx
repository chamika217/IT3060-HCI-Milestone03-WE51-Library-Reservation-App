import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
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
      {user && (
        <>
          <View style={{ gap: 8 }}>
            <Text style={u.eyebrow}>Manage your account</Text>
            <Card style={{ padding: 0, gap: 0 }}>
              <ProfileAction
                icon="edit-3"
                title="Edit profile"
                description="Update your name, phone number, and library details."
                onPress={() => router.push('/profile/edit' as never)}
              />
              <View style={u.divider} />
              <ProfileAction
                icon="settings"
                title="Settings & notifications"
                description="Choose how the library sends you alerts."
                onPress={() => router.push('/profile/settings' as never)}
              />
            </Card>
          </View>

          <View style={{ gap: 8 }}>
            <Text style={u.eyebrow}>Support</Text>
            <Card style={{ padding: 0, gap: 0 }}>
              <ProfileAction
                icon="help-circle"
                title="Help & FAQs"
                description="Find answers about borrowing and reservations."
                onPress={() => router.push('/profile/help' as never)}
              />
              <View style={u.divider} />
              <ProfileAction
                icon="message-circle"
                title="Contact the library"
                description="Send a question or report an account issue."
                onPress={() => router.push('/profile/contact' as never)}
              />
            </Card>
          </View>
        </>
      )}
      {!!error && <Message error>{error}</Message>}
      <Button busy={busy} outline onPress={signOut}>{demo ? 'Leave demo' : user ? 'Sign out' : 'Sign in'}</Button>
    </Screen>
  );
}

function ProfileAction({
  icon,
  title,
  description,
  onPress,
}: {
  icon: 'edit-3' | 'settings' | 'help-circle' | 'message-circle';
  title: string;
  description: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      onPress={onPress}
      style={({ pressed }) => [u.row, { padding: 16, alignItems: 'center', opacity: pressed ? 0.75 : 1 }]}
    >
      <View style={{ width: 38, height: 38, borderRadius: 8, backgroundColor: c.primarySoft, alignItems: 'center', justifyContent: 'center' }}>
        <Icon name={icon} size={18} color={c.primary} />
      </View>
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={[u.body, { color: c.text, fontWeight: '700' }]}>{title}</Text>
        <Text style={u.small}>{description}</Text>
      </View>
      <Icon name="chevron-right" size={18} color={c.secondary} />
    </Pressable>
  );
}
