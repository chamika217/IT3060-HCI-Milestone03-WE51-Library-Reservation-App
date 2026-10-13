/**
 * useColorScheme (web) — same as the native version but with SSR guard.
 * Reads from ThemeContext so the Dark Mode toggle works on web too.
 */
import { useEffect, useState } from 'react';
import { useAppTheme } from '@/contexts/ThemeContext';

export function useColorScheme(): 'light' | 'dark' {
  const { isDark } = useAppTheme();
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  // Before hydration return 'light' to keep SSR consistent
  if (!hydrated) return 'light';

  return isDark ? 'dark' : 'light';
}
