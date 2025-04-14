import React from 'react';
import { FaBitcoin, FaStar, FaCheckCircle, FaTimesCircle, FaTimes, FaGlobe } from 'react-icons/fa';
import { Store } from '@/types';
import ReviewCard from './ReviewCard';

interface StoreDetailsModalProps {
  store: Store;
  isOpen: boolean;
  onClose: () => void;
}

const StoreDetailsModal: React.FC<StoreDetailsModalProps> = ({ store, isOpen, onClose }) => {
  if (!isOpen) return null;

  // Calculate average rating
  const averageRating = store.reviews && store.reviews.length > 0
    ? store.reviews.reduce((acc, review) => acc + review.rating, 0) / store.reviews.length
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
                    {averageRating.toFixed(1)} ({store.reviews?.length || 0} reviews)
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Reviews Section */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Reviews</h3>
            {store.reviews && store.reviews.length > 0 ? (
              <div className="space-y-4">
                {store.reviews.map((review) => (
                  <ReviewCard key={review.id} review={review} />
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No reviews yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoreDetailsModal; 