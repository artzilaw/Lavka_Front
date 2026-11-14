export interface User {
  id: number;
  user_id?: number;
  name: string;
  email: string;
  avatar_path?: string;
  rating?: number;
  reviews_count?: number;
  ads_count?: number;
  favorites_count?: number;
  cart_count?: number;
  created_at?: string;
  updated_at?: string;
}

export interface ServerValidationErrors {
  name?: string;
  email?: string;
  password?: string;
  current_password?: string;
  new_password?: string;
  error?: string;
}
