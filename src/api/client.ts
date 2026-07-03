import { API_BASE_URL, API_V1 } from '../config/api';
import { getAdminApiKey } from '../utils/adminAccess';

export class ApiError extends Error {
  status: number;
  loginRequired?: boolean;
  waiting?: boolean;

  constructor(message: string, status: number, loginRequired?: boolean, waiting?: boolean) {
    super(message);
    this.status = status;
    this.loginRequired = loginRequired;
    this.waiting = waiting;
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
        body.waiting === true,
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
  participant_id?: string;
  name: string;
  home_area: string;
  region_label: string;
  patriotism_points: number;
  grade: UzalendoGrade;
  gala_nominated?: boolean;
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
  demo_twin?: boolean;
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
  auto_flagged?: boolean;
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
  pending_reports: number;
  pending_stories: number;
  signups_today: number;
  gala_nominees: number;
  quiz_questions: number;
  platform_ready: boolean;
  pending_elders?: number;
  pending_rewards?: number;
}

export interface Institution {
  code: string;
  name: string;
  home_area: string;
  region: 'bara' | 'visiwani';
}

export interface ElderStory {
  id: string;
  contributor_name: string;
  title: string;
  body: string;
  home_area: string;
  region: string;
  region_label: string;
  audio_url?: string;
  video_url?: string;
  status: 'pending' | 'approved' | 'rejected';
  radio_nominated?: boolean;
  created_at_label: string;
}

export interface ElderRadioEntry {
  rank: number;
  story_id: string;
  contributor_name: string;
  title: string;
  home_area: string;
  region_label: string;
  audio_url?: string;
}

export interface PartnerDashboard {
  youth_registered: number;
  pairs_today: number;
  certificates_issued: number;
  completed_missions: number;
  bara_youth: number;
  visiwani_youth: number;
  regions_active: number;
  institutions: { code: string; name: string; home_area: string; region: string; youth_count: number }[];
  pending_elder_stories: number;
  elder_radio_nominees: number;
  auto_flagged_pending: number;
  rewards_pending_tzs: number;
  recent_certificates: { cert_code: string; user_name: string; issued_date: string }[];
}

export interface RadioPartnerData {
  station_name: string;
  segment_title: string;
  elder_nominees: ElderRadioEntry[];
  youth_gala_nominees: { rank: number; name: string; home_area: string; region_label: string; patriotism_points: number }[];
  approved_elder_stories: number;
  broadcast_ready: boolean;
}

export interface GalaCeremony {
  event_title: string;
  live_mode: boolean;
  youth_finalists: (LeaderboardEntry & { gala_nominated?: boolean })[];
  elder_finalists: ElderRadioEntry[];
  total_certificates: number;
  total_connections: number;
  average_patriotism_score: number;
  ceremony_message: string;
}

export interface RewardDisbursement {
  id: string;
  participant_name: string;
  participant_phone: string;
  amount_tzs: number;
  reward_type: 'airtime' | 'mpesa';
  status: 'pending' | 'processing' | 'sent' | 'failed';
  source: string;
  reference: string;
  created_at_label: string;
}

export interface PlatformStatus {
  api_online: boolean;
  youth_registered: number;
  seed_peers_ready: boolean;
  quiz_questions: number;
  pending_reports: number;
  demo_ready: boolean;
  message: string;
}

export interface UserReward {
  id: string;
  amount_tzs: number;
  reward_type: 'airtime' | 'mpesa';
  status: 'pending' | 'processing' | 'sent' | 'failed';
  source: string;
  created_at_label: string;
}

export interface MyRewardsSummary {
  rewards: UserReward[];
  pending_total_tzs: number;
  sent_total_tzs: number;
}

export interface RadioBroadcastScript {
  station_name: string;
  segment_title: string;
  broadcast_ready: boolean;
  script_sw: string;
  script_en: string;
  nominees: ElderRadioEntry[];
}

export interface OralStory {
  id: string;
  title: string;
  author_name: string;
  body: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at_label: string;
}

export interface UssdResponse {
  session_id: string;
  lines: string[];
  suggestions: string[];
  points: number;
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
    institution_code?: string;
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

