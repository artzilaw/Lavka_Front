import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  MapPin,
  Search,
  Plus,
  LogOut,
  ShieldCheck,
  Truck,
  Briefcase,
  Heart,
  ShoppingCart,
  WifiOff,
} from 'lucide-react';
import { useAuth } from '../providers/AuthContext';
import { useCart } from '../providers/CartContext';
import { useFavorites } from '../providers/FavoritesContext';
import { BrandLogo } from '@/shared/ui/BrandLogo';
import { Button } from '@/shared/ui/Button';
import { resolveMediaUrl } from '@/shared/config/env';

interface MainLayoutProps {
  children: React.ReactNode;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
}

export const MainLayout: React.FC<MainLayoutProps> = ({
  children,
  searchQuery = '',
  onSearchChange,
}) => {
  const { user, isAuthenticated, logout } = useAuth();
  const { totalItems: cartCount } = useCart();
  const { favoritesCount } = useFavorites();
  const navigate = useNavigate();
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const goOnline = () => setIsOnline(true);
    const goOffline = () => setIsOnline(false);
    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);
    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/80">
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-slate-200/80 shadow-sm">
        {!isOnline && (
          <div className="bg-amber-500 text-slate-950 text-xs font-bold py-1.5 px-4 text-center flex items-center justify-center gap-2">
            <WifiOff className="w-3.5 h-3.5" />
            <span>Нет подключения к интернету — offline-режим</span>
          </div>
        )}

        <div className="bg-slate-950 text-slate-300 text-xs py-2 px-4 sm:px-6">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-6">
              <span className="inline-flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer">
                <Briefcase className="w-3.5 h-3.5 text-indigo-400" />
                <span>Для бизнеса</span>
              </span>
              <span className="hidden sm:inline-flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Безопасная сделка</span>
              </span>
              <span className="hidden md:inline-flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer">
                <Truck className="w-3.5 h-3.5 text-amber-400" />
                <span>Лавка Доставка</span>
              </span>
            </div>

            <div className="inline-flex items-center gap-1.5 font-medium text-slate-200">
              <MapPin className="w-3.5 h-3.5 text-indigo-400" />
              <span>Москва и область</span>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex flex-wrap items-center gap-3 sm:gap-4">
          <BrandLogo />

          <div className="flex-1 min-w-[200px] order-3 md:order-2 w-full md:w-auto">
            <div className="relative flex items-center">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange?.(e.target.value)}
                placeholder="Поиск по объявлениям, товарам и городам..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50/90 pl-10 pr-24 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 transition-all focus:bg-white focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/15"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => onSearchChange?.('')}
                  className="absolute right-3 text-xs font-medium text-slate-400 hover:text-slate-600"
                >
                  Сбросить
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-2.5 ml-auto order-2 md:order-3">
            <Link to={isAuthenticated ? '/ads/new' : '/login'} className="hidden sm:inline-flex">
              <Button variant="secondary" size="md" title="Разместить объявление">
                <Plus className="w-4 h-4" />
                <span>Разместить объявление</span>
              </Button>
            </Link>

            {isAuthenticated && (
              <>
                <Link
                  to="/favorites"
                  title="Избранное"
                  className="relative inline-flex items-center justify-center w-10 h-10 rounded-xl bg-slate-100/80 hover:bg-rose-50 border border-slate-200/80 hover:border-rose-200 text-slate-700 hover:text-rose-500 transition-all"
                >
                  <Heart className="w-4 h-4" />
                  {favoritesCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1 rounded-full bg-rose-500 text-white text-[10px] font-extrabold flex items-center justify-center shadow-sm">
                      {favoritesCount > 99 ? '99+' : favoritesCount}
                    </span>
                  )}
                </Link>

                <Link
                  to="/cart"
                  title="Корзина"
                  className="relative inline-flex items-center justify-center w-10 h-10 rounded-xl bg-slate-100/80 hover:bg-indigo-50 border border-slate-200/80 hover:border-indigo-200 text-slate-700 hover:text-indigo-600 transition-all"
                >
                  <ShoppingCart className="w-4 h-4" />
                  {cartCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1 rounded-full bg-indigo-600 text-white text-[10px] font-extrabold flex items-center justify-center shadow-sm">
                      {cartCount > 99 ? '99+' : cartCount}
                    </span>
                  )}
                </Link>
              </>
            )}

            {isAuthenticated && user ? (
              <div className="flex items-center gap-2">
                <Link
                  to="/profile"
                  className="inline-flex items-center gap-2 pl-1.5 pr-2.5 sm:pr-3.5 py-1.5 rounded-full bg-slate-100/80 hover:bg-indigo-50 border border-slate-200/80 hover:border-indigo-200 transition-all group"
                >
                  <img
                    src={resolveMediaUrl(user.avatar_path)}
                    alt={user.name}
                    onError={(e) => {
                      e.currentTarget.src = '/images/logo/avatar.svg';
                    }}
                    className="w-7 h-7 rounded-full object-cover ring-2 ring-white"
                  />
                  <span className="hidden sm:inline text-sm font-semibold text-slate-800 group-hover:text-indigo-600 max-w-[120px] truncate">
                    {user.name}
                  </span>
                </Link>

                <Button variant="danger" size="sm" onClick={handleLogout} title="Выйти из аккаунта">
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Выйти</span>
                </Button>
              </div>
            ) : (
              <Link to="/login">
                <Button variant="primary" size="md">
                  Войти
                </Button>
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-7">{children}</main>

      <footer className="border-t border-slate-200/80 bg-white py-6 px-4 sm:px-6 mt-12">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <img src="/images/logo/logo.svg" alt="Лавка" className="w-5 h-5 rounded-md" />
            <span className="font-semibold text-slate-600">Лавка</span>
            <span>— учебный проект Технопарка</span>
          </div>
          <div>© 2026 Все права защищены</div>
        </div>
      </footer>
    </div>
  );
};
