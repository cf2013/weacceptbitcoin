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
      <div>
        <label htmlFor="name" className="label">
          Store Name *
        </label>
        <input
          id="name"
          type="text"
          className={`input ${errors.name ? 'border-red-500' : ''}`}
          {...register('name', { required: 'Store name is required' })}
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="description" className="label">
          Description
        </label>
        <textarea
          id="description"
          className="input"
          rows={4}
          {...register('description')}
        />
      </div>

      <div>
        <label htmlFor="category" className="label">
          Category
        </label>
        <input
          id="category"
          type="text"
          className="input"
          {...register('category')}
        />
      </div>

      <div>
        <label htmlFor="website" className="label">
          Website
        </label>
        <input
          id="website"
          type="url"
          className="input"
          {...register('website')}
        />
      </div>

      <div>
        <label htmlFor="btc_address" className="label">
          Bitcoin Address *
        </label>
        <input
          id="btc_address"
          type="text"
          className={`input ${errors.btc_address ? 'border-red-500' : ''}`}
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
          className="btn btn-primary w-full"
          disabled={isLoading}
        >
          {isLoading ? 'Saving...' : initialData ? 'Update Store' : 'Add Store'}
        </button>
      </div>
    </form>
  );
};

export default StoreForm; 