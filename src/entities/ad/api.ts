import { apiClient, translateError } from '@/shared/api/client';
import { Ad, AdDetail, AdUpsertPayload, AdValidationErrors } from './model';

function mapAdErrors(data?: AdValidationErrors) {
  if (!data) return undefined;
  return {
    title: data.title ? translateError(data.title) : undefined,
    description: data.description ? translateError(data.description) : undefined,
    price: data.price ? translateError(data.price) : undefined,
    category_id: data.category_id ? translateError(data.category_id) : undefined,
    location: data.location ? translateError(data.location) : undefined,
  };
}

export const adApi = {
  async getAll() {
    return apiClient.get<Ad[]>('/ads');
  },

  async getById(id: number) {
    return apiClient.get<AdDetail>(`/ads/${id}`);
  },

  async getMyAds() {
    return apiClient.get<Ad[]>('/my/ads');
  },

  async create(payload: AdUpsertPayload) {
    const res = await apiClient.post<Ad & AdValidationErrors>('/ads', payload);
    return {
      ...res,
      fieldErrors: !res.success ? mapAdErrors(res.data) : undefined,
    };
  },

  async update(id: number, payload: AdUpsertPayload) {
    const res = await apiClient.put<Ad & AdValidationErrors>(`/ads/${id}`, payload);
    return {
      ...res,
      fieldErrors: !res.success ? mapAdErrors(res.data) : undefined,
    };
  },

  async close(id: number) {
    return apiClient.post<Ad>(`/ads/${id}/close`);
  },

  async reopen(id: number) {
    return apiClient.post<Ad>(`/ads/${id}/reopen`);
  },

  async remove(id: number) {
    return apiClient.delete<{ status: string }>(`/ads/${id}`);
  },

  async uploadPhoto(file: File) {
    const formData = new FormData();
    formData.append('photo', file);
    return apiClient.post<{ url: string }>('/ads/photos', formData);
  },
};
