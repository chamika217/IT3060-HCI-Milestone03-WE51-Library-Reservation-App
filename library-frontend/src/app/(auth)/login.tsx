import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Button, Card, Field, Icon, Message, Screen, u } from '@/components/library/ui';
import { palette as c } from '@/constants/design-system';
import { useLibrary } from '@/state/library';
export default function Login() {
  const [email, setEmail] = useState(''), [password, setPassword] = useState(''), [visible, setVisible] = useState(false), [error, setError] = useState(''); const { startDemo } = useLibrary();
  const submit = () => setError(!email.includes('@') || password.length < 8 ? 'Enter your university email and a password of at least 8 characters.' : 'Account sign-in is not connected yet. Use Explore demo to preview the portal.');
  return <Screen title="Welcome back" subtitle="CAMPUS LIBRARY PORTAL" back="/">
    <View style={{ backgroundColor: c.primarySoft, padding: 28, borderRadius: 20, alignItems: 'center', gap: 14 }}><View style={{ backgroundColor: c.primary, padding: 18, borderRadius: 20 }}><Icon name="book-open" size={36} color={c.white} /></View><Text style={[u.eyebrow, { color: c.primary }]}>Your whole library. One place.</Text></View>
    <View style={{ gap: 8 }}><Text style={u.title}>Good to see you again.</Text><Text style={u.body}>Sign in to find books and manage your holds.</Text></View>
    <Card><Field label="UNIVERSITY EMAIL" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" autoComplete="email" placeholder="you@university.edu" /><Field label="PASSWORD" value={password} onChangeText={setPassword} secureTextEntry={!visible} autoComplete="current-password" placeholder="Enter your password" /><View style={u.between}><Pressable accessibilityRole="checkbox" accessibilityState={{ checked: visible }} onPress={() => setVisible(!visible)}><Text style={u.link}>{visible ? 'Hide password' : 'Show password'}</Text></Pressable><Pressable onPress={() => setError('For account recovery, contact your campus library desk.')}><Text style={u.link}>Forgot password?</Text></Pressable></View>{!!error && <Message error>{error}</Message>}<Button onPress={submit} icon="arrow-right">Sign in to portal</Button></Card>
    <Button outline onPress={() => { startDemo(); router.replace('/home'); }}>Explore demo without signing in</Button><View style={u.row}><Text style={u.small}>New to the library?</Text><Pressable onPress={() => router.push('/signup')}><Text style={u.link}>Create an account</Text></Pressable></View>
  </Screen>;
}
