import React from 'react';
import { FaStar, FaCheckCircle, FaTimesCircle, FaBolt } from 'react-icons/fa';
import { Review } from '@/types';

interface ReviewCardProps {
  review: Review;
}

const ReviewCard: React.FC<ReviewCardProps> = ({ review }) => {
  // Format date
  const formattedDate = new Date(review.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <div className="card border-l-4 border-bitcoin-orange">
      <div className="flex justify-between items-start">
        <div className="flex items-center">
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <FaStar
                key={i}
                className={`${
                  i < review.rating ? 'text-yellow-400' : 'text-gray-300'
                } mr-1`}
              />
            ))}
          </div>
          <span className="ml-2 text-sm text-gray-500">{formattedDate}</span>
        </div>
        <div className="flex items-center">
          {review.verified ? (
            <span className="text-green-500 flex items-center" title="Verified Review">
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

      {review.comment && (
        <p className="mt-2 text-gray-700">{review.comment}</p>
      )}

      <div className="mt-3 text-xs text-gray-500 flex flex-wrap gap-2">
        <span className="font-mono">
          TXID: {review.txid ? `${review.txid.slice(0, 8)}...${review.txid.slice(-8)}` : 'Lightning Auth'}
        </span>
        
        {review.user_pubkey && (
          <span className="flex items-center text-blue-500" title="Signed with Lightning Network">
            <FaBolt className="mr-1" />
            <span className="font-mono">LN: {review.user_pubkey.slice(0, 8)}...{review.user_pubkey.slice(-8)}</span>
          </span>
        )}
      </div>
    </div>
  );
};

export default ReviewCard; 