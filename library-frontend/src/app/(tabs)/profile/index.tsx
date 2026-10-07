/**
 * Screen 6 — Profile
 * Route: /(tabs)/profile/
 *
 * Data: real API via getUserProfile() — was MOCK_PROFILE.
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';

import {
  IonIcon,
  StatusBadge,
  BottomNavBar,
  MenuRow,
  SectionCard,
  Divider,
} from '@/components/shared';
import { getUserProfile } from '@/services/api';
import { getAuthUserId } from '@/services/api';
import { ApiUserProfile } from '@/features/notifications/types';


// ─── Campus ID barcode visual ─────────────────────────────────────────────────

function CampusIdCard({ studentId }: { studentId: string }) {
  const bars = [3, 1, 2, 1, 3, 1, 1, 2, 1, 3, 2, 1, 1, 3, 1, 2, 1, 1, 3, 2] as const;
  return (
    <View style={idStyles.card}>
      <View style={idStyles.topRow}>
        <View>
          <Text style={idStyles.cardLabel}>CAMPUS MAIN GATE & STACKS</Text>
          <Text style={idStyles.cardSub}>Hold barcode for turnstile access • Ready</Text>
        </View>
        <View style={idStyles.readyDot} />
      </View>
      <View style={idStyles.barcodeWrap}>
        {bars.map((w, i) => (
          <View
            key={i}
            style={[
              idStyles.bar,
              { width: w * 3, backgroundColor: i % 2 === 0 ? '#1C283B' : 'transparent' },
            ]}
          />
        ))}
      </View>
      <Text style={idStyles.barcodeCode}>UNIV-{studentId}-GATE</Text>
    </View>
  );
}

const idStyles = StyleSheet.create({
  card: {
    backgroundColor: '#FAFBFB',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#DDE2E6',
    padding: 16,
    gap: 10,
    shadowColor: '#1C283B',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  cardLabel: { fontSize: 10, fontWeight: '700', color: '#6C7886', letterSpacing: 0.7 },
  cardSub:   { fontSize: 12, color: '#6C7886', marginTop: 2 },
  readyDot:  { width: 9, height: 9, borderRadius: 5, backgroundColor: '#25B87A', marginTop: 2 },
  barcodeWrap: {
    flexDirection: 'row',
    alignItems: 'stretch',
    height: 52,
    alignSelf: 'center',
    paddingVertical: 4,
  },
  bar: { height: '100%', borderRadius: 1 },
  barcodeCode: {
    textAlign: 'center',
    fontSize: 11,
    fontWeight: '600',
    color: '#1C283B',
    letterSpacing: 1.8,
  },
});

// ─── Stats row ────────────────────────────────────────────────────────────────

function StatsRow({ stats }: { stats: ApiUserProfile['stats'] }) {
  const items = [
    { label: 'Holdings', value: stats.holdings },
    { label: 'Bookings', value: stats.bookings },
    { label: 'Alerts',   value: stats.alerts   },
  ];
  return (
    <View style={statStyles.row}>
      {items.map((item, idx) => (
        <React.Fragment key={item.label}>
          <View style={statStyles.box}>
            <Text style={statStyles.value}>{item.value}</Text>
            <Text style={statStyles.label}>{item.label}</Text>
          </View>
          {idx < items.length - 1 && <View style={statStyles.sep} />}
        </React.Fragment>
      ))}
    </View>
  );
}

const statStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    backgroundColor: '#FAFBFB',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#DDE2E6',
    overflow: 'hidden',
    shadowColor: '#1C283B',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  box:   { flex: 1, alignItems: 'center', paddingVertical: 14, gap: 3 },
  sep:   { width: 1, backgroundColor: '#DDE2E6', marginVertical: 12 },
  value: { fontSize: 22, fontWeight: '700', color: '#1C283B', lineHeight: 26 },
  label: { fontSize: 11, color: '#6C7886', fontWeight: '500' },
});

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();

  const [profile,  setProfile]  = useState<ApiUserProfile | null>(null);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const uid = await getAuthUserId();
      const data = await getUserProfile(uid);
      setProfile(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load profile.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchProfile(); }, [fetchProfile]);

  function handleSignOut() {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out of your campus account?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', style: 'destructive', onPress: () => {} },
      ],
    );
  }

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <View style={styles.screen}>
        <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
          <Text style={styles.heading}>Profile</Text>
        </View>
        <View style={styles.centeredFill}>
          <ActivityIndicator size="large" color="#2D7CE9" />
        </View>
        <BottomNavBar activeTab="profile" unreadCount={0} />
      </View>
    );
  }

  // ── Error ─────────────────────────────────────────────────────────────────
  if (error || !profile) {
    return (
      <View style={styles.screen}>
        <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
          <Text style={styles.heading}>Profile</Text>
        </View>
        <View style={styles.centeredFill}>
          <IonIcon name="alert-circle-outline" size={40} color="#F04F55" />
          <Text style={styles.errorText}>{error ?? 'Could not load profile.'}</Text>
          <Pressable
            onPress={fetchProfile}
            style={({ pressed }) => [styles.retryBtn, pressed && styles.pressed]}
            accessibilityRole="button"
          >
            <Text style={styles.retryBtnText}>Try Again</Text>
          </Pressable>
        </View>
        <BottomNavBar activeTab="profile" unreadCount={0} />
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      {/* ── Header ─────────────────────────────────────────────────── */}
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <Text style={styles.heading}>Profile</Text>
        <Pressable
          onPress={() => router.push('/(tabs)/profile/edit' as never)}
          style={({ pressed }) => [styles.avatarBtn, pressed && styles.pressed]}
          accessibilityLabel="Edit profile"
          accessibilityRole="button"
        >
          <View style={styles.avatarSmall}>
            <Text style={styles.avatarSmallText}>{profile.avatarInitials}</Text>
          </View>
        </Pressable>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Identity card ─────────────────────────────────────── */}
        <View style={styles.identityCard}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>{profile.avatarInitials}</Text>
          </View>
          <Text style={styles.studentName}>{profile.fullName}</Text>
          <Text style={styles.program}>{profile.program}</Text>
          <View style={styles.badgeRow}>
            <StatusBadge label="Active Student" variant="success" />
            <StatusBadge label={profile.semester} variant="info" />
          </View>
          <View style={styles.identityButtons}>
            <Pressable
              onPress={() => router.push('/(tabs)/profile/edit' as never)}
              style={({ pressed }) => [styles.btnPrimary, pressed && styles.pressed]}
              accessibilityRole="button"
            >
              <IonIcon name="create-outline" size={15} color="#FAFBFB" />
              <Text style={styles.btnPrimaryText}>Edit Profile</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [styles.btnSecondary, pressed && styles.pressed]}
              accessibilityRole="button"
              accessibilityLabel="View ID Pass"
            >
              <IonIcon name="id-card-outline" size={15} color="#2D7CE9" />
              <Text style={styles.btnSecondaryText}>ID Pass</Text>
            </Pressable>
          </View>
        </View>

        {/* ── Campus ID card ────────────────────────────────────── */}
        <CampusIdCard studentId={profile.studentId} />

        {/* ── Stats ────────────────────────────────────────────── */}
        <StatsRow stats={profile.stats} />

        {/* ── Account & Library Services menu ──────────────────── */}
        <SectionCard label="ACCOUNT & LIBRARY SERVICES">
          <MenuRow
            icon="create-outline"
            iconColor="#2D7CE9"
            label="Edit Profile"
            description="Update your name, phone and avatar"
            onPress={() => router.push('/(tabs)/profile/edit' as never)}
          />
          <Divider />
          <MenuRow
            icon="book-outline"
            iconColor="#2D7CE9"
            label="My Reservations"
            description="Active and past book holds"
            rightSlot={
              <StatusBadge label={`${profile.stats.holdings}`} variant="info" size="sm" />
            }
            onPress={() => {}}
          />
          <Divider />
          <MenuRow
            icon="calendar-outline"
            iconColor="#25B87A"
            label="My Seat Bookings"
            description="Study room and pod reservations"
            rightSlot={<StatusBadge label="Active" variant="success" size="sm" />}
            onPress={() => {}}
          />
          <Divider />
          <MenuRow
            icon="notifications-outline"
            iconColor="#F7A35C"
            label="Notifications"
            description="Manage holds, seat and due-date alerts"
            rightSlot={
              profile.stats.alerts > 0
                ? <StatusBadge label={`${profile.stats.alerts}`} variant="warning" size="sm" />
                : undefined
            }
            onPress={() => router.push('/(tabs)/notifications' as never)}
          />
          <Divider />
          <MenuRow
            icon="help-circle-outline"
            iconColor="#6C7886"
            label="Help & Support"
            description="FAQs and reference guides"
            onPress={() => router.push('/(tabs)/profile/help' as never)}
          />
          <Divider />
          <MenuRow
            icon="settings-outline"
            iconColor="#6C7886"
            label="Settings"
            description="Display, privacy and account preferences"
            onPress={() => router.push('/(tabs)/profile/settings' as never)}
          />
        </SectionCard>

        {/* ── Sign out ─────────────────────────────────────────── */}
        <Pressable
          onPress={handleSignOut}
          style={({ pressed }) => [styles.signOutBtn, pressed && styles.pressed]}
          accessibilityRole="button"
          accessibilityLabel="Sign out of campus account"
        >
          <IonIcon name="log-out-outline" size={18} color="#F04F55" />
          <Text style={styles.signOutText}>Sign Out of Campus Account</Text>
        </Pressable>
      </ScrollView>

      <BottomNavBar activeTab="profile" unreadCount={profile.stats.alerts} />
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  screen:       { flex: 1, backgroundColor: '#F5F7F7' },
  centeredFill: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 14, padding: 24 },
  errorText:    { fontSize: 14, color: '#F04F55', textAlign: 'center', lineHeight: 20 },
  retryBtn:     { backgroundColor: '#2D7CE9', borderRadius: 10, paddingVertical: 11, paddingHorizontal: 28 },
  retryBtnText: { color: '#FAFBFB', fontWeight: '700', fontSize: 14 },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: '#FAFBFB',
    borderBottomWidth: 1,
    borderBottomColor: '#DDE2E6',
    shadowColor: '#1C283B',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    zIndex: 10,
  },
  heading:         { fontSize: 22, fontWeight: '700', color: '#1C283B' },
  avatarBtn:       { borderRadius: 20 },
  avatarSmall:     { width: 36, height: 36, borderRadius: 18, backgroundColor: '#2D7CE9', alignItems: 'center', justifyContent: 'center' },
  avatarSmallText: { color: '#FAFBFB', fontSize: 13, fontWeight: '700' },

  scroll:        { flex: 1 },
  scrollContent: { padding: 16, gap: 14 },

  identityCard: {
    backgroundColor: '#FAFBFB',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#DDE2E6',
    padding: 20,
    alignItems: 'center',
    gap: 8,
    shadowColor: '#1C283B',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  avatarCircle: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: '#2D7CE9', alignItems: 'center', justifyContent: 'center', marginBottom: 4,
  },
  avatarText:   { color: '#FAFBFB', fontSize: 28, fontWeight: '700' },
  studentName:  { fontSize: 20, fontWeight: '700', color: '#1C283B' },
  program:      { fontSize: 13, color: '#6C7886' },
  badgeRow:     { flexDirection: 'row', gap: 8, marginTop: 2 },
  identityButtons: { flexDirection: 'row', gap: 10, marginTop: 6, width: '100%' },

  btnPrimary: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, backgroundColor: '#2D7CE9', borderRadius: 10, paddingVertical: 11,
  },
  btnPrimaryText:  { color: '#FAFBFB', fontWeight: '700', fontSize: 14 },
  btnSecondary: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, borderWidth: 1.5, borderColor: '#2D7CE9', borderRadius: 10, paddingVertical: 10,
  },
  btnSecondaryText: { color: '#2D7CE9', fontWeight: '700', fontSize: 14 },

  signOutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, backgroundColor: '#FDEAEA', borderRadius: 12,
    borderWidth: 1, borderColor: '#F8BBBE', paddingVertical: 14, marginTop: 4,
  },
  signOutText: { color: '#F04F55', fontWeight: '700', fontSize: 15 },
  pressed:     { opacity: 0.75 },
});
