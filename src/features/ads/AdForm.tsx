import React, { useState, useRef } from 'react';
import { ImagePlus, X, MapPin, Tag, RussianRuble, FileText, Loader2 } from 'lucide-react';
import { SELECTABLE_CATEGORIES } from '@/entities/ad/categories';
import { AdUpsertPayload } from '@/entities/ad/model';
import { adApi } from '@/entities/ad/api';
import { resolveMediaUrl } from '@/shared/config/env';
import { Input } from '@/shared/ui/Input';
import { Button } from '@/shared/ui/Button';
import { Alert } from '@/shared/ui/Alert';

interface AdFormProps {
  initialValues?: Partial<AdUpsertPayload>;
  submitLabel: string;
  onSubmit: (payload: AdUpsertPayload) => Promise<{
    success: boolean;
    error?: string;
    fieldErrors?: Partial<Record<keyof AdUpsertPayload, string>>;
  }>;
  onCancel?: () => void;
}

export const AdForm: React.FC<AdFormProps> = ({
  initialValues,
  submitLabel,
  onSubmit,
  onCancel,
}) => {
  const [title, setTitle] = useState(initialValues?.title ?? '');
  const [categoryId, setCategoryId] = useState<number>(initialValues?.category_id ?? 1);
  const [priceStr, setPriceStr] = useState(
    initialValues?.price !== undefined ? String(initialValues.price) : ''
  );
  const [location, setLocation] = useState(initialValues?.location ?? '');
  const [description, setDescription] = useState(initialValues?.description ?? '');
  const [photos, setPhotos] = useState<string[]>(initialValues?.photos ?? []);

  const [errors, setErrors] = useState<Partial<Record<keyof AdUpsertPayload, string>>>({});
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateClient = (): AdUpsertPayload | null => {
    const nextErrors: Partial<Record<keyof AdUpsertPayload, string>> = {};
    const trimmedTitle = title.trim();
    const trimmedLocation = location.trim();
    const trimmedDesc = description.trim();
    const numericPrice = priceStr.trim() === '' ? 0 : Number(priceStr);

    if (!trimmedTitle) {
      nextErrors.title = 'Укажите название объявления';
    } else if (trimmedTitle.length < 3) {
      nextErrors.title = 'Название должно содержать минимум 3 символа';
    } else if (trimmedTitle.length > 120) {
      nextErrors.title = 'Название не должно превышать 120 символов';
    }

    if (!trimmedDesc) {
      nextErrors.description = 'Добавьте описание товара';
    } else if (trimmedDesc.length < 5) {
      nextErrors.description = 'Описание должно содержать минимум 5 символов';
    }

    if (Number.isNaN(numericPrice) || numericPrice < 0 || !Number.isFinite(numericPrice)) {
      nextErrors.price = 'Введите корректную неотрицательную цену';
    }

    if (!trimmedLocation || trimmedLocation.length < 2) {
      nextErrors.location = 'Укажите город (минимум 2 символа)';
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      return null;
    }

    return {
      title: trimmedTitle,
      description: trimmedDesc,
      price: Math.round(numericPrice),
      category_id: categoryId,
      location: trimmedLocation,
      photos,
    };
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setFormError('');
    setIsUploadingPhoto(true);
    try {
      for (const file of files.slice(0, Math.max(0, 6 - photos.length))) {
        const res = await adApi.uploadPhoto(file);
        if (res.success && res.data?.url) {
          setPhotos((prev) => [...prev, res.data!.url]);
        } else {
          setFormError(res.error || 'Не удалось загрузить фотографию');
        }
      }
    } finally {
      setIsUploadingPhoto(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemovePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    const payload = validateClient();
    if (!payload) return;

    setIsSubmitting(true);
    const res = await onSubmit(payload);
    setIsSubmitting(false);

    if (!res.success) {
      if (res.fieldErrors) {
        setErrors((prev) => ({ ...prev, ...res.fieldErrors }));
      }
      if (res.error) {
        setFormError(res.error);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {formError && <Alert type="error" message={formError} />}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Input
          id="ad-title"
          label="Название товара *"
          placeholder="Например: MacBook Air M2 256GB"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            if (errors.title) setErrors((prev) => ({ ...prev, title: undefined }));
          }}
          error={errors.title}
          icon={<Tag className="w-4 h-4" />}
          maxLength={120}
        />

        <div>
          <label htmlFor="ad-category" className="block text-xs font-semibold text-slate-700 mb-1.5">
            Категория *
          </label>
          <select
            id="ad-category"
            value={categoryId}
            onChange={(e) => setCategoryId(Number(e.target.value))}
            className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 py-2.5 text-sm text-slate-900 transition-all hover:border-slate-300 focus:bg-white focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/15"
          >
            {SELECTABLE_CATEGORIES.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.title}
              </option>
            ))}
          </select>
          {errors.category_id && (
            <p className="mt-1.5 text-xs font-medium text-rose-600">{errors.category_id}</p>
          )}
        </div>

        <Input
          id="ad-price"
          type="number"
          min={0}
          step={1}
          label="Цена (₽) — оставьте 0, если отдаёте бесплатно"
          placeholder="0"
          value={priceStr}
          onChange={(e) => {
            setPriceStr(e.target.value);
            if (errors.price) setErrors((prev) => ({ ...prev, price: undefined }));
          }}
          error={errors.price}
          icon={<RussianRuble className="w-4 h-4" />}
        />

        <Input
          id="ad-location"
          label="Город / район *"
          placeholder="Например: Москва"
          value={location}
          onChange={(e) => {
            setLocation(e.target.value);
            if (errors.location) setErrors((prev) => ({ ...prev, location: undefined }));
          }}
          error={errors.location}
          icon={<MapPin className="w-4 h-4" />}
        />
      </div>

      <div>
        <label htmlFor="ad-description" className="block text-xs font-semibold text-slate-700 mb-1.5">
          Подробное описание *
        </label>
        <div className="relative">
          <FileText className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
          <textarea
            id="ad-description"
            rows={5}
            value={description}
            onChange={(e) => {
              setDescription(e.target.value);
              if (errors.description) setErrors((prev) => ({ ...prev, description: undefined }));
            }}
            placeholder="Расскажите о состоянии товара, комплектации, причине продажи и условиях передачи..."
            className={`w-full rounded-xl border bg-slate-50/70 pl-10 pr-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 transition-all focus:bg-white focus:outline-none focus:ring-4 ${
              errors.description
                ? 'border-rose-400 bg-rose-50/30 focus:border-rose-500 focus:ring-rose-500/15'
                : 'border-slate-200 hover:border-slate-300 focus:border-indigo-500 focus:ring-indigo-500/15'
            }`}
          />
        </div>
        {errors.description && (
          <p className="mt-1.5 text-xs font-medium text-rose-600">{errors.description}</p>
        )}
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-xs font-semibold text-slate-700">
            Фотографии (до 6 штук)
          </label>
          <span className="text-xs text-slate-400">{photos.length} / 6</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {photos.map((photo, idx) => (
            <div
              key={`${photo}-${idx}`}
              className="relative aspect-[4/3] rounded-xl overflow-hidden border border-slate-200 bg-slate-100 group"
            >
              <img
                src={resolveMediaUrl(photo, '/images/logo/logo.svg')}
                alt={`Фото ${idx + 1}`}
                className="w-full h-full object-cover"
              />
              {idx === 0 && (
                <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-slate-900/75 text-white text-[10px] font-bold">
                  Обложка
                </span>
              )}
              <button
                type="button"
                onClick={() => handleRemovePhoto(idx)}
                title="Удалить фото"
                className="absolute top-2 right-2 w-7 h-7 rounded-full bg-rose-600 text-white flex items-center justify-center opacity-90 hover:opacity-100 shadow-sm"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}

          {photos.length < 6 && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploadingPhoto}
              className="aspect-[4/3] rounded-xl border-2 border-dashed border-slate-300 hover:border-indigo-400 hover:bg-indigo-50/40 transition-all flex flex-col items-center justify-center gap-1.5 text-slate-500 hover:text-indigo-600 disabled:opacity-50"
            >
              {isUploadingPhoto ? (
                <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
              ) : (
                <ImagePlus className="w-6 h-6" />
              )}
              <span className="text-xs font-semibold">
                {isUploadingPhoto ? 'Загрузка...' : 'Добавить фото'}
              </span>
            </button>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          multiple
          onChange={handlePhotoUpload}
          className="hidden"
        />
      </div>

      <div className="flex flex-wrap items-center justify-end gap-3 pt-4 border-t border-slate-100">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Отмена
          </Button>
        )}
        <Button type="submit" variant="primary" isLoading={isSubmitting}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
};
