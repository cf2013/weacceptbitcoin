export interface Store {
  id: string;
  name: string;
  description: string;
  category: string;
  btc_address: string;
  verified: boolean;
  reviews: Review[];
  created_at: string;
  updated_at: string;
}

export interface Review {
  id: string;
  rating: number;
  comment: string;
  created_at: string;
  txid: string;
  store_id: string;
}

export interface ApiResponse<T> {
  status: string;
  data?: T;
  message?: string;
  error?: string;
}

export interface StoreFormData {
  name: string;
  description?: string;
  category?: string;
  website?: string;
  btc_address: string;
}

export interface ReviewFormData {
  store_id: string;
  rating: number;
  text?: string;
  txid: string;
}

export interface VerificationFormData {
  txid: string;
} 