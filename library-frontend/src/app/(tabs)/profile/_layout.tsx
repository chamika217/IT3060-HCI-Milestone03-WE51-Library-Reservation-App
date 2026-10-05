/**
 * Profile group layout
 *
 * Wraps the profile sub-screens in a Stack navigator so that edit,
 * settings, help, and contact push on top of the index screen.
 * headerShown: false — every screen renders its own ScreenHeader.
 */

import { Stack } from 'expo-router';

export default function ProfileLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* Profile landing page */}
      <Stack.Screen name="index" />

      {/* Push screens — slide from right */}
      <Stack.Screen
        name="edit"
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="settings"
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="help"
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="contact"
        options={{ animation: 'slide_from_right' }}
      />
    </Stack>
  );
}
