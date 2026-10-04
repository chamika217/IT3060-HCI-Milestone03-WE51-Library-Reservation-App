/**
 * IonIcon — lightweight icon shim.
 *
 * Currently renders Unicode glyphs so the app works without @expo/vector-icons.
 * To switch to real Ionicons once the package is installed:
 *
 *   1. Run:  npx expo install @expo/vector-icons
 *   2. Replace the entire implementation below with:
 *
 *      import { Ionicons } from '@expo/vector-icons';
 *      export function IonIcon({ name, size = 20, color }: IonIconProps) {
 *        return <Ionicons name={name} size={size} color={color} />;
 *      }
 *
 * Every call-site already passes an `ionName` that matches the real Ionicons
 * identifier, so no other files need changing.
 */

import React from 'react';
import { Text, StyleSheet } from 'react-native';

/** Subset of Ionicons names used in this feature */
export type IonIconName =
  | 'notifications'
  | 'notifications-outline'
  | 'notifications-off-outline'
  | 'book'
  | 'book-outline'
  | 'time'
  | 'time-outline'
  | 'alert-circle'
  | 'alert-circle-outline'
  | 'information-circle'
  | 'information-circle-outline'
  | 'checkmark-circle'
  | 'checkmark-circle-outline'
  | 'chevron-forward'
  | 'chevron-back'
  | 'close'
  | 'filter'
  | 'sync'
  | 'search'
  | 'home'
  | 'home-outline'
  | 'calendar'
  | 'calendar-outline'
  | 'person'
  | 'person-outline'
  | 'map'
  | 'map-outline'
  | 'wifi'
  | 'barcode'
  | 'shield-checkmark'
  | 'moon'
  | 'mail-outline'
  | 'flash-outline'
  | 'location-outline'
  | 'people-outline';

/** Unicode glyph fallback map */
const GLYPH: Record<IonIconName, string> = {
  'notifications': '🔔',
  'notifications-outline': '🔔',
  'notifications-off-outline': '🔕',
  'book': '📚',
  'book-outline': '📖',
  'time': '⏱',
  'time-outline': '⏱',
  'alert-circle': '⚠',
  'alert-circle-outline': '⚠',
  'information-circle': 'ℹ',
  'information-circle-outline': 'ℹ',
  'checkmark-circle': '✓',
  'checkmark-circle-outline': '✓',
  'chevron-forward': '›',
  'chevron-back': '‹',
  'close': '✕',
  'filter': '⊟',
  'sync': '↻',
  'search': '⌕',
  'home': '⌂',
  'home-outline': '⌂',
  'calendar': '📅',
  'calendar-outline': '📅',
  'person': '👤',
  'person-outline': '👤',
  'map': '🗺',
  'map-outline': '🗺',
  'wifi': '⬡',
  'barcode': '▮▯▮▯▮',
  'shield-checkmark': '🛡',
  'moon': '🌙',
  'mail-outline': '✉',
  'flash-outline': '⚡',
  'location-outline': '📍',
  'people-outline': '👥',
};

export interface IonIconProps {
  name: IonIconName;
  size?: number;
  color?: string;
}

export function IonIcon({ name, size = 20, color }: IonIconProps) {
  return (
    <Text
      style={[styles.base, { fontSize: size * 0.85, color: color ?? '#1C283B' }]}
      accessibilityElementsHidden
    >
      {GLYPH[name] ?? '•'}
    </Text>
  );
}

const styles = StyleSheet.create({
  base: {
    lineHeight: undefined, // let the size drive layout
    textAlign: 'center',
  },
});
