export function getApiBase(): string {
  const meta = import.meta as unknown as { env?: { VITE_API_URL?: string } };
  const envBase = meta?.env?.VITE_API_URL
    ? String(meta.env.VITE_API_URL).trim().replace(/\/$/, '')
    : '';

  // Для Docker/Nginx по умолчанию используем relative proxy (/api -> backend).
  return envBase || '';
}

export function buildApiUrl(path: string): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const base = getApiBase();
  return `${base}${normalizedPath}`;
}
