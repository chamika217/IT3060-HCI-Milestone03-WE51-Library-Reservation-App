import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Platform, View, StyleSheet } from 'react-native';

import { BookingStoreProvider } from '@/seat-booking/store/bookingStore';
import { LibraryProvider } from '@/state/library';
import { AppThemeProvider, useAppTheme } from '@/contexts/ThemeContext';

SplashScreen.preventAutoHideAsync().catch(() => {});

function InnerLayout() {
  const { isDark } = useAppTheme();

  useEffect(() => {
    SplashScreen.hideAsync().catch(() => {});
  }, []);

  const bg = isDark ? '#0D0F12' : '#FAFBFB';
  const outerBg = isDark ? '#000000' : '#EAEFF5';

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
      <View style={[styles.webContainer, { backgroundColor: outerBg }]}>
        <View style={[styles.mobileFrame, { backgroundColor: bg }]}>
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
    overflow: 'hidden',
    ...(Platform.OS === 'web'
      ? {
          boxShadow: '0px 12px 30px rgba(28, 40, 59, 0.15)',
        }
      : {}),
  },
});
