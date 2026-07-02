// Production API base URL — override with EXPO_PUBLIC_API_URL in .env / Railway variables
const PRODUCTION_API = 'https://kivuko-api-production.up.railway.app';

function resolveApiBaseUrl(): string {
  const fromEnv = process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, '');
  if (fromEnv) return fromEnv;

  if (typeof window !== 'undefined' && window.location.hostname.endsWith('.railway.app')) {
    return PRODUCTION_API;
  }

  return 'http://127.0.0.1:8000';
}

export const API_BASE_URL = resolveApiBaseUrl();
export const API_V1 = `${API_BASE_URL}/api/v1`;
