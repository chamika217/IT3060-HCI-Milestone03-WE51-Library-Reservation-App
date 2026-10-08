import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { booksApi } from '@/services/books-api';
import type { Book } from '@/types/book';
export function useBooks() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [revision, setRevision] = useState(0);
  useFocusEffect(useCallback(() => {
    let active = true;
    setLoading(true); setError('');
    booksApi.list().then(data => { if (active) setBooks(data.books); })
      .catch(() => { if (active) setError('Cannot load the catalogue. Check your connection and try again.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
    // revision deliberately restarts loading when the user chooses Retry.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [revision]));
  return { books, loading, error, retry: () => setRevision(value => value + 1) };
}
