import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  MapPin,
  Eye,
  Calendar,
  ShoppingCart,
  Check,
  Edit3,
  Archive,
  RotateCcw,
  Trash2,
  Star,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Store,
} from 'lucide-react';
import { MainLayout } from '@/app/layouts/MainLayout';
import { useAuth } from '@/app/providers/AuthContext';
import { useCart } from '@/app/providers/CartContext';
import { AdDetail } from '@/entities/ad/model';
import { adApi } from '@/entities/ad/api';
import { getCategoryById } from '@/entities/ad/categories';
import { resolveMediaUrl } from '@/shared/config/env';
import { Button } from '@/shared/ui/Button';
import { Alert } from '@/shared/ui/Alert';

export const AdDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { addToCart, isInCart } = useCart();

  const [ad, setAd] = useState<AdDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const [isMutating, setIsMutating] = useState(false);

  const adId = Number(id);

  useEffect(() => {
    let mounted = true;
    setIsLoading(true);
    setError('');
    setActivePhotoIndex(0);

    if (!adId || Number.isNaN(adId)) {
      setError('Некорректный идентификатор объявления');
      setIsLoading(false);
      return;
    }

    (async () => {
      const res = await adApi.getById(adId);
      if (!mounted) return;
      if (res.success && res.data) {
        setAd(res.data);
      } else {
        setError(res.error || 'Объявление не найдено');
      }
      setIsLoading(false);
    })();

    return () => {
      mounted = false;
    };
  }, [adId]);

  const isOwner = Boolean(user && ad && user.id === ad.seller_id);
  const alreadyInCart = ad ? isInCart(ad.id) : false;
  const photos = ad?.photos && ad.photos.length > 0 ? ad.photos : ['/images/logo/logo.svg'];
  const category = ad ? getCategoryById(ad.category_id) : undefined;

  const handleAddToCart = async () => {
    if (!ad) return;
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    setActionError('');
    setActionSuccess('');
    setIsMutating(true);
    const res = await addToCart(ad.id, 1);
    setIsMutating(false);
    if (res.success) {
      setActionSuccess('Товар добавлен в корзину');
    } else {
      setActionError(res.error || 'Не удалось добавить товар в корзину');
    }
  };

  const handleCloseToggle = async () => {
    if (!ad) return;
    setActionError('');
    setActionSuccess('');
    setIsMutating(true);
    const res = ad.status === 'active' ? await adApi.close(ad.id) : await adApi.reopen(ad.id);
    setIsMutating(false);
    if (res.success && res.data) {
      setAd((prev) => (prev ? { ...prev, ...res.data } : prev));
      setActionSuccess(
        res.data.status === 'closed'
          ? 'Объявление закрыто и снято с публикации'
          : 'Объявление снова опубликовано'
      );
    } else {
      setActionError(res.error || 'Не удалось изменить статус объявления');
    }
  };

  const handleDelete = async () => {
    if (!ad) return;
    if (!window.confirm('Удалить это объявление без возможности восстановления?')) return;
    setActionError('');
    setIsMutating(true);
    const res = await adApi.remove(ad.id);
    setIsMutating(false);
    if (res.success) {
      navigate('/profile');
    } else {
      setActionError(res.error || 'Не удалось удалить объявление');
    }
  };

  const formattedDate = ad?.created_at
    ? new Date(ad.created_at).toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : '';

  return (
    <MainLayout>
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-600 hover:text-indigo-600 px-3.5 py-2 rounded-xl bg-white border border-slate-200/80 hover:border-indigo-200 transition-colors shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Назад к объявлениям</span>
          </Link>

          {category && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 text-indigo-700 text-xs font-bold">
              {category.title}
            </span>
          )}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 animate-pulse">
            <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4">
              <div className="aspect-[16/10] bg-slate-200 rounded-2xl" />
              <div className="h-7 w-2/3 bg-slate-200 rounded-lg" />
              <div className="h-24 w-full bg-slate-100 rounded-xl" />
            </div>
            <div className="bg-white rounded-3xl border border-slate-200 p-6 h-80" />
          </div>
        ) : error || !ad ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4">
            <p className="text-lg font-extrabold text-slate-800">{error || 'Объявление не найдено'}</p>
            <Link to="/">
              <Button variant="primary">Вернуться на главную</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 items-start">
            <div className="space-y-6">
              <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden p-4 sm:p-6 space-y-4">
                <div className="relative aspect-[16/10] w-full rounded-2xl overflow-hidden bg-slate-100">
                  <img
                    src={resolveMediaUrl(photos[activePhotoIndex], '/images/logo/logo.svg')}
                    alt={ad.title}
                    onError={(e) => {
                      e.currentTarget.src = '/images/logo/logo.svg';
                    }}
                    className="w-full h-full object-contain bg-slate-950/5"
                  />

                  {ad.status !== 'active' && (
                    <span
                      className={`absolute top-4 left-4 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow ${
                        ad.status === 'sold'
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-900/90 text-white'
                      }`}
                    >
                      {ad.status === 'sold' ? 'Продано' : 'Объявление закрыто'}
                    </span>
                  )}

                  {photos.length > 1 && (
                    <>
                      <button
                        type="button"
                        onClick={() =>
                          setActivePhotoIndex((i) => (i - 1 + photos.length) % photos.length)
                        }
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 hover:bg-white text-slate-800 shadow-md flex items-center justify-center transition-all"
                        aria-label="Предыдущее фото"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setActivePhotoIndex((i) => (i + 1) % photos.length)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 hover:bg-white text-slate-800 shadow-md flex items-center justify-center transition-all"
                        aria-label="Следующее фото"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </>
                  )}
                </div>

                {photos.length > 1 && (
                  <div className="flex gap-2.5 overflow-x-auto pb-1">
                    {photos.map((photo, idx) => (
                      <button
                        key={`${photo}-${idx}`}
                        type="button"
                        onClick={() => setActivePhotoIndex(idx)}
                        className={`w-20 h-16 rounded-xl overflow-hidden border-2 shrink-0 transition-all ${
                          idx === activePhotoIndex
                            ? 'border-indigo-600 ring-2 ring-indigo-500/20'
                            : 'border-slate-200 opacity-70 hover:opacity-100'
                        }`}
                      >
                        <img
                          src={resolveMediaUrl(photo, '/images/logo/logo.svg')}
                          alt={`Миниатюра ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}

                <div className="pt-2 space-y-4">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                      {ad.title}
                    </h1>
                    <div className="text-2xl sm:text-3xl font-black text-indigo-600">
                      {ad.price === 0 ? 'Бесплатно' : `${ad.price.toLocaleString('ru-RU')} ₽`}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-500 pb-4 border-b border-slate-100">
                    <span className="inline-flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-indigo-500" />
                      <span>{ad.location || 'Москва'}</span>
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Eye className="w-4 h-4 text-slate-400" />
                      <span>{ad.views_count} просмотров</span>
                    </span>
                    {formattedDate && (
                      <span className="inline-flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        <span>Опубликовано {formattedDate}</span>
                      </span>
                    )}
                  </div>

                  <div>
                    <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2">
                      Описание
                    </h2>
                    <p className="text-sm sm:text-base text-slate-700 leading-relaxed whitespace-pre-line">
                      {ad.description}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <aside className="space-y-4 lg:sticky lg:top-28">
              <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 space-y-4">
                {actionError && <Alert type="error" message={actionError} />}
                {actionSuccess && <Alert type="success" message={actionSuccess} />}

                {isOwner ? (
                  <div className="space-y-3">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Управление объявлением
                    </p>
                    <Link to={`/ads/${ad.id}/edit`} className="block">
                      <Button variant="primary" fullWidth>
                        <Edit3 className="w-4 h-4" />
                        <span>Редактировать</span>
                      </Button>
                    </Link>

                    {ad.status !== 'sold' && (
                      <Button
                        variant="secondary"
                        fullWidth
                        isLoading={isMutating}
                        onClick={handleCloseToggle}
                      >
                        {ad.status === 'active' ? (
                          <>
                            <Archive className="w-4 h-4" />
                            <span>Закрыть объявление</span>
                          </>
                        ) : (
                          <>
                            <RotateCcw className="w-4 h-4" />
                            <span>Опубликовать снова</span>
                          </>
                        )}
                      </Button>
                    )}

                    <Button
                      variant="danger"
                      fullWidth
                      isLoading={isMutating}
                      onClick={handleDelete}
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Удалить объявление</span>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {ad.status === 'active' ? (
                      alreadyInCart ? (
                        <Link to="/cart" className="block">
                          <Button variant="secondary" size="lg" fullWidth>
                            <Check className="w-4 h-4" />
                            <span>В корзине — перейти к оформлению</span>
                          </Button>
                        </Link>
                      ) : (
                        <Button
                          variant="primary"
                          size="lg"
                          fullWidth
                          isLoading={isMutating}
                          onClick={handleAddToCart}
                        >
                          <ShoppingCart className="w-4 h-4" />
                          <span>Добавить в корзину</span>
                        </Button>
                      )
                    ) : (
                      <div className="rounded-2xl bg-slate-100 text-slate-600 text-sm font-semibold p-4 text-center">
                        {ad.status === 'sold'
                          ? 'Этот товар уже продан'
                          : 'Объявление снято с публикации'}
                      </div>
                    )}

                    <div className="flex items-center gap-2 text-xs text-slate-500 pt-1">
                      <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>Безопасная сделка через Лавка Доставку</span>
                    </div>
                  </div>
                )}
              </div>

              {ad.seller && (
                <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 space-y-4">
                  <div className="flex items-center gap-3.5">
                    <img
                      src={resolveMediaUrl(ad.seller.avatar_path)}
                      alt={ad.seller.name}
                      onError={(e) => {
                        e.currentTarget.src = '/images/logo/avatar.svg';
                      }}
                      className="w-14 h-14 rounded-2xl object-cover ring-2 ring-indigo-100"
                    />
                    <div className="min-w-0">
                      <Link
                        to={`/sellers/${ad.seller.id}`}
                        className="text-base font-extrabold text-slate-900 hover:text-indigo-600 transition-colors block truncate"
                      >
                        {ad.seller.name}
                      </Link>
                      <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                        <span className="inline-flex items-center gap-1 font-bold text-amber-600">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          {ad.seller.rating ? ad.seller.rating.toFixed(1) : '5.0'}
                        </span>
                        <span>•</span>
                        <span>{ad.seller.reviews_count} отзывов</span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Объявлений: {ad.seller.ads_count}
                      </p>
                    </div>
                  </div>

                  <Link to={`/sellers/${ad.seller.id}`} className="block">
                    <Button variant="outline" fullWidth>
                      <Store className="w-4 h-4" />
                      <span>Страница продавца</span>
                    </Button>
                  </Link>
                </div>
              )}
            </aside>
          </div>
        )}
      </div>
    </MainLayout>
  );
};
