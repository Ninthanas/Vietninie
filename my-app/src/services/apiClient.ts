export async function apiClient<T>(
  url: string,
  options: RequestInit = {},
): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options.headers },
    signal: options.signal || AbortSignal.timeout(120000),
  });
  const data = await response.json();
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