  match(token: string, demoMatch = false) {
    return request<MatchResponse>(
      '/matching/match',
      { method: 'POST', body: JSON.stringify({ demo_match: demoMatch }) },
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

  getLeaderboard(limit = 10, region?: 'bara' | 'visiwani', includeGala = false) {
    const regionQ = region ? `&region=${region}` : '';
    const galaQ = includeGala ? '&include_gala=1' : '';
    return request<LeaderboardEntry[]>(`/leaderboard/youth?limit=${limit}${regionQ}${galaQ}`);
  },

  getPlatformStatus() {
    return request<PlatformStatus>('/platform/status');
  },

  toggleGalaNominee(participantId: string, nominated: boolean) {
    return request<{ participant_id: string; nominated: boolean }>(
      `/admin/gala/${participantId}`,
      { method: 'POST', body: JSON.stringify({ nominated }) },
    );
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

  submitOralStory(responses: string[], token: string) {
    return request<OralStory>(
      '/stories/submit',
      { method: 'POST', body: JSON.stringify({ responses }) },
      token,
    );
  },

  getAdminStories(status: 'pending' | 'approved' | 'rejected' = 'pending') {
    return request<OralStory[]>(`/admin/stories?status=${status}`);
  },

  resolveStory(storyId: string, action: 'approve' | 'reject') {
    return request<OralStory>(`/admin/stories/${storyId}/resolve`, {
      method: 'POST',
      body: JSON.stringify({ action }),
    });
  },

  ussdSession(text: string, sessionId?: string | null) {
    return request<UssdResponse>('/channels/ussd/session', {
      method: 'POST',
      body: JSON.stringify({ text, session_id: sessionId ?? undefined }),
    });
  },

  getInstitutions(code?: string) {
    const q = code ? `?code=${encodeURIComponent(code)}` : '';
    return request<Institution[]>(`/institutions${q}`);
  },

  submitElderStory(data: {
    title: string;
    body: string;
    contributor_name?: string;
    audio_url?: string;
    video_url?: string;
  }, token: string) {
    return request<ElderStory>('/elders/submit', {
      method: 'POST',
      body: JSON.stringify(data),
    }, token);
  },

  getElderStories() {
    return request<ElderStory[]>('/elders/stories');
  },

  getElderRadioTop10() {
    return request<ElderRadioEntry[]>('/elders/radio-top10');
  },

  getRadioBroadcastScript() {
    return request<RadioBroadcastScript>('/partner/radio-script');
  },

  getOralStoriesArchive() {
    return request<OralStory[]>('/stories/archive');
  },

  getMyRewards(token: string) {
    return request<MyRewardsSummary>('/users/me/rewards', {}, token);
  },

  getMyCertificates(token: string) {
    return request<Certificate[]>('/certificates/mine', {}, token);
  },

  certificatePdfUrl(certCode: string, token: string) {
    return `${API_V1}/certificates/${encodeURIComponent(certCode)}/pdf`;
  },

  async downloadCertificatePdf(certCode: string, token: string) {
    const res = await fetch(`${API_V1}/certificates/${encodeURIComponent(certCode)}/pdf`, {
      headers: { 'X-Session-Token': token },
    });
    if (!res.ok) throw new ApiError('PDF download failed', res.status);
    return res.blob();
  },

  getPartnerDashboard() {
    return request<PartnerDashboard>('/partner/dashboard');
  },

  getRadioPartner() {
    return request<RadioPartnerData>('/partner/radio');
  },

  getGalaCeremony() {
    return request<GalaCeremony>('/gala/ceremony');
  },

  getAdminElders(status: 'pending' | 'approved' | 'rejected' = 'pending') {
    return request<ElderStory[]>(`/admin/elders?status=${status}`);
  },

  resolveElderStory(storyId: string, action: 'approve' | 'reject') {
    return request<ElderStory>(`/admin/elders/${storyId}/resolve`, {
      method: 'POST',
      body: JSON.stringify({ action }),
    });
  },

  toggleElderRadio(storyId: string, nominated: boolean) {
    return request<ElderStory>(`/admin/elders/${storyId}/radio`, {
      method: 'POST',
      body: JSON.stringify({ nominated }),
    });
  },

  getAdminRewards(status = 'pending') {
    return request<RewardDisbursement[]>(`/admin/rewards?status=${status}`);
  },

  disburseReward(rewardId: string, action: 'send' | 'processing' | 'fail') {
    return request<RewardDisbursement>(`/admin/rewards/${rewardId}/disburse`, {
      method: 'POST',
      body: JSON.stringify({ action }),
    });
  },
};
