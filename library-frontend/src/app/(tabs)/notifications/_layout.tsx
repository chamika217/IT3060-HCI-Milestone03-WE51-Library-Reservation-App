/**
 * Notifications group layout
 *
 * Wraps the notifications sub-screens in a Stack navigator so that
 * [id], permission, and preferences push on top of the list screen
 * with the correct header-less behaviour (each screen renders its own header).
 *
 * The Stack is placed inside the (tabs) route group, so Expo Router
 * treats /(tabs)/notifications as a single tab slot in the root AppTabs.
 */

import { Stack } from 'expo-router';

export default function NotificationsLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* List screen — the tab's landing page */}
      <Stack.Screen name="index" />

      {/* Detail — pushed by tapping a notification card */}
      <Stack.Screen
        name="[id]"
        options={{ animation: 'slide_from_right' }}
      />

      {/* Permission prompt — can be pushed from anywhere */}
      <Stack.Screen
        name="permission"
        options={{ animation: 'slide_from_bottom', presentation: 'modal' }}
      />

      {/* Preferences — pushed from the filter icon in the list header */}
      <Stack.Screen
        name="preferences"
        options={{ animation: 'slide_from_right' }}
      />
    </Stack>
  );
}
