import { Ad } from '@/entities/ad/model';

export interface CartItemView {
  ad_id: number;
  quantity: number;
  added_at: string;
  ad: Ad;
  seller_name: string;
  available: boolean;
}

export interface CartResponse {
  items: CartItemView[];
  total_items: number;
  total_price: number;
}

export interface CheckoutPayload {
  delivery_method: 'delivery' | 'pickup';
  delivery_address: string;
  payment_method: 'card' | 'cash';
  phone: string;
  comment: string;
}

export interface CheckoutValidationErrors {
  delivery_address?: string;
  phone?: string;
  error?: string;
}

export interface OrderItem {
  ad_id: number;
  seller_id: number;
  seller_name: string;
  title: string;
  price: number;
  quantity: number;
  photo?: string;
}

export interface Order {
  id: number;
  buyer_id: number;
  items: OrderItem[];
  total_price: number;
  delivery_method: string;
  delivery_address: string;
  payment_method: string;
  phone: string;
  comment?: string;
  status: string;
  created_at: string;
}
