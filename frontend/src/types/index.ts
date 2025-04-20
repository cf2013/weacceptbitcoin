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
  website?: string;
}

export interface Review {
  id: string;
  rating: number;
  comment: string;
  created_at: string;
  txid: string;
  store_id: string;
  verified: boolean;
}

export interface ApiResponse<T> {
  status: string;
  data?: T;
  message?: string;
  error?: string;
}

export interface StoreFormData {
  id?: string;
  name: string;
  description?: string;
  category?: string;
  website?: string;
  btc_address: string;
  verified?: boolean;
  verification_txid?: string;
  verification_amount?: number;
  created_at?: string;
  updated_at?: string;
}

export interface ReviewFormData {
  store_id: string;
  rating: number;
  comment: string;
  txid?: string;
}

export interface VerificationFormData {
  store_id: string;
  txid: string;
  rating: string;
  comment: string;
} 