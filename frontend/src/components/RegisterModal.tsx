import React, { useEffect } from 'react';
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
  const [storeFormData, setStoreFormData] = React.useState<StoreFormData | null>(null);
  const [verificationStatus, setVerificationStatus] = React.useState<'pending' | 'verified' | 'failed'>('pending');
  const [error, setError] = React.useState<string>('');
  const [isLoading, setIsLoading] = React.useState(false);

  // Reset state when modal is opened
  useEffect(() => {
    if (isOpen) {
      setStep('register');
      setStoreFormData(null);
      setVerificationStatus('pending');
      setError('');
      setIsLoading(false);
    }
  }, [isOpen]);

  const handleStoreSubmit = async (data: StoreFormData) => {
    setStoreFormData(data);
    setStep('verify');
  };

  const handleVerificationSubmit = async (data: VerificationFormData) => {
    if (!storeFormData) return;
    
    setIsLoading(true);
    setError('');
    
    try {
      // First verify the transaction
      const verifyResponse = await fetch(`/api/stores/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...storeFormData,
          txid: data.txid
        }),
      });

      const verifyData = await verifyResponse.json();

      if (!verifyResponse.ok) {
        throw new Error(verifyData.error || verifyData.detail || 'Verification failed');
      }

      // If verification successful, create the store
      const createResponse = await fetch('/api/stores', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...storeFormData,
          verified: true,
          verification_txid: data.txid
        }),
      });

      const createData = await createResponse.json();

      if (!createResponse.ok) {
        throw new Error(createData.error || createData.detail || 'Failed to create store');
      }

      setVerificationStatus('verified');
    } catch (err) {
      console.error('Verification error:', err);
      setVerificationStatus('failed');
      setError(err instanceof Error ? err.message : 'An error occurred during verification');
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
              {step === 'register' && (
                <StoreForm
                  onSubmit={handleStoreSubmit}
                  isLoading={isLoading}
                />
              )}

              {step === 'verify' && storeFormData && (
                <>
                  {verificationStatus === 'pending' && (
                    <VerificationForm
                      onSubmit={handleVerificationSubmit}
                      isLoading={isLoading}
                      type="store"
                      address={storeFormData.btc_address}
                      verificationAmount={storeFormData.verification_amount ?? 5000}
                    />
                  )}

                  {verificationStatus !== 'pending' && (
                    <VerificationStatus
                      status={verificationStatus}
                      error={error}
                      onDismiss={onClose}
                    />
                  )}
                </>
              )}

              {/* Only show error in the register step */}
              {error && step === 'register' && (
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