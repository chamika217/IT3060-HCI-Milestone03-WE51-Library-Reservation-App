/**
 * ToggleRow — a labelled Switch row used in the Notification Preferences screen.
 *
 * Props:
 *   label        — primary label
 *   description  — optional secondary text
 *   value        — boolean controlled state
 *   onValueChange — state setter callback
 *   disabled     — greys out the row when the master push toggle is off
 *   tag          — optional small badge pinned to the right of the label
 *                  (e.g. "Active Term", "15m Warning", "Zero Fees")
 */

import React from 'react';
import {
  View,
  Text,
  Switch,
  StyleSheet,
} from 'react-native';
import { StatusBadge, BadgeVariant } from './StatusBadge';

interface ToggleRowProps {
  label: string;
  description?: string;
  value: boolean;
  onValueChange: (v: boolean) => void;
  disabled?: boolean;
  tag?: { label: string; variant?: BadgeVariant };
}

export function ToggleRow({
  label,
  description,
  value,
  onValueChange,
  disabled = false,
  tag,
}: ToggleRowProps) {
  return (
    <View style={[styles.row, disabled && styles.rowDisabled]}>
      {/* Text block */}
      <View style={styles.textBlock}>
        <View style={styles.labelRow}>
          <Text style={[styles.label, disabled && styles.textDisabled]}>
            {label}
          </Text>
          {tag && (
            <StatusBadge
              label={tag.label}
              variant={tag.variant ?? 'info'}
              size="sm"
            />
          )}
        </View>
        {description ? (
          <Text style={[styles.description, disabled && styles.textDisabled]}>
            {description}
          </Text>
        ) : null}
      </View>

      {/* Switch */}
      <Switch
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
        trackColor={{ false: '#DDE2E6', true: '#B3D0F7' }}
        thumbColor={value && !disabled ? '#2D7CE9' : '#FAFBFB'}
        ios_backgroundColor="#DDE2E6"
        accessibilityLabel={label}
        accessibilityRole="switch"
        accessibilityState={{ checked: value, disabled }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: '#FAFBFB',
    gap: 12,
  },
  rowDisabled: {
    opacity: 0.45,
  },
  textBlock: {
    flex: 1,
    gap: 3,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1C283B',
    lineHeight: 20,
  },
  description: {
    fontSize: 12,
    color: '#6C7886',
    lineHeight: 17,
  },
  textDisabled: {
    color: '#6C7886',
  },
});
