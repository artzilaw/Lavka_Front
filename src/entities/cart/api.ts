import { apiClient, translateError } from '@/shared/api/client';
import { CartResponse, CheckoutPayload, CheckoutValidationErrors, Order } from './model';

export const cartApi = {
  async getCart() {
    return apiClient.get<CartResponse>('/cart');
  },

  async addItem(adId: number, quantity = 1) {
    return apiClient.post<CartResponse>('/cart/items', { ad_id: adId, quantity });
  },

  async updateQuantity(adId: number, quantity: number) {
    return apiClient.patch<CartResponse>(`/cart/items/${adId}`, { quantity });
  },

  async removeItem(adId: number) {
    return apiClient.delete<CartResponse>(`/cart/items/${adId}`);
  },

  async clearCart() {
    return apiClient.delete<CartResponse>('/cart');
  },

  async checkout(payload: CheckoutPayload) {
    const res = await apiClient.post<Order & CheckoutValidationErrors>('/cart/checkout', payload);
    return {
      ...res,
      fieldErrors:
        !res.success && res.data
          ? {
              delivery_address: res.data.delivery_address
                ? translateError(res.data.delivery_address)
                : undefined,
              phone: res.data.phone ? translateError(res.data.phone) : undefined,
            }
          : undefined,
    };
  },

  async getOrders() {
    return apiClient.get<Order[]>('/orders');
  },
};
