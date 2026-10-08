import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { LibraryProvider } from '@/state/library';
export default function RootLayout() { return <LibraryProvider><StatusBar style="dark" /><Stack screenOptions={{ headerShown: false }} /></LibraryProvider>; }
