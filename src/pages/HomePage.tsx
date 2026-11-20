import React, { useEffect, useState, useMemo } from 'react';
import { ShieldCheck, Truck, Sparkle } from 'lucide-react';
import { MainLayout } from '@/app/layouts/MainLayout';
import { Ad } from '@/entities/ad/model';
import { adApi } from '@/entities/ad/api';
import { CATEGORIES } from '@/entities/ad/categories';
import { AdCard } from '@/entities/ad/ui/AdCard';

export const HomePage: React.FC = () => {
  const [ads, setAds] = useState<Ad[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number>(0);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const res = await adApi.getAll();
      if (mounted) {
        if (res.success && Array.isArray(res.data)) {
          setAds(res.data);
        }
        setIsLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const filteredAds = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return ads.filter((ad) => {
      const matchesCategory = selectedCategory === 0 || ad.category_id === selectedCategory;
      const matchesQuery =
        !q ||
        ad.title.toLowerCase().includes(q) ||
        (ad.description || '').toLowerCase().includes(q) ||
        (ad.location || '').toLowerCase().includes(q);
      return matchesCategory && matchesQuery;
    });
  }, [ads, searchQuery, selectedCategory]);

  return (
    <MainLayout searchQuery={searchQuery} onSearchChange={setSearchQuery}>
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-7 items-start">
        <div className="space-y-8">
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Категории</h2>
              {selectedCategory !== 0 && (
                <button
                  type="button"
                  onClick={() => setSelectedCategory(0)}
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-500"
                >
                  Показать все
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-3">
              {CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                const isActive = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`group flex flex-col items-start justify-between p-3.5 rounded-2xl border text-left transition-all duration-200 h-24 ${
                      isActive
                        ? 'bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-500/25 -translate-y-0.5'
                        : 'bg-white border-slate-200/80 text-slate-800 hover:border-indigo-300 hover:shadow-md hover:-translate-y-0.5'
                    }`}
                  >
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 ${
                        isActive ? 'bg-white/20 text-white' : cat.color
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-bold leading-tight line-clamp-1">
                      {cat.title}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          <section>
            <div className="flex items-baseline justify-between mb-4">
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                Рекомендации для вас
              </h2>
              <span className="text-xs font-semibold text-slate-500">
                Найдено: {filteredAds.length}
              </span>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                {Array.from({ length: 6 }).map((_, idx) => (
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
            ) : filteredAds.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                {filteredAds.map((ad) => (
                  <AdCard key={ad.id} ad={ad} />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-3xl border border-dashed border-slate-300 p-12 text-center space-y-3">
                <p className="text-base font-bold text-slate-700">Объявления не найдены</p>
                <p className="text-xs text-slate-500">
                  Попробуйте изменить поисковый запрос или выбрать другую категорию
                </p>
                {(searchQuery || selectedCategory !== 0) && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory(0);
                    }}
                    className="inline-flex items-center px-4 py-2 rounded-xl bg-indigo-50 text-indigo-600 text-xs font-semibold hover:bg-indigo-100 transition-colors"
                  >
                    Сбросить фильтры
                  </button>
                )}
              </div>
            )}
          </section>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-28">
          <div className="rounded-3xl bg-gradient-to-br from-indigo-950 via-indigo-900 to-violet-900 text-white p-6 shadow-xl shadow-indigo-950/15 space-y-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-indigo-100 text-[11px] font-bold uppercase tracking-wider">
              <Sparkle className="w-3 h-3" />
              <span>Лавка Доставка</span>
            </span>

            <h3 className="text-lg font-extrabold leading-snug">
              Покупайте безопасно по всей России
            </h3>

            <p className="text-xs text-indigo-200 leading-relaxed">
              Деньги резервируются в банке и переводятся продавцу только после того, как вы проверите
              и заберёте товар в пункте выдачи.
            </p>

            <div className="pt-2 space-y-2.5 border-t border-white/10 text-xs text-indigo-100">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Защита покупателя и продавца</span>
              </div>
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Более 15 000 пунктов выдачи</span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </MainLayout>
  );
};
