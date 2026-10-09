import { Text, View } from 'react-native';
import { router } from 'expo-router';
import { Button, Card, Icon, Message, u } from '@/components/library/ui';
import AuthTemplate from '@/components/library/AuthTemplate';
import { palette as c } from '@/constants/design-system';

export default function ForgotPassword() {
  return (
    <AuthTemplate accessLabel="ACCOUNT SUPPORT" accessBadge="Password help">
      <Card style={{ padding: 32, gap: 20 }}>
        <Icon name="key" color={c.primary} size={28} />
        <View style={{ gap: 8 }}>
          <Text style={u.title}>Need help signing in?</Text>
          <Text style={u.body}>Password recovery is handled by your campus library team.</Text>
        </View>
        <Message>Contact or visit the library circulation desk to reset your account password. Online reset requests are not available yet.</Message>
        <Button outline icon="arrow-left" onPress={() => router.replace('/login')}>Back to sign in</Button>
      </Card>
    </AuthTemplate>
  );
}