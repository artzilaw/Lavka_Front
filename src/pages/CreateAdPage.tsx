import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Upload, X, PlusCircle, Save } from 'lucide-react';
import { MainLayout } from '@/app/layouts/MainLayout';
import { adApi } from '@/entities/ad/api';
import { resolveMediaUrl } from '@/shared/config/env';
import { Input } from '@/shared/ui/Input';
import { Button } from '@/shared/ui/Button';
import { Alert } from '@/shared/ui/Alert';

const AD_CATEGORIES = [
  { id: 1, title: 'Электроника' },
  { id: 2, title: 'Авто и гаражи' },
  { id: 3, title: 'Недвижимость' },
  { id: 4, title: 'Одежда и обувь' },
  { id: 5, title: 'Хобби и отдых' },
  { id: 6, title: 'Для дома' },
  { id: 7, title: 'Работа' },
  { id: 8, title: 'Животные' },
  { id: 9, title: 'Запчасти' },
  { id: 10, title: 'Детям' },
  { id: 11, title: 'Красота' },
];

export const CreateAdPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [categoryId, setCategoryId] = useState<number>(1);
  const [location, setLocation] = useState('Москва');
  const [photos, setPhotos] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isEdit || !id) return;
    let mounted = true;
    (async () => {
      const res = await adApi.getById(Number(id), false);
      if (mounted && res.success && res.data) {
        setTitle(res.data.title);
        setDescription(res.data.description);
        setPrice(String(res.data.price));
        setCategoryId(res.data.category_id || 1);
        setLocation(res.data.location || 'Москва');
        setPhotos(res.data.photos || []);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [id, isEdit]);

  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError('');
    setIsUploading(true);
    const res = await adApi.uploadPhoto(file);
    setIsUploading(false);
    e.target.value = '';

    if (res.success && res.data?.url) {
      setPhotos((prev) => [...prev, res.data!.url]);
    } else {
      setError(res.error || 'Не удалось загрузить фото');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const parsedPrice = Number(price === '' ? 0 : price);
    if (!title.trim() || title.trim().length < 3) {
      setError('Название должно содержать минимум 3 символа');
      return;
    }
    if (!description.trim() || description.trim().length < 5) {
      setError('Описание должно содержать минимум 5 символов');
      return;
    }
    if (Number.isNaN(parsedPrice) || parsedPrice < 0) {
      setError('Укажите корректную цену (0 для бесплатного)');
      return;
    }

    setIsSubmitting(true);
    const payload = {
      title: title.trim(),
      description: description.trim(),
      price: Math.floor(parsedPrice),
      category_id: categoryId,
      location: location.trim() || 'Москва',
      photos,
    };

    const res = isEdit && id ? await adApi.update(Number(id), payload) : await adApi.create(payload);
    setIsSubmitting(false);

    if (res.success && res.data) {
      navigate(`/ads/${res.data.id}`);
      return;
    }

    const details = res.data as Record<string, string> | undefined;
    const detailMsg =
      details?.title || details?.description || details?.price || details?.location || details?.category_id;
    setError(detailMsg || res.error || 'Не удалось сохранить объявление');
  };

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Link
            to={isEdit && id ? `/ads/${id}` : '/'}
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-indigo-600"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Назад</span>
          </Link>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 sm:p-8">
          <h1 className="text-2xl font-extrabold text-slate-900 mb-1">
            {isEdit ? 'Редактировать объявление' : 'Новое объявление'}
          </h1>
          <p className="text-sm text-slate-500 mb-6">
            Заполните подробности товара — объявление сразу появится в каталоге
          </p>

          {error && <Alert type="error" message={error} className="mb-5" />}

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              id="ad-title"
              label="Название объявления"
              placeholder="Например, MacBook Air M2 16/512"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="ad-category" className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Категория
                </label>
                <select
                  id="ad-category"
                  value={categoryId}
                  onChange={(e) => setCategoryId(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 py-2.5 text-sm text-slate-900 focus:bg-white focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/15"
                >
                  {AD_CATEGORIES.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </div>

              <Input
                id="ad-price"
                type="number"
                min={0}
                label="Цена (₽)"
                placeholder="0 — бесплатно"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </div>

            <Input
              id="ad-location"
              label="Город / локация"
              placeholder="Москва"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
            />

            <div>
              <label htmlFor="ad-description" className="block text-xs font-semibold text-slate-700 mb-1.5">
                Описание
              </label>
              <textarea
                id="ad-description"
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Расскажите о состоянии, комплектации и условиях передачи..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/15"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">Фотографии</label>
              <div className="flex flex-wrap gap-3">
                {photos.map((url, idx) => (
                  <div key={`${url}-${idx}`} className="relative w-24 h-24 rounded-xl overflow-hidden border border-slate-200">
                    <img
                      src={resolveMediaUrl(url, '/images/logo/logo.svg')}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setPhotos((prev) => prev.filter((_, i) => i !== idx))}
                      className="absolute top-1 right-1 w-6 h-6 rounded-full bg-slate-900/70 text-white flex items-center justify-center hover:bg-rose-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}

                <label className="w-24 h-24 rounded-xl border-2 border-dashed border-slate-300 hover:border-indigo-400 bg-slate-50 hover:bg-indigo-50/40 flex flex-col items-center justify-center gap-1 cursor-pointer text-slate-500 hover:text-indigo-600 transition-colors">
                  <Upload className="w-5 h-5" />
                  <span className="text-[11px] font-semibold">
                    {isUploading ? 'Загрузка...' : 'Добавить'}
                  </span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    onChange={handlePhotoSelect}
                    disabled={isUploading}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            <div className="pt-2">
              <Button type="submit" variant="primary" size="lg" fullWidth isLoading={isSubmitting}>
                {isEdit ? <Save className="w-4 h-4" /> : <PlusCircle className="w-4 h-4" />}
                <span>{isEdit ? 'Сохранить изменения' : 'Опубликовать объявление'}</span>
              </Button>
            </div>
          </form>
        </div>
      </div>
    </MainLayout>
  );
};
