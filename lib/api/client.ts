export const API_BASE_URL = 'https://frontend-task-chatapp.onrender.com/api';
export const SOCKET_BASE_URL = 'https://frontend-task-chatapp.onrender.com';

export class ApiError extends Error {
  status: number;
  code?: string;
  details?: unknown;

  constructor(message: string, status: number, code?: string, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

let getAuthToken: () => string | null = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('chatterbox_token');
  }
  return null;
};

export const setAuthTokenGetter = (fn: () => string | null) => {
  getAuthToken = fn;
};

export async function apiClient<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAuthToken();
  const headers = new Headers(options.headers || {});

  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;

  const res = await fetch(url, {
    ...options,
    headers,
  });

  if (!res.ok) {
    let errorData: any = {};
    try {
      errorData = await res.json();
    } catch {
      // response wasn't JSON
    }

    const message = errorData?.error?.message || errorData?.message || `HTTP ${res.status}: ${res.statusText}`;
    const code = errorData?.error?.code || errorData?.code;
    const details = errorData?.error?.details || errorData?.details;

    throw new ApiError(message, res.status, code, details);
  }

  return res.json() as Promise<T>;
}
