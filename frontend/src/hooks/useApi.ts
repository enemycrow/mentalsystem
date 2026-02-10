import { useState, useCallback } from 'react';
import api from '../services/api';

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export function useApi<T = unknown>() {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const get = useCallback(async (path: string) => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const res = await api.get<T>(path);
      setState({ data: res.data, loading: false, error: null });
      return res.data;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'An error occurred';
      setState((s) => ({ ...s, loading: false, error: msg }));
      throw err;
    }
  }, []);

  const post = useCallback(async (path: string, body?: unknown) => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const res = await api.post<T>(path, body);
      setState({ data: res.data, loading: false, error: null });
      return res.data;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'An error occurred';
      setState((s) => ({ ...s, loading: false, error: msg }));
      throw err;
    }
  }, []);

  const put = useCallback(async (path: string, body?: unknown) => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const res = await api.put<T>(path, body);
      setState({ data: res.data, loading: false, error: null });
      return res.data;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'An error occurred';
      setState((s) => ({ ...s, loading: false, error: msg }));
      throw err;
    }
  }, []);

  const del = useCallback(async (path: string) => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const res = await api.del<T>(path);
      setState({ data: res.data, loading: false, error: null });
      return res.data;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'An error occurred';
      setState((s) => ({ ...s, loading: false, error: msg }));
      throw err;
    }
  }, []);

  return {
    ...state,
    get,
    post,
    put,
    del,
  };
}
