import axios from 'axios';
import { Store, Review, StoreFormData, ReviewFormData, ApiResponse } from '@/types';

const API_URL = process.env.API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Store API functions
export const getStores = async (verifiedOnly = false): Promise<Store[]> => {
  const response = await api.get(`/stores?verified_only=${verifiedOnly}`);
  return response.data;
};

export const getStore = async (id: string): Promise<Store> => {
  const response = await api.get(`/stores/${id}`);
  return response.data;
};

export const createStore = async (storeData: StoreFormData): Promise<Store> => {
  const response = await api.post('/stores', storeData);
  return response.data;
};

export const verifyStore = async (storeId: string, txid: string): Promise<ApiResponse<null>> => {
  const response = await api.post(`/stores/${storeId}/verify`, { txid });
  return response.data;
};

// Review API functions
export const getStoreReviews = async (storeId: string, verifiedOnly = false): Promise<Review[]> => {
  const response = await api.get(`/reviews/store/${storeId}?verified_only=${verifiedOnly}`);
  return response.data;
};

export const getReview = async (id: string): Promise<Review> => {
  const response = await api.get(`/reviews/${id}`);
  return response.data;
};

export const createReview = async (reviewData: ReviewFormData): Promise<Review> => {
  const response = await api.post('/reviews', reviewData);
  return response.data;
};

export const verifyReview = async (reviewId: string): Promise<ApiResponse<null>> => {
  const response = await api.post(`/reviews/${reviewId}/verify`);
  return response.data;
}; 