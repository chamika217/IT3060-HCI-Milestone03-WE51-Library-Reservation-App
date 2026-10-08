import type { ComponentType } from 'react';
import { Text, TurboModuleRegistry } from 'react-native';
import { palette as c } from '@/constants/design-system';

type Props = { onCredential: (credential: string) => void; disabled?: boolean };

// The SDK throws during import when its native module is absent (including Expo Go).
// Only evaluate it in a binary that actually includes Google Sign-In.
const SupportedGoogleSignIn: ComponentType<Props> | null = TurboModuleRegistry.get('RNGoogleSignin')
  // eslint-disable-next-line @typescript-eslint/no-require-imports -- Static imports crash binaries without the native module.
  ? require('./GoogleSignInSupported.native').default
  : null;

export default function GoogleSignIn(props: Props) {
  if (SupportedGoogleSignIn) return <SupportedGoogleSignIn {...props} />;
  return (
    <Text style={{ color: c.secondary, fontSize: 12, textAlign: 'center' }}>
      Google sign-in is unavailable in this version of the app. Please sign in with your email and password.
    </Text>
  );
}
