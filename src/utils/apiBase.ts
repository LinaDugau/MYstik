function normalizeBase(raw: string): string {
  return raw.trim().replace(/\/$/, '');
}

/**
 * 1) `window.__MYSTIK_API_URL__` из `public/mystik-api-config.js` — срабатывает на Timeweb Static,
 *    если VITE_API_URL не попал в сборку (Docker build без ARG/ENV).
 * 2) `VITE_API_URL` из `import.meta.env` — Docker/Nginx и локальная сборка с .env.
 * 3) Пусто — относительные URL (прокси /api на том же хосте).
 */
export function getApiBase(): string {
  if (typeof window !== 'undefined') {
    const w = window as Window & { __MYSTIK_API_URL__?: string };
    const runtime = w.__MYSTIK_API_URL__;
    if (typeof runtime === 'string' && normalizeBase(runtime).length > 0) {
      return normalizeBase(runtime);
    }
  }

  const meta = import.meta as unknown as { env?: { VITE_API_URL?: string } };
  const envBase = meta?.env?.VITE_API_URL
    ? normalizeBase(String(meta.env.VITE_API_URL))
    : '';

  return envBase || '';
}

export function buildApiUrl(path: string): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const base = getApiBase();
  return `${base}${normalizedPath}`;
}
