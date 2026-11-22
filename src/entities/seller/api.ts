import { apiClient } from '@/shared/api/client';
import { SellerPageData } from './model';

export const sellerApi = {
  async getSellerPage(sellerId: number) {
    return apiClient.get<SellerPageData>(`/sellers/${sellerId}`);
  },
};
