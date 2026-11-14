import { apiClient } from '@/shared/api/client';
import { Ad } from './model';

export const adApi = {
  async getAll() {
    return apiClient.get<Ad[]>('/ads');
  },
};
