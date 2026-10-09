import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'react-native';

import { BookingStoreProvider } from '@/seat-booking/store/bookingStore';
import { LibraryProvider } from '@/state/library';

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const colorScheme = useColorScheme();

  useEffect(() => {
    SplashScreen.hideAsync().catch(() => {});
  }, []);

  return (
    <BookingStoreProvider>
      <LibraryProvider>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <StatusBar style="dark" />
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="admin-panel" />
          </Stack>
        </ThemeProvider>
      </LibraryProvider>
    </BookingStoreProvider>
  );
}
