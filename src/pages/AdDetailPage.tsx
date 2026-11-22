import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  MapPin,
  Eye,
  Heart,
  Pencil,
  Trash2,
  Lock,
  Unlock,
  Calendar,
  Tag,
  ShoppingCart,
  Hash,
  ChevronRight,
  CheckCircle2,
  TrendingDown,
  TrendingUp,
  History,
  Sparkles,
  Crown,
  Flame,
  Wallet,
} from 'lucide-react';
import { MainLayout } from '@/app/layouts/MainLayout';
import { useAuth } from '@/app/providers/AuthContext';
import { useCart } from '@/app/providers/CartContext';
import { useFavorites } from '@/app/providers/FavoritesContext';
import { adApi, AdDetail } from '@/entities/ad/api';
import { isAdPromoted, PromotionTariff } from '@/entities/ad/model';
import { resolveMediaUrl } from '@/shared/config/env';
import { getCategoryById } from '@/shared/config/categories';
import { Button } from '@/shared/ui/Button';
import { Alert } from '@/shared/ui/Alert';

export const AdDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { addToCart } = useCart();
  const { isFavorite, toggleFavorite } = useFavorites();

  const [ad, setAd] = useState<AdDetail | null>(null);
  const [tariffs, setTariffs] = useState<PromotionTariff[]>([]);
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (!id) return;
    let mounted = true;
    (async () => {
      setIsLoading(true);
      setActivePhotoIdx(0);
      const [adRes, tariffsRes] = await Promise.all([
        adApi.getById(Number(id), true),
        adApi.getPromotionTariffs(),
      ]);
      if (mounted) {
        if (adRes.success && adRes.data) {
          setAd(adRes.data);
        } else {
          setError(adRes.error || 'Объявление не найдено');
        }
        if (tariffsRes.success && Array.isArray(tariffsRes.data)) {
          setTariffs(tariffsRes.data);
        }
        setIsLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [id]);

  const currentUserId = user?.id || user?.user_id;
  const isOwner = Boolean(ad && currentUserId && ad.seller_id === currentUserId);

  useEffect(() => {
    if (!isOwner) return;
    let mounted = true;
    (async () => {
      const res = await adApi.getWallet();
      if (mounted && res.success && res.data) {
        setWalletBalance(res.data.balance);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [isOwner]);

  const liked = ad ? isFavorite(ad.id) : false;
  const category = getCategoryById(ad?.category_id);
  const promoted = ad ? isAdPromoted(ad) : false;

  const showNotice = (type: 'success' | 'error', text: string) => {
    setNotice({ type, text });
    setTimeout(() => setNotice(null), 4000);
  };

  const handleToggleClose = async () => {
    if (!ad) return;
    setActionLoading(true);
    const res = ad.status === 'active' ? await adApi.close(ad.id) : await adApi.reopen(ad.id);
    setActionLoading(false);
    if (res.success && res.data) {
      setAd((prev) => (prev ? { ...prev, ...res.data } : prev));
    }
  };

  const handleDelete = async () => {
    if (!ad || !window.confirm('Удалить это объявление?')) return;
    setActionLoading(true);
    const res = await adApi.remove(ad.id);
    setActionLoading(false);
    if (res.success) {
      navigate('/');
    }
  };

  const handleFavorite = async () => {
    if (!ad) return;
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    const ok = await toggleFavorite(ad.id);
    if (ok) {
      setAd((prev) =>
        prev
          ? { ...prev, favorites_count: Math.max(0, (prev.favorites_count || 0) + (liked ? -1 : 1)) }
          : prev
      );
    }
  };

  const handleAddToCart = async () => {
    if (!ad) return;
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    setActionLoading(true);
    const res = await addToCart(ad.id, 1);
    setActionLoading(false);
    if (res.success) {
      showNotice('success', 'Товар добавлен в корзину!');
    } else if (res.error) {
      showNotice('error', res.error);
    }
  };

  const handlePromote = async (tier: string) => {
    if (!ad) return;
    setActionLoading(true);
    const res = await adApi.promote(ad.id, tier);
    setActionLoading(false);
    if (res.success && res.data) {
      setAd((prev) => (prev ? { ...prev, ...res.data!.ad } : prev));
      setWalletBalance(res.data.balance);
      showNotice('success', 'Продвижение успешно активировано!');
    } else {
      showNotice(
        'error',
        res.error === 'insufficient funds'
          ? 'Недостаточно средств на балансе — пополните кошелёк в профиле'
          : res.error || 'Не удалось активировать продвижение'
      );
    }
  };

  const photos = ad?.photos && ad.photos.length > 0 ? ad.photos : ['/images/logo/logo.svg'];
  const mainPhotoUrl = resolveMediaUrl(photos[activePhotoIdx] || photos[0], '/images/logo/logo.svg');
  const priceHistory =
    ad?.price_history && ad.price_history.length > 0
      ? ad.price_history
      : ad
        ? [
            {
              id: 0,
              ad_id: ad.id,
              old_price: ad.price,
              new_price: ad.price,
              changed_at: ad.created_at || new Date().toISOString(),
            },
          ]
        : [];

  const statusLabel =
    ad?.status === 'active'
      ? 'Активно'
      : ad?.status === 'closed'
        ? 'Снято с публикации'
        : ad?.status === 'sold'
          ? 'Продано'
          : ad?.status || '';

  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto space-y-5">
        <nav className="flex flex-wrap items-center gap-2 text-xs font-medium text-slate-500">
          <Link to="/" className="inline-flex items-center gap-1 hover:text-indigo-600 font-semibold">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Главная</span>
          </Link>
          {ad && (
            <>
              <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border ${category.badgeClass}`}>
                <Tag className="w-3 h-3" />
                {ad.category_name || category.title}
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
              <span className="text-slate-700 font-semibold truncate max-w-[260px]">{ad.title}</span>
            </>
          )}
        </nav>

        {isLoading ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-8 animate-pulse space-y-4">
            <div className="h-80 bg-slate-200 rounded-2xl" />
            <div className="h-8 w-1/2 bg-slate-200 rounded-xl" />
          </div>
        ) : error || !ad ? (
          <Alert type="error" message={error || 'Объявление не найдено'} />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6 items-start">
            <div className="space-y-6">
              <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
                <div className="aspect-[16/10] bg-slate-100 overflow-hidden relative">
                  <img
                    src={mainPhotoUrl}
                    alt={ad.title}
                    onError={(e) => {
                      e.currentTarget.src = '/images/logo/logo.svg';
                    }}
                    className="w-full h-full object-cover"
                  />
                  {promoted && (
                    <span className="absolute top-4 left-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wide bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-md">
                      {ad.promotion_tier === 'vip' ? (
                        <Crown className="w-3.5 h-3.5" />
                      ) : ad.promotion_tier === 'boost' ? (
                        <Flame className="w-3.5 h-3.5" />
                      ) : (
                        <Sparkles className="w-3.5 h-3.5" />
                      )}
                      <span>
                        {ad.promotion_tier === 'vip'
                          ? 'VIP-объявление'
                          : ad.promotion_tier === 'boost'
                            ? 'В топе выдачи'
                            : 'Выделено'}
                      </span>
                    </span>
                  )}
                </div>

                {photos.length > 1 && (
                  <div className="flex items-center gap-2.5 px-6 pt-4 overflow-x-auto">
                    {photos.map((p, idx) => (
                      <button
                        key={`${p}-${idx}`}
                        type="button"
                        onClick={() => setActivePhotoIdx(idx)}
                        className={`w-16 h-16 rounded-xl overflow-hidden border-2 shrink-0 transition-all ${
                          idx === activePhotoIdx
                            ? 'border-indigo-600 ring-2 ring-indigo-200'
                            : 'border-slate-200 opacity-75 hover:opacity-100'
                        }`}
                      >
                        <img
                          src={resolveMediaUrl(p, '/images/logo/logo.svg')}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}

                <div className="p-6 sm:p-8 space-y-6">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                        {ad.title}
                      </h1>
                      <div className="flex flex-wrap items-center gap-4 mt-2.5 text-xs font-medium text-slate-500">
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-indigo-500" />
                          {ad.location || 'Москва'}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Eye className="w-3.5 h-3.5" />
                          {ad.views_count} просмотров
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Heart className="w-3.5 h-3.5 text-rose-400" />
                          {ad.favorites_count ?? 0} в избранном
                        </span>
                        {ad.created_at && (
                          <span className="inline-flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            {new Date(ad.created_at).toLocaleDateString('ru-RU')}
                          </span>
                        )}
                      </div>
                    </div>

                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                        ad.status === 'active'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}
                    >
                      {statusLabel}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-100">
                    <div className="rounded-2xl bg-slate-50/80 border border-slate-100 p-3">
                      <div className="text-[11px] font-medium text-slate-400 mb-0.5">Категория</div>
                      <div className="text-xs font-bold text-slate-800">
                        {ad.category_name || category.title}
                      </div>
                    </div>
                    <div className="rounded-2xl bg-slate-50/80 border border-slate-100 p-3">
                      <div className="text-[11px] font-medium text-slate-400 mb-0.5">Город</div>
                      <div className="text-xs font-bold text-slate-800">{ad.location || 'Москва'}</div>
                    </div>
                    <div className="rounded-2xl bg-slate-50/80 border border-slate-100 p-3">
                      <div className="text-[11px] font-medium text-slate-400 mb-0.5">Статус</div>
                      <div className="text-xs font-bold text-slate-800">{statusLabel}</div>
                    </div>
                    <div className="rounded-2xl bg-slate-50/80 border border-slate-100 p-3">
                      <div className="text-[11px] font-medium text-slate-400 mb-0.5">Объявление</div>
                      <div className="text-xs font-bold text-slate-800 inline-flex items-center gap-0.5">
                        <Hash className="w-3 h-3 text-slate-400" />
                        {ad.id}
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100">
                    <h2 className="text-sm font-bold text-slate-900 mb-2">Описание</h2>
                    <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                      {ad.description}
                    </p>
                  </div>
                </div>
              </div>

              {/* История изменения цены (РК4) */}
              {priceHistory.length > 0 && (
                <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 sm:p-7 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                        <History className="w-4 h-4" />
                      </div>
                      <div>
                        <h2 className="text-sm font-bold text-slate-900">История изменения цены</h2>
                        <p className="text-xs text-slate-500">
                          Зафиксировано изменений: {Math.max(0, priceHistory.length - 1)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    {priceHistory.map((item, idx) => {
                      const diff = item.new_price - item.old_price;
                      const isFirst = idx === 0 || diff === 0;
                      const pct =
                        !isFirst && item.old_price > 0
                          ? Math.round((Math.abs(diff) / item.old_price) * 100)
                          : 0;
                      return (
                        <div
                          key={item.id || idx}
                          className="flex items-center justify-between rounded-2xl bg-slate-50/80 border border-slate-100 px-4 py-3 text-xs"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-slate-400 font-medium">
                              {new Date(item.changed_at).toLocaleString('ru-RU', {
                                day: '2-digit',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                            <span className="font-bold text-slate-900">
                              {item.new_price === 0
                                ? 'Бесплатно'
                                : `${item.new_price.toLocaleString('ru-RU')} ₽`}
                            </span>
                          </div>

                          {isFirst ? (
                            <span className="px-2.5 py-0.5 rounded-full bg-slate-200/70 text-slate-600 font-semibold">
                              Начальная цена
                            </span>
                          ) : diff < 0 ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold">
                              <TrendingDown className="w-3.5 h-3.5" />
                              <span>
                                {diff.toLocaleString('ru-RU')} ₽ {pct > 0 ? `(-${pct}%)` : ''}
                              </span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 font-bold">
                              <TrendingUp className="w-3.5 h-3.5" />
                              <span>
                                +{diff.toLocaleString('ru-RU')} ₽ {pct > 0 ? `(+${pct}%)` : ''}
                              </span>
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <aside className="space-y-4">
              <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 space-y-3.5">
                <div className="text-3xl font-extrabold text-slate-900 tracking-tight">
                  {ad.price === 0 ? 'Бесплатно' : `${ad.price.toLocaleString('ru-RU')} ₽`}
                </div>

                {notice && (
                  <div
                    className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold ${
                      notice.type === 'success'
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                        : 'bg-rose-50 border-rose-200 text-rose-700'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>{notice.text}</span>
                  </div>
                )}

                {!isOwner && ad.status === 'active' && (
                  <Button
                    variant="primary"
                    fullWidth
                    isLoading={actionLoading}
                    onClick={handleAddToCart}
                  >
                    <ShoppingCart className="w-4 h-4" />
                    <span>Добавить в корзину</span>
                  </Button>
                )}

                <Button
                  variant={liked ? 'danger' : 'secondary'}
                  fullWidth
                  onClick={handleFavorite}
                >
                  <Heart className={`w-4 h-4 ${liked ? 'fill-current' : ''}`} />
                  <span>{liked ? 'В избранном' : 'Добавить в избранное'}</span>
                </Button>

                {isOwner && (
                  <div className="pt-3 border-t border-slate-100 space-y-2.5">
                    <Link to={`/ads/${ad.id}/edit`} className="block">
                      <Button variant="outline" fullWidth>
                        <Pencil className="w-4 h-4" />
                        <span>Редактировать</span>
                      </Button>
                    </Link>

                    <Button
                      variant="outline"
                      fullWidth
                      isLoading={actionLoading}
                      onClick={handleToggleClose}
                    >
                      {ad.status === 'active' ? (
                        <>
                          <Lock className="w-4 h-4" />
                          <span>Снять с публикации</span>
                        </>
                      ) : (
                        <>
                          <Unlock className="w-4 h-4" />
                          <span>Опубликовать снова</span>
                        </>
                      )}
                    </Button>

                    <Button
                      variant="danger"
                      fullWidth
                      isLoading={actionLoading}
                      onClick={handleDelete}
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Удалить объявление</span>
                    </Button>
                  </div>
                )}
              </div>

              {/* Блок платного продвижения для владельца (РК4) */}
              {isOwner && ad.status === 'active' && tariffs.length > 0 && (
                <div className="bg-gradient-to-br from-amber-50/80 via-white to-indigo-50/60 rounded-3xl border border-amber-200/80 shadow-sm p-5 space-y-3.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Crown className="w-5 h-5 text-amber-500" />
                      <h3 className="text-sm font-extrabold text-slate-900">Продвинуть объявление</h3>
                    </div>
                    {walletBalance !== null && (
                      <Link
                        to="/profile"
                        className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:underline"
                      >
                        <Wallet className="w-3.5 h-3.5" />
                        <span>{walletBalance.toLocaleString('ru-RU')} ₽</span>
                      </Link>
                    )}
                  </div>

                  {promoted && ad.promoted_until && (
                    <div className="text-xs font-semibold text-amber-800 bg-amber-100/70 rounded-xl px-3 py-2">
                      Активен тариф «{(ad.promotion_tier || '').toUpperCase()}» до{' '}
                      {new Date(ad.promoted_until).toLocaleDateString('ru-RU')}
                    </div>
                  )}

                  <div className="space-y-2">
                    {tariffs.map((t) => (
                      <button
                        key={t.tier}
                        type="button"
                        disabled={actionLoading}
                        onClick={() => handlePromote(t.tier)}
                        className="w-full flex items-center justify-between rounded-2xl bg-white hover:bg-indigo-50/60 border border-slate-200 hover:border-indigo-300 px-3.5 py-2.5 text-left transition-all disabled:opacity-50"
                      >
                        <div>
                          <div className="text-xs font-bold text-slate-900">{t.title}</div>
                          <div className="text-[11px] text-slate-500">На {t.days} дн.</div>
                        </div>
                        <span className="px-2.5 py-1 rounded-xl bg-indigo-600 text-white text-xs font-extrabold">
                          {t.price} ₽
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {ad.seller && (
                <Link
                  to={`/sellers/${ad.seller.id}`}
                  className="bg-white rounded-3xl border border-slate-200/80 hover:border-indigo-300 shadow-sm p-5 flex items-center gap-3.5 transition-all group"
                >
                  <img
                    src={resolveMediaUrl(ad.seller.avatar_path)}
                    alt={ad.seller.name}
                    onError={(e) => {
                      e.currentTarget.src = '/images/logo/avatar.svg';
                    }}
                    className="w-12 h-12 rounded-2xl object-cover ring-2 ring-indigo-50"
                  />
                  <div>
                    <div className="text-xs text-slate-400 font-medium">Продавец</div>
                    <div className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                      {ad.seller.name}
                    </div>
                    <div className="text-xs text-slate-500">
                      Объявлений: {ad.seller.ads_count ?? 1}
                    </div>
                  </div>
                </Link>
              )}
            </aside>
          </div>
        )}
      </div>
    </MainLayout>
  );
};
