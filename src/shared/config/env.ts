const isLocalhost =
  typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

export const ENV = {
  API_BASE_URL: isLocalhost ? 'http://localhost:8000' : 'http://lavka-go.ru:8000',
  get API_URL() {
    return `${this.API_BASE_URL}/api/v1`;
  },
};

export function resolveMediaUrl(path?: string | null, fallback = '/images/logo/avatar.svg'): string {
  if (!path) return fallback;
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  return `${ENV.API_BASE_URL}${path}`;
}
