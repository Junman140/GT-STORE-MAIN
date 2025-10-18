import { useState } from 'react';
import { usePiNetwork } from '../contexts/PiNetworkContext';

export default function DonationModal({ isOpen, onClose, onSuccess }) {
  const { user, createPayment, isPaymentInProgress } = usePiNetwork();
  const [amount, setAmount] = useState(10);
  const [memo, setMemo] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [status, setStatus] = useState('idle'); // idle, processing, success, error
  const [error, setError] = useState(null);

  const predefinedAmounts = [5, 10, 25, 50, 100];

  // Handle incomplete payments callback (following PIFRONTENDINTEGRATION.ts)
  const onIncompletePaymentFound = async (payment) => {
    console.log('Incomplete payment found:', payment);
    const paymentId = payment.identifier;
    try {
      await fetch('/api/pi/payments/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentId })
      });
    } catch (err) {
      console.error('Error cancelling incomplete payment:', err);
    }
  };

  const handleDonation = async () => {
    if (!amount || amount <= 0) {
      setError('Please enter a valid donation amount');
      return;
    }

    if (!user) {
      setError('Please login with Pi first');
      return;
    }

    setIsProcessing(true);
    setStatus('processing');
    setError(null);

    try {
      const paymentData = {
        amount: amount,
        memo: memo || `Donation to GT Store - ${amount} π`,
        metadata: {
          type: 'donation',
          userId: user.user_uid || user.uid,
          timestamp: new Date().toISOString()
        }
      };

      const result = await createPayment(paymentData);
      
      if (result.success) {
        setStatus('success');
        setTimeout(() => {
          onSuccess?.({ paymentId: result.paymentId, amount });
          onClose();
          resetForm();
        }, 2000);
      } else {
        setError(result.error || 'Donation failed');
        setStatus('error');
      }

    } catch (error) {
      console.error('Donation failed:', error);
      setError(error.message || 'Donation failed');
      setStatus('error');
    } finally {
      setIsProcessing(false);
    }
  };

  const resetForm = () => {
    setAmount(10);
    setMemo('');
    setStatus('idle');
    setError(null);
    setIsProcessing(false);
  };

  const handleClose = () => {
    if (!isProcessing) {
      resetForm();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="rounded-2xl border border-white/20 bg-white/5 backdrop-blur-sm p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto shadow-soft">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white">Support GT Store</h2>
          <button
            onClick={handleClose}
            disabled={isProcessing}
            className="text-gray-400 hover:text-white disabled:opacity-50 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-4">
          {/* User Info */}
          <div className="rounded-xl border border-blue-400/30 bg-blue-900/20 p-3">
            <p className="text-sm text-blue-200">
              <strong>Donating as:</strong> {user?.piUsername || user?.username || user?.user_uid || user?.uid}
            </p>
          </div>

          {/* Amount Selection */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Donation Amount (π)
            </label>
            <div className="grid grid-cols-3 gap-2 mb-3">
              {predefinedAmounts.map((predefinedAmount) => (
                <button
                  key={predefinedAmount}
                  onClick={() => setAmount(predefinedAmount)}
                  disabled={isProcessing}
                  className={`px-3 py-2 text-sm rounded-md border transition-colors ${
                    amount === predefinedAmount
                      ? 'bg-brand-blue text-white border-brand-blue'
                      : 'bg-white/5 text-gray-300 border-white/20 hover:bg-white/10'
                  } disabled:opacity-50`}
                >
                  {predefinedAmount} π
                </button>
              ))}
            </div>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
              disabled={isProcessing}
              className="w-full px-3 py-2 border border-white/20 bg-white/5 backdrop-blur-sm text-white placeholder:text-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-brand-blue disabled:opacity-50"
              placeholder="Custom amount"
              min="0.1"
              step="0.1"
            />
          </div>

          {/* Memo */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Message (Optional)
            </label>
            <textarea
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              disabled={isProcessing}
              className="w-full px-3 py-2 border border-white/20 bg-white/5 backdrop-blur-sm text-white placeholder:text-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-brand-blue disabled:opacity-50"
              placeholder="Thank you for supporting GT Store!"
              rows={3}
            />
          </div>

          {/* Status Display */}
          {status === 'processing' && (
            <div className="text-center py-4">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-brand-blue"></div>
              <p className="mt-2 text-sm text-gray-300">Processing donation...</p>
            </div>
          )}

          {status === 'success' && (
            <div className="text-center py-4">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mb-2 mx-auto">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-sm text-green-300 font-medium">Donation successful!</p>
            </div>
          )}

          {error && (
            <div className="rounded-xl border border-red-400/30 bg-red-900/20 p-3">
              <p className="text-sm text-red-300">{error}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4">
            <button
              onClick={handleDonation}
              disabled={isProcessing || amount <= 0}
              className="flex-1 bg-brand-blue text-white py-2 px-4 rounded-md hover:bg-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-blue disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isProcessing ? 'Processing...' : `Donate ${amount} π`}
            </button>
            <button
              onClick={handleClose}
              disabled={isProcessing}
              className="px-4 py-2 border border-white/20 bg-white/5 backdrop-blur-sm text-white rounded-md hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-brand-blue disabled:opacity-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
