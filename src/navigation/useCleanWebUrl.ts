import { useEffect } from 'react';
import { Platform } from 'react-native';

/** Strip legacy query params from the URL on web (session holds the real state). */
export function useCleanWebUrl() {
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return;
    if (!window.location.search) return;
    window.history.replaceState({}, '', window.location.pathname);
  }, []);
}
