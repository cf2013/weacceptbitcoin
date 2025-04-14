import React from 'react';
import { useForm } from 'react-hook-form';
import { FaBitcoin, FaArrowRight } from 'react-icons/fa';
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
    reset,
  } = useForm<VerificationFormData>();

  // Reset form when component mounts to ensure clean state
  React.useEffect(() => {
    reset();
  }, [reset]);

  return (
    <div className="card bg-gray-50">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label htmlFor="txid" className="label">
            Bitcoin Transaction ID (TXID) *
          </label>
          <input
            id="txid"
            type="text"
            className={`input ${errors.txid ? 'border-red-500' : ''}`}
            placeholder="Enter the transaction ID from your Bitcoin wallet"
            {...register('txid', { required: 'Transaction ID is required' })}
          />
          {errors.txid && (
            <p className="mt-1 text-sm text-red-500">{errors.txid.message}</p>
          )}
        </div>

        <div className="pt-2">
          <button
            type="submit"
            className="btn btn-primary w-full flex items-center justify-center"
            disabled={isLoading}
          >
            {isLoading ? 'Verifying...' : 'Verify Store'}
            {!isLoading && <FaArrowRight className="ml-2" />}
          </button>
        </div>
      </form>

      <div className="mt-4 text-sm text-gray-500">
        <p>
          {type === 'store'
            ? 'Verification helps build trust with customers and ensures you control the Bitcoin address. Your store will be listed in our directory once verified.'
            : 'Verified reviews help other customers make informed decisions.'}
        </p>
      </div>
    </div>
  );
};

export default VerificationForm; 