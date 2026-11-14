import React, { useState } from 'react';
import { Heart, MapPin, Eye } from 'lucide-react';
import { Ad } from '../model';
import { resolveMediaUrl } from '@/shared/config/env';

interface AdCardProps {
  ad: Ad;
}

export const AdCard: React.FC<AdCardProps> = ({ ad }) => {
  const [liked, setLiked] = useState(false);

  const imageUrl = resolveMediaUrl(ad.photos?.[0], '/images/logo/logo.svg');
  const formattedPrice =
    ad.price === 0 ? 'Бесплатно' : `${ad.price.toLocaleString('ru-RU')} ₽`;

  return (
    <article className="group bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm hover:shadow-xl hover:shadow-indigo-950/5 hover:border-indigo-200 transition-all duration-300 flex flex-col cursor-pointer">
      <div className="relative aspect-[4/3] w-full bg-slate-100 overflow-hidden">
        <img
          src={imageUrl}
          alt={ad.title}
          loading="lazy"
          onError={(e) => {
            e.currentTarget.src = '/images/logo/logo.svg';
          }}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setLiked((v) => !v);
          }}
          title="В избранное"
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
        <div className="text-lg font-extrabold text-slate-900 tracking-tight">
          {formattedPrice}
        </div>

        <h3
          title={ad.title}
          className="text-sm font-semibold text-slate-700 group-hover:text-indigo-600 transition-colors line-clamp-2 min-h-[2.5rem]"
        >
          {ad.title}
        </h3>

        <div className="mt-auto pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400 font-medium">
          <span className="inline-flex items-center gap-1 truncate max-w-[70%]">
            <MapPin className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            <span className="truncate">{ad.location || 'Москва'}</span>
          </span>
          <span className="inline-flex items-center gap-1 shrink-0" title="Просмотры">
            <Eye className="w-3.5 h-3.5" />
            <span>{ad.views_count}</span>
          </span>
        </div>
      </div>
    </article>
  );
};
