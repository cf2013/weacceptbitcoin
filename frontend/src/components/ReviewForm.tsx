import React, { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { FaBitcoin, FaArrowRight, FaCheckCircle, FaExclamationTriangle, FaBolt } from 'react-icons/fa';
import { ReviewFormData, VerificationFormData } from '@/types';
import Image from 'next/image';

interface ReviewFormProps {
  storeId: string;
  storeAddress: string;
  onSubmit: (data: ReviewFormData) => void;
  onVerify: (data: VerificationFormData) => Promise<void>;
  isLoading?: boolean;
  onClose: (msg?: {type: 'success' | 'error', message: string}) => void;
}

const ReviewForm: React.FC<ReviewFormProps> = ({ 
  storeId, 
  storeAddress,
  onSubmit, 
  onVerify,
  isLoading = false,
  onClose
}) => {
  const [step, setStep] = useState<'review' | 'verify' | 'lnauth'>('review');
  const reviewDataRef = useRef<ReviewFormData | null>(null);
  const [verificationStatus, setVerificationStatus] = useState<'pending' | 'verified' | 'failed'>('pending');
  const [error, setError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [verificationAmount, setVerificationAmount] = useState<number>(0);
  const [lnurlData, setLnurlData] = useState<{k1: string, lnurl: string, qr_code: string} | null>(null);
  const [userPubkey, setUserPubkey] = useState<string | null>(null);
  const [lnReviewStatus, setLnReviewStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null);

  // Generate a random verification amount between 1000 and 5000 sats
  useEffect(() => {
    setVerificationAmount(Math.floor(Math.random() * 4000) + 1000);
  }, []);

  // Cleanup polling interval on unmount
  useEffect(() => {
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [pollingInterval]);

  useEffect(() => {
    console.log('reviewData changed:', reviewDataRef.current);
  }, [reviewDataRef.current]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
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
      reviewDataRef.current = data;
      setStep('verify');
    } catch (err) {
      console.error('Review submission error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while submitting your review');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerificationSubmit = async (data: ReviewFormData) => {
    if (!reviewDataRef.current) return;
    setIsSubmitting(true);
    setError('');
    try {
      // Validate txid
      if (!data.txid || data.txid.length !== 64) {
        throw new Error('Transaction ID must be exactly 64 characters long');
      }
      // Create verification data from the form data
      const verificationData: VerificationFormData = {
        store_id: data.store_id,
        txid: data.txid,
        rating: data.rating.toString(),
        comment: data.comment,
        verification_amount: verificationAmount
      };
      console.log('Verification form submitted with data:', verificationData);
      console.log('Store address for verification:', storeAddress);
      console.log('Review data to be submitted after verification:', reviewDataRef.current);
      await onVerify(verificationData);
      console.log('Verification successful, updating status to verified');
      setVerificationStatus('verified');
      // Reset form after successful verification
      reset();
      setStep('review');
      reviewDataRef.current = null;
      onClose({ type: 'success', message: 'Your review has been verified and submitted successfully!' });
    } catch (err) {
      console.error('Verification error:', err);
      setVerificationStatus('failed');
      const errorMessage = err instanceof Error ? err.message : 'An error occurred during verification';
      setError(errorMessage);
      onClose({ type: 'error', message: errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  };

  const checkVerificationStatus = async (k1: string) => {
    try {
      const response = await fetch(`/api/auth/lnurl/status?k1=${k1}`);
      if (!response.ok) {
        throw new Error('Failed to check verification status');
      }
      const data = await response.json();
      if (data.status === 'OK') {
        // Stop polling
        if (pollingInterval) {
          clearInterval(pollingInterval);
          setPollingInterval(null);
        }
        // Set success status
        setLnReviewStatus('success');
        setUserPubkey(data.pubkey);
        // Submit the review with pubkey if opted in
        if (reviewDataRef.current) {
          const reviewPayload: ReviewFormData = {
            ...reviewDataRef.current,
            user_pubkey: data.pubkey,
            txid: null,
          };
          console.log('Submitting review via LNAuth:', reviewPayload);
          const reviewResponse = await fetch('/api/reviews', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(reviewPayload),
          });
          if (!reviewResponse.ok) {
            const errorData = await reviewResponse.json();
            console.error('Error submitting review via LNAuth:', errorData);
            throw new Error(JSON.stringify(errorData.detail) || 'Failed to submit review with Lightning');
          }
          // Get the newly created review data
          const newReview = await reviewResponse.json();
          // Call onSubmit with the new review data to update parent component
          onSubmit(newReview);
        } else {
          console.error('No reviewData found when LNAuth completed!');
        }
        // Reset form after successful submission
        reset();
        reviewDataRef.current = null;
        setStep('review');
        onClose({ type: 'success', message: 'Successfully signed with Lightning Network!' });
      }
    } catch (err) {
      console.error('Error checking verification status:', err);
      setLnReviewStatus('error');
      const errorMessage = err instanceof Error ? err.message : JSON.stringify(err);
      setError(errorMessage);
      // Stop polling on error
      if (pollingInterval) {
        clearInterval(pollingInterval);
        setPollingInterval(null);
      }
      onClose({ type: 'error', message: errorMessage });
    }
  };

  const handleLnauthSign = async () => {
    setIsSubmitting(true);
    setError('');
    try {
      // Request LNURL-auth challenge
      const response = await fetch('/api/reviews/lnauth/challenge');
      if (!response.ok) {
        throw new Error('Failed to generate LNURL-auth challenge');
      }
      const data = await response.json();
      setLnurlData(data);
      setStep('lnauth');
      
      // Start polling for verification status
      const interval = setInterval(() => checkVerificationStatus(data.k1), 2000); // Poll every 2 seconds
      setPollingInterval(interval);
    } catch (err) {
      console.error('LNURL-auth error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred during LNURL-auth');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLnauthVerify = async (k1: string, sig: string, pubkey: string) => {
    setIsSubmitting(true);
    setError('');
    try {
      // Verify LNURL-auth signature
      const response = await fetch('/api/reviews/lnauth/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ k1, sig, pubkey }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to verify LNURL-auth signature');
      }
      
      const data = await response.json();
      if (data.status !== 'success' || !data.pubkey) {
        throw new Error('Invalid response from LNURL-auth verification');
      }
      
      setUserPubkey(data.pubkey);
      
      // Show success message
      setLnReviewStatus('success');
      
      // Submit the review with pubkey if opted in
      if (reviewDataRef.current) {
        const reviewPayload: ReviewFormData = {
          ...reviewDataRef.current,
          user_pubkey: data.pubkey,
          txid: null,
        };
        
        // Call the backend review creation endpoint
        const reviewResponse = await fetch('/api/reviews', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(reviewPayload),
        });
        
        if (!reviewResponse.ok) {
          const errorData = await reviewResponse.json();
          throw new Error(errorData.detail || 'Failed to submit review with Lightning');
        }
        
        // Show success message
        setLnReviewStatus('success');
      }
      
      // Reset form after successful submission
      reset();
      reviewDataRef.current = null;
      setStep('review');
    } catch (err) {
      setLnReviewStatus('error');
      setError(err instanceof Error ? err.message : 'An error occurred during LNURL-auth verification');
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

  console.log('ReviewForm rendered, step:', step);

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

          <div className="flex flex-col items-center space-y-2">
            <button
              type="button"
              className="btn btn-secondary flex items-center justify-center w-full"
              onClick={async () => {
                // Validate the form before starting LNAuth
                await handleSubmit((data) => {
                  reviewDataRef.current = data; // Save the review data
                  handleLnauthSign();  // Start LNAuth
                })();
              }}
              disabled={isSubmitting}
            >
              <FaBolt className="mr-2" />
              Sign with Wallet
            </button>
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

      {step === 'lnauth' && lnurlData && (
        <div className="card bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-center mb-6">
            <FaBolt className="text-yellow-500 text-2xl mr-2" />
            <h3 className="text-xl font-bold">Sign with Lightning Network</h3>
          </div>

          {lnReviewStatus === 'idle' && (
            <>
              <p className="text-sm text-gray-700 mb-2">
                Scan this QR code with your Lightning wallet to sign your review.
              </p>
              <p className="text-xs text-gray-500 mb-4">
                This will verify your Lightning identity and save your pubkey with your review.
              </p>
              <div className="flex justify-center mb-4">
                <img 
                  src={`data:image/png;base64,${lnurlData.qr_code}`} 
                  alt="LNURL QR Code" 
                  className="w-64 h-64"
                />
              </div>
              <p className="text-sm text-gray-600">
                Or click this link to open in your wallet:
              </p>
              <a 
                href={lnurlData.lnurl} 
                className="text-sm text-blue-500 hover:underline break-all"
                target="_blank"
                rel="noopener noreferrer"
              >
                {lnurlData.lnurl}
              </a>
            </>
          )}

          {lnReviewStatus === 'success' && (
            <div className="p-4 bg-green-100 text-green-800 rounded-lg mb-4">
              <div className="flex items-center">
                <FaCheckCircle className="mr-2" />
                <p>Successfully signed with Lightning Network!</p>
              </div>
              <p className="mt-2 text-sm">
                Your pubkey has been saved with your review.
              </p>
            </div>
          )}

          {lnReviewStatus === 'error' && (
            <div className="p-4 bg-red-100 text-red-800 rounded-lg mb-4">
              <div className="flex items-center">
                <FaExclamationTriangle className="mr-2" />
                <p>{error}</p>
              </div>
            </div>
          )}

          <div className="pt-2">
            <button
              type="button"
              className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-md transition-colors"
              onClick={() => {
                setStep('review');
                setLnReviewStatus('idle');
                setError('');
              }}
            >
              {lnReviewStatus === 'success' ? 'Done' : 'Cancel'}
            </button>
          </div>
        </div>
      )}

      {step === 'verify' && reviewDataRef.current && (
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

              <form onSubmit={handleSubmit((data) => {
                if (userPubkey) {
                  data.user_pubkey = userPubkey;
                }
                handleVerificationSubmit(data);
              })} className="space-y-4">
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
                        reset();
                        setStep('review');
                        reviewDataRef.current = null;
                        setVerificationStatus('pending');
                        setError('');
                        setUserPubkey(null);
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

      {lnReviewStatus === 'success' && (
        <div className="p-4 bg-green-100 text-green-800 rounded">
          Your review has been submitted with your Lightning identity!
        </div>
      )}
      {lnReviewStatus === 'error' && (
        <div className="p-4 bg-red-100 text-red-800 rounded">
          {error}
        </div>
      )}

      {error && step === 'review' && (
        <div className="mt-4 p-4 bg-red-50 text-red-500 rounded-md">
          {error}
        </div>
      )}
    </div>
  );
};

export default ReviewForm; 