import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Platform, View, StyleSheet } from 'react-native';

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

  const content = (
    <ThemeProvider value={isDark ? DarkTheme : DefaultTheme}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack initialRouteName="index" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="admin-panel" />
      </Stack>
    </ThemeProvider>
  );

  if (Platform.OS === 'web') {
    return (
      <View style={styles.webContainer}>
        <View style={styles.mobileFrame}>
          {content}
        </View>
      </View>
    );
  }

  return content;
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

const styles = StyleSheet.create({
  webContainer: {
    flex: 1,
    height: '100%',
    width: '100%',
    backgroundColor: '#EAEFF5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mobileFrame: {
    flex: 1,
    width: '100%',
    maxWidth: 480,
    height: '100%',
    backgroundColor: '#FAFBFB',
    overflow: 'hidden',
    ...(Platform.OS === 'web'
      ? {
          boxShadow: '0px 12px 30px rgba(28, 40, 59, 0.15)',
        }
      : {}),
  },
});
