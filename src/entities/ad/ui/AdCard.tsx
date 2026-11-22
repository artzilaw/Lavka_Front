import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, MapPin, Eye, Tag, Sparkles, Crown, Flame } from 'lucide-react';
import { Ad, isAdPromoted } from '../model';
import { resolveMediaUrl } from '@/shared/config/env';
import { getCategoryById } from '@/shared/config/categories';
import { useAuth } from '@/app/providers/AuthContext';
import { useFavorites } from '@/app/providers/FavoritesContext';

interface AdCardProps {
  ad: Ad;
}

export const AdCard: React.FC<AdCardProps> = ({ ad }) => {
  const { isAuthenticated } = useAuth();
  const { isFavorite, toggleFavorite } = useFavorites();
  const navigate = useNavigate();

  const liked = isFavorite(ad.id);
  const category = getCategoryById(ad.category_id);
  const imageUrl = resolveMediaUrl(ad.photos?.[0], '/images/logo/logo.svg');
  const formattedPrice =
    ad.price === 0 ? 'Бесплатно' : `${ad.price.toLocaleString('ru-RU')} ₽`;
  const isInactive = ad.status !== 'active';
  const promoted = !isInactive && isAdPromoted(ad);

  const promoRing =
    promoted && ad.promotion_tier === 'vip'
      ? 'border-amber-300 ring-2 ring-amber-200/70 bg-amber-50/20'
      : promoted && ad.promotion_tier === 'boost'
        ? 'border-indigo-300 ring-1 ring-indigo-200'
        : promoted && ad.promotion_tier === 'highlight'
          ? 'border-emerald-300 bg-emerald-50/20'
          : 'border-slate-200/80 bg-white';

  return (
    <Link
      to={`/ads/${ad.id}`}
      className={`group rounded-2xl border overflow-hidden shadow-sm hover:shadow-xl hover:shadow-indigo-950/5 hover:border-indigo-300 transition-all duration-300 flex flex-col ${promoRing}`}
    >
      <div className="relative aspect-[4/3] w-full bg-slate-100 overflow-hidden">
        <img
          src={imageUrl}
          alt={ad.title}
          loading="lazy"
          onError={(e) => {
            e.currentTarget.src = '/images/logo/logo.svg';
          }}
          className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${
            isInactive ? 'opacity-65 grayscale-[30%]' : ''
          }`}
        />

        {isInactive ? (
          <span
            className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide shadow-sm ${
              ad.status === 'sold'
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-900/85 text-white'
            }`}
          >
            {ad.status === 'sold' ? 'Продано' : 'Закрыто'}
          </span>
        ) : (
          <span
            className={`absolute top-3 left-3 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold border backdrop-blur-md shadow-sm ${category.badgeClass}`}
          >
            <Tag className="w-3 h-3" />
            <span>{category.title}</span>
          </span>
        )}

        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (!isAuthenticated) {
              navigate('/login');
              return;
            }
            void toggleFavorite(ad.id);
          }}
          title={liked ? 'Убрать из избранного' : 'В избранное'}
          className={`absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center backdrop-blur-md transition-all duration-200 shadow-sm ${
            liked
              ? 'bg-rose-500 text-white scale-105'
              : 'bg-white/90 text-slate-600 hover:bg-white hover:text-rose-500 hover:scale-105'
          }`}
        >
          <Heart className={`w-4 h-4 ${liked ? 'fill-current' : ''}`} />
        </button>
      </div>

      <div className="p-4 flex flex-col flex-1 gap-1.5">
        <div className="flex items-center justify-between gap-2">
          <div className="text-lg font-extrabold text-slate-900 tracking-tight">
            {formattedPrice}
          </div>
          {promoted && (
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide ${
                ad.promotion_tier === 'vip'
                  ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-sm'
                  : ad.promotion_tier === 'boost'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-emerald-500 text-white'
              }`}
            >
              {ad.promotion_tier === 'vip' ? (
                <>
                  <Crown className="w-3 h-3" />
                  <span>VIP</span>
                </>
              ) : ad.promotion_tier === 'boost' ? (
                <>
                  <Flame className="w-3 h-3" />
                  <span>Топ</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3 h-3" />
                  <span>Выделено</span>
                </>
              )}
            </span>
          )}
        </div>

        <h3
          title={ad.title}
          className="text-sm font-semibold text-slate-700 group-hover:text-indigo-600 transition-colors line-clamp-2 min-h-[2.5rem]"
        >
          {ad.title}
        </h3>

        <div className="mt-auto pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400 font-medium">
          <span className="inline-flex items-center gap-1 truncate max-w-[68%]">
            <MapPin className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            <span className="truncate">{ad.location || 'Москва'}</span>
          </span>
          <span className="inline-flex items-center gap-1 shrink-0" title="Просмотры">
            <Eye className="w-3.5 h-3.5" />
            <span>{ad.views_count}</span>
          </span>
        </div>
      </div>
    </Link>
  );
};
