/**
 * useScreenColors — returns a flat color object for our notification/profile
 * screens. Switches between light and dark palettes when isDark changes in
 * ThemeContext so every screen re-renders with the correct colors.
 *
 * Usage:
 *   const C = useScreenColors();
 *   <View style={{ backgroundColor: C.background }}>
 *     <Text style={{ color: C.text }}>Hello</Text>
 *   </View>
 */

import { useAppTheme } from '@/contexts/ThemeContext';

export interface ScreenColors {
  // Backgrounds
  background: string;
  card: string;
  cardAlt: string;     // slightly different card bg
  input: string;
  inputLocked: string;

  // Text
  text: string;
  textSecondary: string;
  textDisabled: string;

  // Borders & dividers
  border: string;
  divider: string;

  // Brand
  primary: string;
  primarySoft: string;

  // Semantic
  success: string;
  successSoft: string;
  warning: string;
  warningSoft: string;
  error: string;
  errorSoft: string;
  info: string;
  infoSoft: string;
}

const LIGHT: ScreenColors = {
  background:   '#F5F7F7',
  card:         '#FAFBFB',
  cardAlt:      '#F4F9FF',
  input:        '#FAFBFB',
  inputLocked:  '#F0F2F4',

  text:         '#1C283B',
  textSecondary:'#6C7886',
  textDisabled: '#6C7886',

  border:       '#DDE2E6',
  divider:      '#F0F2F4',

  primary:      '#2D7CE9',
  primarySoft:  '#EAF2FD',

  success:      '#25B87A',
  successSoft:  '#EDFAF4',
  warning:      '#F7A35C',
  warningSoft:  '#FFF5EB',
  error:        '#F04F55',
  errorSoft:    '#FDEAEA',
  info:         '#2D7CE9',
  infoSoft:     '#EAF2FD',
};

const DARK: ScreenColors = {
  background:   '#0D0F12',
  card:         '#1A1D23',
  cardAlt:      '#141820',
  input:        '#1A1D23',
  inputLocked:  '#111318',

  text:         '#E8ECF0',
  textSecondary:'#8A94A0',
  textDisabled: '#5A6470',

  border:       '#2A3040',
  divider:      '#22262E',

  primary:      '#4D9FFF',
  primarySoft:  '#0F1E35',

  success:      '#30D689',
  successSoft:  '#0A2018',
  warning:      '#FFB066',
  warningSoft:  '#251508',
  error:        '#FF6B70',
  errorSoft:    '#250B0C',
  info:         '#4D9FFF',
  infoSoft:     '#0F1E35',
};

export function useScreenColors(): ScreenColors {
  const { isDark } = useAppTheme();
  return isDark ? DARK : LIGHT;
}
