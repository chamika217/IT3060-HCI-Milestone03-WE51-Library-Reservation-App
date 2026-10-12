import { useEffect, useRef, useState } from 'react';
import { Text, View } from 'react-native';
import { palette as c } from '@/constants/design-system';

type GoogleCredential = { credential?: string };
type GoogleIdentity = {
  accounts: {
    id: {
      initialize: (options: { client_id: string; callback: (response: GoogleCredential) => void }) => void;
      renderButton: (parent: HTMLElement, options: Record<string, string | number | boolean>) => void;
    };
  };
};
declare global { interface Window { google?: GoogleIdentity } }

const clientId = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID;
const scriptId = 'google-identity-services';
const allowLocalGoogleSignIn = process.env.EXPO_PUBLIC_ENABLE_GOOGLE_WEB_SIGNIN === 'true';

export default function GoogleSignIn({ onCredential, disabled = false }: { onCredential: (credential: string) => void; disabled?: boolean }) {
  const host = useRef<HTMLDivElement>(null);
  const credentialHandler = useRef(onCredential);
  const [error, setError] = useState('');
  const isLocalhost = typeof window !== 'undefined'
    && ['localhost', '127.0.0.1'].includes(window.location.hostname);
  const canLoadGoogle = Boolean(clientId) && (!isLocalhost || allowLocalGoogleSignIn);
  useEffect(() => { credentialHandler.current = onCredential; }, [onCredential]);

  useEffect(() => {
    // Google rejects this project's current OAuth client from localhost. Do not
    // load its script locally unless the origin has been authorized in Google
    // Cloud Console and the opt-in environment flag has been set.
    if (!canLoadGoogle || !clientId) return;
    let disposed = false;
    const mountButton = () => {
      if (disposed || !host.current || !window.google) return;
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: response => {
          if (!response.credential) {
            setError('Google did not return a sign-in credential. Please try again.');
            return;
          }
          credentialHandler.current(response.credential);
        },
      });
      window.google.accounts.id.renderButton(host.current, {
        type: 'standard',
        theme: 'outline',
        size: 'large',
        text: 'continue_with',
        shape: 'rectangular',
        width: Math.min(360, Math.max(240, window.innerWidth - 64)),
      });
    };

    let script = document.getElementById(scriptId) as HTMLScriptElement | null;
    if (window.google) mountButton();
    else if (script) {
      script.addEventListener('load', mountButton, { once: true });
      script.addEventListener('error', () => setError('Google Sign-In could not load. Check your connection and retry.'), { once: true });
    } else {
      script = document.createElement('script');
      script.id = scriptId;
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = mountButton;
      script.onerror = () => setError('Google Sign-In could not load. Check your connection and retry.');
      document.head.appendChild(script);
    }

    return () => { disposed = true; };
  }, [canLoadGoogle]);

  return (
    <View style={{ alignItems: 'center', opacity: disabled ? 0.55 : 1 }}>
      {canLoadGoogle
        ? <div ref={host} aria-disabled={disabled} style={{ pointerEvents: disabled ? 'none' : 'auto', minHeight: 44 }} />
        : <Text style={{ color: c.secondary, fontSize: 12, textAlign: 'center' }}>{isLocalhost ? 'Google sign-in is disabled for local testing. Use email and password, or authorize this localhost origin in Google Cloud.' : 'Add EXPO_PUBLIC_GOOGLE_CLIENT_ID to library-frontend/.env to enable Google sign-in.'}</Text>}
      {!!error && <Text accessibilityRole="alert" style={{ color: c.error, fontSize: 12, marginTop: 8, textAlign: 'center' }}>{error}</Text>}
    </View>
  );
}
