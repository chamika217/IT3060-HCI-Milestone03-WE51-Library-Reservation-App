/**
 * usePalette — returns the design-system palette object that switches
 * between light and dark values based on the ThemeContext isDark flag.
 *
 * Use this instead of `import { palette as c } from '@/constants/design-system'`
 * inside React components so colors respond to the Dark Mode toggle.
 */
import { useAppTheme } from '@/contexts/ThemeContext';

const LIGHT = {
  primary:     '#2D7CE9',
  text:        '#1C283B',
  background:  '#F5F7F7',
  card:        '#FAFBFB',
  border:      '#DDE2E6',
  secondary:   '#6C7886',
  success:     '#25B87A',
  warning:     '#F7A35C',
  error:       '#F04F55',
  info:        '#2D7CE9',
  primarySoft: '#EAF2FD',
  successSoft: '#E9F8F1',
  warningSoft: '#FFF3E8',
  errorSoft:   '#FDECEE',
  white:       '#FFFFFF',
};

const DARK = {
  primary:     '#4D9FFF',
  text:        '#E8ECF0',
  background:  '#0D0F12',
  card:        '#1A1D23',
  border:      '#2A3040',
  secondary:   '#8A94A0',
  success:     '#30D689',
  warning:     '#FFB066',
  error:       '#FF6B70',
  info:        '#4D9FFF',
  primarySoft: '#0F1E35',
  successSoft: '#0A2018',
  warningSoft: '#251508',
  errorSoft:   '#250B0C',
  white:       '#FFFFFF',
};

export type Palette = typeof LIGHT;

export function usePalette(): Palette {
  const { isDark } = useAppTheme();
  return isDark ? DARK : LIGHT;
}
