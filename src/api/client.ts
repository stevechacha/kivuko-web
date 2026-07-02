import { API_BASE_URL, API_V1 } from '../config/api';

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  token?: string | null,
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> | undefined),
  };
  if (token) {
    headers['X-Session-Token'] = token;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  try {
    const res = await fetch(`${API_V1}${path}`, {
      ...options,
      headers,
      signal: controller.signal,
    });
    const body = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new ApiError(body.detail || body.message || 'Request failed', res.status);
    }
    return body as T;
  } catch (err) {
    if (err instanceof ApiError) throw err;
    if (err instanceof Error && err.name === 'AbortError') {
      throw new ApiError('Server is taking too long to respond. Check the API URL.', 408);
    }
    throw new ApiError('Could not reach the API. Check your connection.', 0);
  } finally {
    clearTimeout(timeout);
  }
}

export interface Participant {
  id: string;
  name: string;
  phone: string;
  college: string;
  home_area: string;
  region: 'bara' | 'visiwani';
  region_label: string;
  initials: string;
  patriotism_points: number;
  session_token: string;
}

export interface RegisterResponse {
  message: string;
  participant: Participant;
}

export interface Peer {
  id: string;
  name: string;
  initials: string;
  region: 'bara' | 'visiwani';
  region_label: string;
  home_area: string;
}

export interface MatchResponse {
  match_id: string;
  mission_id: string;
  peer: Peer;
  status_messages: string[];
}

export interface ChatMessage {
  id: string;
  from_role: 'me' | 'peer' | 'system';
  text: string;
  created_at?: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correct_index: number;
}

export interface QuizSubmitResponse {
  completed: boolean;
  score: number;
  total_questions: number;
  patriotism_points: number;
  airtime_reward_tzs: number;
  message: string;
}

export interface Certificate {
  cert_code: string;
  user_name: string;
  verify_url: string;
  issued_date: string;
}

export interface MapConnection {
  id: string;
  from_region: string;
  to_region: string;
}

export interface MapStats {
  pairs_today: number;
  regions_active: number;
  connections: MapConnection[];
}

export interface ElderAudio {
  id: string;
  name: string;
  area: string;
  duration_label: string;
  audio_url?: string;
}

export interface HealthResponse {
  status: string;
  service: string;
}

export interface CertificateVerifyResponse {
  valid: boolean;
  certificate?: Certificate;
  detail?: string;
}

export const api = {
  health() {
    return fetch(`${API_BASE_URL}/health/`).then(async (res) => {
      const body = (await res.json().catch(() => ({}))) as HealthResponse;
      if (!res.ok) throw new ApiError('API health check failed', res.status);
      return body;
    });
  },

  verifyCertificate(certCode: string) {
    return request<CertificateVerifyResponse>(`/certificates/verify/${encodeURIComponent(certCode)}`);
  },
  register(data: {
    name: string;
    phone: string;
    college: string;
    home_area: string;
    region: 'bara' | 'visiwani';
  }) {
    return request<RegisterResponse>('/users/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  match(token: string) {
    return request<MatchResponse>(
      '/matching/match',
      { method: 'POST', body: '{}' },
      token,
    );
  },

  getChat(missionId: string, token: string) {
    return request<ChatMessage[]>(`/missions/${missionId}/chat`, {}, token);
  },

  sendMessage(missionId: string, text: string, token: string) {
    return request<{ sent: ChatMessage; reply: ChatMessage }>(
      `/missions/${missionId}/chat`,
      { method: 'POST', body: JSON.stringify({ text }) },
      token,
    );
  },

  getQuizQuestions() {
    return request<QuizQuestion[]>('/quiz/questions');
  },

  submitQuiz(missionId: string, answers: Record<string, number>, token: string) {
    return request<QuizSubmitResponse>(
      `/missions/${missionId}/quiz/submit`,
      { method: 'POST', body: JSON.stringify({ answers }) },
      token,
    );
  },

  generateCertificate(missionId: string, token: string) {
    return request<Certificate>(
      '/certificates/generate',
      { method: 'POST', body: JSON.stringify({ mission_id: missionId }) },
      token,
    );
  },

  getMapStats() {
    return request<MapStats>('/map/stats');
  },

  getAudioArchive() {
    return request<ElderAudio[]>('/audio/archive');
  },
};
