/**
 * SectionCard — a labelled rounded card wrapping a group of rows.
 *
 * Usage:
 *   <SectionCard label="ACCOUNT & SECURITY" rightLabel="4 active">
 *     <MenuRow ... />
 *     <Divider />
 *     <MenuRow ... />
 *   </SectionCard>
 *
 * The children are rendered inside a card with design-system shadow/border.
 * `rightLabel` accepts a string or any ReactNode (e.g. a StatusBadge).
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface SectionCardProps {
  label?: string;
  rightLabel?: React.ReactNode;
  children: React.ReactNode;
}

export function SectionCard({ label, rightLabel, children }: SectionCardProps) {
  return (
    <View style={styles.section}>
      {(label || rightLabel) && (
        <View style={styles.sectionHeader}>
          {label ? <Text style={styles.sectionLabel}>{label}</Text> : <View />}
          {rightLabel ? <View>{rightLabel}</View> : null}
        </View>
      )}
      <View style={styles.card}>{children}</View>
    </View>
  );
}

/** Thin hairline divider between rows inside a SectionCard */
export function Divider() {
  return <View style={dividerStyles.line} />;
}

const dividerStyles = StyleSheet.create({
  line: {
    height: 1,
    backgroundColor: '#F0F2F4',
    marginHorizontal: 16,
  },
});

const styles = StyleSheet.create({
  section: {
    gap: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6C7886',
    letterSpacing: 0.8,
  },
  card: {
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
});
