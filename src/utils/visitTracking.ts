import { Platform } from 'react-native';

const KEYS = {
  academy: 'kivuko_visited_academy',
  patriot: 'kivuko_visited_patriot',
  omnichannel: 'kivuko_visited_omnichannel',
  moderator: 'kivuko_visited_moderator',
  gala: 'kivuko_visited_gala',
} as const;

export type VisitKey = keyof typeof KEYS;

export function markVisited(key: VisitKey) {
  if (Platform.OS !== 'web' || typeof sessionStorage === 'undefined') return;
  try {
    sessionStorage.setItem(KEYS[key], '1');
  } catch {
    // ignore
  }
}

export function hasVisited(key: VisitKey): boolean {
  if (Platform.OS !== 'web' || typeof sessionStorage === 'undefined') return false;
  return sessionStorage.getItem(KEYS[key]) === '1';
}

export function readVisitState(): Record<VisitKey, boolean> {
  return {
    academy: hasVisited('academy'),
    patriot: hasVisited('patriot'),
    omnichannel: hasVisited('omnichannel'),
    moderator: hasVisited('moderator'),
    gala: hasVisited('gala'),
  };
}
