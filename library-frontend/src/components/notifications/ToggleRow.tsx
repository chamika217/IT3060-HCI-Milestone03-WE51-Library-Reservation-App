import React from 'react';
import { View, Text, Switch, StyleSheet } from 'react-native';
import { StatusBadge, BadgeVariant } from './StatusBadge';
import { useScreenColors } from '@/hooks/useScreenColors';

interface ToggleRowProps {
  label: string;
  description?: string;
  value: boolean;
  onValueChange: (v: boolean) => void;
  disabled?: boolean;
  tag?: { label: string; variant?: BadgeVariant };
}

export function ToggleRow({ label, description, value, onValueChange, disabled = false, tag }: ToggleRowProps) {
  const C = useScreenColors();
  return (
    <View style={[styles.row, { backgroundColor: C.card }, disabled && styles.rowDisabled]}>
      <View style={styles.textBlock}>
        <View style={styles.labelRow}>
          <Text style={[styles.label, { color: C.text }, disabled && { color: C.textDisabled }]}>
            {label}
          </Text>
          {tag && <StatusBadge label={tag.label} variant={tag.variant ?? 'info'} size="sm" />}
        </View>
        {description ? (
          <Text style={[styles.description, { color: C.textSecondary }, disabled && { color: C.textDisabled }]}>
            {description}
          </Text>
        ) : null}
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
        trackColor={{ false: C.border, true: '#B3D0F7' }}
        thumbColor={value && !disabled ? C.primary : C.card}
        ios_backgroundColor={C.border}
        accessibilityLabel={label}
        accessibilityRole="switch"
        accessibilityState={{ checked: value, disabled }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row:         { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14, paddingHorizontal: 16, gap: 12 },
  rowDisabled: { opacity: 0.45 },
  textBlock:   { flex: 1, gap: 3 },
  labelRow:    { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  label:       { fontSize: 14, fontWeight: '600', lineHeight: 20 },
  description: { fontSize: 12, lineHeight: 17 },
});
