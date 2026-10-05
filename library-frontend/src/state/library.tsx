import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import seed from '@/data/demo-books.json';
import type { Book, Reservation } from '@/types/book';
import { booksApi } from '@/services/books-api';
export type Filters = { category: string; available: boolean };
type Library = { demo: boolean; setDemo: (value: boolean) => void; query: string; setQuery: (value: string) => void; filters: Filters; setFilters: (value: Filters) => void; books: Book[]; holds: Reservation[]; name: string; startDemo: (name?: string) => void; list: () => Promise<Book[]>; listHolds: () => Promise<Reservation[]>; reserve: (id: string, date: string, window: string) => Promise<Reservation>; cancel: (id: string) => Promise<void>; confirmation: Reservation | null };
const Context = createContext<Library | null>(null);
export function LibraryProvider({ children }: { children: ReactNode }) {
  const [demo, setDemo] = useState(false), [name, setName] = useState('Alex Morgan');
  const [books, setBooks] = useState<Book[]>([]), [holds, setHolds] = useState<Reservation[]>([]);
  const [query, setQuery] = useState(''), [filters, setFilters] = useState<Filters>({ category: 'All', available: false });
  const [confirmation, setConfirmation] = useState<Reservation | null>(null);
  const list = useCallback(async () => { if (demo) return books; const data = (await booksApi.list()).books; setBooks(data); return data; }, [demo, books]);
  const listHolds = useCallback(async () => { if (demo) return holds; const data = (await booksApi.reservations()).reservations; setHolds(data); return data; }, [demo, holds]);
  async function reserve(id: string, date: string, window: string) {
    let result: Reservation;
    if (demo) { const book = books.find(b => b.id === id); if (!book?.available || holds.some(h => h.id === id)) throw new Error('This book is unavailable or you already reserved it.'); result = { ...book, copies: book.copies - 1, available: book.copies > 1, reservationId: 'demo-' + Date.now(), pickupCode: 'DEMO-' + String(Date.now()).slice(-6), pickupDate: date, pickupWindow: window }; setBooks(current => current.map(b => b.id === id ? { ...b, copies: result.copies, available: result.available } : b)); setHolds(current => [...current, result]); }
    else { result = (await booksApi.reserve(id, date, window)).reservation; } setConfirmation(result); return result;
  }
  async function cancel(id: string) { if (!demo) await booksApi.cancel(id); else { const hold = holds.find(h => h.reservationId === id); if (hold) setBooks(current => current.map(b => b.id === hold.id ? { ...b, copies: b.copies + 1, available: true } : b)); } setHolds(current => current.filter(h => h.reservationId !== id)); }
  function startDemo(nextName = 'Alex Morgan') { setName(nextName); setDemo(true); setBooks(seed); setHolds([]); setConfirmation(null); setQuery(''); setFilters({category:'All',available:false}); }
  return <Context.Provider value={{ demo, setDemo: (value) => { setDemo(value); if (!value) { setBooks([]); setHolds([]); setConfirmation(null); } }, query, setQuery, filters, setFilters, books, holds, name, startDemo, list, listHolds, reserve, cancel, confirmation }}>{children}</Context.Provider>;
}
export function useLibrary() { const value = useContext(Context); if (!value) throw new Error('LibraryProvider required'); return value; }
export function useFilteredBooks() { const { books, query, filters } = useLibrary(); return useMemo(() => books.filter(b => (!filters.available || b.available) && (filters.category === 'All' || b.category === filters.category) && (b.title + ' ' + b.author + ' ' + b.category + ' ' + b.isbn).toLowerCase().includes(query.trim().toLowerCase())), [books, query, filters]); }
