import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { resolveApiUrl } from './api-url';
import type { Book, Reservation } from '@/types/book';
const base = resolveApiUrl(process.env.EXPO_PUBLIC_API_URL, Platform.OS, __DEV__, Constants.expoConfig?.hostUri);
let sessionToken: string | null = null;
// Call after login; clear on logout. The auth feature owns secure persistence.
export function setBookSessionToken(token: string | null) { sessionToken = token; }
export async function request<T>(path: string, method = 'GET', body?: unknown): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 10000);
  try {
    const response = await fetch(base + path, { method, signal: controller.signal,
      headers: { 'Content-Type': 'application/json', ...(sessionToken ? { Authorization: `Bearer ${sessionToken}` } : {}) },
      ...(body ? { body: JSON.stringify(body) } : {}) });
    const data = await response.json().catch(() => ({ message: 'The server returned an invalid response.' }));
    if (!response.ok) throw new Error(data.message || 'Request failed.');
    return data;
  } catch (error) { if (error instanceof Error && (error.name === 'AbortError' || /failed to fetch|fetch failed|network request failed|ConnectException/i.test(error.message))) throw new Error('Cannot reach the library server. Make sure the server is running and your phone and computer are on the same Wi-Fi.'); throw error; } finally { clearTimeout(timer); }
}
export const booksApi = {
  list: () => request<{ books: Book[] }>('/books'),
  detail: (id: string) => request<{ book: Book }>('/books/' + encodeURIComponent(id)),
  reservations: () => request<{ reservations: Reservation[] }>('/reservations'),
  reserve: (bookId: string, pickupDate: string, pickupWindow: string) => request<{ reservation: Reservation }>('/reservations', 'POST', { bookId, pickupDate, pickupWindow }),
  updateReservation: (id: string, pickupDate: string, pickupWindow: string) => request<{ reservation: Reservation }>('/reservations/' + encodeURIComponent(id), 'PATCH', { pickupDate, pickupWindow }),
  cancel: (id: string) => request('/reservations/' + encodeURIComponent(id), 'DELETE'),
};
