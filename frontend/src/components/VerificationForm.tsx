import React from 'react';
import { useForm } from 'react-hook-form';
import { FaBitcoin } from 'react-icons/fa';
import { VerificationFormData } from '@/types';

interface VerificationFormProps {
  onSubmit: (data: VerificationFormData) => void;
  isLoading?: boolean;
  type: 'store' | 'review';
  address?: string;
}

const VerificationForm: React.FC<VerificationFormProps> = ({
  onSubmit,
  isLoading = false,
  type,
  address,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<VerificationFormData>();

  return (
    <div className="card bg-gray-50">
      <div className="flex items-center mb-4">
        <FaBitcoin className="text-bitcoin-orange text-2xl mr-2" />
        <h3 className="text-xl font-bold">
          {type === 'store' ? 'Verify Your Store' : 'Verify Your Review'}
        </h3>
      </div>

      <p className="mb-4 text-gray-700">
        {type === 'store'
          ? 'To verify your store, send a small Bitcoin transaction (5,000+ sats) from the address you provided.'
          : 'To verify your review, provide the transaction ID of your payment to this store.'}
      </p>

      {type === 'store' && address && (
        <div className="mb-4 p-3 bg-gray-100 rounded-md">
          <p className="text-sm text-gray-600 mb-1">Send payment to:</p>
          <p className="font-mono text-sm break-all">{address}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
        </div>

        <div className="pt-2">
          <button
            type="submit"
            className="btn btn-primary w-full"
            disabled={isLoading}
          >
            {isLoading ? 'Verifying...' : 'Verify'}
          </button>
        </div>
      </form>

      <div className="mt-4 text-sm text-gray-500">
        <p>
          {type === 'store'
            ? 'Verification helps build trust with customers and ensures you control the Bitcoin address.'
            : 'Verified reviews help other customers make informed decisions.'}
        </p>
      </div>
    </div>
  );
};

export default VerificationForm; 