import React, { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  LogOut,
  FileText,
  Heart,
  Settings,
  Plus,
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
} from 'lucide-react';
import { useAuth } from '@/app/providers/AuthContext';
import { useFavorites } from '@/app/providers/FavoritesContext';
import { BrandLogo } from '@/shared/ui/BrandLogo';
import { Button } from '@/shared/ui/Button';
import { Alert } from '@/shared/ui/Alert';
import { ProfileHeroCard } from '@/features/profile/ProfileHeroCard';
import { EditProfileForm } from '@/features/profile/EditProfileForm';
import { ChangePasswordForm } from '@/features/profile/ChangePasswordForm';
import { User } from '@/entities/user/model';
import { Ad, WalletData } from '@/entities/ad/model';
import { adApi } from '@/entities/ad/api';
import { AdCard } from '@/entities/ad/ui/AdCard';

type ProfileTab = 'ads' | 'favorites' | 'wallet' | 'settings';

export const ProfilePage: React.FC = () => {
  const { user, setUser, refreshProfile, logout } = useAuth();
  const { favorites: favAds, isLoading: loadingFavs, refreshFavorites } = useFavorites();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<ProfileTab>('ads');
  const [myAds, setMyAds] = useState<Ad[]>([]);
  const [loadingAds, setLoadingAds] = useState(true);
  const [wallet, setWallet] = useState<WalletData>({ balance: 0, transactions: [] });
  const [topUpLoading, setTopUpLoading] = useState(false);
  const [walletNotice, setWalletNotice] = useState('');

  const loadMyAds = useCallback(async () => {
    setLoadingAds(true);
    const res = await adApi.getMyAds();
    if (res.success && Array.isArray(res.data)) {
      setMyAds(res.data);
    }
    setLoadingAds(false);
  }, []);

  const loadWallet = useCallback(async () => {
    const res = await adApi.getWallet();
    if (res.success && res.data) {
      setWallet(res.data);
    }
  }, []);

  useEffect(() => {
    void refreshProfile();
    void loadMyAds();
    void refreshFavorites();
    void loadWallet();
  }, [refreshProfile, loadMyAds, refreshFavorites, loadWallet]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const handleUserUpdated = (updated: User) => {
    setUser((prev) => ({ ...(prev || {}), ...updated }));
  };

  const handleTopUp = async (amount: number) => {
    setTopUpLoading(true);
    const res = await adApi.topUpWallet(amount);
    setTopUpLoading(false);
    if (res.success && res.data) {
      setWallet((prev) => ({
        balance: res.data!.balance,
        transactions: [res.data!.transaction, ...prev.transactions],
      }));
      setWalletNotice(`Кошелёк пополнен на ${amount.toLocaleString('ru-RU')} ₽ (демо-режим)`);
      setTimeout(() => setWalletNotice(''), 3000);
    }
  };

  if (!user) return null;

  const tabs: { id: ProfileTab; label: string; icon: React.ElementType; badge?: string }[] = [
    { id: 'ads', label: 'Мои объявления', icon: FileText, badge: String(myAds.length) },
    { id: 'favorites', label: 'Избранное', icon: Heart, badge: String(favAds.length) },
    {
      id: 'wallet',
      label: 'Кошелёк',
      icon: Wallet,
      badge: `${wallet.balance.toLocaleString('ru-RU')} ₽`,
    },
    { id: 'settings', label: 'Настройки', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50/50 via-slate-50 to-violet-50/50 py-7 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <header className="flex items-center justify-between bg-white/90 backdrop-blur-md border border-slate-200/80 rounded-2xl px-5 py-3.5 shadow-sm">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-700 hover:text-indigo-600 px-3.5 py-2 rounded-xl bg-slate-100/80 hover:bg-indigo-50 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>К объявлениям</span>
          </Link>

          <div className="hidden sm:flex items-center gap-2.5">
            <BrandLogo size="sm" />
          </div>

          <Button variant="danger" size="sm" onClick={handleLogout}>
            <LogOut className="w-4 h-4" />
            <span>Выйти</span>
          </Button>
        </header>

        <ProfileHeroCard
          user={user}
          onUserUpdated={handleUserUpdated}
          adsCountOverride={myAds.length}
          favoritesCountOverride={favAds.length}
          onSelectTab={setActiveTab}
        />

        <div className="flex flex-wrap items-center justify-between gap-3 bg-white rounded-2xl border border-slate-200/80 p-2 shadow-sm">
          <div className="flex flex-wrap items-center gap-1.5">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/25'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                  {tab.badge && (
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                        isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <Link to="/ads/new">
            <Button variant="secondary" size="sm">
              <Plus className="w-4 h-4" />
              <span>Разместить объявление</span>
            </Button>
          </Link>
        </div>

        {activeTab === 'ads' && (
          <section className="space-y-4">
            {loadingAds ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-64 bg-white rounded-2xl border border-slate-200 animate-pulse" />
                ))}
              </div>
            ) : myAds.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {myAds.map((ad) => (
                  <AdCard key={ad.id} ad={ad} />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-3xl border border-dashed border-slate-300 p-12 text-center space-y-3">
                <p className="text-base font-bold text-slate-800">У вас пока нет объявлений</p>
                <p className="text-sm text-slate-500">
                  Опубликуйте первое объявление — оно сразу появится в общем каталоге и здесь
                </p>
                <div className="pt-2">
                  <Link to="/ads/new">
                    <Button variant="primary">
                      <Plus className="w-4 h-4" />
                      <span>Создать объявление</span>
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </section>
        )}

        {activeTab === 'favorites' && (
          <section className="space-y-4">
            {loadingFavs ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-64 bg-white rounded-2xl border border-slate-200 animate-pulse" />
                ))}
              </div>
            ) : favAds.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {favAds.map((ad) => (
                  <AdCard key={ad.id} ad={ad} />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-3xl border border-dashed border-slate-300 p-12 text-center space-y-3">
                <p className="text-base font-bold text-slate-800">В избранном пока пусто</p>
                <p className="text-sm text-slate-500">
                  Нажимайте на сердечко на карточках товаров, чтобы сохранить их сюда
                </p>
                <div className="pt-2">
                  <Link to="/">
                    <Button variant="primary">Перейти к объявлениям</Button>
                  </Link>
                </div>
              </div>
            )}
          </section>
        )}

        {activeTab === 'wallet' && (
          <section className="space-y-5">
            {walletNotice && <Alert type="success" message={walletNotice} />}

            <div className="bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 rounded-3xl p-6 sm:p-8 text-white shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-indigo-200">
                  Демо-кошелёк Лавки
                </div>
                <div className="text-4xl font-extrabold mt-1">
                  {wallet.balance.toLocaleString('ru-RU')} ₽
                </div>
                <p className="text-xs text-indigo-100 mt-1.5">
                  Используйте баланс для платного продвижения ваших объявлений
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {[500, 1000, 3000].map((sum) => (
                  <button
                    key={sum}
                    type="button"
                    disabled={topUpLoading}
                    onClick={() => handleTopUp(sum)}
                    className="px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 border border-white/20 text-sm font-bold transition-all disabled:opacity-50"
                  >
                    +{sum.toLocaleString('ru-RU')} ₽
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 space-y-4">
              <h3 className="text-base font-bold text-slate-900">История операций</h3>
              {wallet.transactions.length > 0 ? (
                <div className="divide-y divide-slate-100">
                  {wallet.transactions.map((tx) => {
                    const isTopUp = tx.amount > 0;
                    return (
                      <div key={tx.id} className="py-3.5 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                              isTopUp
                                ? 'bg-emerald-50 text-emerald-600'
                                : 'bg-amber-50 text-amber-600'
                            }`}
                          >
                            {isTopUp ? (
                              <ArrowDownLeft className="w-4 h-4" />
                            ) : (
                              <ArrowUpRight className="w-4 h-4" />
                            )}
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-slate-800">
                              {tx.description}
                            </div>
                            <div className="text-xs text-slate-400">
                              {new Date(tx.created_at).toLocaleString('ru-RU')}
                            </div>
                          </div>
                        </div>
                        <div
                          className={`text-sm font-extrabold ${
                            isTopUp ? 'text-emerald-600' : 'text-slate-900'
                          }`}
                        >
                          {isTopUp ? '+' : ''}
                          {tx.amount.toLocaleString('ru-RU')} ₽
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-slate-500">Операций пока нет.</p>
              )}
            </div>
          </section>
        )}

        {activeTab === 'settings' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <EditProfileForm user={user} onUserUpdated={handleUserUpdated} />
            <ChangePasswordForm />
          </div>
        )}
      </div>
    </div>
  );
};
