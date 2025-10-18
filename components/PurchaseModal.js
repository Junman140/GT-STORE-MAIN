import React, { useState } from 'react';
import { usePiNetwork } from '../contexts/PiNetworkContext';

export default function PurchaseModal({ isOpen, onClose, listing, seller }) {
  const { user, createPayment } = usePiNetwork();
  
  const [shippingDetails, setShippingDetails] = useState({
    fullName: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    phone: ''
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [status, setStatus] = useState('idle'); // idle, processing, success, error
  const [error, setError] = useState(null);

  // Calculate fees
  const productPrice = listing.pricePi || 0;
  const logisticsFee = listing.logisticsFee || 5; // Use seller's logistics fee
  const platformFee = Math.round((productPrice + logisticsFee) * 0.01 * 100) / 100; // 1% platform fee
  const totalAmount = productPrice + logisticsFee + platformFee;

  // Check if buyer is in Nigeria
  const isNigerianBuyer = () => {
    const country = shippingDetails.country?.toLowerCase();
    return country === 'nigeria' || country === 'ng';
  };

  const handlePurchase = async () => {
    if (!user) {
      setError('Please login with Pi first');
      return;
    }

    // Validate shipping details
    const requiredFields = ['fullName', 'address', 'city', 'state', 'zipCode', 'country', 'phone'];
    const missingFields = requiredFields.filter(field => !shippingDetails[field].trim());
    
    if (missingFields.length > 0) {
      setError(`Please fill in all required fields: ${missingFields.join(', ')}`);
      return;
    }

    // Check if buyer is in Nigeria
    if (!isNigerianBuyer()) {
      setError('This platform is currently only available for buyers in Nigeria. Please contact the seller directly to discuss international shipping.');
      return;
    }

    setIsProcessing(true);
    setStatus('processing');
    setError(null);

    try {
      const paymentData = {
        amount: totalAmount,
        memo: `Purchase: ${listing.title} - ${totalAmount} π`,
        metadata: {
          type: 'purchase',
          userId: user.user_uid || user.uid,
          listingType: listing.type || 'phone',
          listingId: listing.id,
          sellerId: seller?.id || seller?.user_uid,
          productPrice,
          logisticsFee,
          platformFee,
          totalAmount,
          shippingDetails,
          timestamp: new Date().toISOString()
        }
      };

      const result = await createPayment(paymentData);
      
      if (result.success) {
        setStatus('success');
        setTimeout(() => {
          onClose();
          resetForm();
        }, 2000);
      } else {
        setError(result.error || 'Purchase failed');
        setStatus('error');
      }

    } catch (error) {
      console.error('Purchase failed:', error);
      setError(error.message || 'Purchase failed');
      setStatus('error');
    } finally {
      setIsProcessing(false);
    }
  };

  const resetForm = () => {
    setShippingDetails({
      fullName: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      country: '',
      phone: ''
    });
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
          <h2 className="text-xl font-bold text-white">Complete Purchase</h2>
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

        {/* Product Summary */}
        <div className="mb-6 p-4 rounded-2xl border border-white/20 bg-white/5 backdrop-blur-sm">
          <h3 className="font-semibold text-white mb-2">{listing.title}</h3>
          <div className="text-sm text-gray-300">
            <p>Seller: {seller?.piUsername || 'Unknown'}</p>
            <p>Location: {listing.location}</p>
          </div>
        </div>

        {/* Price Breakdown */}
        <div className="mb-6">
          <h3 className="font-semibold text-white mb-3">Price Breakdown</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-gray-300">
              <span>Product Price:</span>
              <span>{productPrice} π</span>
            </div>
            <div className="flex justify-between text-gray-300">
              <span>Logistics Fee:</span>
              <span>{logisticsFee} π</span>
            </div>
            <div className="flex justify-between text-gray-300">
              <span>Platform Fee (1%):</span>
              <span>{platformFee} π</span>
            </div>
            <div className="flex justify-between font-semibold border-t border-white/20 pt-2 text-white">
              <span>Total:</span>
              <span>{totalAmount} π</span>
            </div>
          </div>
        </div>

        {/* Shipping Details Form */}
        <div className="mb-6">
          <h3 className="font-semibold text-white mb-3">Shipping Details</h3>
          
          {/* Nigeria-only notice */}
          <div className="mb-4 p-3 rounded-xl border border-blue-400/30 bg-blue-900/20">
            <div className="flex items-start gap-2">
              <svg className="h-5 w-5 text-blue-300 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="text-sm font-medium text-blue-200">Nigeria Only</p>
                <p className="text-xs text-blue-300 mt-1">
                  This platform currently only supports shipping within Nigeria. International buyers should contact the seller directly.
                </p>
              </div>
            </div>
          </div>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-white mb-1">
                Full Name *
              </label>
              <input
                type="text"
                value={shippingDetails.fullName}
                onChange={(e) => setShippingDetails(prev => ({ ...prev, fullName: e.target.value }))}
                className="w-full px-3 py-2 border border-white/20 bg-white/5 backdrop-blur-sm text-white placeholder:text-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-brand-blue"
                placeholder="Enter your full name"
                disabled={isProcessing}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-white mb-1">
                Address *
              </label>
              <input
                type="text"
                value={shippingDetails.address}
                onChange={(e) => setShippingDetails(prev => ({ ...prev, address: e.target.value }))}
                className="w-full px-3 py-2 border border-white/20 bg-white/5 backdrop-blur-sm text-white placeholder:text-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-brand-blue"
                placeholder="Street address"
                disabled={isProcessing}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-white mb-1">
                  City *
                </label>
                <input
                  type="text"
                  value={shippingDetails.city}
                  onChange={(e) => setShippingDetails(prev => ({ ...prev, city: e.target.value }))}
                  className="w-full px-3 py-2 border border-white/20 bg-white/5 backdrop-blur-sm text-white placeholder:text-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-brand-blue"
                  placeholder="City"
                  disabled={isProcessing}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-1">
                  State *
                </label>
                <input
                  type="text"
                  value={shippingDetails.state}
                  onChange={(e) => setShippingDetails(prev => ({ ...prev, state: e.target.value }))}
                  className="w-full px-3 py-2 border border-white/20 bg-white/5 backdrop-blur-sm text-white placeholder:text-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-brand-blue"
                  placeholder="State"
                  disabled={isProcessing}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-white mb-1">
                  ZIP Code *
                </label>
                <input
                  type="text"
                  value={shippingDetails.zipCode}
                  onChange={(e) => setShippingDetails(prev => ({ ...prev, zipCode: e.target.value }))}
                  className="w-full px-3 py-2 border border-white/20 bg-white/5 backdrop-blur-sm text-white placeholder:text-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-brand-blue"
                  placeholder="ZIP Code"
                  disabled={isProcessing}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-1">
                  Country *
                </label>
                <input
                  type="text"
                  value={shippingDetails.country}
                  onChange={(e) => setShippingDetails(prev => ({ ...prev, country: e.target.value }))}
                  className="w-full px-3 py-2 border border-white/20 bg-white/5 backdrop-blur-sm text-white placeholder:text-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-brand-blue"
                  placeholder="Country"
                  disabled={isProcessing}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-1">
                Phone Number *
              </label>
              <input
                type="tel"
                value={shippingDetails.phone}
                onChange={(e) => setShippingDetails(prev => ({ ...prev, phone: e.target.value }))}
                className="w-full px-3 py-2 border border-white/20 bg-white/5 backdrop-blur-sm text-white placeholder:text-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-brand-blue"
                placeholder="Phone number"
                disabled={isProcessing}
              />
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 rounded-xl border border-red-400/30 bg-red-900/20 text-red-300">
            {error}
          </div>
        )}

        {/* Success Message */}
        {status === 'success' && (
          <div className="mb-4 p-3 rounded-xl border border-green-400/30 bg-green-900/20 text-green-300">
            Purchase completed successfully! You will receive logistics details via message.
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-3">
          <button
            onClick={handleClose}
            disabled={isProcessing}
            className="flex-1 px-4 py-2 border border-white/20 bg-white/5 backdrop-blur-sm text-white rounded-md hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handlePurchase}
            disabled={isProcessing}
            className="flex-1 px-4 py-2 bg-brand-blue text-white rounded-md hover:bg-brand-dark disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
          >
            {isProcessing ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </>
            ) : (
              `Pay ${totalAmount} π`
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
