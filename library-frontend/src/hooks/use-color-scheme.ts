/**
 * useColorScheme — returns 'dark' or 'light'.
 *
 * Reads from ThemeContext (the user's manual toggle in Settings) so that
 * ALL components using useTheme() → useColorScheme() automatically switch
 * when the Dark Mode toggle is flipped. Falls back to the OS preference if
 * the context is unavailable (e.g. during SSR or outside the provider).
 */
import { useColorScheme as useRNColorScheme } from 'react-native';
import { useAppTheme } from '@/contexts/ThemeContext';

export function useColorScheme(): 'light' | 'dark' {
  const { isDark } = useAppTheme();
  return isDark ? 'dark' : 'light';
}
