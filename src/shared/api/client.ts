import { ENV } from '../config/env';

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  fieldErrors?: Record<string, string>;
  status: number;
}

const ERROR_TRANSLATIONS: Record<string, string> = {
  'invalid input': 'Некорректный ввод',
  'invalid request body': 'Некорректный формат запроса',
  'wrong email or password': 'Неверный email или пароль',
  'invalid credentials': 'Неверный email или пароль',
  'user not found': 'Пользователь не найден',
  'user already exists': 'Этот email уже зарегистрирован',
  'internal error': 'Внутренняя ошибка сервера',
  'invalid email format': 'Некорректный формат электронной почты',
  'password must be at least 8 characters long': 'Пароль должен содержать минимум 8 символов',
  'password must contain at least one digit': 'Пароль должен содержать хотя бы одну цифру',
  'password must contain at least one latin letter': 'Пароль должен содержать хотя бы одну латинскую букву',
  'password contains forbidden characters': 'Пароль может содержать только латинские буквы, цифры и _',
  'name cannot be empty': 'Имя не может быть пустым',
  'name must be at least 2 characters long': 'Имя должно содержать минимум 2 символа',
  'name contains invalid characters': 'Имя содержит недопустимые символы',
  'invalid current password': 'Неверный текущий пароль',
  'current password is required': 'Введите текущий пароль',
  'new password must be different': 'Новый пароль должен отличаться от текущего',
  'unsupported file type': 'Поддерживаются только изображения JPG, PNG, WEBP и GIF',
  'file too big': 'Размер файла не должен превышать 5 МБ',
  'failed to get file': 'Не удалось прочитать выбранный файл',
  'invalid or missing csrf token': 'Ошибка безопасности (CSRF). Обновите страницу и попробуйте снова',
};

function getCookieValue(name: string): string {
  if (typeof document === 'undefined') return '';
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : '';
}

async function ensureCsrfToken(): Promise<string> {
  const existing = getCookieValue('csrf_token');
  if (existing) return existing;
  try {
    const res = await fetch(`${ENV.API_URL}/csrf`, { credentials: 'include' });
    if (res.ok) {
      const data = await res.json();
      return data?.csrf_token || getCookieValue('csrf_token');
    }
  } catch {
    // ignore network error
  }
  return getCookieValue('csrf_token');
}

export function translateError(msg?: string): string {
  if (!msg) return 'Произошла ошибка';
  return ERROR_TRANSLATIONS[msg] || msg;
}

async function request<T>(
  endpoint: string,
  method = 'GET',
  body?: unknown,
  customHeaders: Record<string, string> = {}
): Promise<ApiResponse<T>> {
  const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;
  const headers: Record<string, string> = isFormData
    ? { ...customHeaders }
    : { 'Content-Type': 'application/json', ...customHeaders };

  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method.toUpperCase())) {
    const csrfToken = await ensureCsrfToken();
    if (csrfToken) {
      headers['X-CSRF-Token'] = csrfToken;
    }
  }

  const config: RequestInit = {
    method,
    headers,
    credentials: 'include',
  };

  if (body !== undefined && body !== null) {
    config.body = isFormData ? (body as FormData) : JSON.stringify(body);
  }

  try {
    const response = await fetch(`${ENV.API_URL}${endpoint}`, config);
    const contentType = response.headers.get('content-type') || '';

    let data: any = null;
    if (contentType.includes('application/json')) {
      try {
        data = await response.json();
      } catch {
        data = null;
      }
    } else {
      const text = await response.text();
      data = text ? { message: text } : null;
    }

    if (response.ok) {
      return {
        success: true,
        data: data as T,
        status: response.status,
      };
    }

    const rawError = data?.error || data?.message || 'Ошибка запроса';
    return {
      success: false,
      data: data as T,
      error: translateError(rawError),
      status: response.status,
    };
  } catch {
    return {
      success: false,
      error: 'Не удалось соединиться с сервером',
      status: 0,
    };
  }
}

export const apiClient = {
  get: <T>(endpoint: string) => request<T>(endpoint, 'GET'),
  post: <T>(endpoint: string, body?: unknown) => request<T>(endpoint, 'POST', body),
  put: <T>(endpoint: string, body?: unknown) => request<T>(endpoint, 'PUT', body),
  patch: <T>(endpoint: string, body?: unknown) => request<T>(endpoint, 'PATCH', body),
  delete: <T>(endpoint: string) => request<T>(endpoint, 'DELETE'),
};
