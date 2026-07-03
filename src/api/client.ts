import { API_BASE_URL, API_V1 } from '../config/api';
import { getAdminApiKey } from '../utils/adminAccess';

export class ApiError extends Error {
  status: number;
  loginRequired?: boolean;

  constructor(message: string, status: number, loginRequired?: boolean) {
    super(message);
    this.status = status;
    this.loginRequired = loginRequired;
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  token?: string | null,
  adminKey?: string | null,
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> | undefined),
  };
  if (token) {
    headers['X-Session-Token'] = token;
  }
  const key = adminKey ?? (path.startsWith('/admin') ? getAdminApiKey() : null);
  if (key) {
    headers['X-Admin-Key'] = key;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  try {
    const res = await fetch(`${API_V1}${path}`, {
      ...options,
      headers,
      signal: controller.signal,
    });
    const contentType = res.headers.get('content-type') || '';
    const body = contentType.includes('application/json')
      ? await res.json().catch(() => ({}))
      : {};

    if (!res.ok) {
      const fallback =
        res.status >= 500
          ? 'Server error. Try again in a moment.'
          : 'Request failed';
      throw new ApiError(
        body.detail || body.message || fallback,
        res.status,
        body.login_required === true,
      );
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
  patriotism_grade?: UzalendoGrade;
  session_token: string;
}

export interface UzalendoGrade {
  code: string;
  label: string;
  badge: string;
  next_threshold: number | null;
}

export interface MissionStep {
  number: number;
  title: string;
  subtitle: string;
  icon: string;
  points: number;
  status: 'completed' | 'active' | 'locked';
}

export interface MissionProgress {
  steps: MissionStep[];
  current_step: number;
  completed_count: number;
  total_steps: number;
  grade: UzalendoGrade;
  patriotism_points?: number;
}

export interface TimelineEvent {
  id: string;
  year: number;
  month_label: string;
  title: string;
  description: string;
}

export interface LeaderboardEntry {
  rank: number;
  name: string;
  home_area: string;
  region_label: string;
  patriotism_points: number;
  grade: UzalendoGrade;
}

export interface ChemshaBongoResult {
  bonus_points: number;
  airtime_reward_tzs: number;
  message: string;
  patriotism_points: number;
  grade: UzalendoGrade;
}

export interface SessionResponse {
  message?: string;
  participant: Participant;
  active_mission_id: string | null;
  active_match_id: string | null;
}

export interface RegisterResponse extends SessionResponse {}

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

export interface ChatThread {
  peer: Peer;
  mission_title: string;
  messages: ChatMessage[];
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
  qr_data_url?: string;
}

export type ReportReasonId = 'abusive_language' | 'contact_request' | 'inappropriate_content' | 'other';

export interface WhatsAppBotResponse {
  reply: string;
  channel: string;
  session_id: string;
  points: number;
  suggestions: string[];
}

export interface ReportedItem {
  id: string;
  mission_id: string;
  mission_title: string;
  reporter_name: string;
  reported_name: string;
  reason: ReportReasonId | string;
  excerpt?: string;
  reported_at_label: string;
  status: 'pending' | 'resolved';
}

export interface MapConnection {
  id: string;
  from_region: string;
  to_region: string;
}

export interface LiveImpact {
  youth_connected: number;
  pairs_today: number;
  certificates_issued: number;
  regions_active: number;
  live_connections: number;
  bara_youth: number;
  visiwani_youth: number;
  activity: { id: string; icon: string; text: string; subtitle?: string }[];
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
  verify_url?: string;
  qr_data_url?: string;
  detail?: string;
}

export interface AcademyArticle {
  id: string;
  category: 'army' | 'union' | 'patriot';
  title: string;
  summary: string;
  body: string;
  badge_label: string;
}

export interface AdminDashboard {
  total_participants: number;
  seed_peers: number;
  active_matches: number;
  completed_missions: number;
  certificates_issued: number;
  pairs_today: number;
  regions_active: number;
  bara_participants: number;
  visiwani_participants: number;
  recent_connections: MapConnection[];
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

  getMe(token: string) {
    return request<SessionResponse>('/users/me', {}, token);
  },

  getAcademyArticles(category?: string) {
    const q = category ? `?category=${encodeURIComponent(category)}` : '';
    return request<AcademyArticle[]>(`/academy/articles${q}`);
  },

  getAdminDashboard() {
    return request<AdminDashboard>('/admin/dashboard');
  },

  register(data: {
    name: string;
    phone: string;
    college: string;
    home_area: string;
    region: 'bara' | 'visiwani';
    accepted_terms: boolean;
  }) {
    return request<RegisterResponse>('/users/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  login(phone: string) {
    return request<SessionResponse>('/users/login', {
      method: 'POST',
      body: JSON.stringify({ phone }),
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
    return request<ChatThread>(`/missions/${missionId}/chat`, {}, token);
  },

  sendMessage(missionId: string, text: string, token: string) {
    return request<{ sent: ChatMessage }>(
      `/missions/${missionId}/chat`,
      { method: 'POST', body: JSON.stringify({ text }) },
      token,
    );
  },

  whatsappBot(text: string, sessionId?: string) {
    return request<WhatsAppBotResponse>('/channels/whatsapp/chat', {
      method: 'POST',
      body: JSON.stringify({ text, session_id: sessionId ?? '' }),
    });
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

  getLiveImpact() {
    return request<LiveImpact>('/impact/live');
  },

  getAudioArchive() {
    return request<ElderAudio[]>('/audio/archive');
  },

  getMissionProgress(token: string) {
    return request<MissionProgress>('/users/me/progress', {}, token);
  },

  completeMissionStep(step: number, token: string) {
    return request<MissionProgress>(`/users/me/steps/${step}/complete`, { method: 'POST', body: '{}' }, token);
  },

  getTimelineEvents() {
    return request<TimelineEvent[]>('/timeline/events');
  },

  getLeaderboard(limit = 10, region?: 'bara' | 'visiwani') {
    const regionQ = region ? `&region=${region}` : '';
    return request<LeaderboardEntry[]>(`/leaderboard/youth?limit=${limit}${regionQ}`);
  },

  reportMission(missionId: string, reason: ReportReasonId, token: string) {
    return request<ReportedItem>(
      '/reports',
      { method: 'POST', body: JSON.stringify({ mission_id: missionId, reason }) },
      token,
    );
  },

  getReportedContent(status: 'pending' | 'resolved') {
    return request<ReportedItem[]>(`/admin/reports?status=${status}`);
  },

  resolveReport(reportId: string, action: 'dismiss' | 'warn' | 'suspend') {
    return request<ReportedItem>(`/admin/reports/${reportId}/resolve`, {
      method: 'POST',
      body: JSON.stringify({ action }),
    });
  },

  submitChemshaBongo(score: number, total: number, token: string) {
    return request<ChemshaBongoResult>(
      '/quiz/chemsha-bongo',
      { method: 'POST', body: JSON.stringify({ score, total }) },
      token,
    );
  },
};
