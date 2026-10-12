import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Button, Card, Field, Icon, Message, u } from '@/components/library/ui';
import AuthTemplate from '@/components/library/AuthTemplate';
import { palette as c } from '@/constants/design-system';
import { authApi } from '@/services/auth-api';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [devCode, setDevCode] = useState('');
  const [error, setError] = useState('');

  async function sendCode() {
    if (busy) return;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Enter a valid email address.');
      return;
    }
    setBusy(true); setError(''); setMessage('');
    try {
      const result = await authApi.requestPasswordReset(email.trim());
      setSent(true); setMessage(result.message); setDevCode(result.devCode ?? '');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not send a reset code.');
    } finally { setBusy(false); }
  }

  async function resetPassword() {
    if (busy) return;
    if (!/^\d{6}$/.test(code) || password.length < 8 || !/[a-z]/.test(password) || !/[A-Z]/.test(password) || password !== confirmPassword) {
      setError('Enter the six-digit code and matching password with at least 8 characters, including uppercase and lowercase letters.');
      return;
    }
    setBusy(true); setError('');
    try {
      const result = await authApi.resetPassword(email.trim(), code, password);
      setMessage(result.message);
      setTimeout(() => router.replace('/login'), 900);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not reset your password.');
    } finally { setBusy(false); }
  }

  return (
    <AuthTemplate accessLabel="ACCOUNT SUPPORT" accessBadge="Password reset">
      <Card style={{ padding: 32, gap: 20 }}>
        <Icon name="key" color={c.primary} size={28} />
        <View style={{ gap: 8 }}>
          <Text style={u.title}>{sent ? 'Check your email.' : 'Reset your password'}</Text>
          <Text style={u.body}>{sent ? 'Enter the six-digit code we emailed you. It expires in 15 minutes.' : 'Enter your account email and we will send a secure reset code.'}</Text>
        </View>
        <Field label="EMAIL ADDRESS" value={email} onChangeText={value => { setEmail(value); setError(''); }} autoCapitalize="none" autoCorrect={false} keyboardType="email-address" autoComplete="email" placeholder="you@my.sliit.lk" editable={!sent} style={{ backgroundColor: c.primarySoft }} />
        {sent && <>
          <Field label="RESET CODE" value={code} onChangeText={value => { setCode(value.replace(/\D/g, '').slice(0, 6)); setError(''); }} keyboardType="number-pad" placeholder="123456" maxLength={6} style={{ backgroundColor: c.primarySoft }} />
          <Field label="NEW PASSWORD" value={password} onChangeText={value => { setPassword(value); setError(''); }} secureTextEntry autoComplete="new-password" placeholder="At least 8 characters" style={{ backgroundColor: c.primarySoft }} />
          <Field label="CONFIRM NEW PASSWORD" value={confirmPassword} onChangeText={value => { setConfirmPassword(value); setError(''); }} secureTextEntry autoComplete="new-password" placeholder="Repeat new password" style={{ backgroundColor: c.primarySoft }} />
        </>}
        {!!error && <Message error>{error}</Message>}
        {!!message && <Message>{message}</Message>}
        {!!devCode && <Message>Local testing reset code: {devCode}</Message>}
        <Button busy={busy} onPress={sent ? resetPassword : sendCode} icon={sent ? 'check' : 'mail'}>{sent ? 'Reset password' : 'Email reset code'}</Button>
        {sent && <Pressable disabled={busy} onPress={sendCode}><Text style={[u.link, { color: c.primary, textAlign: 'center' }]}>Send a new code</Text></Pressable>}
        <Button outline icon="arrow-left" onPress={() => router.replace('/login')}>Back to sign in</Button>
      </Card>
    </AuthTemplate>
  );
}
