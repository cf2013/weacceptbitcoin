export interface Store {
  id: string;
  name: string;
  description: string;
  category: string;
  website: string;
  btc_address: string;
  verified: boolean;
  verification_txid: string;
  verification_amount: number;
  banner_image_url?: string;
  profile_image_url?: string;
  created_at: string;
  updated_at: string;
  reviews: Review[];
}

export interface Review {
  id: string;
  rating: number;
  comment: string;
  created_at: string;
  updated_at: string;
  txid: string;
  store_id: string;
  verified: boolean;
  user_pubkey?: string;
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
  description: string;
  category: string;
  website: string;
  btc_address: string;
  verified?: boolean;
  verification_txid?: string;
  verification_amount?: number;
  created_at?: string;
  updated_at?: string;
  banner_image?: File;
  profile_image?: File;
}

export interface ReviewFormData {
  store_id: string;
  rating: number;
  comment: string;
  txid?: string | null;
  verified?: boolean;
  user_pubkey?: string;
}

export interface VerificationFormData {
  store_id: string;
  txid: string;
  rating: string;
  comment: string;
  verification_amount?: number;
}

export interface LnurlAuthResponse {
  k1: string;
  lnurl: string;
  qr_code: string;
} 