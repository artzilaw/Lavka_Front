import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, PlusCircle } from 'lucide-react';
import { MainLayout } from '@/app/layouts/MainLayout';
import { AdForm } from '@/features/ads/AdForm';
import { adApi } from '@/entities/ad/api';
import { AdUpsertPayload } from '@/entities/ad/model';

export const AdCreatePage: React.FC = () => {
  const navigate = useNavigate();

  const handleCreate = async (payload: AdUpsertPayload) => {
    const res = await adApi.create(payload);
    if (res.success && res.data?.id) {
      navigate(`/ads/${res.data.id}`);
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
          to="/"
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-600 hover:text-indigo-600 px-3.5 py-2 rounded-xl bg-white border border-slate-200/80 hover:border-indigo-200 transition-colors shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Назад к объявлениям</span>
        </Link>

        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
            <div className="w-11 h-11 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <PlusCircle className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                Новое объявление
              </h1>
              <p className="text-xs sm:text-sm text-slate-500">
                Заполните детали товара и добавьте фотографии
              </p>
            </div>
          </div>

          <AdForm
            submitLabel="Опубликовать объявление"
            onSubmit={handleCreate}
            onCancel={() => navigate(-1)}
          />
        </div>
      </div>
    </MainLayout>
  );
};
