import { useEffect, useState } from 'react';
import { Platform, Text, View } from 'react-native';
import {
  GoogleSignin,
  GoogleSigninButton,
  isErrorWithCode,
  isSuccessResponse,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import { palette as c } from '@/constants/design-system';

const webClientId = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID;
const iosClientId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;
const configured = Boolean(webClientId && (Platform.OS !== 'ios' || iosClientId));

export default function GoogleSignIn({
  onCredential,
  disabled = false,
}: {
  onCredential: (credential: string) => void;
  disabled?: boolean;
}) {
  const [error, setError] = useState('');

  useEffect(() => {
    if (configured && webClientId) {
      GoogleSignin.configure({
        webClientId,
        ...(Platform.OS === 'ios' && iosClientId ? { iosClientId } : {}),
      });
    }
  }, []);

  async function signIn() {
    if (disabled) return;
    if (!configured) {
      setError(Platform.OS === 'ios'
        ? 'Add the iOS Google OAuth client ID to the frontend .env file.'
        : 'Google sign-in is not configured. Add the web client ID to the frontend .env file.');
      return;
    }

    setError('');
    try {
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      const result = await GoogleSignin.signIn();
      if (!isSuccessResponse(result)) return;
      if (!result.data.idToken) {
        setError('Google did not return a sign-in token. Check the web client ID configuration.');
        return;
      }
      onCredential(result.data.idToken);
    } catch (cause) {
      if (isErrorWithCode(cause)) {
        if (cause.code === statusCodes.SIGN_IN_CANCELLED) return;
        if (cause.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
          setError('Google Play Services is missing or needs an update on this device.');
          return;
        }
        if (cause.code === 'DEVELOPER_ERROR') {
          setError('Google sign-in setup is incomplete. Add this Android app package and its SHA-1 to Google Cloud OAuth clients.');
          return;
        }
      }
      setError(cause instanceof Error ? cause.message : 'Google sign-in failed. Please try again.');
    }
  }

  return (
    <View style={{ alignItems: 'center', gap: 8 }}>
      <GoogleSigninButton
        size={GoogleSigninButton.Size.Wide}
        color={GoogleSigninButton.Color.Light}
        disabled={disabled}
        onPress={signIn}
      />
      {!!error && (
        <Text accessibilityRole="alert" style={{ color: c.error, fontSize: 12, textAlign: 'center' }}>
          {error}
        </Text>
      )}
    </View>
  );
}
