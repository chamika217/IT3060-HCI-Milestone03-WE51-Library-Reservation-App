/**
 * api.ts — typed fetch wrapper for the Library Reservation backend.
 *
 * Base URL note:
 *   • Simulator / web:   http://localhost:5000/api  ← works as-is
 *   • Physical device (Expo Go on the same Wi-Fi):
 *       replace 'localhost' with your machine's LAN IP, e.g.
 *       http://192.168.1.42:5000/api
 *     You can find your LAN IP with:
 *       Windows → ipconfig  (look for IPv4 Address)
 *       Mac/Linux → ifconfig | grep "inet "
 *
 * Auth:
 *   initAuth() is called automatically on the first request that needs a userId.
 *   It logs in with TEST_EMAIL/TEST_PASSWORD, caches the token + userId, and
 *   never needs updating when seed.js re-creates the user.
 *   Once a real login screen exists, replace initAuth() with setAuthToken().
 */

import {
  Notification,
  ApiUserProfile,
  ApiNotificationPreferences,
  ProfileUpdatePayload,
  PasswordChangePayload,
  ContactMessagePayload,
  ApiContactMessage,
  AuthResponse,
  LoginPayload,
  RegisterPayload,
} from '@/features/notifications/types';
import { TEST_EMAIL, TEST_PASSWORD } from '@/constants/testAuth';

// ─── Configuration ────────────────────────────────────────────────────────────

export const API_BASE_URL = 'http://localhost:5000/api';
// ↑ IMPORTANT: When testing on a physical device via Expo Go, change
//   'localhost' to your development machine's LAN IP address.
//   Expo Go runs on the phone — it cannot resolve 'localhost' to your laptop.
//   Example: 'http://192.168.1.42:5000/api'
//   Find your LAN IP: Windows → run `ipconfig`, look for "IPv4 Address".

// ─── Auth state ───────────────────────────────────────────────────────────────

let _authToken: string | null = null;
let _userId:    string | null = null;
let _initPromise: Promise<void> | null = null;

/**
 * initAuth — logs in with test credentials and caches token + userId.
 * Called automatically; safe to call multiple times (runs only once).
 * Re-runs if the token is cleared (e.g. after sign-out).
 */
async function initAuth(): Promise<void> {
  if (_authToken && _userId) return; // already initialised
  if (_initPromise) return _initPromise; // in-flight — wait for it

  _initPromise = (async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: TEST_EMAIL, password: TEST_PASSWORD }),
      });
      const data = await res.json() as AuthResponse;
      if (!res.ok) throw new Error((data as { message?: string }).message ?? 'Login failed');
      _authToken = data.token;
      _userId    = String(data.user.id);
    } finally {
      _initPromise = null; // allow retry on failure
    }
  })();

  return _initPromise;
}

/**
 * getAuthUserId — returns the cached userId, auto-logging in if needed.
 * Use this in every screen instead of TEST_USER_ID.
 */
export async function getAuthUserId(): Promise<string> {
  await initAuth();
  if (!_userId) throw new Error('Could not determine user ID after login.');
  return _userId;
}

export function setAuthToken(token: string) {
  _authToken = token;
}

export function clearAuthToken() {
  _authToken = null;
  _userId    = null;
}

// ─── Core fetch helper ────────────────────────────────────────────────────────

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  // Ensure we have a token before making any authenticated request
  await initAuth();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> | undefined),
  };

  if (_authToken) {
    headers['Authorization'] = `Bearer ${_authToken}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  // Parse JSON regardless of status so we can read the error message
  let data: unknown;
  try {
    data = await response.json();
  } catch {
    // Non-JSON response (e.g. 404 HTML from a misconfigured proxy)
    throw new Error(`Server returned ${response.status} with a non-JSON body.`);
  }

  if (!response.ok) {
    const msg =
      (data as { message?: string })?.message ??
      `Request failed with status ${response.status}`;
    throw new Error(msg);
  }

  return data as T;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

/** POST /api/auth/login */
export async function login(payload: LoginPayload): Promise<AuthResponse> {
  const res = await request<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  setAuthToken(res.token);
  return res;
}

/** POST /api/auth/register */
export async function register(payload: RegisterPayload): Promise<AuthResponse> {
  const res = await request<AuthResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  setAuthToken(res.token);
  return res;
}

// ─── Notifications ────────────────────────────────────────────────────────────

/**
 * GET /api/notifications/:userId
 * Optional type filter: 'book' | 'seat' | 'system'
 * Returns the array mapped to the frontend Notification shape.
 */
export async function getNotifications(
  userId: string,
  type?: 'book' | 'seat' | 'system',
): Promise<Notification[]> {
  const query = type ? `?type=${type}` : '';
  return request<Notification[]>(`/notifications/${userId}${query}`);
}

/**
 * GET /api/notifications/detail/:id
 * Returns a single Notification in the frontend shape.
 */
export async function getNotificationDetail(id: string): Promise<Notification> {
  return request<Notification>(`/notifications/detail/${id}`);
}

/**
 * PUT /api/notifications/:id/read
 * Marks one notification as read.
 */
export async function markNotificationRead(
  id: string,
): Promise<{ message: string; notification: Notification }> {
  return request(`/notifications/${id}/read`, { method: 'PUT' });
}

/**
 * PUT /api/notifications/:userId/read-all
 * Marks every notification for the user as read.
 */
export async function markAllNotificationsRead(
  userId: string,
): Promise<{ message: string; updated: number }> {
  return request(`/notifications/${userId}/read-all`, { method: 'PUT' });
}

// ─── Users / Profile ──────────────────────────────────────────────────────────

/**
 * GET /api/users/:id
 * Returns the full user profile (no password field).
 */
export async function getUserProfile(userId: string): Promise<ApiUserProfile> {
  return request<ApiUserProfile>(`/users/${userId}`);
}

/**
 * PUT /api/users/:id
 * Updates fullName, email, phone, program, semester (not studentId).
 */
export async function updateUserProfile(
  userId: string,
  data: ProfileUpdatePayload,
): Promise<{ message: string; user: ApiUserProfile }> {
  return request(`/users/${userId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

/**
 * PUT /api/users/:id/preferences
 * Saves notification preference toggles.
 */
export async function updateNotificationPreferences(
  userId: string,
  prefs: Partial<ApiNotificationPreferences>,
): Promise<{ message: string; notificationPreferences: ApiNotificationPreferences }> {
  return request(`/users/${userId}/preferences`, {
    method: 'PUT',
    body: JSON.stringify(prefs),
  });
}

/**
 * PUT /api/users/:id/password
 * Changes the user's password after verifying the old one.
 */
export async function changePassword(
  userId: string,
  payload: PasswordChangePayload,
): Promise<{ message: string }> {
  return request(`/users/${userId}/password`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

// ─── Contact ──────────────────────────────────────────────────────────────────

/**
 * POST /api/contact
 * Submits a message to library staff.
 */
export async function sendContactMessage(
  data: ContactMessagePayload,
): Promise<{ message: string; id: string }> {
  return request('/contact', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * GET /api/contact/:userId
 * Returns the user's past contact messages, newest first.
 */
export async function getContactMessages(
  userId: string,
): Promise<ApiContactMessage[]> {
  return request<ApiContactMessage[]>(`/contact/${userId}`);
}
