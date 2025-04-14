import React, { useEffect } from 'react';
import { FaBitcoin, FaCheckCircle, FaClock, FaExclamationTriangle, FaArrowRight } from 'react-icons/fa';

interface VerificationStatusProps {
  status: 'pending' | 'verified' | 'failed';
  storeAddress: string;
  verificationAmount: number;
  error?: string;
  onDismiss?: () => void;
  onManualVerify?: () => void;
}

const VerificationStatus: React.FC<VerificationStatusProps> = ({
  status,
  storeAddress,
  verificationAmount,
  error,
  onDismiss,
  onManualVerify,
}) => {
  useEffect(() => {
    console.log('VerificationStatus rendered with:', { status, onDismiss: !!onDismiss });
  }, [status, onDismiss]);

  const getStatusIcon = () => {
    switch (status) {
      case 'verified':
        return <FaCheckCircle className="text-green-500 text-4xl" />;
      case 'pending':
        return <FaClock className="text-yellow-500 text-4xl" />;
      case 'failed':
        return <FaExclamationTriangle className="text-red-500 text-4xl" />;
      default:
        return null;
    }
  };

  const getStatusMessage = () => {
    switch (status) {
      case 'verified':
        return 'Your store has been verified!';
      case 'pending':
        return 'Waiting for verification transaction...';
      case 'failed':
        return 'Verification failed';
      default:
        return '';
    }
  };

  return (
    <div className="card bg-gray-50 p-6">
      <div className="flex items-center justify-center mb-6">
        <FaBitcoin className="text-bitcoin-orange text-2xl mr-2" />
        <h3 className="text-xl font-bold">Store Verification</h3>
      </div>

      <div className="text-center mb-6">
        {getStatusIcon()}
        <h4 className="text-lg font-semibold mt-2">{getStatusMessage()}</h4>
        {error && status !== 'failed' && <p className="text-red-500 mt-2">{error}</p>}
      </div>

      {status === 'pending' && (
        <div className="space-y-4">
          <div className="p-4 bg-gray-100 rounded-md">
            <p className="text-sm text-gray-600 mb-1">Send payment to:</p>
            <p className="font-mono text-sm break-all">{storeAddress}</p>
          </div>
          
          <div className="p-4 bg-gray-100 rounded-md">
            <p className="text-sm text-gray-600 mb-1">Required amount:</p>
            <p className="font-mono text-sm">{verificationAmount} sats</p>
          </div>

          <div className="text-sm text-gray-500">
            <p>Please send exactly {verificationAmount} sats to your store's Bitcoin address.</p>
            <p className="mt-2">The verification process may take a few minutes after the transaction is confirmed.</p>
          </div>
          
          {onManualVerify && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-md">
              <p className="text-sm text-blue-700 mb-2">
                <span className="font-semibold">Already sent the payment?</span> You can verify your store immediately by entering the transaction ID.
              </p>
            </div>
          )}
        </div>
      )}

      {status === 'verified' && (
        <div className="text-center">
          <p className="text-green-600 mb-4">Your store is now verified and visible in the directory!</p>
          {onDismiss && (
            <button 
              onClick={onDismiss}
              className="btn btn-primary"
            >
              Continue to Dashboard
            </button>
          )}
        </div>
      )}

      {status === 'failed' && (
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <p className="text-sm text-gray-600 mb-4">Please try the verification process again.</p>
          {onManualVerify && (
            <button 
              onClick={onManualVerify}
              className="btn btn-outline flex items-center justify-center"
            >
              Try Manual Verification <FaArrowRight className="ml-2" />
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default VerificationStatus; 