import { Platform } from 'react-native';

export function registerServiceWorker() {
  if (Platform.OS !== 'web' || typeof navigator === 'undefined' || !('serviceWorker' in navigator)) {
    return;
  }
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  });
}

export async function cacheQuizOffline(questionsJson: string) {
  if (Platform.OS !== 'web' || typeof caches === 'undefined') return;
  try {
    const cache = await caches.open('kivuko-quiz-v1');
    await cache.put(
      '/offline/quiz.json',
      new Response(questionsJson, { headers: { 'Content-Type': 'application/json' } }),
    );
  } catch {
    // ignore
  }
}
