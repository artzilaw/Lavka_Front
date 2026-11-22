export interface PriceHistoryItem {
  id: number;
  ad_id: number;
  old_price: number;
  new_price: number;
  changed_at: string;
}

export interface PromotionTariff {
  tier: 'highlight' | 'boost' | 'vip';
  title: string;
  price: number;
  priority: number;
  days: number;
}

export interface WalletTransaction {
  id: number;
  user_id: number;
  amount: number;
  type: 'topup' | 'promotion';
  description: string;
  created_at: string;
}

export interface WalletData {
  balance: number;
  transactions: WalletTransaction[];
}

export interface Ad {
  id: number;
  seller_id: number;
  category_id: number;
  title: string;
  description: string;
  price: number;
  status: string;
  views_count: number;
  favorites_count?: number;
  promotion_tier?: string;
  promotion_priority?: number;
  promoted_until?: string;
  location: string;
  photos?: string[];
  created_at?: string;
  updated_at?: string;
}

export function isAdPromoted(ad: Pick<Ad, 'promotion_tier' | 'promoted_until'>): boolean {
  if (!ad.promotion_tier || !ad.promoted_until) return false;
  return new Date(ad.promoted_until).getTime() > Date.now();
}
