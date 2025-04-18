import React from 'react';
import { FaBitcoin, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';

interface VerificationStatusProps {
  status: 'pending' | 'verified' | 'failed';
  error?: string;
  onDismiss?: () => void;
}

const VerificationStatus: React.FC<VerificationStatusProps> = ({
  status,
  error,
  onDismiss,
}) => {
  const getStatusIcon = () => {
    switch (status) {
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
    switch (status) {
      case 'verified':
        return 'Your store has been verified!';
      case 'pending':
        return 'Verification in progress...';
      case 'failed':
        return 'Verification failed';
      default:
        return '';
    }
  };

  return (
    <div className="card bg-white p-6 rounded-lg shadow-sm">
      <div className="text-center">
        {getStatusIcon()}
        <h4 className="text-lg font-semibold mt-2">{getStatusMessage()}</h4>
        
        {status === 'verified' && (
          <div className="mt-4">
            <p className="text-green-600 mb-4">Your store is now verified and visible in the directory!</p>
            {onDismiss && (
              <button 
                onClick={onDismiss}
                className="bg-bitcoin-orange hover:bg-bitcoin-orange-dark text-white py-2 px-4 rounded-md transition-colors"
              >
                Continue to Dashboard
              </button>
            )}
          </div>
        )}

        {status === 'failed' && (
          <div className="mt-4">
            <p className="text-red-500 mb-4">{error}</p>
            <p className="text-sm text-gray-600">Please try the verification process again.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerificationStatus; 