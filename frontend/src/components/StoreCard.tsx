import React, { useState } from 'react';
import { FaBitcoin, FaStar, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { Store } from '@/types';
import StoreDetailsModal from './StoreDetailsModal';
import Image from 'next/image';

interface StoreCardProps {
  store: Store;
}

const StoreCard: React.FC<StoreCardProps> = ({ store }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Calculate average rating
  const averageRating = store.reviews && store.reviews.length > 0
    ? store.reviews.reduce((acc, review) => acc + review.rating, 0) / store.reviews.length
    : 0;

  return (
    <>
      <div className="card hover:shadow-lg transition-shadow">
        <div className="flex justify-between items-start">
          <div className="flex items-center space-x-4">
            <div className="relative w-16 h-16 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
              {store.profile_image_url ? (
                <Image
                  src={store.profile_image_url}
                  alt={`${store.name} profile`}
                  width={48}
                  height={48}
                  className="rounded-full object-cover"
                />
              ) : (
                <FaBitcoin className="w-8 h-8 text-orange-500" />
              )}
            </div>
            <div>
              <h3 className="text-xl font-bold">{store.name}</h3>
              {store.category && (
                <span className="inline-block bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded-full mt-1">
                  {store.category}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center">
            {store.verified ? (
              <span className="text-green-500 flex items-center" title="Verified">
                <FaCheckCircle className="mr-1" />
                <span className="text-xs">Verified</span>
              </span>
            ) : (
              <span className="text-gray-400 flex items-center" title="Not Verified">
                <FaTimesCircle className="mr-1" />
                <span className="text-xs">Not Verified</span>
              </span>
            )}
          </div>
        </div>

        {store.description && (
          <p className="mt-2 text-gray-600 line-clamp-2">{store.description}</p>
        )}

        <div className="mt-4 space-y-2">
          <div className="flex items-center">
            <FaStar className="text-yellow-400 mr-1" />
            <span>{averageRating.toFixed(1)}</span>
            <span className="text-gray-500 text-sm ml-1">
              ({store.reviews?.length || 0} reviews)
            </span>
          </div>
          <div className="flex items-center text-bitcoin-orange">
            <FaBitcoin className="mr-1" />
            <span className="text-sm font-mono">{store.btc_address.slice(0, 8)}...{store.btc_address.slice(-8)}</span>
          </div>
        </div>

        <div className="mt-4 flex justify-between">
          <button
            onClick={() => setIsModalOpen(true)}
            className="btn btn-primary"
          >
            View Details
          </button>
          {!store.verified && (
            <a href={`/stores/${store.id}/verify`} className="btn btn-outline">
              Verify
            </a>
          )}
        </div>
      </div>

      <StoreDetailsModal
        store={store}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
};

export default StoreCard; 