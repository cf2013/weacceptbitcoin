import React from 'react';
import { useForm } from 'react-hook-form';
import { FaBitcoin, FaArrowRight } from 'react-icons/fa';
import { VerificationFormData } from '@/types';

interface VerificationFormProps {
  onSubmit: (data: VerificationFormData) => void;
  isLoading?: boolean;
  type: 'store' | 'review';
  address?: string;
  verificationAmount?: number;
}

const VerificationForm: React.FC<VerificationFormProps> = ({
  onSubmit,
  isLoading = false,
  type,
  address,
  verificationAmount,
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
    <div className="card bg-white p-6 rounded-lg shadow-sm">
      <div className="flex items-center justify-center mb-6">
        <FaBitcoin className="text-bitcoin-orange text-2xl mr-2" />
        <h3 className="text-xl font-bold">Verify Your Store</h3>
      </div>

      <div className="mb-6 p-4 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-800 mb-2">
          To verify your store ownership, please send exactly <span className="font-bold">{verificationAmount} sats</span> to:
        </p>
        <div className="bg-white p-3 rounded border border-blue-100 break-all">
          <p className="font-mono text-sm">{address}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label htmlFor="txid" className="block text-sm font-medium text-gray-700 mb-1">
            Bitcoin Transaction ID (TXID)
          </label>
          <input
            id="txid"
            type="text"
            className={`w-full px-3 py-2 border rounded-md ${errors.txid ? 'border-red-500' : 'border-gray-300'}`}
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
            className="w-full bg-bitcoin-orange hover:bg-bitcoin-orange-dark text-white py-2 px-4 rounded-md flex items-center justify-center transition-colors"
            disabled={isLoading}
          >
            {isLoading ? 'Verifying...' : 'Verify Store'}
            {!isLoading && <FaArrowRight className="ml-2" />}
          </button>
        </div>
      </form>
    </div>
  );
};

export default VerificationForm; 