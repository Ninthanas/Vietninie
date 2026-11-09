const allowed =
  /^sentruc_(learned|favorites)_(zh|vi)$|^sentruc_daily_log$|^vietninie_react_quiz_history$/;
export function exportProgress() {
  const data: Record<string, string> = {};
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && allowed.test(key)) data[key] = localStorage.getItem(key) || '';
  }
  return JSON.stringify({ version: 1, data }, null, 2);
}
export function importProgress(text: string) {
  const parsed = JSON.parse(text);
  if (parsed.version !== 1 || !parsed.data || typeof parsed.data !== 'object')
    throw new Error('Tệp không hợp lệ');
  const entries = Object.entries(parsed.data).filter(([key]) =>
    allowed.test(key),
  );
  if (!entries.length) throw new Error('Tệp không có tiến độ phù hợp');
  for (const [key, value] of entries) {
    if (typeof value !== 'string') throw new Error('Giá trị không hợp lệ');
    const payload = JSON.parse(value);
    if (key.includes('learned') || key.includes('favorites')) {
      if (!Array.isArray(payload) || payload.some((x) => !Number.isFinite(x)))
        throw new Error('Danh sách từ không hợp lệ');
    } else if (key === 'sentruc_daily_log') {
      if (
        typeof payload !== 'object' ||
        Array.isArray(payload) ||
        payload === null ||
        Object.values(payload).some(
          (x) => typeof x !== 'number' || !Number.isFinite(x) || x < 0,
        )
      )
        throw new Error('Nhật ký không hợp lệ');
    } else if (
      !Array.isArray(payload) ||
      payload.some(
        (x) =>
          !x ||
          typeof x.date !== 'string' ||
          !Number.isFinite(x.score) ||
          !Number.isFinite(x.total) ||
          !['zh', 'vi'].includes(x.language),
      )
    )
      throw new Error('Kết quả không hợp lệ');
  }
  for (const [key, value] of entries) localStorage.setItem(key, String(value));
}
