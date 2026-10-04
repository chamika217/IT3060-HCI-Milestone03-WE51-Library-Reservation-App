import React from 'react';
import { View, Text, TouchableOpacity, TextInput, ActivityIndicator, StatusBar, StyleSheet } from 'react-native';
import { colors, radius, spacing, font } from './theme';

export const Header = ({ title, onBack, right }) => (
  <View style={s.header}>
    {onBack ? <TouchableOpacity onPress={onBack}><Text style={s.back}>‹</Text></TouchableOpacity> : <View style={{ width: 24 }} />}
    <Text style={s.title}>{title}</Text>
    <View style={{ minWidth: 24 }}>{right}</View>
  </View>
);

export const Button = ({ title, onPress, variant = 'primary', style, disabled }) => {
  const bg = { primary: colors.primary, success: colors.success, danger: colors.error, outline: 'transparent' }[variant];
  const txt = variant === 'outline' ? colors.primary : '#fff';
  return (
    <TouchableOpacity disabled={disabled} onPress={onPress} activeOpacity={0.8}
      style={[s.btn, { backgroundColor: bg, opacity: disabled ? 0.5 : 1 }, variant === 'outline' && { borderWidth: 1, borderColor: colors.primary }, style]}>
      <Text style={[s.btnText, { color: txt }]}>{title}</Text>
    </TouchableOpacity>
  );
};

export const Card = ({ children, style, onPress }) => {
  const C = onPress ? TouchableOpacity : View;
  return <C onPress={onPress} style={[s.card, style]}>{children}</C>;
};

export const Input = ({ label, style, ...props }) => (
  <View style={{ marginBottom: spacing.md }}>
    {label ? <Text style={s.label}>{label}</Text> : null}
    <TextInput placeholderTextColor={colors.textSecondary} style={[s.input, style]} {...props} />
  </View>
);

const BADGE = {
  Pending: colors.warning, Confirmed: colors.success, Cancelled: colors.error, Completed: colors.info,
  Available: colors.success, Occupied: colors.error, Reserved: colors.warning, Maintenance: colors.textSecondary,
  Active: colors.success, Inactive: colors.error,
};
export const StatusBadge = ({ status }) => (
  <View style={[s.badge, { backgroundColor: (BADGE[status] || colors.textSecondary) + '22' }]}>
    <Text style={{ color: BADGE[status] || colors.textSecondary, fontSize: font.small, fontWeight: '600' }}>{status}</Text>
  </View>
);

export const Chip = ({ label, active, onPress }) => (
  <TouchableOpacity onPress={onPress} style={[s.chip, active && { backgroundColor: colors.primary, borderColor: colors.primary }]}>
    <Text style={{ color: active ? '#fff' : colors.text, fontSize: font.small }}>{label}</Text>
  </TouchableOpacity>
);

export const Loading = () => <ActivityIndicator style={{ marginTop: 40 }} size="large" color={colors.primary} />;
export const ErrorBox = ({ message, onRetry }) => (
  <View style={{ alignItems: 'center', marginTop: 40 }}>
    <Text style={{ color: colors.error, marginBottom: spacing.sm }}>{message}</Text>
    {onRetry ? <Button title="Retry" variant="outline" onPress={onRetry} /> : null}
  </View>
);
export const Empty = ({ text = 'Nothing here yet' }) => (
  <Text style={{ textAlign: 'center', color: colors.textSecondary, marginTop: 40 }}>{text}</Text>
);

const s = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.md, paddingBottom: spacing.md, paddingTop: (StatusBar.currentHeight || 44) + 4, backgroundColor: colors.card, borderBottomWidth: 1, borderBottomColor: colors.border },
  back: { fontSize: 32, color: colors.primary, lineHeight: 32 },
  title: { fontSize: font.h2, fontWeight: '700', color: colors.text },
  btn: { paddingVertical: 12, paddingHorizontal: spacing.md, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  btnText: { fontWeight: '700', fontSize: font.body },
  card: { backgroundColor: colors.card, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: spacing.md, marginBottom: spacing.sm },
  label: { color: colors.textSecondary, fontSize: font.small, marginBottom: 4 },
  input: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, paddingHorizontal: spacing.md, paddingVertical: 10, color: colors.text, fontSize: font.body },
  badge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20, alignSelf: 'flex-start' },
  chip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card, marginRight: 8, marginBottom: 8 },
});
