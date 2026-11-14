export interface Ad {
  id: number;
  seller_id: number;
  category_id: number;
  title: string;
  description: string;
  price: number;
  status: string;
  views_count: number;
  location: string;
  photos?: string[];
  created_at?: string;
  updated_at?: string;
}
