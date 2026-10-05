import { request } from './books-api';
export type User = { id: string; name: string; email: string; studentId: string; department: string };
export type Registration = { name: string; studentId: string; department: string; email: string; password: string; acceptedTerms: boolean };
type Session = { token: string; user: User; expiresAt: string };
export const authApi = { login: (email: string, password: string) => request<Session>('/auth/login', 'POST', { email, password }), register: (details: Registration) => request<Session>('/auth/register', 'POST', details), me: () => request<{ user: User }>('/auth/me'), logout: () => request('/auth/logout', 'POST') };
