import { Ad } from '@/entities/ad/model';

export interface SellerProfile {
  id: number;
  name: string;
  avatar_path?: string;
  rating: number;
  reviews_count: number;
  ads_count: number;
  active_ads_count: number;
  closed_ads_count: number;
  created_at?: string;
}

export interface SellerPageData {
  seller: SellerProfile;
  ads: Ad[];
}
