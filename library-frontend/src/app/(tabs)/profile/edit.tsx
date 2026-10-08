/**
 * Screen 7 — Edit Profile
 * Route: /(tabs)/profile/edit
 *
 * Fetches real profile on mount; saves via PUT /api/users/:id.
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  Pressable,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';

import { ScreenHeader, StatusBadge, BottomNavBar, IonIcon } from '@/components/shared';
import { getUserProfile, updateUserProfile, getAuthUserId } from '@/services/api';
import { ApiUserProfile } from '@/features/notifications/types';

// ─── Field wrapper ────────────────────────────────────────────────────────────

interface FieldProps {
  label: string;
  hint?: string;
  children: React.ReactNode;
}
function Field({ label, hint, children }: FieldProps) {
  return (
    <View style={fieldStyles.wrap}>
      <Text style={fieldStyles.label}>{label}</Text>
      {children}
      {hint ? <Text style={fieldStyles.hint}>{hint}</Text> : null}
    </View>
  );
}
const fieldStyles = StyleSheet.create({
  wrap:  { gap: 5 },
  label: { fontSize: 12, fontWeight: '600', color: '#6C7886', letterSpacing: 0.2 },
  hint:  { fontSize: 11, color: '#6C7886', lineHeight: 15 },
});

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function EditProfileScreen() {
  const insets = useSafeAreaInsets();

  const [profile,  setProfile]  = useState<ApiUserProfile | null>(null);
  const [loading,  setLoading]  = useState(true);
  const [fullName, setFullName] = useState('');
  const [phone,    setPhone]    = useState('');
  const [saving,   setSaving]   = useState(false);

  // Fetch profile and seed form fields
  useEffect(() => {
    getAuthUserId()
      .then((uid) => getUserProfile(uid))
      .then((p) => {
        setProfile(p);
        setFullName(p.fullName);
        setPhone(p.phone);
      })
      .catch(() =>
        Alert.alert('Error', 'Could not load profile. Please go back and try again.'),
      )
      .finally(() => setLoading(false));
  }, []);

  async function handleSave() {
    if (!fullName.trim()) {
      Alert.alert('Validation', 'Full name cannot be empty.');
      return;
    }
    setSaving(true);
    try {
      const uid = await getAuthUserId();
      await updateUserProfile(uid, { fullName: fullName.trim(), phone: phone.trim() });
      Alert.alert('Saved', 'Your profile has been updated.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (err) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Could not save changes.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScreenHeader title="Edit Profile" onBack={() => router.back()} />
        <View style={styles.centeredFill}>
          <ActivityIndicator size="large" color="#2D7CE9" />
        </View>
        <BottomNavBar activeTab="profile" unreadCount={0} />
      </KeyboardAvoidingView>
    );
  }

  const initials = profile?.avatarInitials ?? '?';
  const email    = profile?.email          ?? '';
  const studentId = profile?.studentId     ?? '';

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScreenHeader title="Edit Profile" onBack={() => router.back()} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* ── Avatar ───────────────────────────────────────────── */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <Pressable accessibilityRole="button" accessibilityLabel="Change photo">
            <Text style={styles.changePhoto}>Change Photo</Text>
          </Pressable>
          <Text style={styles.photoHint}>JPG, PNG or WEBP up to 2 MB</Text>
        </View>

        {/* ── Form ────────────────────────────────────────────── */}
        <View style={styles.formCard}>
          <Field label="Full Name" hint="Visible to classmates">
            <TextInput
              style={styles.input}
              value={fullName}
              onChangeText={setFullName}
              placeholder="Your full name"
              placeholderTextColor="#6C7886"
              autoCapitalize="words"
              returnKeyType="next"
              accessibilityLabel="Full name"
            />
          </Field>

          <View style={styles.fieldDivider} />

          <Field label="University Email">
            <View style={styles.inputRow}>
              <TextInput
                style={[styles.input, styles.inputFlex]}
                value={email}
                editable={false}
                selectTextOnFocus={false}
                placeholderTextColor="#6C7886"
                accessibilityLabel="University email (read only)"
              />
              <StatusBadge label="Verified" variant="success" size="sm" />
            </View>
          </Field>

          <View style={styles.fieldDivider} />

          <Field label="Phone Number" hint="Used for SMS rate alerts and urgent notices">
            <TextInput
              style={styles.input}
              value={phone}
              onChangeText={setPhone}
              placeholder="+xx xx xxx xxxx"
              placeholderTextColor="#6C7886"
              keyboardType="phone-pad"
              returnKeyType="next"
              accessibilityLabel="Phone number"
            />
          </Field>

          <View style={styles.fieldDivider} />

          <Field label="Student ID" hint="Contact the Office of the Registrar to update your Student ID">
            <View style={styles.inputRow}>
              <View style={[styles.input, styles.inputFlex, styles.inputLocked]}>
                <Text style={styles.inputLockedText}>{studentId}</Text>
              </View>
              <IonIcon name="lock-closed" size={16} color="#6C7886" />
            </View>
          </Field>
        </View>

        {/* ── Save ─────────────────────────────────────────────── */}
        <Pressable
          onPress={handleSave}
          disabled={saving}
          style={({ pressed }) => [styles.btnSave, (pressed || saving) && styles.btnSavePressed]}
          accessibilityRole="button"
          accessibilityLabel="Save changes"
        >
          <Text style={styles.btnSaveText}>{saving ? 'Saving…' : 'Save Changes'}</Text>
        </Pressable>

        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [styles.cancelLink, pressed && styles.pressed]}
          accessibilityRole="button"
          accessibilityLabel="Cancel"
        >
          <Text style={styles.cancelText}>Cancel</Text>
        </Pressable>
      </ScrollView>

      <BottomNavBar activeTab="profile" unreadCount={profile?.stats.alerts ?? 0} />
    </KeyboardAvoidingView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  screen:       { flex: 1, backgroundColor: '#F5F7F7' },
  centeredFill: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scroll:       { flex: 1 },
  scrollContent: { padding: 16, gap: 16 },

  avatarSection: { alignItems: 'center', paddingVertical: 8, gap: 6 },
  avatarCircle:  { width: 88, height: 88, borderRadius: 44, backgroundColor: '#2D7CE9', alignItems: 'center', justifyContent: 'center' },
  avatarText:    { color: '#FAFBFB', fontSize: 30, fontWeight: '700' },
  changePhoto:   { fontSize: 14, fontWeight: '600', color: '#2D7CE9' },
  photoHint:     { fontSize: 12, color: '#6C7886' },

  formCard: {
    backgroundColor: '#FAFBFB',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#DDE2E6',
    padding: 16,
    gap: 14,
    shadowColor: '#1C283B',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  fieldDivider: { height: 1, backgroundColor: '#F0F2F4' },
  input: {
    borderWidth: 1, borderColor: '#DDE2E6', borderRadius: 8,
    paddingHorizontal: 12, paddingVertical: 10,
    fontSize: 14, color: '#1C283B', backgroundColor: '#FAFBFB',
  },
  inputFlex:       { flex: 1 },
  inputRow:        { flexDirection: 'row', alignItems: 'center', gap: 10 },
  inputLocked:     { backgroundColor: '#F0F2F4', justifyContent: 'center' },
  inputLockedText: { fontSize: 14, color: '#6C7886' },

  btnSave:        { backgroundColor: '#2D7CE9', borderRadius: 12, paddingVertical: 15, alignItems: 'center' },
  btnSavePressed: { opacity: 0.8 },
  btnSaveText:    { color: '#FAFBFB', fontWeight: '700', fontSize: 15 },
  cancelLink:     { alignItems: 'center', paddingVertical: 8 },
  cancelText:     { fontSize: 14, color: '#6C7886', fontWeight: '500', textDecorationLine: 'underline' },
  pressed:        { opacity: 0.75 },
});
