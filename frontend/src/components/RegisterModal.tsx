import React from 'react';
import { FaTimes } from 'react-icons/fa';
import StoreForm from './StoreForm';
import VerificationForm from './VerificationForm';
import VerificationStatus from './VerificationStatus';
import { StoreFormData, VerificationFormData } from '@/types';

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const RegisterModal: React.FC<RegisterModalProps> = ({ isOpen, onClose }) => {
  const [step, setStep] = React.useState<'register' | 'verify'>('register');
  const [storeData, setStoreData] = React.useState<StoreFormData | null>(null);
  const [verificationStatus, setVerificationStatus] = React.useState<'pending' | 'verified' | 'failed'>('pending');
  const [error, setError] = React.useState<string>('');
  const [isLoading, setIsLoading] = React.useState(false);

  const handleStoreSubmit = async (data: StoreFormData) => {
    setIsLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/stores', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to create store');
      }

      const store = await response.json();
      setStoreData(store);
      setStep('verify');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerificationSubmit = async (data: VerificationFormData) => {
    if (!storeData) return;
    
    setIsLoading(true);
    setError('');
    
    try {
      const response = await fetch(`/api/stores/${storeData.id}/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Verification failed');
      }

      const verifiedStore = await response.json();
      setVerificationStatus('verified');
      
      // Close modal after 3 seconds on success
      setTimeout(() => {
        onClose();
        // Reset state for next time
        setStep('register');
        setStoreData(null);
        setVerificationStatus('pending');
        setError('');
      }, 3000);
    } catch (err) {
      setVerificationStatus('failed');
      setError(err instanceof Error ? err.message : 'Verification failed');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div 
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
          onClick={onClose}
        />

        {/* Modal panel */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="relative">
            <button
              onClick={onClose}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-500"
            >
              <FaTimes className="text-xl" />
            </button>

            <div className="p-6">
              <h2 className="text-2xl font-bold mb-6 text-center">
                {step === 'register' ? 'Register Your Store' : 'Verify Your Store'}
              </h2>

              {step === 'register' && (
                <StoreForm
                  onSubmit={handleStoreSubmit}
                  isLoading={isLoading}
                />
              )}

              {step === 'verify' && storeData && (
                <div className="space-y-6">
                  <VerificationStatus
                    status={verificationStatus}
                    storeAddress={storeData.btc_address}
                    verificationAmount={5000}
                    error={error}
                  />

                  {verificationStatus === 'pending' && (
                    <VerificationForm
                      onSubmit={handleVerificationSubmit}
                      isLoading={isLoading}
                      type="store"
                      address={storeData.btc_address}
                    />
                  )}
                </div>
              )}

              {error && (
                <div className="mt-4 p-4 bg-red-50 text-red-500 rounded-md">
                  {error}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterModal; 