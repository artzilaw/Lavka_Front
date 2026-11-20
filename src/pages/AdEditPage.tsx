import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Edit3 } from 'lucide-react';
import { MainLayout } from '@/app/layouts/MainLayout';
import { useAuth } from '@/app/providers/AuthContext';
import { AdForm } from '@/features/ads/AdForm';
import { adApi } from '@/entities/ad/api';
import { AdDetail, AdUpsertPayload } from '@/entities/ad/model';
import { Button } from '@/shared/ui/Button';

export const AdEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [ad, setAd] = useState<AdDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const adId = Number(id);

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!adId || Number.isNaN(adId)) {
        setError('Некорректный идентификатор объявления');
        setIsLoading(false);
        return;
      }
      const res = await adApi.getById(adId);
      if (!mounted) return;
      if (res.success && res.data) {
        if (user && res.data.seller_id !== user.id) {
          setError('Вы можете редактировать только собственные объявления');
        } else {
          setAd(res.data);
        }
      } else {
        setError(res.error || 'Объявление не найдено');
      }
      setIsLoading(false);
    })();
    return () => {
      mounted = false;
    };
  }, [adId, user]);

  const handleUpdate = async (payload: AdUpsertPayload) => {
    const res = await adApi.update(adId, payload);
    if (res.success) {
      navigate(`/ads/${adId}`);
      return { success: true };
    }
    return {
      success: false,
      error: res.error,
      fieldErrors: res.fieldErrors,
    };
  };

  return (
    <MainLayout>
      <div className="max-w-3xl mx-auto space-y-5">
        <Link
          to={ad ? `/ads/${ad.id}` : '/'}
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-600 hover:text-indigo-600 px-3.5 py-2 rounded-xl bg-white border border-slate-200/80 hover:border-indigo-200 transition-colors shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Назад к объявлению</span>
        </Link>

        {isLoading ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-10 text-center text-sm text-slate-500">
            Загрузка объявления...
          </div>
        ) : error || !ad ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-10 text-center space-y-4">
            <p className="text-base font-bold text-slate-800">{error || 'Объявление не найдено'}</p>
            <Link to="/">
              <Button variant="primary">На главную</Button>
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 sm:p-8 space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
              <div className="w-11 h-11 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Edit3 className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                  Редактирование объявления
                </h1>
                <p className="text-xs sm:text-sm text-slate-500">{ad.title}</p>
              </div>
            </div>

            <AdForm
              initialValues={{
                title: ad.title,
                description: ad.description,
                price: ad.price,
                category_id: ad.category_id,
                location: ad.location,
                photos: ad.photos || [],
              }}
              submitLabel="Сохранить изменения"
              onSubmit={handleUpdate}
              onCancel={() => navigate(`/ads/${ad.id}`)}
            />
          </div>
        )}
      </div>
    </MainLayout>
  );
};
