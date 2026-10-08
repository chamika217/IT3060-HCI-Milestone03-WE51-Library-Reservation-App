# Android Google Sign-In

Native Google Sign-In requires the development APK, not Expo Go. Android uses
the installed Google Sign-In package through native autolinking; Firebase is
not used. The optional Google config plugin configures the iOS URL scheme only.

## Remaining account configuration

The Android package is `com.librareserve.app`. The provided SHA-1 fingerprint
matches this project's `android/app/debug.keystore`, and the frontend and
backend Web client IDs are configured to match.

1. In Google Cloud, confirm the Android OAuth client uses package
   `com.librareserve.app` and SHA-1
   `5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25`.
2. From this directory, sign in with `npx.cmd eas-cli@latest login`, then link
   the project with `npx.cmd eas-cli@latest init`. With dynamic app config,
   persist the returned project ID in `expo.extra.eas.projectId` in app.json
   if the CLI asks for it.
3. Build the native development client:
   `npx.cmd eas-cli@latest build --platform android --profile development`.
   The development APK loads JavaScript from Metro; keep the frontend `.env`
   on this computer so Metro can read the Web client ID and local API URL.
4. Inspect `npx.cmd eas-cli@latest credentials --platform android`. If EAS
   signs with a different key, add that key's SHA-1 to the Android OAuth
   client too.
5. Install the APK on the phone. Start Metro with
   `npx.cmd expo start --dev-client --lan` and open the installed development app.
   Start the backend and keep the computer and phone on the same Wi-Fi.

For a tunnel or hosted backend, set `EXPO_PUBLIC_API_URL` to the reachable API
URL. A Metro tunnel does not expose the backend. Test Google cancellation,
existing-account login, and new-account profile completion on the APK.

References:
- https://react-native-google-signin.github.io/docs/setting-up/get-config-file
- https://react-native-google-signin.github.io/docs/setting-up/expo
- https://docs.expo.dev/develop/development-builds/introduction/
