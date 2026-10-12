import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';

import { BookingStoreProvider } from '@/seat-booking/store/bookingStore';
import { LibraryProvider } from '@/state/library';
import { AppThemeProvider, useAppTheme } from '@/contexts/ThemeContext';

SplashScreen.preventAutoHideAsync().catch(() => {});

// Inner layout reads from ThemeContext — must be inside AppThemeProvider
function InnerLayout() {
  const { isDark } = useAppTheme();

  useEffect(() => {
    SplashScreen.hideAsync().catch(() => {});
  }, []);

  return (
    <ThemeProvider value={isDark ? DarkTheme : DefaultTheme}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack initialRouteName="index" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="admin-panel" />
      </Stack>
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <AppThemeProvider>
      <BookingStoreProvider>
        <LibraryProvider>
          <InnerLayout />
        </LibraryProvider>
      </BookingStoreProvider>
    </AppThemeProvider>
  );
}
