import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { IonIcon, IonIconName } from '@/components/notifications/IonIcon';
import { useScreenColors } from '@/hooks/useScreenColors';

interface MenuRowProps {
  icon: IonIconName;
  iconColor?: string;
  label: string;
  description?: string;
  rightSlot?: React.ReactNode;
  showChevron?: boolean;
  onPress?: () => void;
  destructive?: boolean;
}

export function MenuRow({ icon, iconColor = '#6C7886', label, description, rightSlot, showChevron = true, onPress, destructive = false }: MenuRowProps) {
  const C = useScreenColors();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.row, { backgroundColor: pressed ? C.divider : C.card }]}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <View style={[styles.iconCircle, { backgroundColor: `${iconColor}22` }]}>
        <IonIcon name={icon} size={18} color={iconColor} />
      </View>
      <View style={styles.textBlock}>
        <Text style={[styles.label, { color: destructive ? '#F04F55' : C.text }]}>{label}</Text>
        {description ? <Text style={[styles.description, { color: C.textSecondary }]} numberOfLines={2}>{description}</Text> : null}
      </View>
      {rightSlot ? <View style={styles.rightSlot}>{rightSlot}</View> : null}
      {showChevron && <IonIcon name="chevron-forward" size={16} color={C.textSecondary} />}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row:         { flexDirection: 'row', alignItems: 'center', paddingVertical: 13, paddingHorizontal: 16, gap: 12 },
  iconCircle:  { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  textBlock:   { flex: 1, gap: 2 },
  label:       { fontSize: 14, fontWeight: '600', lineHeight: 20 },
  description: { fontSize: 12, lineHeight: 17 },
  rightSlot:   { flexShrink: 0 },
});
