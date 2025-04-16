import React from 'react';
import { useForm } from 'react-hook-form';
import { StoreFormData } from '@/types';

interface StoreFormProps {
  initialData?: StoreFormData;
  onSubmit: (data: StoreFormData) => void;
  isLoading?: boolean;
}

const StoreForm: React.FC<StoreFormProps> = ({ initialData, onSubmit, isLoading = false }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<StoreFormData>({
    defaultValues: initialData,
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="form-group">
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
          Store Name *
        </label>
        <input
          id="name"
          type="text"
          className={`w-full px-4 py-2 border-2 rounded-lg focus:ring-2 focus:ring-bitcoin-orange focus:border-bitcoin-orange transition-colors ${
            errors.name ? 'border-red-500' : 'border-gray-300'
          }`}
          {...register('name', { required: 'Store name is required' })}
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          id="description"
          className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-bitcoin-orange focus:border-bitcoin-orange transition-colors"
          rows={4}
          {...register('description')}
        />
      </div>

      <div className="form-group">
        <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
          Category
        </label>
        <input
          id="category"
          type="text"
          className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-bitcoin-orange focus:border-bitcoin-orange transition-colors"
          {...register('category')}
        />
      </div>

      <div className="form-group">
        <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-1">
          Website
        </label>
        <input
          id="website"
          type="url"
          className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-bitcoin-orange focus:border-bitcoin-orange transition-colors"
          {...register('website')}
        />
      </div>

      <div className="form-group">
        <label htmlFor="btc_address" className="block text-sm font-medium text-gray-700 mb-1">
          Bitcoin Address *
        </label>
        <input
          id="btc_address"
          type="text"
          className={`w-full px-4 py-2 border-2 rounded-lg focus:ring-2 focus:ring-bitcoin-orange focus:border-bitcoin-orange transition-colors ${
            errors.btc_address ? 'border-red-500' : 'border-gray-300'
          }`}
          {...register('btc_address', { required: 'Bitcoin address is required' })}
        />
        {errors.btc_address && (
          <p className="mt-1 text-sm text-red-500">{errors.btc_address.message}</p>
        )}
        <p className="mt-1 text-sm text-gray-500">
          This address will be used for verification and receiving payments.
        </p>
      </div>

      <div className="pt-4">
        <button
          type="submit"
          className="w-full bg-bitcoin-orange text-white py-3 px-4 rounded-lg font-medium hover:bg-bitcoin-orange-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isLoading}
        >
          {isLoading ? 'Saving...' : initialData ? 'Update Store' : 'Add Store'}
        </button>
      </div>
    </form>
  );
};

export default StoreForm; 