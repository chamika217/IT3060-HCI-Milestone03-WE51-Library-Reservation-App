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
 * Requests use the active sign-in token shared with the book API client.
 */

import type {
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
  ApiFaqFeedback,
  FaqFeedbackPayload,
} from '@/features/notifications/types';
import { API_BASE_URL as SHARED_API_BASE_URL, setBookSessionToken } from './books-api';

// ─── Configuration ────────────────────────────────────────────────────────────

export const API_BASE_URL = SHARED_API_BASE_URL;
// ↑ IMPORTANT: When testing on a physical device via Expo Go, change
//   'localhost' to your development machine's LAN IP address.
//   Expo Go runs on the phone — it cannot resolve 'localhost' to your laptop.
//   Example: 'http://192.168.1.42:5000/api'
//   Find your LAN IP: Windows → run `ipconfig`, look for "IPv4 Address".

// ─── Auth state ───────────────────────────────────────────────────────────────

let _authToken: string | null = null;
let _userId:    string | null = null;

/**
 * Resolve the signed-in user's id using the current app session.
 */
export async function getAuthUserId(): Promise<string> {
  if (!_userId) {
    const result = await request<{ user: { id: string } }>('/auth/me');
    _userId = result.user.id;
  }
  return _userId;
}

export function setAuthToken(token: string, userId?: string) {
  _authToken = token;
  _userId = userId ?? null;
  setBookSessionToken(token);
}

export function clearAuthToken() {
  _authToken = null;
  _userId    = null;
  setBookSessionToken(null);
}

// ─── Core fetch helper ────────────────────────────────────────────────────────

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
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

// ─── Notifications — new CRUD operations ─────────────────────────────────────

/**
 * PUT /api/notifications/:id/unread
 * Sets isRead back to false.
 */
export async function markNotificationUnread(
  id: string,
): Promise<{ message: string; notification: Notification }> {
  return request(`/notifications/${id}/unread`, { method: 'PUT' });
}

/**
 * DELETE /api/notifications/:id
 * Permanently removes a notification.
 */
export async function deleteNotification(
  id: string,
): Promise<{ message: string }> {
  return request(`/notifications/${id}`, { method: 'DELETE' });
}

// ─── FAQ Feedback ─────────────────────────────────────────────────────────────

/**
 * POST /api/faq
 * Submits (or updates) a helpful/not-helpful rating for one FAQ.
 */
export async function submitFaqFeedback(
  faqId: string,
  helpful: boolean,
): Promise<{ message: string; feedback: ApiFaqFeedback }> {
  const payload: FaqFeedbackPayload = { faqId, helpful };
  return request('/faq', { method: 'POST', body: JSON.stringify(payload) });
}

/**
 * GET /api/faq/:userId
 * Returns all feedback entries for the user so rated FAQs can be pre-populated.
 */
export async function getFaqFeedback(
  userId: string,
): Promise<ApiFaqFeedback[]> {
  return request<ApiFaqFeedback[]>(`/faq/${userId}`);
}

/**
 * DELETE /api/faq/:id
 * Removes a feedback entry so the user can undo their rating.
 */
export async function deleteFaqFeedback(
  id: string,
): Promise<{ message: string }> {
  return request(`/faq/${id}`, { method: 'DELETE' });
}

// ─── Contact — new CRUD operation ────────────────────────────────────────────

/**
 * DELETE /api/contact/:id
 * Removes one of the user's own past contact messages.
 */
export async function deleteContactMessage(
  id: string,
): Promise<{ message: string }> {
  return request(`/contact/${id}`, { method: 'DELETE' });
}
