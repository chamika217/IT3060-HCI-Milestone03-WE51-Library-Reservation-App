import { useState } from 'react';
import { Text, View } from 'react-native';
import { router } from 'expo-router';

import { Button, Field, Message, Screen, u } from '@/components/library/ui';
import { palette as c } from '@/constants/design-system';
import { changePassword } from '@/services/api';
import { useLibrary } from '@/state/library';

export default function ChangePassword() {
  const { user, demo } = useLibrary();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [busy, setBusy] = useState(false);

  const passwordError = newPassword.length < 8
    ? 'Use at least 8 characters.'
    : !/[a-z]/.test(newPassword) || !/[A-Z]/.test(newPassword)
      ? 'Include at least one uppercase and one lowercase letter.'
      : '';

  async function submit() {
    if (busy) return;
    setError('');
    setSuccess('');
    if (!user) {
      router.replace('/login');
      return;
    }
    if (!currentPassword) {
      setError('Enter your current password.');
      return;
    }
    if (passwordError) {
      setError(passwordError);
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('New password and confirmation do not match.');
      return;
    }

    setBusy(true);
    try {
      await changePassword(user.id, { oldPassword: currentPassword, newPassword });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setSuccess('Password changed successfully.');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not change your password. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Screen title="Change password" back="/profile" tab="profile" demo={demo}>
      <View style={{ gap: 8 }}>
        <Text style={u.title}>Keep your account secure.</Text>
        <Text style={u.body}>Use at least 8 characters with uppercase and lowercase letters.</Text>
      </View>
      <View style={[u.card, { gap: 16 }]}>
        <Field label="CURRENT PASSWORD" value={currentPassword} onChangeText={setCurrentPassword} secureTextEntry autoCapitalize="none" autoCorrect={false} autoComplete="current-password" style={{ backgroundColor: c.primarySoft }} />
        <Field label="NEW PASSWORD" value={newPassword} onChangeText={setNewPassword} secureTextEntry autoCapitalize="none" autoCorrect={false} autoComplete="new-password" style={{ backgroundColor: c.primarySoft }} />
        <Field label="CONFIRM NEW PASSWORD" value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry autoCapitalize="none" autoCorrect={false} autoComplete="new-password" style={{ backgroundColor: c.primarySoft }} />
      </View>
      {!!error && <Message error>{error}</Message>}
      {!!success && <Message>{success}</Message>}
      <Button busy={busy} icon="lock" onPress={submit}>Update password</Button>
    </Screen>
  );
}
