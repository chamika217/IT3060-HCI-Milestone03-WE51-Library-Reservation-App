/**
 * ThemeContext — global dark mode override.
 *
 * Usage:
 *   const { isDark, setIsDark } = useAppTheme();
 *
 * The context wraps the whole app in _layout.tsx. The Dark Mode toggle in
 * settings.tsx calls setIsDark(true/false), which switches DarkTheme /
 * DefaultTheme for expo-router's ThemeProvider and flips all colors in the
 * design system everywhere in the app.
 */

import React, { createContext, useContext, useState } from 'react';

interface ThemeContextValue {
  isDark: boolean;
  setIsDark: (v: boolean) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  isDark: false,
  setIsDark: () => {},
});

export function AppThemeProvider({ children }: { children: React.ReactNode }) {
  const [isDark, setIsDark] = useState(false);
  return (
    <ThemeContext.Provider value={{ isDark, setIsDark }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useAppTheme() {
  return useContext(ThemeContext);
}
