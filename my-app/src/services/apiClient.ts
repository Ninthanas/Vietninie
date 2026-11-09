import { env } from '../config/env';
import { useAuthStore } from '../features/auth/store';

export async function apiClient<T>(
  url: string,
  options: RequestInit = {},
): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set('Content-Type', 'application/json');
  const backendRequest =
    Boolean(env.apiUrl) && url.startsWith(env.apiUrl + '/');
  const token = useAuthStore.getState().user?.access_token;
  if (
    backendRequest &&
    token &&
    !url.startsWith(env.apiUrl + '/api/data/') &&
    !headers.has('Authorization')
  )
    headers.set('Authorization', 'Bearer ' + token);
  const response = await fetch(url, {
    ...options,
    headers,
    signal: options.signal || AbortSignal.timeout(120000),
  });
  if (response.status === 204) return undefined as T;
  const data = await response.json();
  if (
    response.status === 401 &&
    backendRequest &&
    headers.get('Authorization') ===
      'Bearer ' + useAuthStore.getState().user?.access_token
  )
    useAuthStore.getState().setUser(null);
  if (!response.ok)
    throw new Error(
      typeof data.error === 'string'
        ? data.error
        : typeof data.detail === 'string'
          ? data.detail
          : 'Không thể kết nối. Vui lòng thử lại.',
    );
  return data as T;
}
