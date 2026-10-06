import { useEffect, useState, useCallback } from 'react';
import api, { errMsg } from './api';

export default function useLoad(path: string, params: Record<string, any> = {}, pollMs = 0) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const key = JSON.stringify(params);

  const load = useCallback(async () => {
    try {
      const r = await api.get(path, { params: JSON.parse(key) });
      setData(r.data); setError('');
    } catch (e) { setError(errMsg(e)); }
    finally { setLoading(false); }
  }, [path, key]);

  useEffect(() => {
    load();
    if (!pollMs) return undefined;
    const t = setInterval(load, pollMs);
    return () => clearInterval(t);
  }, [load, pollMs]);

  return { data, loading, error, reload: load };
}
