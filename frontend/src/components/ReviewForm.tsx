import React from 'react';
import { useForm } from 'react-hook-form';
import { ReviewFormData } from '@/types';

interface ReviewFormProps {
  storeId: string;
  onSubmit: (data: ReviewFormData) => void;
  isLoading?: boolean;
}

const ReviewForm: React.FC<ReviewFormProps> = ({ storeId, onSubmit, isLoading = false }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ReviewFormData>({
    defaultValues: {
      store_id: storeId,
      rating: 5,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <label className="label">Rating</label>
        <div className="flex space-x-2">
          {[1, 2, 3, 4, 5].map((value) => (
            <label key={value} className="flex items-center">
              <input
                type="radio"
                value={value}
                className="mr-1"
                {...register('rating', { required: 'Rating is required' })}
              />
              <span>{value}</span>
            </label>
          ))}
        </div>
        {errors.rating && (
          <p className="mt-1 text-sm text-red-500">{errors.rating.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="text" className="label">
          Review
        </label>
        <textarea
          id="text"
          className="input"
          rows={4}
          {...register('text')}
        />
      </div>

      <div>
        <label htmlFor="txid" className="label">
          Bitcoin Transaction ID (TXID) *
        </label>
        <input
          id="txid"
          type="text"
          className={`input ${errors.txid ? 'border-red-500' : ''}`}
          {...register('txid', { required: 'Transaction ID is required' })}
        />
        {errors.txid && (
          <p className="mt-1 text-sm text-red-500">{errors.txid.message}</p>
        )}
        <p className="mt-1 text-sm text-gray-500">
          Enter the transaction ID of your payment to this store to verify your review.
        </p>
      </div>

      <div className="pt-4">
        <button
          type="submit"
          className="btn btn-primary w-full"
          disabled={isLoading}
        >
          {isLoading ? 'Submitting...' : 'Submit Review'}
        </button>
      </div>
    </form>
  );
};

export default ReviewForm; 