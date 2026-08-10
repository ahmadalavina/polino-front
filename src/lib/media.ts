const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? '';

export function resolveMediaUrl(path?: string) {
  if (!path) return '';

  if (/^(https?:|data:|blob:)/i.test(path)) return path;

  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return API_BASE_URL
    ? `${API_BASE_URL.replace(/\/$/, '')}${normalizedPath}`
    : normalizedPath;
}
