import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, font, radius, shadows } from '../theme';
import { Button, Input, Card } from '../components';
import { notify } from '../dialog';
import api, { setToken, errMsg } from '../api';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function AdminLogin({ nav }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);

  const login = async () => {
    const normalizedEmail = email.trim();
    if (!normalizedEmail || !password) return notify('Missing details', 'Enter username and password');
    if (!EMAIL_RE.test(normalizedEmail)) return notify('Invalid email', 'Please enter a valid email address');
    setBusy(true);
    try {
      const r = await api.post('/auth/login', { email: normalizedEmail, password });
      setToken(r.data.token);
      nav.reset('Dashboard');
    } catch (e) {
      notify('Login failed', errMsg(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={s.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={s.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={s.topDecoration}>
          <View style={s.logoCircle}>
            <Ionicons name="library" size={38} color={colors.primary} />
          </View>
          <Text style={s.title}>Library Admin</Text>
          <Text style={s.subtitle}>Management Portal & Controls</Text>
        </View>

        <Card style={s.card}>
          <Text style={s.cardHeading}>Sign In</Text>
          <Text style={s.cardSubheading}>Enter your credentials to manage library resources</Text>

          <Input
            label="Username / Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            placeholder="admin@library.com"
            leftIcon="mail-outline"
          />

          <Input
            label="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            placeholder="Enter password"
            leftIcon="lock-closed-outline"
            rightIcon={showPassword ? 'eye-off-outline' : 'eye-outline'}
            onRightIconPress={() => setShowPassword(!showPassword)}
          />

          <Button
            title={busy ? 'Signing in...' : 'Sign In'}
            onPress={login}
            disabled={busy}
            loading={busy}
            icon="log-in-outline"
            style={{ marginTop: spacing.sm }}
          />
        </Card>

        <View style={s.footer}>
          <Ionicons name="shield-checkmark-outline" size={16} color={colors.textSecondary} />
          <Text style={s.footerText}>Secure Admin End-to-End System</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  topDecoration: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primaryLight,
    borderWidth: 2,
    borderColor: 'rgba(45, 124, 233, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: font.body,
    color: colors.textSecondary,
    marginTop: 4,
  },
  card: {
    padding: spacing.lg,
    borderRadius: radius.xl,
    backgroundColor: colors.card,
  },
  cardHeading: {
    fontSize: font.h2,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  cardSubheading: {
    fontSize: font.small,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.lg,
  },
  footerText: {
    fontSize: font.small,
    color: colors.textSecondary,
    marginLeft: 6,
  },
});
