// Production API base URL — override with EXPO_PUBLIC_API_URL in .env
export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, '') || 'http://127.0.0.1:8000';

export const API_V1 = `${API_BASE_URL}/api/v1`;
