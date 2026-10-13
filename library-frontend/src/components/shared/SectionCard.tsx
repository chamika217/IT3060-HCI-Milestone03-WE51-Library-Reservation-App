import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useScreenColors } from '@/hooks/useScreenColors';

interface SectionCardProps {
  label?: string;
  rightLabel?: React.ReactNode;
  children: React.ReactNode;
}

export function SectionCard({ label, rightLabel, children }: SectionCardProps) {
  const C = useScreenColors();
  return (
    <View style={styles.section}>
      {(label || rightLabel) && (
        <View style={styles.sectionHeader}>
          {label ? <Text style={[styles.sectionLabel, { color: C.textSecondary }]}>{label}</Text> : <View />}
          {rightLabel ? <View>{rightLabel}</View> : null}
        </View>
      )}
      <View style={[styles.card, { backgroundColor: C.card, borderColor: C.border }]}>{children}</View>
    </View>
  );
}

export function Divider() {
  const C = useScreenColors();
  return <View style={[dividerStyles.line, { backgroundColor: C.divider }]} />;
}

const dividerStyles = StyleSheet.create({
  line: { height: 1, marginHorizontal: 16 },
});

const styles = StyleSheet.create({
  section:       { gap: 8 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 4 },
  sectionLabel:  { fontSize: 11, fontWeight: '700', letterSpacing: 0.8 },
  card:          { borderRadius: 14, borderWidth: 1, overflow: 'hidden' },
});
