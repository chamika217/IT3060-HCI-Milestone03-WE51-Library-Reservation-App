/**
 * ScreenHeader — consistent back-arrow + title header used across the
 * notification detail, permission, and preferences screens.
 *
 * Props:
 *   title        — heading text
 *   onBack       — called when the back arrow is pressed
 *   rightSlot    — optional element rendered at the trailing edge
 *                  (e.g. filter icon, sync status)
 */

import React from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { IonIcon } from './IonIcon';

interface ScreenHeaderProps {
  title: string;
  onBack?: () => void;
  rightSlot?: React.ReactNode;
  /** When true, the back arrow is replaced by a close (✕) icon */
  closeIcon?: boolean;
}

export function ScreenHeader({
  title,
  onBack,
  rightSlot,
  closeIcon = false,
}: ScreenHeaderProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
      {/* Left: back / close */}
      <Pressable
        onPress={onBack}
        style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}
        accessibilityRole="button"
        accessibilityLabel={closeIcon ? 'Close' : 'Go back'}
        hitSlop={8}
      >
        <IonIcon
          name={closeIcon ? 'close' : 'chevron-back'}
          size={24}
          color="#1C283B"
        />
      </Pressable>

      {/* Centre: title */}
      <Text style={styles.title} numberOfLines={1}>
        {title}
      </Text>

      {/* Right: slot or blank spacer */}
      <View style={styles.rightSlot}>
        {rightSlot ?? <View style={styles.spacer} />}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: '#FAFBFB',
    borderBottomWidth: 1,
    borderBottomColor: '#DDE2E6',
    gap: 8,
    // Shadow
    shadowColor: '#1C283B',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    zIndex: 10,
  },
  iconButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
    flexShrink: 0,
  },
  pressed: {
    backgroundColor: '#F0F2F4',
  },
  title: {
    flex: 1,
    textAlign: 'center',
    fontSize: 17,
    fontWeight: '700',
    color: '#1C283B',
    lineHeight: 22,
  },
  rightSlot: {
    width: 36,
    alignItems: 'flex-end',
    flexShrink: 0,
  },
  spacer: {
    width: 36,
  },
});
