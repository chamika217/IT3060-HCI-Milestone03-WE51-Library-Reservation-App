/**
 * admin/api.ts — axios replaced with native fetch so the app runs without
 * installing the axios package (blocked by network policy on this machine).
 * The exported interface is identical to what the admin screens expect.
 */
import { Platform } from 'react-native';

const getHost = () => {
  const envHost = process.env.EXPO_PUBLIC_API_HOST;
  if (envHost && envHost.trim()) return envHost.trim();
  return Platform.OS === 'web' ? 'localhost' : '192.168.1.40';
};

const HOST = getHost();
export const BASE_URL = `http://${HOST}:5000/api/admin`;

let token: string | null = null;
export const setToken = (t: string | null) => { token = t; };

// Minimal axios-compatible fetch wrapper
const api = {
  get: (url: string, config?: { params?: Record<string, string> }) => {
    const query = config?.params
      ? '?' + new URLSearchParams(config.params).toString()
      : '';
    return fetchRequest('GET', `${BASE_URL}${url}${query}`);
  },
  post: (url: string, data?: unknown) =>
    fetchRequest('POST', `${BASE_URL}${url}`, data),
  put: (url: string, data?: unknown) =>
    fetchRequest('PUT', `${BASE_URL}${url}`, data),
  patch: (url: string, data?: unknown) =>
    fetchRequest('PATCH', `${BASE_URL}${url}`, data),
  delete: (url: string) =>
    fetchRequest('DELETE', `${BASE_URL}${url}`),
};

async function fetchRequest(method: string, url: string, data?: unknown) {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(url, {
    method,
    headers,
    body: data !== undefined ? JSON.stringify(data) : undefined,
  });

  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(json?.message || `Request failed: ${res.status}`) as Error & { response: { data: unknown } };
    err.response = { data: json };
    throw err;
  }
  return { data: json, status: res.status };
}

export const errMsg = (e: unknown): string => {
  if (e && typeof e === 'object') {
    const err = e as { response?: { data?: { message?: string } }; message?: string };
    return err?.response?.data?.message || err?.message || 'Something went wrong';
  }
  return 'Something went wrong';
};

export default api;
