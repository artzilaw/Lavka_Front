import React, { useState } from 'react';
import { ShieldCheck, KeyRound } from 'lucide-react';
import { userApi } from '@/entities/user/api';
import { validatePassword } from '@/shared/lib/validators';
import { PasswordInput } from '@/shared/ui/PasswordInput';
import { Button } from '@/shared/ui/Button';
import { Alert } from '@/shared/ui/Alert';

export const ChangePasswordForm: React.FC = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  const [fieldErrors, setFieldErrors] = useState<{
    currentPassword?: string;
    newPassword?: string;
    confirmNewPassword?: string;
  }>({});
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});
    setStatus(null);

    const errors: typeof fieldErrors = {};
    if (!currentPassword) {
      errors.currentPassword = 'Введите текущий пароль';
    }

    const pwdErr = validatePassword(newPassword);
    if (pwdErr) {
      errors.newPassword = pwdErr;
    } else if (currentPassword && currentPassword === newPassword) {
      errors.newPassword = 'Новый пароль должен отличаться от текущего';
    }

    if (newPassword !== confirmNewPassword) {
      errors.confirmNewPassword = 'Пароли не совпадают';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setIsLoading(true);
    const res = await userApi.changePassword(currentPassword, newPassword);
    setIsLoading(false);

    if (res.success) {
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
      setStatus({ type: 'success', message: 'Пароль успешно изменён!' });
      setTimeout(() => setStatus(null), 3500);
      return;
    }

    if (res.fieldErrors && (res.fieldErrors.currentPassword || res.fieldErrors.newPassword)) {
      setFieldErrors(res.fieldErrors);
      return;
    }

    setStatus({
      type: 'error',
      message: res.error || 'Не удалось изменить пароль',
    });
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 sm:p-7 flex flex-col">
      <div className="flex items-center gap-3.5 pb-5 mb-6 border-b border-slate-100">
        <div className="w-11 h-11 rounded-2xl bg-violet-50 border border-violet-100 text-violet-600 flex items-center justify-center shrink-0">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-base font-bold text-slate-900">Безопасность и пароль</h2>
          <p className="text-xs text-slate-500">Минимум 8 символов, латинские буквы и цифры</p>
        </div>
      </div>

      {status && <Alert type={status.type} message={status.message} className="mb-4" />}

      <form onSubmit={handleSubmit} noValidate className="space-y-4 flex-1 flex flex-col">
        <PasswordInput
          id="current-password"
          label="Текущий пароль"
          placeholder="Введите текущий пароль"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          error={fieldErrors.currentPassword}
          autoComplete="current-password"
        />

        <PasswordInput
          id="new-password"
          label="Новый пароль"
          placeholder="Минимум 8 символов"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          error={fieldErrors.newPassword}
          autoComplete="new-password"
        />

        <PasswordInput
          id="confirm-new-password"
          label="Подтвердите новый пароль"
          placeholder="Повторите новый пароль"
          value={confirmNewPassword}
          onChange={(e) => setConfirmNewPassword(e.target.value)}
          error={fieldErrors.confirmNewPassword}
          autoComplete="new-password"
        />

        <div className="pt-3 mt-auto">
          <Button type="submit" variant="secondary" fullWidth isLoading={isLoading}>
            <KeyRound className="w-4 h-4" />
            <span>Обновить пароль</span>
          </Button>
        </div>
      </form>
    </div>
  );
};
