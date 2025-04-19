import React, { useState, useEffect } from 'react';
import { FaBitcoin, FaStar, FaCheckCircle, FaTimesCircle, FaTimes, FaGlobe } from 'react-icons/fa';
import { Store, Review } from '@/types';
import ReviewCard from './ReviewCard';
import ReviewForm from './ReviewForm';

interface StoreDetailsModalProps {
  store: Store;
  isOpen: boolean;
  onClose: () => void;
}

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

const StoreDetailsModal: React.FC<StoreDetailsModalProps> = ({ store, isOpen, onClose }) => {
  const [reviews, setReviews] = useState<Review[]>(store.reviews || []);
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch reviews if they're not already available
  useEffect(() => {
    if (isOpen && (!store.reviews || store.reviews.length === 0)) {
      fetchReviews();
    }
  }, [isOpen, store.id]);

  const fetchReviews = async () => {
    try {
      setIsLoadingReviews(true);
      setError(null);
      
      const response = await fetch(`${API_URL}/api/reviews/store/${store.id}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch reviews: ${response.statusText}`);
      }
      
      const fetchedReviews = await response.json();
      setReviews(fetchedReviews);
    } catch (err) {
      console.error('Error fetching reviews:', err);
      setError('Failed to load reviews. Please try again later.');
    } finally {
      setIsLoadingReviews(false);
    }
  };

  const handleReviewSubmit = async (reviewData: any) => {
    try {
      setIsSubmittingReview(true);
      setError(null);
      
      const response = await fetch(`${API_URL}/api/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reviewData),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to submit review: ${response.statusText}`);
      }
      
      const newReview = await response.json();
      setReviews([...reviews, newReview]);
      setShowReviewForm(false);
    } catch (err) {
      console.error('Error submitting review:', err);
      setError('Failed to submit review. Please try again later.');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  if (!isOpen) return null;

  // Calculate average rating
  const averageRating = reviews && reviews.length > 0
    ? reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length
    : 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold">{store.name}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <FaTimes size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Store Info */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">About</h3>
                <p className="text-gray-600">{store.description || 'No description available.'}</p>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">Category</h3>
                <span className="inline-block bg-gray-200 text-gray-700 px-3 py-1 rounded-full">
                  {store.category || 'Uncategorized'}
                </span>
              </div>

              {store.website && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">Website</h3>
                  <a
                    href={store.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-bitcoin-orange hover:underline flex items-center"
                  >
                    <FaGlobe className="mr-2" />
                    {store.website}
                  </a>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">Bitcoin Address</h3>
                <div className="bg-gray-50 p-3 rounded-md">
                  <div className="flex items-center text-bitcoin-orange">
                    <FaBitcoin className="mr-2" />
                    <span className="font-mono break-all">{store.btc_address}</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">Verification Status</h3>
                <div className="flex items-center">
                  {store.verified ? (
                    <span className="text-green-500 flex items-center">
                      <FaCheckCircle className="mr-2" />
                      <span>Verified Store</span>
                    </span>
                  ) : (
                    <span className="text-gray-400 flex items-center">
                      <FaTimesCircle className="mr-2" />
                      <span>Not Verified</span>
                    </span>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">Rating</h3>
                <div className="flex items-center">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <FaStar
                        key={i}
                        className={`${
                          i < averageRating ? 'text-yellow-400' : 'text-gray-300'
                        } mr-1`}
                      />
                    ))}
                  </div>
                  <span className="ml-2">
                    {averageRating.toFixed(1)} ({reviews.length} reviews)
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Reviews Section */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Reviews</h3>
              <button
                onClick={() => setShowReviewForm(!showReviewForm)}
                className="btn btn-outline btn-sm"
              >
                {showReviewForm ? 'Cancel' : 'Add Review'}
              </button>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-md mb-4">
                {error}
              </div>
            )}

            {showReviewForm && (
              <div className="mb-6 p-4 border rounded-md">
                <h4 className="text-md font-semibold mb-3">Write a Review</h4>
                <ReviewForm
                  storeId={store.id}
                  onSubmit={handleReviewSubmit}
                  isLoading={isSubmittingReview}
                />
              </div>
            )}

            {isLoadingReviews ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-bitcoin-orange mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading reviews...</p>
              </div>
            ) : reviews.length > 0 ? (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <ReviewCard key={review.id} review={review} />
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No reviews yet. Be the first to review this store!</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoreDetailsModal; 