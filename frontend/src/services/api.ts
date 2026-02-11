const BASE_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV ? 'http://localhost:3000/api' : '/api');

interface ApiResponse<T = unknown> {
  data: T;
  status: number;
  ok: boolean;
}

type ErrorPayload =
  | { error?: { code?: string; message?: string } }
  | { error?: string }
  | { message?: string }
  | Record<string, unknown>;

function extractErrorMessage(data: unknown, status: number): string {
  if (data && typeof data === 'object') {
    const payload = data as ErrorPayload;
    if (
      typeof payload.error === 'object' &&
      payload.error !== null &&
      'message' in payload.error &&
      typeof payload.error.message === 'string'
    ) {
      return payload.error.message;
    }
    if (typeof payload.error === 'string') {
      return payload.error;
    }
    if ('message' in payload && typeof payload.message === 'string') {
      return payload.message;
    }
  }
  return `Request failed with status ${status}`;
}

async function request<T = unknown>(
  method: string,
  path: string,
  body?: unknown,
): Promise<ApiResponse<T>> {
  const token = localStorage.getItem('token');

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config: RequestInit = {
    method,
    headers,
  };

  if (body !== undefined) {
    config.body = JSON.stringify(body);
  }

  const res = await fetch(`${BASE_URL}${path}`, config);

  if (res.status === 401) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
    throw new Error('Unauthorized');
  }

  let data: T;
  const text = await res.text();
  try {
    data = text ? JSON.parse(text) : ({} as T);
  } catch {
    data = text as unknown as T;
  }

  if (!res.ok) {
    throw new Error(extractErrorMessage(data, res.status));
  }

  return { data, status: res.status, ok: res.ok };
}

const api = {
  get: <T = unknown>(path: string) => request<T>('GET', path),
  post: <T = unknown>(path: string, body?: unknown) =>
    request<T>('POST', path, body),
  put: <T = unknown>(path: string, body?: unknown) =>
    request<T>('PUT', path, body),
  del: <T = unknown>(path: string) => request<T>('DELETE', path),
};

export type { ApiResponse };
export default api;
