/**
 * MenuRow — a tappable list-row used in Profile and Settings menus.
 *
 * Layout:  [icon circle] [label + description]  [right slot] [chevron]
 *
 * The right slot accepts any ReactNode — typically a StatusBadge or plain Text.
 * Pass `showChevron={false}` to hide the trailing arrow (e.g. toggle rows
 * that already have a Switch).
 */

import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { IonIcon, IonIconName } from '@/components/notifications/IonIcon';

interface MenuRowProps {
  icon: IonIconName;
  /** Icon circle background tint — defaults to a neutral grey */
  iconColor?: string;
  label: string;
  description?: string;
  rightSlot?: React.ReactNode;
  showChevron?: boolean;
  onPress?: () => void;
  /** When true, renders the label in error red (used for Sign Out rows) */
  destructive?: boolean;
}

export function MenuRow({
  icon,
  iconColor = '#6C7886',
  label,
  description,
  rightSlot,
  showChevron = true,
  onPress,
  destructive = false,
}: MenuRowProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      {/* Left icon circle */}
      <View style={[styles.iconCircle, { backgroundColor: `${iconColor}18` }]}>
        <IonIcon name={icon} size={18} color={iconColor} />
      </View>

      {/* Text block */}
      <View style={styles.textBlock}>
        <Text style={[styles.label, destructive && styles.labelDestructive]}>
          {label}
        </Text>
        {description ? (
          <Text style={styles.description} numberOfLines={2}>
            {description}
          </Text>
        ) : null}
      </View>

      {/* Right slot (badge, value text, etc.) */}
      {rightSlot ? <View style={styles.rightSlot}>{rightSlot}</View> : null}

      {/* Chevron */}
      {showChevron && (
        <IonIcon name="chevron-forward" size={16} color="#6C7886" />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    paddingHorizontal: 16,
    backgroundColor: '#FAFBFB',
    gap: 12,
  },
  rowPressed: {
    backgroundColor: '#F0F2F4',
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  textBlock: {
    flex: 1,
    gap: 2,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1C283B',
    lineHeight: 20,
  },
  labelDestructive: {
    color: '#F04F55',
  },
  description: {
    fontSize: 12,
    color: '#6C7886',
    lineHeight: 17,
  },
  rightSlot: {
    flexShrink: 0,
  },
});
