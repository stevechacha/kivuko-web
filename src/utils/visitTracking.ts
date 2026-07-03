import { Platform } from 'react-native';

const KEYS = {
  academy: 'kivuko_visited_academy',
  patriot: 'kivuko_visited_patriot',
  omnichannel: 'kivuko_visited_omnichannel',
  moderator: 'kivuko_visited_moderator',
  gala: 'kivuko_visited_gala',
  elder: 'kivuko_visited_elder',
  gallery: 'kivuko_visited_gallery',
  partner: 'kivuko_visited_partner',
  archive: 'kivuko_visited_archive',
  rewards: 'kivuko_visited_rewards',
  impact: 'kivuko_visited_impact',
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
    elder: hasVisited('elder'),
    gallery: hasVisited('gallery'),
    partner: hasVisited('partner'),
    archive: hasVisited('archive'),
    rewards: hasVisited('rewards'),
    impact: hasVisited('impact'),
  };
}
