import React, { useEffect, useState, useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Star, Calendar, Package, CheckCircle2, Plus, Settings } from 'lucide-react';
import { MainLayout } from '@/app/layouts/MainLayout';
import { useAuth } from '@/app/providers/AuthContext';
import { sellerApi } from '@/entities/seller/api';
import { SellerPageData } from '@/entities/seller/model';
import { AdCard } from '@/entities/ad/ui/AdCard';
import { resolveMediaUrl } from '@/shared/config/env';
import { Button } from '@/shared/ui/Button';

export const SellerPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();

  const [data, setData] = useState<SellerPageData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState<'active' | 'closed'>('active');

  const sellerId = Number(id);

  useEffect(() => {
    let mounted = true;
    setIsLoading(true);
    setError('');

    if (!sellerId || Number.isNaN(sellerId)) {
      setError('Некорректный идентификатор продавца');
      setIsLoading(false);
      return;
    }

    (async () => {
      const res = await sellerApi.getSellerPage(sellerId);
      if (!mounted) return;
      if (res.success && res.data) {
        setData(res.data);
      } else {
        setError(res.error || 'Продавец не найден');
      }
      setIsLoading(false);
    })();

    return () => {
      mounted = false;
    };
  }, [sellerId]);

  const activeAds = useMemo(
    () => (data?.ads || []).filter((ad) => ad.status === 'active'),
    [data]
  );
  const closedAds = useMemo(
    () => (data?.ads || []).filter((ad) => ad.status !== 'active'),
    [data]
  );

  const displayedAds = tab === 'active' ? activeAds : closedAds;
  const isMe = Boolean(user && data && user.id === data.seller.id);

  const memberSince = data?.seller.created_at
    ? new Date(data.seller.created_at).toLocaleDateString('ru-RU', {
        month: 'long',
        year: 'numeric',
      })
    : '';

  return (
    <MainLayout>
      <div className="space-y-6">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-600 hover:text-indigo-600 px-3.5 py-2 rounded-xl bg-white border border-slate-200/80 hover:border-indigo-200 transition-colors shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Назад к объявлениям</span>
        </Link>

        {isLoading ? (
          <div className="space-y-6 animate-pulse">
            <div className="h-44 bg-white rounded-3xl border border-slate-200" />
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
              {Array.from({ length: 3 }).map((_, idx) => (
                <div key={idx} className="h-72 bg-white rounded-2xl border border-slate-200" />
              ))}
            </div>
          </div>
        ) : error || !data ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4">
            <p className="text-lg font-extrabold text-slate-800">{error || 'Продавец не найден'}</p>
            <Link to="/">
              <Button variant="primary">Вернуться на главную</Button>
            </Link>
          </div>
        ) : (
          <>
            <section className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="flex items-center gap-5">
                <img
                  src={resolveMediaUrl(data.seller.avatar_path)}
                  alt={data.seller.name}
                  onError={(e) => {
                    e.currentTarget.src = '/images/logo/avatar.svg';
                  }}
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl object-cover ring-4 ring-indigo-50 shadow-sm"
                />

                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                      {data.seller.name}
                    </h1>
                    {isMe && (
                      <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold">
                        Это вы
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-slate-500">
                    <span className="inline-flex items-center gap-1 font-bold text-amber-600">
                      <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                      {data.seller.rating ? data.seller.rating.toFixed(1) : '5.0'}
                    </span>
                    <span>({data.seller.reviews_count} отзывов)</span>
                    {memberSince && (
                      <>
                        <span>•</span>
                        <span className="inline-flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>На Лавке с {memberSince}</span>
                        </span>
                      </>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-3 pt-1">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-indigo-50 text-indigo-700 text-xs font-bold">
                      <Package className="w-3.5 h-3.5" />
                      <span>Активных: {data.seller.active_ads_count}</span>
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-bold">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Завершённых: {data.seller.closed_ads_count}</span>
                    </span>
                  </div>
                </div>
              </div>

              {isMe && (
                <div className="flex flex-wrap items-center gap-2.5">
                  <Link to="/ads/new">
                    <Button variant="primary" size="sm">
                      <Plus className="w-4 h-4" />
                      <span>Новое объявление</span>
                    </Button>
                  </Link>
                  <Link to="/profile">
                    <Button variant="outline" size="sm">
                      <Settings className="w-4 h-4" />
                      <span>Настройки профиля</span>
                    </Button>
                  </Link>
                </div>
              )}
            </section>

            <section className="space-y-5">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <h2 className="text-xl font-extrabold text-slate-900">Объявления продавца</h2>
                <div className="inline-flex rounded-2xl bg-white border border-slate-200 p-1 shadow-sm">
                  <button
                    type="button"
                    onClick={() => setTab('active')}
                    className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                      tab === 'active'
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Активные ({activeAds.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setTab('closed')}
                    className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                      tab === 'closed'
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Завершённые ({closedAds.length})
                  </button>
                </div>
              </div>

              {displayedAds.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                  {displayedAds.map((ad) => (
                    <AdCard key={ad.id} ad={ad} />
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-3xl border border-dashed border-slate-300 p-12 text-center space-y-2">
                  <p className="text-base font-bold text-slate-700">
                    {tab === 'active'
                      ? 'У продавца сейчас нет активных объявлений'
                      : 'Завершённых объявлений пока нет'}
                  </p>
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </MainLayout>
  );
};
