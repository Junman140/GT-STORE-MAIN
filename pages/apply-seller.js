import { useState } from 'react';
import { usePiNetwork } from '../contexts/PiNetworkContext';
import SellerApplicationForm from '../components/SellerApplicationForm';
import Head from 'next/head';

export default function ApplySellerPage() {
  const { user, isAuthenticated } = usePiNetwork();
  const [showForm, setShowForm] = useState(false);

  if (!isAuthenticated) {
    return (
      <>
        <Head>
          <title>Apply to Become a Seller - GT Store</title>
        </Head>
        <div className="min-h-screen bg-black flex items-center justify-center">
          <div className="max-w-md mx-auto text-center">
            <div className="rounded-2xl border border-white/20 bg-white/5 backdrop-blur-sm p-8 shadow-soft">
              <h1 className="text-2xl font-bold text-white mb-4">
                Login Required
              </h1>
              <p className="text-gray-300 mb-6">
                Please login with your Pi wallet to apply as a seller.
              </p>
              <button
                onClick={() => window.location.href = '/'}
                className="bg-brand-blue text-white px-6 py-2 rounded-md hover:bg-brand-dark"
              >
                Go to Homepage
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Admins and sellers can create listings directly
  if (user?.role === 'seller' || user?.role === 'admin') {
    return (
      <>
        <Head>
          <title>Already a Seller - GT Store</title>
        </Head>
        <div className="min-h-screen bg-black flex items-center justify-center">
          <div className="max-w-md mx-auto text-center">
            <div className="rounded-2xl border border-white/20 bg-white/5 backdrop-blur-sm p-8 shadow-soft">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-900/20 border border-green-400/30 mb-4">
                <svg className="h-6 w-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-white mb-4">
                {user.role === 'admin' ? "You're an Admin!" : "You're Already a Seller!"}
              </h1>
              <p className="text-gray-300 mb-6">
                {user.role === 'admin' 
                  ? "As an admin, you already have full access to create listings. You don't need to apply as a seller!"
                  : "You have been approved as a seller on GT Store. You can now list gadgets and electronics for sale."
                }
              </p>
              <div className="space-y-3">
                <button
                  onClick={() => window.location.href = user.role === 'admin' ? '/seller-dashboard' : '/seller-dashboard'}
                  className="w-full bg-brand-blue text-white px-6 py-2 rounded-md hover:bg-brand-dark"
                >
                  {user.role === 'admin' ? 'Go to Dashboard' : 'My Listings'}
                </button>
                <button
                  onClick={() => window.location.href = '/create'}
                  className="w-full bg-brand-blue text-white px-6 py-2 rounded-md hover:bg-brand-dark"
                >
                  Create New Listing
                </button>
                <button
                  onClick={() => window.location.href = '/'}
                  className="w-full border border-white/20 bg-white/5 backdrop-blur-sm text-white px-6 py-2 rounded-md hover:bg-white/10"
                >
                  Browse Listings
                </button>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Apply to Become a Seller - GT Store</title>
        <meta name="description" content="Apply to become a verified seller on GT Store marketplace" />
      </Head>

      <div className="min-h-screen bg-black py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {!showForm ? (
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold text-white mb-4">
                Become a Seller
              </h1>
              <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-8">
                Join GT Store as a verified seller and start listing gadgets and electronics for sale.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="rounded-2xl border border-white/20 bg-white/5 backdrop-blur-sm p-6 shadow-soft">
                  <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-900/20 border border-blue-400/30 mb-4">
                    <svg className="h-6 w-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    Verified Status
                  </h3>
                  <p className="text-gray-300">
                    Get verified as a trusted seller with our approval process
                  </p>
                </div>

                <div className="rounded-2xl border border-white/20 bg-white/5 backdrop-blur-sm p-6 shadow-soft">
                  <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-900/20 border border-green-400/30 mb-4">
                    <svg className="h-6 w-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    Direct Communication
                  </h3>
                  <p className="text-gray-300">
                    Chat directly with interested buyers through our messaging system
                  </p>
                </div>

                <div className="rounded-2xl border border-white/20 bg-white/5 backdrop-blur-sm p-6 shadow-soft">
                  <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-purple-900/20 border border-purple-400/30 mb-4">
                    <svg className="h-6 w-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    Easy Listing
                  </h3>
                  <p className="text-gray-300">
                    Create detailed listings for gadgets and electronics with photos and descriptions
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-white/20 bg-white/5 backdrop-blur-sm p-8 mb-8 shadow-soft">
                <h2 className="text-2xl font-bold text-white mb-6">
                  Requirements
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">
                      For Phone Sellers:
                    </h3>
                    <ul className="space-y-2 text-gray-300">
                      <li className="flex items-start">
                        <svg className="w-5 h-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        Valid device ownership proof
                      </li>
                      <li className="flex items-start">
                        <svg className="w-5 h-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        Device condition documentation
                      </li>
                      <li className="flex items-start">
                        <svg className="w-5 h-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        Valid identification
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">
                      For Laptop Sellers:
                    </h3>
                    <ul className="space-y-2 text-gray-300">
                      <li className="flex items-start">
                        <svg className="w-5 h-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        Device ownership documentation
                      </li>
                      <li className="flex items-start">
                        <svg className="w-5 h-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        Proof of purchase or receipt
                      </li>
                      <li className="flex items-start">
                        <svg className="w-5 h-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        Valid identification
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowForm(true)}
                className="bg-brand-blue text-white px-8 py-3 rounded-lg hover:bg-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-blue font-semibold text-lg"
              >
                Start Application
              </button>
            </div>
          ) : (
            <SellerApplicationForm
              onSuccess={(application) => {
                console.log('Application submitted:', application);
                setShowForm(false);
              }}
              onCancel={() => setShowForm(false)}
            />
          )}
        </div>
      </div>
    </>
  );
}
