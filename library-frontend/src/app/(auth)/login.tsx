import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Button, Card, Field, Message, u } from '@/components/library/ui';
import AuthTemplate from '@/components/library/AuthTemplate';
import GoogleSignIn from '@/components/library/GoogleSignIn';
import { palette as c } from '@/constants/design-system';
import { useLibrary } from '@/state/library';

export default function Login() {
  const { login, loginWithGoogle } = useLibrary();
  const { returnTo, id } = useLocalSearchParams<{ returnTo?: string; id?: string }>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [visible, setVisible] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const passwordValidation = password.length === 0
    ? ''
    : password.length < 8
      ? 'Password must contain at least 8 characters.'
      : !/[a-z]/.test(password) || !/[A-Z]/.test(password)
        ? 'Password should include an uppercase and a lowercase letter.'
        : '';

  function continueAfterSignIn() {
    if (returnTo === 'reserve' && typeof id === 'string' && /^[A-Za-z0-9_-]{1,64}$/.test(id)) {
      router.replace({ pathname: '/books/reserve', params: { id } });
      return;
    }
    router.replace('/home');
  }

  async function submit() {
    if (busy) return;
    if (!email.includes('@') || password.length < 8) {
      setError('Enter your university email and a password of at least 8 characters.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      await login(email, password);
      setPassword('');
      continueAfterSignIn();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Sign-in failed.');
    } finally {
      setBusy(false);
    }
  }

  async function submitGoogleCredential(credential: string) {
    if (busy) return;
    setBusy(true);
    setError('');
    try {
      const existingAccount = await loginWithGoogle(credential);
      if (existingAccount) continueAfterSignIn();
      else router.replace('/signup');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Google sign-in failed.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthTemplate
      accessLabel="STUDENT & STAFF ACCESS"
      accessBadge="Member portal"
      footer={(
        <>
          <Text style={u.small}>A little help goes a long way.</Text>
          <Text style={u.caption}>For account support, visit your library circulation desk.</Text>
        </>
      )}
    >
      <Card style={{ padding: 32, gap: 20 }}>
        <View style={{ gap: 8 }}>
          <Text style={u.title}>Welcome back.</Text>
          <Text style={u.body}>Your next great read is waiting. Sign in to continue.</Text>
        </View>
        <Field label="EMAIL ADDRESS" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" autoComplete="email" placeholder="you@university.edu" style={{ backgroundColor: c.primarySoft, minHeight: 54, paddingVertical: 16 }} />
        <Field label="PASSWORD" value={password} onChangeText={value => { setPassword(value); setError(''); }} secureTextEntry={!visible} autoComplete="current-password" placeholder="Enter your password" style={{ backgroundColor: c.primarySoft, minHeight: 54, paddingVertical: 16 }} />
        {!!passwordValidation && <Message error>{passwordValidation}</Message>}
        <View style={u.between}>
          <Pressable onPress={() => router.push('/forgot-password')}>
            <Text style={[u.link, { color: c.primary }]}>Forgot password?</Text>
          </Pressable>
          <Pressable accessibilityRole="checkbox" accessibilityState={{ checked: visible }} onPress={() => setVisible(!visible)}>
            <Text style={u.link}>{visible ? 'Hide' : 'Show'}</Text>
          </Pressable>
        </View>
        {!!error && <Message error>{error}</Message>}
        <Button busy={busy} onPress={submit} icon="arrow-right">Sign in to your library</Button>
        <View style={{ height: 1, backgroundColor: c.border }} />
        <Text style={[u.caption, { textAlign: 'center' }]}>OR CONTINUE WITH</Text>
        <GoogleSignIn onCredential={submitGoogleCredential} disabled={busy} />
        <View style={{ height: 1, backgroundColor: c.border }} />
        <View style={[u.row, { justifyContent: 'center', flexWrap: 'wrap' }]}>
          <Text style={u.small}>New to LibraReserve?</Text>
          <Pressable onPress={() => router.push('/signup')}><Text style={[u.link, { color: c.primary }]}>Create an account</Text></Pressable>
        </View>
      </Card>
    </AuthTemplate>
  );
}
