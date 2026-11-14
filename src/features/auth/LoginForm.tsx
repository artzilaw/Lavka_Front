import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail } from 'lucide-react';
import { useAuth } from '@/app/providers/AuthContext';
import { userApi } from '@/entities/user/api';
import { validateEmail } from '@/shared/lib/validators';
import { Input } from '@/shared/ui/Input';
import { PasswordInput } from '@/shared/ui/PasswordInput';
import { Button } from '@/shared/ui/Button';
import { Alert } from '@/shared/ui/Alert';

export const LoginForm: React.FC = () => {
  const { setUser } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});
  const [generalError, setGeneralError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});
    setGeneralError('');

    const emailErr = validateEmail(email);
    if (emailErr || !password) {
      setFieldErrors({
        email: emailErr || undefined,
        password: !password ? 'Введите пароль' : undefined,
      });
      return;
    }

    setIsLoading(true);
    const res = await userApi.login(email, password);
    setIsLoading(false);

    if (res.success && res.data) {
      setUser(res.data);
      navigate('/');
      return;
    }

    setGeneralError(res.error || 'Неверный email или пароль');
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      {generalError && <Alert type="error" message={generalError} />}

      <Input
        id="login-email"
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
        id="login-password"
        label="Пароль"
        placeholder="Введите ваш пароль"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        error={fieldErrors.password}
        autoComplete="current-password"
      />

      <div className="pt-2">
        <Button type="submit" variant="primary" size="lg" fullWidth isLoading={isLoading}>
          Войти в аккаунт
        </Button>
      </div>

      <p className="text-center text-sm text-slate-500 pt-4 border-t border-slate-100">
        Ещё нет аккаунта?{' '}
        <Link to="/register" className="font-semibold text-indigo-600 hover:text-indigo-500">
          Зарегистрироваться
        </Link>
      </p>
    </form>
  );
};
