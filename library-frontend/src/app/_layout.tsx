import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useColorScheme } from 'react-native';
import { AnimatedSplashOverlay } from '@/components/animated-icon';
SplashScreen.preventAutoHideAsync();
export default function RootLayout() {
  const scheme = useColorScheme();
  return <ThemeProvider value={scheme === 'dark' ? DarkTheme : DefaultTheme}><AnimatedSplashOverlay /><Stack>
    <Stack.Screen name="index" options={{ title: 'LibraReserve' }} />
    <Stack.Screen name="books" options={{ headerShown: false }} />
    <Stack.Screen name="explore" options={{ title: 'Explore' }} />
  </Stack></ThemeProvider>;
}
