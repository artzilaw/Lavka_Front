const USERNAME_REGEX = /^[\p{L}a-zA-Z0-9_\s'-]+$/u;
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const LETTER_REGEX = /[a-zA-Z]/;
const DIGIT_REGEX = /[0-9]/;
const FORBIDDEN_PASSWORD_REGEX = /[^a-zA-Z0-9_]/;

export const VALIDATION_LIMITS = {
  USERNAME_MIN_LENGTH: 2,
  PASSWORD_MIN_LENGTH: 8,
};

export function validateName(name: string): string | null {
  const trimmed = name.trim();
  if (!trimmed) return 'Имя обязательно для заполнения';
  if (trimmed.length < VALIDATION_LIMITS.USERNAME_MIN_LENGTH) {
    return `Имя должно содержать минимум ${VALIDATION_LIMITS.USERNAME_MIN_LENGTH} символа`;
  }
  if (!USERNAME_REGEX.test(trimmed)) {
    return 'Имя содержит недопустимые символы';
  }
  return null;
}

export function validateEmail(email: string): string | null {
  const trimmed = email.trim();
  if (!trimmed) return 'Электронная почта обязательна';
  if (!EMAIL_REGEX.test(trimmed)) return 'Некорректный формат электронной почты';
  return null;
}

export function validatePassword(password: string): string | null {
  if (!password) return 'Пароль обязателен';
  if (password.length < VALIDATION_LIMITS.PASSWORD_MIN_LENGTH) {
    return `Пароль должен содержать минимум ${VALIDATION_LIMITS.PASSWORD_MIN_LENGTH} символов`;
  }
  if (FORBIDDEN_PASSWORD_REGEX.test(password)) {
    return 'Разрешены только латинские буквы, цифры и нижнее подчёркивание';
  }
  if (!LETTER_REGEX.test(password)) {
    return 'Пароль должен содержать хотя бы одну латинскую букву';
  }
  if (!DIGIT_REGEX.test(password)) {
    return 'Пароль должен содержать хотя бы одну цифру';
  }
  return null;
}
