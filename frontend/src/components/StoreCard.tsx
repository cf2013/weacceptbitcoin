import React from 'react';
import Link from 'next/link';
import { FaBitcoin, FaStar, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { Store } from '@/types';

interface StoreCardProps {
  store: Store;
}

const StoreCard: React.FC<StoreCardProps> = ({ store }) => {
  // Calculate average rating
  const averageRating = store.reviews && store.reviews.length > 0
    ? store.reviews.reduce((acc, review) => acc + review.rating, 0) / store.reviews.length
    : 0;

  return (
    <div className="card hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-xl font-bold">{store.name}</h3>
          {store.category && (
            <span className="inline-block bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded-full mt-1">
              {store.category}
            </span>
          )}
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

      <div className="mt-4 flex items-center justify-between">
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
        <Link href={`/stores/${store.id}`} className="btn btn-primary">
          View Details
        </Link>
        {!store.verified && (
          <Link href={`/stores/${store.id}/verify`} className="btn btn-outline">
            Verify
          </Link>
        )}
      </div>
    </div>
  );
};

export default StoreCard; 