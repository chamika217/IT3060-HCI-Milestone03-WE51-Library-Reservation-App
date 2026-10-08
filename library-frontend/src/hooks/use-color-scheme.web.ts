import { useSyncExternalStore } from 'react';
import { useColorScheme as useRNColorScheme } from 'react-native';
const subscribe = () => () => {};
const clientSnapshot = () => true;
const serverSnapshot = () => false;
// Keep static HTML and the first hydration render consistent.
export function useColorScheme() {
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setHasHydrated(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const hydrated = useSyncExternalStore(subscribe, clientSnapshot, serverSnapshot);
  const colorScheme = useRNColorScheme();
  return hydrated ? colorScheme : 'light';
}
