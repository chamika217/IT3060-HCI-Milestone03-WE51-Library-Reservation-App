import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { useColorScheme } from 'react-native';

import { BookingStoreProvider } from '@/seat-booking/store/bookingStore';

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const colorScheme = useColorScheme();

  useEffect(() => {
    SplashScreen.hideAsync().catch(() => {});
  }, []);

  return (
    <BookingStoreProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack screenOptions={{ headerShown: false }} />
      </ThemeProvider>
    </BookingStoreProvider>
  );
}

import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { LibraryProvider } from '@/state/library';
export default function RootLayout() { return <LibraryProvider><StatusBar style="dark" /><Stack screenOptions={{ headerShown: false }} /></LibraryProvider>; }
