export type AdStatus = 'active' | 'closed' | 'sold' | 'deleted' | string;

export interface SellerSummary {
  id: number;
  name: string;
  avatar_path?: string;
  rating: number;
  reviews_count: number;
  ads_count: number;
  created_at?: string;
}

export interface Ad {
  id: number;
  seller_id: number;
  category_id: number;
  title: string;
  description: string;
  price: number;
  status: AdStatus;
  views_count: number;
  favorites_count?: number;
  location: string;
  photos?: string[];
  created_at?: string;
  updated_at?: string;
}

export interface AdDetail extends Ad {
  seller?: SellerSummary;
}

export interface AdUpsertPayload {
  title: string;
  description: string;
  price: number;
  category_id: number;
  location: string;
  photos: string[];
}

export interface AdValidationErrors {
  title?: string;
  description?: string;
  price?: string;
  category_id?: string;
  location?: string;
  error?: string;
}
