import { Platform } from 'react-native';

const NARRATIONS: Record<string, string> = {
  a0: 'Hii ni sauti ya umoja — wimbo wa taifa na kumbukumbu za Mwalimu Nyerere.',
  a1: 'Hadithi za wazee zinahifadhi historia halisi ya Muungano wa Tanzania.',
};

export function speakKiswahili(text: string, audioId?: string) {
  if (Platform.OS !== 'web' || typeof window === 'undefined' || !window.speechSynthesis) {
    return false;
  }
  const phrase = (audioId && NARRATIONS[audioId]) || text;
  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(phrase);
  utter.lang = 'sw-TZ';
  utter.rate = 0.9;
  window.speechSynthesis.speak(utter);
  return true;
}

export function stopSpeech() {
  if (Platform.OS === 'web' && typeof window !== 'undefined' && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
}
