import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { MainLayout } from '@/app/layouts/MainLayout';
import { useFavorites } from '@/app/providers/FavoritesContext';
import { AdCard } from '@/entities/ad/ui/AdCard';
import { Button } from '@/shared/ui/Button';

export const FavoritesPage: React.FC = () => {
  const { favorites, isLoading, refreshFavorites } = useFavorites();

  useEffect(() => {
    refreshFavorites();
  }, [refreshFavorites]);

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-rose-500 text-white flex items-center justify-center shadow-md shadow-rose-500/25">
            <Heart className="w-5 h-5 fill-current" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Избранное</h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Сохранённые объявления ({favorites.length})
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-slate-200/70 p-3 space-y-3 animate-pulse"
              >
                <div className="aspect-[4/3] bg-slate-200 rounded-xl" />
                <div className="h-5 w-1/2 bg-slate-200 rounded-lg" />
                <div className="h-4 w-3/4 bg-slate-100 rounded-lg" />
              </div>
            ))}
          </div>
        ) : favorites.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {favorites.map((ad) => (
              <AdCard key={ad.id} ad={ad} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-dashed border-slate-300 p-14 text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-400 flex items-center justify-center mx-auto">
              <Heart className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <p className="text-lg font-extrabold text-slate-800">В избранном пока пусто</p>
              <p className="text-sm text-slate-500">
                Нажимайте на сердечко на карточках объявлений, чтобы не потерять интересные предложения
              </p>
            </div>
            <Link to="/" className="inline-block">
              <Button variant="primary">К объявлениям</Button>
            </Link>
          </div>
        )}
      </div>
    </MainLayout>
  );
};
