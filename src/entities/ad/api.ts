import { apiClient } from '@/shared/api/client';
import {
  Ad,
  AdDetail,
  AdSeller,
  AdUpsertPayload,
  PriceHistoryItem,
  PromotionTariff,
  WalletData,
  WalletTransaction,
} from './model';

export type { AdDetail, AdSeller, AdUpsertPayload };

export interface AdSearchParams {
  q?: string;
  category_id?: number;
  location?: string;
  min_price?: number;
  max_price?: number;
  sort?: 'newest' | 'price_asc' | 'price_desc' | 'popular';
}

export const adApi = {
  async getAll() {
    return apiClient.get<Ad[]>('/ads');
  },

  async search(params: AdSearchParams) {
    const qs = new URLSearchParams();
    if (params.q?.trim()) qs.set('q', params.q.trim());
    if (params.category_id && params.category_id > 0) qs.set('category_id', String(params.category_id));
    if (params.location?.trim()) qs.set('location', params.location.trim());
    if (params.min_price !== undefined && !Number.isNaN(params.min_price)) {
      qs.set('min_price', String(params.min_price));
    }
    if (params.max_price !== undefined && !Number.isNaN(params.max_price)) {
      qs.set('max_price', String(params.max_price));
    }
    if (params.sort) qs.set('sort', params.sort);
    const query = qs.toString();
    return apiClient.get<Ad[]>(query ? `/ads?${query}` : '/ads');
  },

  async getById(id: number, trackView = true) {
    const query = trackView ? '' : '?track_view=false';
    return apiClient.get<AdDetail>(`/ads/${id}${query}`);
  },

  async addToCart(adId: number, quantity = 1) {
    return apiClient.post('/cart', { ad_id: adId, quantity });
  },

  async getMyAds() {
    return apiClient.get<Ad[]>('/my/ads');
  },

  async create(payload: AdUpsertPayload) {
    return apiClient.post<Ad>('/ads', payload);
  },

  async update(id: number, payload: AdUpsertPayload) {
    return apiClient.put<Ad>(`/ads/${id}`, payload);
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

  async getFavorites() {
    return apiClient.get<Ad[]>('/favorites');
  },

  async addFavorite(adId: number) {
    return apiClient.post<{ status: string; ad_id: number; favorites_count: number }>(
      `/favorites/${adId}`
    );
  },

  async removeFavorite(adId: number) {
    return apiClient.delete<{ status: string; ad_id: number; favorites_count: number }>(
      `/favorites/${adId}`
    );
  },

  async getPromotionTariffs() {
    return apiClient.get<PromotionTariff[]>('/promotion/tariffs');
  },

  async promote(adId: number, tier: string) {
    return apiClient.post<{ ad: Ad; balance: number; transaction: WalletTransaction }>(
      `/ads/${adId}/promote`,
      { tier }
    );
  },

  async getWallet() {
    return apiClient.get<WalletData>('/wallet');
  },

  async topUpWallet(amount: number) {
    return apiClient.post<{ balance: number; transaction: WalletTransaction }>('/wallet/topup', {
      amount,
    });
  },
};
