// data/mockData.ts

export type Region = 'bara' | 'visiwani';

export interface MockPeer {
  id: string;
  name: string;
  initials: string;
  region: Region;
  regionLabel: string;
  homeArea: string;
}

export const MOCK_PEERS: MockPeer[] = [
  { id: 'p1', name: 'Khadija Mrisho', initials: 'KM', region: 'visiwani', regionLabel: 'Zanzibar', homeArea: 'Unguja' },
  { id: 'p2', name: 'Suleiman Faki', initials: 'SF', region: 'visiwani', regionLabel: 'Zanzibar', homeArea: 'Pemba' },
  { id: 'p3', name: 'Furaha Ndosi', initials: 'FN', region: 'bara', regionLabel: 'Mainland', homeArea: 'Mwanza' },
];

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
}

export const UNION_QUIZ: QuizQuestion[] = [
  {
    id: 'q1',
    question: "Muungano wa Tanganyika na Zanzibar ulianzishwa tarehe gani?",
    options: ['26 Aprili 1964', '9 Desemba 1961', '12 Januari 1964'],
    correctIndex: 0,
  },
  {
    id: 'q2',
    question: 'Muungano uliunda nchi gani?',
    options: ['Jamhuri ya Kenya', 'Jamhuri ya Muungano wa Tanzania', 'Shirikisho la Afrika Mashariki'],
    correctIndex: 1,
  },
  {
    id: 'q3',
    question: 'Rais wa kwanza wa Zanzibar baada ya mapinduzi alikuwa nani?',
    options: ['Julius K. Nyerere', 'Abeid Amani Karume', 'Ali Hassan Mwinyi'],
    correctIndex: 1,
  },
];

export interface ChatMessage {
  id: string;
  from: 'me' | 'peer' | 'system';
  text: string;
}

export const SEED_CHAT: ChatMessage[] = [
  { id: 'c0', from: 'system', text: 'Umeunganishwa na Khadija — Visiwani 🌊' },
  { id: 'c1', from: 'peer', text: 'Habari! Niko tayari kwa Dhamira ya leo 😊' },
  { id: 'c2', from: 'me', text: 'Habari Khadija! Nami niko tayari — tuanze na jaribio?' },
  { id: 'c3', from: 'peer', text: "Sawa! Muungano ulianzishwa mwaka gani, nadhani unajua 😉" },
];

export interface MapConnection {
  id: string;
  fromRegion: string;
  toRegion: string;
}

export const MAP_CONNECTIONS: MapConnection[] = [
  { id: 'm1', fromRegion: 'Mwanza', toRegion: 'Unguja' },
  { id: 'm2', fromRegion: 'Dodoma', toRegion: 'Pemba' },
  { id: 'm3', fromRegion: 'Mbeya', toRegion: 'Unguja' },
  { id: 'm4', fromRegion: 'Dar es Salaam', toRegion: 'Pemba' },
];

export const ELDER_AUDIO_ARCHIVE = [
  { id: 'a1', name: 'Bibi Fatuma', area: 'Pemba', durationLabel: 'Sekunde 30 · 1964 ilivyokuwa' },
  { id: 'a2', name: 'Babu Elias', area: 'Kigoma', durationLabel: 'Sekunde 30 · Siku ya Muungano' },
];
