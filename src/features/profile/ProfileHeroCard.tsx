import React, { useRef, useState } from 'react';
import { Camera, Calendar, FileText, MessageSquare, Star, Heart } from 'lucide-react';
import { User } from '@/entities/user/model';
import { userApi } from '@/entities/user/api';
import { resolveMediaUrl } from '@/shared/config/env';
import { Alert } from '@/shared/ui/Alert';

interface ProfileHeroCardProps {
  user: User;
  onUserUpdated: (updated: User) => void;
}

export const ProfileHeroCard: React.FC<ProfileHeroCardProps> = ({ user, onUserUpdated }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [avatarBust, setAvatarBust] = useState<number>(0);
  const [statusMessage, setStatusMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setStatusMessage(null);
    setIsUploading(true);
    const res = await userApi.uploadAvatar(file);
    setIsUploading(false);
    e.target.value = '';

    if (res.success && res.data) {
      onUserUpdated(res.data);
      setAvatarBust(Date.now());
      setStatusMessage({ type: 'success', text: 'Аватар успешно обновлён!' });
      setTimeout(() => setStatusMessage(null), 3500);
      return;
    }

    setStatusMessage({
      type: 'error',
      text: res.error || 'Не удалось загрузить изображение',
    });
  };

  const baseAvatarUrl = resolveMediaUrl(user.avatar_path);
  const avatarSrc =
    avatarBust && user.avatar_path ? `${baseAvatarUrl}?t=${avatarBust}` : baseAvatarUrl;

  const registeredDate = user.created_at
    ? new Date(user.created_at).toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : 'сегодня';

  const stats = [
    {
      label: 'Объявлений',
      value: user.ads_count ?? 0,
      icon: FileText,
      color: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    },
    {
      label: 'Отзывов',
      value: user.reviews_count ?? 0,
      icon: MessageSquare,
      color: 'bg-violet-50 text-violet-600 border-violet-100',
    },
    {
      label: 'Рейтинг',
      value: (user.rating && user.rating > 0 ? user.rating : 5.0).toFixed(1),
      icon: Star,
      color: 'bg-amber-50 text-amber-600 border-amber-100',
    },
    {
      label: 'В избранном',
      value: user.favorites_count ?? 0,
      icon: Heart,
      color: 'bg-rose-50 text-rose-600 border-rose-100',
    },
  ];

  return (
    <div className="space-y-4">
      <div className="relative bg-white rounded-3xl border border-slate-200/80 shadow-md overflow-hidden">
        <div className="h-24 bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600" />

        <div className="px-6 sm:px-8 pb-7">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 -mt-12">
            <div className="flex flex-col sm:flex-row sm:items-end gap-5">
              <div className="relative w-28 h-28 shrink-0">
                <img
                  src={avatarSrc}
                  alt={user.name}
                  onError={(e) => {
                    e.currentTarget.src = '/images/logo/avatar.svg';
                  }}
                  className="w-28 h-28 rounded-3xl object-cover ring-4 ring-white shadow-lg bg-indigo-50"
                />
                <button
                  type="button"
                  disabled={isUploading}
                  onClick={() => fileInputRef.current?.click()}
                  title="Изменить фото профиля"
                  className="absolute -bottom-1.5 -right-1.5 w-9 h-9 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center ring-4 ring-white shadow-md transition-transform hover:scale-105 disabled:opacity-60"
                >
                  <Camera className="w-4 h-4" />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>

              <div className="pt-2 sm:pb-1">
                <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                  {user.name}
                </h1>
                <p className="text-sm font-medium text-slate-500 mt-0.5">{user.email}</p>
              </div>
            </div>

            <div className="inline-flex items-center gap-2 self-start sm:self-end px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-xs font-semibold text-indigo-700">
              <Calendar className="w-3.5 h-3.5" />
              <span>На Лавке с {registeredDate}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 mt-7 pt-6 border-t border-slate-100">
            {stats.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.label}
                  className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-slate-50/70 border border-slate-100 hover:border-slate-200 hover:bg-white transition-all"
                >
                  <div
                    className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${item.color}`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-lg font-extrabold text-slate-900 leading-tight">
                      {item.value}
                    </div>
                    <div className="text-xs font-medium text-slate-500">{item.label}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {statusMessage && <Alert type={statusMessage.type} message={statusMessage.text} />}
    </div>
  );
};
