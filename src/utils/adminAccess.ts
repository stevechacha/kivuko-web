import { Platform } from 'react-native';

const UNLOCK_FLAG = 'kivuko_admin_unlock';
const API_KEY_STORAGE = 'kivuko_admin_api_key';

export const DEFAULT_ADMIN_PIN = 'MUUNGANO2026';

export function getConfiguredAdminPin(): string {
  return process.env.EXPO_PUBLIC_ADMIN_PIN?.trim() || DEFAULT_ADMIN_PIN;
}

export function isAdminUnlocked(): boolean {
  if (Platform.OS !== 'web' || typeof sessionStorage === 'undefined') {
    return false;
  }
  return sessionStorage.getItem(UNLOCK_FLAG) === '1';
}

/** Store judge unlock + use entered PIN as API key when no env key is set. */
export function setAdminSession(pin: string): void {
  if (Platform.OS !== 'web' || typeof sessionStorage === 'undefined') return;
  sessionStorage.setItem(UNLOCK_FLAG, '1');
  sessionStorage.setItem(API_KEY_STORAGE, pin.trim().toUpperCase());
}

export function clearAdminSession(): void {
  if (Platform.OS === 'web' && typeof sessionStorage !== 'undefined') {
    sessionStorage.removeItem(UNLOCK_FLAG);
    sessionStorage.removeItem(API_KEY_STORAGE);
  }
}

/** Key sent as X-Admin-Key — must match Railway ADMIN_DASHBOARD_KEY (or leave that empty). */
export function getAdminApiKey(): string | null {
  if (!isAdminUnlocked()) return null;

  const fromEnv = process.env.EXPO_PUBLIC_ADMIN_API_KEY?.trim();
  if (fromEnv) return fromEnv;

  if (Platform.OS === 'web' && typeof sessionStorage !== 'undefined') {
    const stored = sessionStorage.getItem(API_KEY_STORAGE);
    if (stored) return stored;
  }

  return DEFAULT_ADMIN_PIN;
}
