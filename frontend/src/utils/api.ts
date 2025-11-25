import axios from 'axios';
import { Store, Review, StoreFormData, ReviewFormData, VerificationFormData, ApiResponse } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/api` : 'http://localhost:8000/api';

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

export const verifyReviewTransaction = async (storeId: string, verificationData: VerificationFormData): Promise<ApiResponse<{ txid: string }>> => {
  // Validate txid length
  if (!verificationData.txid || verificationData.txid.length !== 64) {
    throw new Error('Transaction ID must be exactly 64 characters long');
  }
  
  // Extract only the required fields for the verification request
  const verificationRequest = {
    txid: verificationData.txid,
    verification_amount: verificationData.verification_amount ? parseInt(verificationData.verification_amount.toString()) : undefined
  };
  
  console.log('Sending verification request:', {
    url: `/reviews/verify?store_id=${storeId}`,
    body: verificationRequest
  });
  
  try {
    // Send the request with store_id as a query parameter and verification as the request body
    const response = await api.post(`/reviews/verify?store_id=${storeId}`, verificationRequest);
    return response.data;
  } catch (error: any) {
    console.error('Error in verifyReviewTransaction:', error);
    if (error.response) {
      console.error('Error response data:', error.response.data);
      console.error('Error response status:', error.response.status);
      throw new Error(error.response.data?.detail || error.response.data?.message || error.message || 'Verification failed');
    }
    throw error;
  }
}; 