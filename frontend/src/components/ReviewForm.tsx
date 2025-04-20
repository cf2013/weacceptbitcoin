import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { FaBitcoin, FaArrowRight, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';
import { ReviewFormData, VerificationFormData } from '@/types';

interface ReviewFormProps {
  storeId: string;
  storeAddress: string;
  onSubmit: (data: ReviewFormData) => void;
  onVerify: (data: VerificationFormData) => Promise<void>;
  isLoading?: boolean;
}

const ReviewForm: React.FC<ReviewFormProps> = ({ 
  storeId, 
  storeAddress,
  onSubmit, 
  onVerify,
  isLoading = false 
}) => {
  const [step, setStep] = useState<'review' | 'verify'>('review');
  const [reviewData, setReviewData] = useState<ReviewFormData | null>(null);
  const [verificationStatus, setVerificationStatus] = useState<'pending' | 'verified' | 'failed'>('pending');
  const [error, setError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [verificationAmount, setVerificationAmount] = useState<number>(0);

  // Generate a random verification amount between 1000 and 5000 sats
  useEffect(() => {
    setVerificationAmount(Math.floor(Math.random() * 4000) + 1000);
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ReviewFormData>({
    defaultValues: {
      store_id: storeId,
      rating: 5,
    },
  });

  const handleReviewSubmit = async (data: ReviewFormData) => {
    setIsSubmitting(true);
    setError('');
    
    try {
      console.log('Review form submitted with data:', data);
      setReviewData(data);
      setStep('verify');
    } catch (err) {
      console.error('Review submission error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while submitting your review');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerificationSubmit = async (data: ReviewFormData) => {
    if (!reviewData) return;
    
    setIsSubmitting(true);
    setError('');
    
    try {
      // Create verification data from the form data
      const verificationData: VerificationFormData = {
        store_id: data.store_id,
        txid: data.txid || '',
        rating: data.rating.toString(),
        comment: data.comment
      };
      
      console.log('Verification form submitted with data:', verificationData);
      console.log('Store address for verification:', storeAddress);
      console.log('Review data to be submitted after verification:', reviewData);
      
      await onVerify(verificationData);
      console.log('Verification successful, updating status to verified');
      setVerificationStatus('verified');
      
      // Reset form after successful verification
      reset();
      setStep('review');
      setReviewData(null);
    } catch (err) {
      console.error('Verification error:', err);
      setVerificationStatus('failed');
      setError(err instanceof Error ? err.message : 'An error occurred during verification');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusIcon = () => {
    switch (verificationStatus) {
      case 'verified':
        return <FaCheckCircle className="text-green-500 text-4xl" />;
      case 'pending':
        return <FaBitcoin className="text-bitcoin-orange text-4xl" />;
      case 'failed':
        return <FaExclamationTriangle className="text-red-500 text-4xl" />;
      default:
        return null;
    }
  };

  const getStatusMessage = () => {
    switch (verificationStatus) {
      case 'verified':
        return 'Your review has been verified!';
      case 'pending':
        return 'Verification in progress...';
      case 'failed':
        return 'Verification failed';
      default:
        return '';
    }
  };

  return (
    <div className="space-y-6">
      {step === 'review' && (
        <form onSubmit={handleSubmit(handleReviewSubmit)} className="space-y-6">
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
            <label htmlFor="comment" className="label">
              Review
            </label>
            <textarea
              id="comment"
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-bitcoin-orange focus:border-bitcoin-orange transition-colors"
              rows={4}
              {...register('comment', { required: 'Review comment is required' })}
            />
            {errors.comment && (
              <p className="mt-1 text-sm text-red-500">{errors.comment.message}</p>
            )}
          </div>

          <div className="pt-4">
            <button
              type="submit"
              className="btn btn-primary w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Continue to Verification'}
            </button>
          </div>
        </form>
      )}

      {step === 'verify' && reviewData && (
        <>
          {verificationStatus === 'pending' && (
            <div className="card bg-white p-6 rounded-lg shadow-sm">
              <div className="flex items-center justify-center mb-6">
                <FaBitcoin className="text-bitcoin-orange text-2xl mr-2" />
                <h3 className="text-xl font-bold">Verify Your Review</h3>
              </div>

              <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800 mb-2">
                  To verify your review, please send exactly <span className="font-bold">{verificationAmount} sats</span> to:
                </p>
                <div className="bg-white p-3 rounded border border-blue-100 break-all">
                  <p className="font-mono text-sm">{storeAddress}</p>
                </div>
              </div>

              <form onSubmit={handleSubmit(handleVerificationSubmit)} className="space-y-4">
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
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Verifying...' : 'Verify Review'}
                    {!isSubmitting && <FaArrowRight className="ml-2" />}
                  </button>
                </div>
              </form>
            </div>
          )}

          {verificationStatus !== 'pending' && (
            <div className="card bg-white p-6 rounded-lg shadow-sm">
              <div className="text-center">
                {getStatusIcon()}
                <h4 className="text-lg font-semibold mt-2">{getStatusMessage()}</h4>
                
                {verificationStatus === 'verified' && (
                  <div className="mt-4">
                    <p className="text-green-600 mb-4">Your review is now verified and visible on the store page!</p>
                    <button 
                      onClick={() => {
                        // Reset form and go back to review step
                        reset();
                        setStep('review');
                        setReviewData(null);
                        setVerificationStatus('pending');
                        setError('');
                      }}
                      className="bg-bitcoin-orange hover:bg-bitcoin-orange-dark text-white py-2 px-4 rounded-md transition-colors"
                    >
                      Write Another Review
                    </button>
                  </div>
                )}

                {verificationStatus === 'failed' && (
                  <div className="mt-4">
                    <p className="text-red-500 mb-4">{error}</p>
                    <p className="text-sm text-gray-600">Please try the verification process again.</p>
                    <button 
                      onClick={() => setVerificationStatus('pending')}
                      className="mt-4 bg-bitcoin-orange hover:bg-bitcoin-orange-dark text-white py-2 px-4 rounded-md transition-colors"
                    >
                      Try Again
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}

      {/* Only show error in the review step */}
      {error && step === 'review' && (
        <div className="mt-4 p-4 bg-red-50 text-red-500 rounded-md">
          {error}
        </div>
      )}
    </div>
  );
};

export default ReviewForm; 