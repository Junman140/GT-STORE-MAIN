import { useState } from 'react';
import { usePiNetwork } from '@/contexts/PiNetworkContext';
import DonationModal from '../components/DonationModal';
import Head from 'next/head';

export default function DonatePage() {
  const { user, isAuthenticated } = usePiNetwork();
  const [showDonationModal, setShowDonationModal] = useState(false);
  const [recentDonations, setRecentDonations] = useState([]);

  const handleDonationSuccess = (donationData) => {
    console.log('Donation successful:', donationData);
    setRecentDonations(prev => [donationData, ...prev.slice(0, 4)]);
    // You could show a success message or redirect
  };

  return (
    <>
      <Head>
        <title>Support GT Store - Donate with Pi</title>
        <meta name="description" content="Support GT Store development with Pi cryptocurrency donations" />
      </Head>

      <div className="min-h-screen bg-black py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-white mb-4">
              Support GT Store
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Help us build the future of decentralized marketplace for gadgets and electronics. 
              Your Pi donations help us maintain and improve the platform.
            </p>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Donation Section */}
            <div className="rounded-2xl border border-white/20 bg-white/5 backdrop-blur-sm p-8 shadow-soft">
              <h2 className="text-2xl font-bold text-white mb-6">
                Make a Donation
              </h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-200 mb-3">
                    Why Donate?
                  </h3>
                  <ul className="space-y-2 text-gray-300">
                    <li className="flex items-start">
                      <svg className="w-5 h-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Support platform development and maintenance
                    </li>
                    <li className="flex items-start">
                      <svg className="w-5 h-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Help us add new features and improvements
                    </li>
                    <li className="flex items-start">
                      <svg className="w-5 h-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Keep the platform free for all users
                    </li>
                    <li className="flex items-start">
                      <svg className="w-5 h-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Support the Pi Network ecosystem
                    </li>
                  </ul>
                </div>

                {!isAuthenticated ? (
                  <div className="bg-yellow-900/20 border border-yellow-400/30 rounded-md p-4">
                    <p className="text-yellow-300 text-sm">
                      Please login with your Pi wallet to make a donation.
                    </p>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowDonationModal(true)}
                    className="w-full bg-brand-blue text-white py-3 px-6 rounded-lg hover:bg-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-blue font-semibold"
                  >
                    Donate with Pi
                  </button>
                )}
              </div>
            </div>

            {/* Info Section */}
            <div className="space-y-6">
              {/* How it Works */}
              <div className="rounded-2xl border border-white/20 bg-white/5 backdrop-blur-sm p-6 shadow-soft">
                <h3 className="text-xl font-bold text-white mb-4">
                  How Donations Work
                </h3>
                <div className="space-y-3">
                  <div className="flex items-start">
                    <div className="bg-brand-blue text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-0.5">
                      1
                    </div>
                    <div>
                      <p className="font-medium text-white">Connect Pi Wallet</p>
                      <p className="text-sm text-gray-300">Login with your Pi Network wallet</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="bg-brand-blue text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-0.5">
                      2
                    </div>
                    <div>
                      <p className="font-medium text-white">Choose Amount</p>
                      <p className="text-sm text-gray-300">Select a donation amount in Pi</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="bg-brand-blue text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-0.5">
                      3
                    </div>
                    <div>
                      <p className="font-medium text-white">Confirm Payment</p>
                      <p className="text-sm text-gray-300">Approve the transaction in your Pi wallet</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="bg-brand-blue text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-0.5">
                      4
                    </div>
                    <div>
                      <p className="font-medium text-white">Thank You!</p>
                      <p className="text-sm text-gray-300">Your donation helps support GT Store</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Donations */}
              {recentDonations.length > 0 && (
                <div className="rounded-2xl border border-white/20 bg-white/5 backdrop-blur-sm p-6 shadow-soft">
                  <h3 className="text-xl font-bold text-white mb-4">
                    Recent Donations
                  </h3>
                  <div className="space-y-2">
                    {recentDonations.map((donation, index) => (
                      <div key={index} className="flex justify-between items-center py-2 border-b border-white/10 last:border-b-0">
                        <div>
                          <p className="font-medium text-white">{donation.amount} π</p>
                          <p className="text-sm text-gray-400">Just now</p>
                        </div>
                        <div className="text-green-500">
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* FAQ */}
              <div className="rounded-2xl border border-white/20 bg-white/5 backdrop-blur-sm p-6 shadow-soft">
                <h3 className="text-xl font-bold text-white mb-4">
                  Frequently Asked Questions
                </h3>
                <div className="space-y-4">
                  <div>
                    <p className="font-medium text-white">Is my donation secure?</p>
                    <p className="text-sm text-gray-300">Yes, all donations are processed through the secure Pi Network blockchain.</p>
                  </div>
                  <div>
                    <p className="font-medium text-white">Can I donate any amount?</p>
                    <p className="text-sm text-gray-300">Yes, you can donate any amount starting from 0.1 π.</p>
                  </div>
                  <div>
                    <p className="font-medium text-white">How is my donation used?</p>
                    <p className="text-sm text-gray-300">Donations are used for platform development, server costs, and new features.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Donation Modal */}
        <DonationModal
          isOpen={showDonationModal}
          onClose={() => setShowDonationModal(false)}
          onSuccess={handleDonationSuccess}
        />
      </div>
    </>
  );
}
