import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, User as UserIcon } from 'lucide-react';
import { useAuth } from '@/app/providers/AuthContext';
import { userApi } from '@/entities/user/api';
import { translateError } from '@/shared/api/client';
import { validateName, validateEmail, validatePassword } from '@/shared/lib/validators';
import { Input } from '@/shared/ui/Input';
import { PasswordInput } from '@/shared/ui/PasswordInput';
import { Button } from '@/shared/ui/Button';
import { Alert } from '@/shared/ui/Alert';

export const RegisterForm: React.FC = () => {
  const { setUser } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [fieldErrors, setFieldErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});
  const [generalError, setGeneralError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});
    setGeneralError('');

    const errors: typeof fieldErrors = {};
    const nameErr = validateName(name);
    if (nameErr) errors.name = nameErr;

    const emailErr = validateEmail(email);
    if (emailErr) errors.email = emailErr;

    const passErr = validatePassword(password);
    if (passErr) errors.password = passErr;

    if (password !== confirmPassword) {
      errors.confirmPassword = 'Пароли не совпадают';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setIsLoading(true);
    const res = await userApi.register(name, email, password);
    setIsLoading(false);

    if (res.success && res.data) {
      setUser(res.data);
      navigate('/');
      return;
    }

    if (res.data && (res.data.name || res.data.email || res.data.password)) {
      setFieldErrors({
        name: res.data.name ? translateError(res.data.name) : undefined,
        email: res.data.email ? translateError(res.data.email) : undefined,
        password: res.data.password ? translateError(res.data.password) : undefined,
      });
      return;
    }

    setGeneralError(res.error || 'Не удалось создать аккаунт');
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      {generalError && <Alert type="error" message={generalError} />}

      <Input
        id="register-name"
        type="text"
        label="Ваше имя"
        placeholder="Например, Георгий"
        value={name}
        onChange={(e) => setName(e.target.value)}
        error={fieldErrors.name}
        icon={<UserIcon className="w-4 h-4" />}
        autoComplete="name"
      />

      <Input
        id="register-email"
        type="email"
        label="Электронная почта"
        placeholder="example@mail.ru"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={fieldErrors.email}
        icon={<Mail className="w-4 h-4" />}
        autoComplete="email"
      />

      <PasswordInput
        id="register-password"
        label="Пароль"
        placeholder="Минимум 8 символов, буквы и цифры"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        error={fieldErrors.password}
        autoComplete="new-password"
      />

      <PasswordInput
        id="register-confirm-password"
        label="Подтверждение пароля"
        placeholder="Повторите пароль"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        error={fieldErrors.confirmPassword}
        autoComplete="new-password"
      />

      <div className="pt-2">
        <Button type="submit" variant="primary" size="lg" fullWidth isLoading={isLoading}>
          Создать аккаунт
        </Button>
      </div>

      <p className="text-center text-sm text-slate-500 pt-4 border-t border-slate-100">
        Уже есть аккаунт?{' '}
        <Link to="/login" className="font-semibold text-indigo-600 hover:text-indigo-500">
          Войти
        </Link>
      </p>
    </form>
  );
};
