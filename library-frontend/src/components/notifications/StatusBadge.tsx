/**
 * StatusBadge — small pill-shaped label used throughout the notification screens.
 *
 * Usage:
 *   <StatusBadge label="Expires 2:15 PM" variant="warning" />
 *   <StatusBadge label="Released"        variant="error"   />
 *   <StatusBadge label="45m ago"         variant="info"    />
 *   <StatusBadge label="Active"          variant="success" />
 *   <StatusBadge label="PHYSICAL COPY"   variant="neutral" size="sm" />
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'neutral';
export type BadgeSize = 'sm' | 'md';

interface StatusBadgeProps {
  label: string;
  variant?: BadgeVariant;
  size?: BadgeSize;
}

const VARIANT_COLORS: Record<BadgeVariant, { bg: string; text: string; border: string }> = {
  success: { bg: '#EDFAF4', text: '#25B87A', border: '#B8EDD4' },
  warning: { bg: '#FFF5EB', text: '#F7A35C', border: '#FDD8B0' },
  error:   { bg: '#FDEAEA', text: '#F04F55', border: '#F8BBBE' },
  info:    { bg: '#EAF2FD', text: '#2D7CE9', border: '#B3D0F7' },
  neutral: { bg: '#F0F2F4', text: '#6C7886', border: '#DDE2E6' },
};

export function StatusBadge({ label, variant = 'neutral', size = 'md' }: StatusBadgeProps) {
  const colors = VARIANT_COLORS[variant];
  const isSmall = size === 'sm';

  return (
    <View
      style={[
        styles.badge,
        isSmall ? styles.badgeSm : styles.badgeMd,
        {
          backgroundColor: colors.bg,
          borderColor: colors.border,
        },
      ]}
    >
      <Text
        style={[
          styles.label,
          isSmall ? styles.labelSm : styles.labelMd,
          { color: colors.text },
        ]}
        numberOfLines={1}
      >
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: 99,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  badgeMd: {
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  badgeSm: {
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  label: {
    fontWeight: '600',
    letterSpacing: 0.1,
  },
  labelMd: {
    fontSize: 12,
    lineHeight: 16,
  },
  labelSm: {
    fontSize: 10,
    lineHeight: 14,
  },
});
