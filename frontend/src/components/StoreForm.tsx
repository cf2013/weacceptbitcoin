import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { StoreFormData } from '@/types';
import { FaBitcoin, FaInfoCircle } from 'react-icons/fa';

interface StoreFormProps {
  initialData?: StoreFormData;
  onSubmit: (data: FormData, verificationSats: number) => void;
  isLoading?: boolean;
}

interface BitcoinPrice {
  USD: number;
  time: number;
}

const StoreForm: React.FC<StoreFormProps> = ({ initialData, onSubmit, isLoading = false }) => {
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [profilePreview, setProfilePreview] = useState<string | null>(null);
  const [btcPrice, setBtcPrice] = useState<number | null>(null);
  const [verificationAmount, setVerificationAmount] = useState<number>(1);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<StoreFormData>({
    defaultValues: initialData,
  });

  // Calculate sats for a given USD amount
  const calculateSats = (usdAmount: number): number => {
    if (!btcPrice) return 0;
    // Convert USD to BTC, then to sats
    const btcAmount = usdAmount / btcPrice;
    return Math.round(btcAmount * 100000000); // Convert to sats
  };

  // Fetch BTC price on component mount
  React.useEffect(() => {
    const fetchBtcPrice = async (): Promise<void> => {
      try {
        const response = await fetch('https://mempool.space/api/v1/prices');
        const data: BitcoinPrice = await response.json();
        setBtcPrice(data.USD);
      } catch (error) {
        console.error('Failed to fetch BTC price:', error);
      }
    };
    fetchBtcPrice();
  }, []);

  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setBannerPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmitForm = (data: StoreFormData) => {
    const formData = new FormData();
    
    // Add text fields
    formData.append('name', data.name);
    formData.append('btc_address', data.btc_address);
    if (data.description) formData.append('description', data.description);
    if (data.category) formData.append('category', data.category);
    if (data.website) formData.append('website', data.website);
    
    // Add files if they exist
    const bannerFile = (document.getElementById('banner_image') as HTMLInputElement)?.files?.[0];
    const profileFile = (document.getElementById('profile_image') as HTMLInputElement)?.files?.[0];
    
    if (bannerFile) formData.append('banner_image', bannerFile);
    if (profileFile) formData.append('profile_image', profileFile);
    
    const verificationSats = calculateSats(verificationAmount);
    onSubmit(formData, verificationSats);
  };

  return (
    <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-6">
      <div className="bg-blue-50 p-4 rounded-lg mb-6">
        <div className="flex items-start">
          <FaInfoCircle className="text-blue-500 mt-1 mr-2 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-blue-800 mb-2">How to Register Your Store</h3>
            <ol className="list-decimal list-inside space-y-2 text-blue-700">
              <li>Fill out your store details below</li>
              <li>Add your Bitcoin address for receiving payments</li>
              <li>Send a small verification amount (1-10 USD in sats) to your own address</li>
              <li>Submit the transaction ID to verify ownership</li>
            </ol>
            {btcPrice && (
              <div className="mt-2 space-y-2">
                <p className="text-sm text-blue-600">
                  Current BTC price: ${btcPrice.toLocaleString()}
                </p>
                <div className="flex items-center space-x-2">
                  <label htmlFor="verificationAmount" className="text-sm text-blue-600">
                    Verification amount (USD):
                  </label>
                  <input
                    type="number"
                    id="verificationAmount"
                    min="1"
                    max="10"
                    value={verificationAmount}
                    onChange={(e) => setVerificationAmount(Number(e.target.value))}
                    className="w-20 px-2 py-1 border border-blue-300 rounded text-sm"
                  />
                  <span className="text-sm text-blue-600">
                    = {calculateSats(verificationAmount).toLocaleString()} sats
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Profile Image Upload */}
        <div className="form-group">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Profile Image
          </label>
          <div className="mt-1 flex flex-col items-center">
            <div className="relative w-32 h-32 rounded-full overflow-hidden bg-gray-100 border border-gray-300 shadow-sm">
              {profilePreview ? (
                <img
                  src={profilePreview}
                  alt="Profile preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <FaBitcoin className="text-4xl" />
                </div>
              )}
            </div>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              id="profile_image"
              {...register('profile_image', { onChange: handleProfileChange })}
            />
            <label
              htmlFor="profile_image"
              className="mt-2 w-40 text-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer"
            >
              Choose Image
            </label>
          </div>
        </div>

        {/* Banner Image Upload */}
        <div className="form-group">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Banner Image
          </label>
          <div className="mt-1 flex flex-col items-center">
            <div className="relative w-full h-32 rounded-lg overflow-hidden bg-gray-100 border border-gray-300 shadow-sm">
              {bannerPreview ? (
                <img
                  src={bannerPreview}
                  alt="Banner preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <FaBitcoin className="text-4xl" />
                </div>
              )}
            </div>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              id="banner_image"
              {...register('banner_image', { onChange: handleBannerChange })}
            />
            <label
              htmlFor="banner_image"
              className="mt-2 w-40 text-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer"
            >
              Choose Banner
            </label>
          </div>
        </div>
      </div>

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