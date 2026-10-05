import { Pressable, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Button, u } from '@/components/library/ui';
import AuthTemplate from '@/components/library/AuthTemplate';
import { palette as c } from '@/constants/design-system';
import { useLibrary } from '@/state/library';
export default function Onboarding() {
  const { startDemo } = useLibrary();
  return (
    <AuthTemplate
      accessLabel="YOUR CAMPUS LIBRARY"
      accessBadge="Reader portal"
      footer={<Text style={u.small}>For account support, visit your library circulation desk.</Text>}
    >
      <View style={{ gap: 18 }}>
        <Text style={[u.eyebrow, { color: c.primary }]}>A SMARTER WAY TO BORROW</Text>
        <Text style={u.display}>Your next chapter starts here.</Text>
        <Text style={u.body}>Find a book you love, check availability, and choose a pickup time that works for you.</Text>
      </View>
      <View style={{ gap: 12 }}>
        <Button icon="arrow-right" onPress={() => router.push('/login')}>Sign in to your library</Button>
        <Button outline onPress={() => { startDemo(); router.replace('/home'); }}>Explore the demo</Button>
      </View>
      <View style={[u.row, { justifyContent: 'center', flexWrap: 'wrap' }]}>
        <Text style={u.small}>New to the library?</Text>
        <Pressable onPress={() => router.push('/signup')}>
          <Text style={[u.link, { color: c.primary }]}>Create an account</Text>
        </Pressable>
      </View>
    </AuthTemplate>
  );
}
