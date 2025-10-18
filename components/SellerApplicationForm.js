import { useState } from 'react';
import { usePiNetwork } from '../contexts/PiNetworkContext';

export default function SellerApplicationForm({ onSuccess, onCancel }) {
  const { user, isAuthenticated } = usePiNetwork();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    businessName: '',
    businessType: 'Individual',
    location: '',
    description: '',
    email: user?.email || '',
    phone: '',
    ownershipProof: []
  });

  const businessTypes = [
    { value: 'Individual', label: 'Individual Seller' },
    { value: 'Company', label: 'Company' },
    { value: 'Dealer', label: 'Authorized Dealer' }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    const fileUrls = files.map(file => URL.createObjectURL(file));
    
    setFormData(prev => ({
      ...prev,
      ownershipProof: [...prev.ownershipProof, ...fileUrls]
    }));
  };

  const removeFile = (index) => {
    setFormData(prev => ({
      ...prev,
      ownershipProof: prev.ownershipProof.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      setError('Please login with Pi first');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const userId = user?.id || user?.user_uid || user?.uid;
      const response = await fetch('/api/seller-applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          userId: userId
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(true);
        setTimeout(() => {
          onSuccess?.(data.application);
        }, 2000);
      } else {
        setError(data.error || 'Application submission failed');
      }
    } catch (error) {
      console.error('Application error:', error);
      setError('Application submission failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-8">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
            <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Application Submitted Successfully!
          </h3>
          <p className="text-gray-600 mb-6">
            Your seller application has been submitted and is under review. 
            You will be notified once the admin reviews your application.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-800">
              <strong>What's next?</strong><br />
              An admin will review your application within 24-48 hours. Once approved, 
              you'll be able to create listings from the <strong>Seller Dashboard</strong>.
            </p>
          </div>
          <button
            onClick={onCancel}
            className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Become a Seller
        </h2>
        <p className="text-gray-600">
          Apply to become a verified seller on GT Store. You'll be able to list gadgets and electronics for sale.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Business Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Business Name *
          </label>
          <input
            type="text"
            name="businessName"
            value={formData.businessName}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your business name"
          />
        </div>

        {/* Business Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Business Type *
          </label>
          <select
            name="businessType"
            value={formData.businessType}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {businessTypes.map(type => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        {/* Location */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Location *
          </label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="City, Country"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Business Description *
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            required
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Describe your business and what you plan to sell..."
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email Address *
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="your@email.com"
          />
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Phone Number
          </label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="+1 (555) 123-4567"
          />
        </div>

        {/* Proof of Ownership */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Proof of Ownership *
          </label>
          <p className="text-sm text-gray-500 mb-3">
            Upload documents that prove you own the items you plan to sell (e.g., vehicle registration, property deeds, business license)
          </p>
          
          <input
            type="file"
            multiple
            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
            onChange={handleFileUpload}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          
          {formData.ownershipProof.length > 0 && (
            <div className="mt-3">
              <p className="text-sm font-medium text-gray-700 mb-2">Uploaded Files:</p>
              <div className="space-y-2">
                {formData.ownershipProof.map((file, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                    <span className="text-sm text-gray-700">File {index + 1}</span>
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Submit Buttons */}
        <div className="flex space-x-4 pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Application'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
