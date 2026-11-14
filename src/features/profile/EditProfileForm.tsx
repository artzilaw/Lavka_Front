import React, { useState, useEffect } from 'react';
import { User as UserIcon, Mail, Save } from 'lucide-react';
import { User } from '@/entities/user/model';
import { userApi } from '@/entities/user/api';
import { validateName, validateEmail } from '@/shared/lib/validators';
import { Input } from '@/shared/ui/Input';
import { Button } from '@/shared/ui/Button';
import { Alert } from '@/shared/ui/Alert';

interface EditProfileFormProps {
  user: User;
  onUserUpdated: (updated: User) => void;
}

export const EditProfileForm: React.FC<EditProfileFormProps> = ({ user, onUserUpdated }) => {
  const [name, setName] = useState(user.name || '');
  const [email, setEmail] = useState(user.email || '');
  const [fieldErrors, setFieldErrors] = useState<{ name?: string; email?: string }>({});
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setName(user.name || '');
    setEmail(user.email || '');
  }, [user.name, user.email]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});
    setStatus(null);

    const nameErr = validateName(name);
    const emailErr = validateEmail(email);

    if (nameErr || emailErr) {
      setFieldErrors({
        name: nameErr || undefined,
        email: emailErr || undefined,
      });
      return;
    }

    setIsLoading(true);
    const res = await userApi.updateProfile(name, email);
    setIsLoading(false);

    if (res.success && res.data) {
      onUserUpdated(res.data);
      setStatus({ type: 'success', message: 'Личные данные успешно обновлены!' });
      setTimeout(() => setStatus(null), 3500);
      return;
    }

    if (res.fieldErrors && (res.fieldErrors.name || res.fieldErrors.email)) {
      setFieldErrors(res.fieldErrors);
      return;
    }

    setStatus({
      type: 'error',
      message: res.error || 'Не удалось сохранить изменения',
    });
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 sm:p-7 flex flex-col">
      <div className="flex items-center gap-3.5 pb-5 mb-6 border-b border-slate-100">
        <div className="w-11 h-11 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
          <UserIcon className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-base font-bold text-slate-900">Личные данные</h2>
          <p className="text-xs text-slate-500">Обновите ваше имя или адрес электронной почты</p>
        </div>
      </div>

      {status && <Alert type={status.type} message={status.message} className="mb-4" />}

      <form onSubmit={handleSubmit} noValidate className="space-y-4 flex-1 flex flex-col">
        <Input
          id="profile-name"
          type="text"
          label="Имя пользователя"
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={fieldErrors.name}
          icon={<UserIcon className="w-4 h-4" />}
          placeholder="Ваше имя"
        />

        <Input
          id="profile-email"
          type="email"
          label="Электронная почта"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={fieldErrors.email}
          icon={<Mail className="w-4 h-4" />}
          placeholder="example@mail.ru"
        />

        <div className="pt-3 mt-auto">
          <Button type="submit" variant="primary" fullWidth isLoading={isLoading}>
            <Save className="w-4 h-4" />
            <span>Сохранить изменения</span>
          </Button>
        </div>
      </form>
    </div>
  );
};
