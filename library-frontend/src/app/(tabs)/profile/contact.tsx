/**
 * Screen 10 — Contact Library Staff
 * Route: /(tabs)/profile/contact
 *
 * Prefills name & studentId from the real API; sends via POST /api/contact.
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
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';

import {
  ScreenHeader,
  StatusBadge,
  BottomNavBar,
  IonIcon,
} from '@/components/shared';
import { getUserProfile, sendContactMessage } from '@/services/api';
import { CONTACT_SUBJECTS, ContactSubject } from '@/features/profile/types';
import { TEST_USER_ID } from '@/constants/testAuth';

const MAX_MESSAGE_LENGTH = 500;

// ─── Field wrapper ────────────────────────────────────────────────────────────

interface FieldProps {
  label: string;
  children: React.ReactNode;
}
function Field({ label, children }: FieldProps) {
  return (
    <View style={fieldStyles.wrap}>
      <Text style={fieldStyles.label}>{label}</Text>
      {children}
    </View>
  );
}
const fieldStyles = StyleSheet.create({
  wrap:  { gap: 6 },
  label: { fontSize: 12, fontWeight: '600', color: '#6C7886', letterSpacing: 0.2 },
});

// ─── Simple dropdown ──────────────────────────────────────────────────────────

interface DropdownProps {
  value: ContactSubject;
  options: ContactSubject[];
  onChange: (v: ContactSubject) => void;
}
function Dropdown({ value, options, onChange }: DropdownProps) {
  const [open, setOpen] = useState(false);
  return (
    <View>
      <Pressable
        onPress={() => setOpen((v) => !v)}
        style={({ pressed }) => [
          dropStyles.trigger,
          open && dropStyles.triggerOpen,
          pressed && dropStyles.triggerPressed,
        ]}
        accessibilityRole="button"
        accessibilityLabel={`Subject: ${value}`}
        accessibilityState={{ expanded: open }}
      >
        <Text style={dropStyles.triggerText}>{value}</Text>
        <IonIcon name={open ? 'chevron-down' : 'chevron-forward'} size={16} color="#6C7886" />
      </Pressable>
      {open && (
        <View style={dropStyles.menu}>
          {options.map((opt) => (
            <Pressable
              key={opt}
              onPress={() => { onChange(opt); setOpen(false); }}
              style={({ pressed }) => [
                dropStyles.option,
                opt === value && dropStyles.optionActive,
                pressed && dropStyles.optionPressed,
              ]}
              accessibilityRole="menuitem"
              accessibilityLabel={opt}
            >
              <Text style={[dropStyles.optionText, opt === value && dropStyles.optionTextActive]}>
                {opt}
              </Text>
              {opt === value && <IonIcon name="checkmark-circle" size={15} color="#2D7CE9" />}
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}

const dropStyles = StyleSheet.create({
  trigger: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderWidth: 1, borderColor: '#DDE2E6', borderRadius: 8,
    paddingHorizontal: 12, paddingVertical: 10, backgroundColor: '#FAFBFB',
  },
  triggerOpen:    { borderColor: '#2D7CE9', borderBottomLeftRadius: 0, borderBottomRightRadius: 0 },
  triggerPressed: { backgroundColor: '#F0F2F4' },
  triggerText:    { fontSize: 14, color: '#1C283B' },
  menu: {
    borderWidth: 1, borderTopWidth: 0, borderColor: '#2D7CE9',
    borderBottomLeftRadius: 8, borderBottomRightRadius: 8,
    backgroundColor: '#FAFBFB', overflow: 'hidden',
  },
  option:          { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, paddingVertical: 11 },
  optionActive:    { backgroundColor: '#EAF2FD' },
  optionPressed:   { backgroundColor: '#F0F2F4' },
  optionText:      { fontSize: 14, color: '#1C283B' },
  optionTextActive:{ color: '#2D7CE9', fontWeight: '600' },
});

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function ContactScreen() {
  const insets = useSafeAreaInsets();

  // Prefilled from API
  const [fullName,   setFullNameDisplay] = useState('');
  const [studentId,  setStudentIdDisplay] = useState('');
  const [alertCount, setAlertCount]       = useState(0);

  // Form state
  const [subject,    setSubject]    = useState<ContactSubject>('General Inquiry');
  const [message,    setMessage]    = useState('');
  const [attachment, setAttachment] = useState<string | null>(null);
  const [sending,    setSending]    = useState(false);

  const remaining = MAX_MESSAGE_LENGTH - message.length;

  // Load profile to prefill locked fields
  useEffect(() => {
    getUserProfile(TEST_USER_ID)
      .then((p) => {
        setFullNameDisplay(p.fullName);
        setStudentIdDisplay(p.studentId);
        setAlertCount(p.stats.alerts);
      })
      .catch(() => {}); // non-critical — fields just stay empty
  }, []);

  async function handleSend() {
    if (message.trim().length < 10) {
      Alert.alert('Message too short', 'Please write at least 10 characters.');
      return;
    }
    setSending(true);
    try {
      await sendContactMessage({
        userId:        TEST_USER_ID,
        subject,
        message:       message.trim(),
        attachmentUrl: attachment ?? undefined,
      });
      Alert.alert(
        'Message Sent',
        'A reference librarian will respond within 24 business hours.',
        [{
          text: 'OK',
          onPress: () => {
            // Clear form then go back
            setMessage('');
            setAttachment(null);
            setSubject('General Inquiry');
            router.back();
          },
        }],
      );
    } catch (err) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Could not send your message. Please try again.');
    } finally {
      setSending(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScreenHeader title="Contact Library Staff" onBack={() => router.back()} />

      {/* Sub-header */}
      <View style={styles.subHeader}>
        <Text style={styles.subHeadDesk}>Circulation & Reference Desk</Text>
        <Text style={styles.subHeadTime}>
          Team typically responds in 24 business hours during academic terms
        </Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* ── Form card ────────────────────────────────────────── */}
        <View style={styles.formCard}>
          {/* Full name — prefilled, read-only */}
          <Field label="Full Name">
            <View style={styles.lockedRow}>
              <View style={[styles.input, styles.inputLocked, styles.inputFlex]}>
                <Text style={styles.lockedText}>{fullName || '…'}</Text>
              </View>
              <IonIcon name="lock-closed" size={15} color="#6C7886" />
            </View>
          </Field>

          <View style={styles.divider} />

          {/* Student ID — prefilled with verified badge */}
          <Field label="Student ID">
            <View style={styles.lockedRow}>
              <View style={[styles.input, styles.inputLocked, styles.inputFlex]}>
                <Text style={styles.lockedText}>{studentId || '…'}</Text>
              </View>
              <StatusBadge label="Verified" variant="success" size="sm" />
            </View>
          </Field>

          <View style={styles.divider} />

          {/* Subject */}
          <Field label="Subject">
            <Dropdown value={subject} options={CONTACT_SUBJECTS} onChange={setSubject} />
          </Field>

          <View style={styles.divider} />

          {/* Message */}
          <Field label="Message">
            <TextInput
              style={styles.textArea}
              value={message}
              onChangeText={(t) => { if (t.length <= MAX_MESSAGE_LENGTH) setMessage(t); }}
              placeholder="Describe your enquiry in detail…"
              placeholderTextColor="#6C7886"
              multiline
              numberOfLines={5}
              textAlignVertical="top"
              accessibilityLabel="Message"
            />
            <Text style={[styles.charCount, remaining < 50 && styles.charCountWarn]}>
              {message.length} / {MAX_MESSAGE_LENGTH} characters
            </Text>
          </Field>
        </View>

        {/* ── Attachment ───────────────────────────────────────── */}
        <Pressable
          onPress={() => setAttachment(attachment ? null : 'placeholder')}
          style={({ pressed }) => [styles.attachBox, pressed && styles.pressed]}
          accessibilityRole="button"
          accessibilityLabel={attachment ? 'Remove attachment' : 'Attach a file'}
        >
          <IonIcon name="attach" size={20} color="#2D7CE9" />
          <View style={styles.attachText}>
            <Text style={styles.attachHeading}>
              {attachment ? '1 file attached' : 'Attach a file'}
            </Text>
            <Text style={styles.attachSub}>Screenshot or library pass (PNG, JPG or PDF)</Text>
          </View>
          {attachment && <IonIcon name="close" size={16} color="#F04F55" />}
        </Pressable>

        {/* ── Urgent note ──────────────────────────────────────── */}
        <View style={styles.urgentNote}>
          <IonIcon name="warning-outline" size={15} color="#F7A35C" />
          <Text style={styles.urgentText}>
            Urgent inquiry? Visit Desk 3 on Floor 1 or chat with live staff.
          </Text>
        </View>

        {/* ── Send button ──────────────────────────────────────── */}
        <Pressable
          onPress={handleSend}
          disabled={sending}
          style={({ pressed }) => [styles.btnSend, (pressed || sending) && styles.btnSendPressed]}
          accessibilityRole="button"
          accessibilityLabel="Send message"
        >
          <IonIcon name="send" size={16} color="#FAFBFB" />
          <Text style={styles.btnSendText}>{sending ? 'Sending…' : 'Send Message'}</Text>
        </Pressable>
      </ScrollView>

      <BottomNavBar activeTab="profile" unreadCount={alertCount} />
    </KeyboardAvoidingView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F5F7F7' },

  subHeader: {
    backgroundColor: '#FAFBFB',
    paddingHorizontal: 16, paddingVertical: 10,
    borderBottomWidth: 1, borderBottomColor: '#DDE2E6', gap: 2,
  },
  subHeadDesk: { fontSize: 13, fontWeight: '700', color: '#1C283B' },
  subHeadTime: { fontSize: 12, color: '#6C7886' },

  scroll:        { flex: 1 },
  scrollContent: { padding: 16, gap: 14 },

  formCard: {
    backgroundColor: '#FAFBFB', borderRadius: 14,
    borderWidth: 1, borderColor: '#DDE2E6',
    padding: 16, gap: 14,
    shadowColor: '#1C283B',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 3, elevation: 1,
  },
  divider:     { height: 1, backgroundColor: '#F0F2F4' },
  input: {
    borderWidth: 1, borderColor: '#DDE2E6', borderRadius: 8,
    paddingHorizontal: 12, paddingVertical: 10,
    fontSize: 14, color: '#1C283B', backgroundColor: '#FAFBFB',
  },
  inputFlex:    { flex: 1 },
  inputLocked:  { backgroundColor: '#F0F2F4', justifyContent: 'center' },
  lockedRow:    { flexDirection: 'row', alignItems: 'center', gap: 10 },
  lockedText:   { fontSize: 14, color: '#6C7886' },
  textArea: {
    borderWidth: 1, borderColor: '#DDE2E6', borderRadius: 8,
    paddingHorizontal: 12, paddingVertical: 10,
    fontSize: 14, color: '#1C283B', backgroundColor: '#FAFBFB', minHeight: 110,
  },
  charCount:     { fontSize: 11, color: '#6C7886', textAlign: 'right' },
  charCountWarn: { color: '#F04F55' },

  attachBox: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    borderWidth: 1.5, borderColor: '#B3D0F7',
    borderStyle: 'dashed', borderRadius: 12,
    padding: 14, backgroundColor: '#EAF2FD',
  },
  attachText:    { flex: 1, gap: 2 },
  attachHeading: { fontSize: 14, fontWeight: '600', color: '#2D7CE9' },
  attachSub:     { fontSize: 12, color: '#6C7886' },

  urgentNote: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 8,
    backgroundColor: '#FFF5EB', borderRadius: 10,
    borderWidth: 1, borderColor: '#FDD8B0', padding: 12,
  },
  urgentText: { flex: 1, fontSize: 13, color: '#1C283B', lineHeight: 18 },

  btnSend: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, backgroundColor: '#2D7CE9', borderRadius: 12, paddingVertical: 15,
  },
  btnSendPressed: { opacity: 0.8 },
  btnSendText:    { color: '#FAFBFB', fontWeight: '700', fontSize: 15 },
  pressed:        { opacity: 0.75 },
});
