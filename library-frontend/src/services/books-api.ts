import { Platform } from 'react-native';
import type { Book, Reservation } from '@/types/book';
const base = (process.env.EXPO_PUBLIC_API_URL || (Platform.OS === 'android' ? 'http://10.0.2.2:5000/api' : 'http://localhost:5000/api')).replace(/\/$/, '');
let sessionToken: string | null = null;
// Call after login; clear on logout. The auth feature owns secure persistence.
export function setBookSessionToken(token: string | null) { sessionToken = token; }
async function request<T>(path: string, method = 'GET', body?: unknown): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 10000);
  try {
    const response = await fetch(base + path, { method, signal: controller.signal,
      headers: { 'Content-Type': 'application/json', ...(sessionToken ? { Authorization: `Bearer ${sessionToken}` } : {}) },
      ...(body ? { body: JSON.stringify(body) } : {}) });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Request failed.');
    return data;
  } finally { clearTimeout(timer); }
}
export const booksApi = {
  list: () => request<{ books: Book[] }>('/books'),
  detail: (id: string) => request<{ book: Book }>('/books/' + encodeURIComponent(id)),
  reservations: () => request<{ reservations: Reservation[] }>('/reservations'),
  reserve: (bookId: string, pickupDate: string, pickupWindow: string) => request<{ reservation: Reservation }>('/reservations', 'POST', { bookId, pickupDate, pickupWindow }),
  cancel: (id: string) => request('/reservations/' + encodeURIComponent(id), 'DELETE'),
};
