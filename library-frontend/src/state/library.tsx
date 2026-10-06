import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import type { Book, Reservation } from '@/types/book';
import { authApi, type User, type Registration, type GoogleRegistration } from '@/services/auth-api';
import { booksApi, setBookSessionToken } from '@/services/books-api';
export type Filters = { category: string; available: boolean };
type PendingGoogle = { credential: string; name: string; email: string };
type Library = { user: User | null; login: (email: string, password: string) => Promise<void>; loginWithGoogle: (credential: string) => Promise<boolean>; pendingGoogle: PendingGoogle | null; completeGoogleRegistration: (details: GoogleRegistration) => Promise<void>; clearGoogleRegistration: () => void; register: (details: Registration) => Promise<void>; logout: () => Promise<void>; demo: boolean; query: string; setQuery: (value: string) => void; filters: Filters; setFilters: (value: Filters) => void; books: Book[]; holds: Reservation[]; name: string; list: () => Promise<Book[]>; listHolds: () => Promise<Reservation[]>; reserve: (id: string, date: string, window: string) => Promise<Reservation>; cancel: (id: string) => Promise<void>; confirmation: Reservation | null };
const Context = createContext<Library | null>(null);
export function LibraryProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [pendingGoogle, setPendingGoogle] = useState<PendingGoogle | null>(null);
  const demo = false;
  const [name, setName] = useState('');
  const [books, setBooks] = useState<Book[]>([]), [holds, setHolds] = useState<Reservation[]>([]);
  const [query, setQuery] = useState(''), [filters, setFilters] = useState<Filters>({ category: 'All', available: false });
  const [confirmation, setConfirmation] = useState<Reservation | null>(null);
  const list = useCallback(async () => { const data = (await booksApi.list()).books; setBooks(data); return data; }, []);
  const listHolds = useCallback(async () => { const data = (await booksApi.reservations()).reservations; setHolds(data); return data; }, []);
  async function reserve(id: string, date: string, window: string) {
    const result = (await booksApi.reserve(id, date, window)).reservation;
    setConfirmation(result);
    return result;
  }
  async function cancel(id: string) { await booksApi.cancel(id); setHolds(current => current.filter(h => h.reservationId !== id)); }
  function acceptSession(session: { user: User; token: string }) { setBookSessionToken(session.token); setUser(session.user); setName(session.user.name); setBooks([]); setHolds([]); setConfirmation(null); setQuery(''); setFilters({ category: 'All', available: false }); }
  async function login(email: string, password: string) { acceptSession(await authApi.login(email, password)); }
  async function loginWithGoogle(credential: string) {
    const result = await authApi.google(credential);
    if ('registrationRequired' in result) { setPendingGoogle({ credential, ...result.profile }); return false; }
    setPendingGoogle(null); acceptSession(result); return true;
  }
  async function completeGoogleRegistration(details: GoogleRegistration) { acceptSession(await authApi.googleRegister(details)); setPendingGoogle(null); }
  function clearGoogleRegistration() { setPendingGoogle(null); }
  async function register(details: Registration) { acceptSession(await authApi.register(details)); }
  async function logout() { if (user) await authApi.logout(); setBookSessionToken(null); setUser(null); setName(''); setBooks([]); setHolds([]); setConfirmation(null); }
  return <Context.Provider value={{ user, login, loginWithGoogle, pendingGoogle, completeGoogleRegistration, clearGoogleRegistration, register, logout, demo, query, setQuery, filters, setFilters, books, holds, name, list, listHolds, reserve, cancel, confirmation }}>{children}</Context.Provider>;
}
export function useLibrary() { const value = useContext(Context); if (!value) throw new Error('LibraryProvider required'); return value; }
export function useFilteredBooks() { const { books, query, filters } = useLibrary(); return useMemo(() => books.filter(b => (!filters.available || b.available) && (filters.category === 'All' || b.category === filters.category) && (b.title + ' ' + b.author + ' ' + b.category + ' ' + b.isbn).toLowerCase().includes(query.trim().toLowerCase())), [books, query, filters]); }
