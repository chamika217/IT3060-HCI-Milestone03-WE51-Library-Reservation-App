import React, { useState } from 'react';
import { View, Text, Alert } from 'react-native';
import { colors, spacing, font } from '../theme';
import { Button, Input } from '../components';
import api, { setToken, errMsg } from '../api';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function AdminLogin({ nav }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);

  const login = async () => {
    const normalizedEmail = email.trim();
    if (!normalizedEmail || !password) return Alert.alert('Missing details', 'Enter username and password');
    if (!EMAIL_RE.test(normalizedEmail)) return Alert.alert('Invalid email', 'Please enter a valid email address');
    setBusy(true);
    try {
      const r = await api.post('/auth/login', { email: normalizedEmail, password });
      setToken(r.data.token);
      nav.reset('Dashboard');
    } catch (e) { Alert.alert('Login failed', errMsg(e)); }
    finally { setBusy(false); }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', padding: spacing.lg, backgroundColor: colors.background }}>
      <Text style={{ fontSize: 28, fontWeight: '800', color: colors.primary, textAlign: 'center' }}>Library Admin</Text>
      <Text style={{ color: colors.textSecondary, textAlign: 'center', marginBottom: spacing.lg, fontSize: font.body }}>Login to continue</Text>
      <Input label="Username / Email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" placeholder="admin@library.com" />
      <Input label="Password" value={password} onChangeText={setPassword} secureTextEntry placeholder="Password" />
      <Button title={busy ? 'Logging in...' : 'Login'} onPress={login} disabled={busy} />
    </View>
  );
}
