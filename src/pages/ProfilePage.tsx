import React, { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  LogOut,
  Plus,
  ShoppingCart,
  Store,
  Edit3,
  Archive,
  RotateCcw,
  Trash2,
  Eye,
} from 'lucide-react';
import { useAuth } from '@/app/providers/AuthContext';
import { useCart } from '@/app/providers/CartContext';
import { BrandLogo } from '@/shared/ui/BrandLogo';
import { Button } from '@/shared/ui/Button';
import { ProfileHeroCard } from '@/features/profile/ProfileHeroCard';
import { EditProfileForm } from '@/features/profile/EditProfileForm';
import { ChangePasswordForm } from '@/features/profile/ChangePasswordForm';
import { User } from '@/entities/user/model';
import { Ad } from '@/entities/ad/model';
import { adApi } from '@/entities/ad/api';
import { resolveMediaUrl } from '@/shared/config/env';

export const ProfilePage: React.FC = () => {
  const { user, setUser, refreshProfile, logout } = useAuth();
  const { totalItems } = useCart();
  const navigate = useNavigate();

  const [myAds, setMyAds] = useState<Ad[]>([]);
  const [adsLoading, setAdsLoading] = useState(true);

  const loadMyAds = useCallback(async () => {
    setAdsLoading(true);
    const res = await adApi.getMyAds();
    if (res.success && Array.isArray(res.data)) {
      setMyAds(res.data);
    }
    setAdsLoading(false);
  }, []);

  useEffect(() => {
    refreshProfile();
    loadMyAds();
  }, [refreshProfile, loadMyAds]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const handleUserUpdated = (updated: User) => {
    setUser((prev) => ({ ...(prev || {}), ...updated }));
  };

  const handleToggleClose = async (ad: Ad) => {
    const res = ad.status === 'active' ? await adApi.close(ad.id) : await adApi.reopen(ad.id);
    if (res.success && res.data) {
      setMyAds((prev) => prev.map((item) => (item.id === ad.id ? res.data! : item)));
    }
  };

  const handleDeleteAd = async (ad: Ad) => {
    if (!window.confirm(`Удалить объявление «${ad.title}»?`)) return;
    const res = await adApi.remove(ad.id);
    if (res.success) {
      setMyAds((prev) => prev.filter((item) => item.id !== ad.id));
      refreshProfile();
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50/50 via-slate-50 to-violet-50/50 py-7 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <header className="flex flex-wrap items-center justify-between gap-3 bg-white/90 backdrop-blur-md border border-slate-200/80 rounded-2xl px-5 py-3.5 shadow-sm">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-700 hover:text-indigo-600 px-3.5 py-2 rounded-xl bg-slate-100/80 hover:bg-indigo-50 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>К объявлениям</span>
          </Link>

          <div className="hidden md:flex items-center gap-2.5">
            <BrandLogo size="sm" />
          </div>

          <div className="flex items-center gap-2">
            <Link to={`/sellers/${user.id}`}>
              <Button variant="outline" size="sm">
                <Store className="w-4 h-4" />
                <span className="hidden sm:inline">Страница продавца</span>
              </Button>
            </Link>
            <Link to="/cart">
              <Button variant="secondary" size="sm">
                <ShoppingCart className="w-4 h-4" />
                <span className="hidden sm:inline">Корзина ({totalItems})</span>
              </Button>
            </Link>
            <Button variant="danger" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Выйти</span>
            </Button>
          </div>
        </header>

        <ProfileHeroCard user={user} onUserUpdated={handleUserUpdated} />

        <section className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-extrabold text-slate-900">Мои объявления</h2>
              <p className="text-xs text-slate-500">
                Создавайте, редактируйте, закрывайте и удаляйте свои объявления
              </p>
            </div>
            <Link to="/ads/new">
              <Button variant="primary" size="sm">
                <Plus className="w-4 h-4" />
                <span>Разместить объявление</span>
              </Button>
            </Link>
          </div>

          {adsLoading ? (
            <p className="text-sm text-slate-500 py-4">Загружаем ваши объявления...</p>
          ) : myAds.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center space-y-2">
              <p className="text-sm font-bold text-slate-700">У вас пока нет объявлений</p>
              <p className="text-xs text-slate-500">
                Опубликуйте первое объявление, чтобы оно появилось в каталоге Лавки
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {myAds.map((ad) => (
                <div
                  key={ad.id}
                  className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <Link
                      to={`/ads/${ad.id}`}
                      className="w-20 h-16 rounded-xl overflow-hidden bg-slate-100 shrink-0"
                    >
                      <img
                        src={resolveMediaUrl(ad.photos?.[0], '/images/logo/logo.svg')}
                        alt={ad.title}
                        onError={(e) => {
                          e.currentTarget.src = '/images/logo/logo.svg';
                        }}
                        className="w-full h-full object-cover"
                      />
                    </Link>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Link
                          to={`/ads/${ad.id}`}
                          className="text-sm font-extrabold text-slate-900 hover:text-indigo-600 truncate"
                        >
                          {ad.title}
                        </Link>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            ad.status === 'active'
                              ? 'bg-emerald-50 text-emerald-700'
                              : ad.status === 'sold'
                                ? 'bg-indigo-50 text-indigo-700'
                                : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {ad.status === 'active'
                            ? 'Активно'
                            : ad.status === 'sold'
                              ? 'Продано'
                              : 'Закрыто'}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                        <span className="font-bold text-slate-800">
                          {ad.price === 0 ? 'Бесплатно' : `${ad.price.toLocaleString('ru-RU')} ₽`}
                        </span>
                        <span>•</span>
                        <span>{ad.location}</span>
                        <span>•</span>
                        <span className="inline-flex items-center gap-1">
                          <Eye className="w-3.5 h-3.5" />
                          {ad.views_count}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <Link to={`/ads/${ad.id}/edit`}>
                      <Button variant="outline" size="sm">
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Изменить</span>
                      </Button>
                    </Link>
                    {ad.status !== 'sold' && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleToggleClose(ad)}
                      >
                        {ad.status === 'active' ? (
                          <>
                            <Archive className="w-3.5 h-3.5" />
                            <span>Закрыть</span>
                          </>
                        ) : (
                          <>
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Открыть</span>
                          </>
                        )}
                      </Button>
                    )}
                    <Button variant="danger" size="sm" onClick={() => handleDeleteAd(ad)}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <EditProfileForm user={user} onUserUpdated={handleUserUpdated} />
          <ChangePasswordForm />
        </div>
      </div>
    </div>
  );
};
