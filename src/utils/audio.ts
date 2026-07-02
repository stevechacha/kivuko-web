import { Platform } from 'react-native';

let activeAudio: HTMLAudioElement | null = null;

export function stopActiveAudio() {
  if (Platform.OS !== 'web' || !activeAudio) return;
  activeAudio.pause();
  activeAudio.currentTime = 0;
  activeAudio = null;
}

export function playAudioUrl(url: string): boolean {
  if (Platform.OS !== 'web' || typeof window === 'undefined' || !url) {
    return false;
  }

  stopActiveAudio();
  const audio = new window.Audio(url);
  activeAudio = audio;
  audio.play().catch(() => {
    activeAudio = null;
  });
  audio.onended = () => {
    if (activeAudio === audio) activeAudio = null;
  };
  return true;
}
