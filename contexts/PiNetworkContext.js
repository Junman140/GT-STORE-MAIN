'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

const PiNetworkContext = createContext(undefined);

export function PiNetworkProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPaymentInProgress, setIsPaymentInProgress] = useState(false);
  const [currentPaymentId, setCurrentPaymentId] = useState(null);

  // Check for existing authentication on mount
  useEffect(() => {
    const checkExistingAuth = async () => {
      const savedToken = localStorage.getItem('pi_access_token');
      const savedUser = localStorage.getItem('pi_user');
      
      if (savedToken && savedUser) {
        try {
          const userData = JSON.parse(savedUser);
          console.log('📦 User data from localStorage:', userData);
          setUser(userData);
          setAccessToken(savedToken);
          setIsAuthenticated(true);
          console.log('✅ Restored authentication from localStorage');
          console.log('👤 User:', userData.piUsername || userData.username || userData.user_uid || userData.uid);
          
          // Initialize Pi SDK with authentication scopes to ensure payments work
          if (typeof window !== 'undefined' && window.Pi) {
            try {
              await window.Pi.init({ version: "2.0", sandbox: false });
              console.log('✅ Pi SDK initialized for existing authentication');
            } catch (initError) {
              console.warn('⚠️ Pi SDK initialization failed:', initError);
            }
          }
          
          // Re-verify with backend to get updated role and other data
          try {
            const response = await fetch('/api/pi/auth/verify', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ accessToken: savedToken }),
            });

            if (response.ok) {
              const backendResponse = await response.json();
              console.log('✅ User data refreshed from backend');
              console.log('   - User UID:', backendResponse.user.user_uid);
              console.log('   - Username:', backendResponse.user.piUsername);
              console.log('   - Role:', backendResponse.user.role);
              console.log('   - Full user object:', backendResponse.user);
              setUser(backendResponse.user);
              localStorage.setItem('pi_user', JSON.stringify(backendResponse.user));
            } else if (response.status === 401) {
              // Token expired - logout user
              const errorData = await response.json().catch(() => ({}));
              if (errorData.expired) {
                console.warn('⚠️ Access token expired - clearing auth and prompting re-login');
              } else {
                console.warn('⚠️ Authentication failed - logging out');
              }
              localStorage.removeItem('pi_access_token');
              localStorage.removeItem('pi_user');
              setUser(null);
              setAccessToken(null);
              setIsAuthenticated(false);
            } else {
              console.warn('⚠️ Backend verification failed, using cached data');
            }
          } catch (error) {
            console.warn('⚠️ Backend verification request failed, using cached data:', error);
          }
        } catch (error) {
          console.error('Error restoring saved authentication:', error);
          localStorage.removeItem('pi_access_token');
          localStorage.removeItem('pi_user');
        }
      } else {
        console.log('ℹ️ No saved authentication found in localStorage');
      }
    };

    checkExistingAuth();
  }, []);

  const authenticate = async () => {
    if (typeof window === 'undefined' || !window.Pi) {
      throw new Error('Pi SDK not available. Please open in Pi Browser.');
    }

    setIsLoading(true);
    try {
      console.log('🔐 Starting authentication flow...');
      
      // Initialize Pi SDK
      await window.Pi.init({ version: "2.0", sandbox: false });
      
      // Handle incomplete payments callback (following PIFRONTENDINTEGRATION.ts)
      const onIncompletePaymentFound = async (payment) => {
        console.log('⚠️ Incomplete payment found:', payment);
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
      
      // Authenticate with Pi Network (exactly like PIFRONTENDINTEGRATION.ts)
      console.log('🔑 Authenticating with Pi Network...');
      const auth = await window.Pi.authenticate(
        ["username", "payments", "wallet_address"],
        onIncompletePaymentFound
      );
      
      console.log('✅ Pi authentication completed successfully');
      console.log('✅ Scopes granted: username, payments, wallet_address');
      
      const userData = auth.user;
      
      // Save authentication data locally
      setUser(userData);
      setAccessToken(auth.accessToken);
      setIsAuthenticated(true);
      
      // Store in localStorage
      localStorage.setItem('pi_access_token', auth.accessToken);
      localStorage.setItem('pi_user', JSON.stringify(userData));
      
      console.log('💾 Authentication data saved to localStorage');
      
      // Verify token with the backend to create/update the user
      try {
        const response = await fetch('/api/pi/auth/verify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            accessToken: auth.accessToken,
            userData: userData // Include full user data from Pi Network
          }),
        });

        if (response.ok) {
          const backendResponse = await response.json();
          console.log('✅ User verified and data synced with backend');
          console.log('   - User UID:', backendResponse.user.user_uid);
          console.log('   - Username:', backendResponse.user.piUsername);
          console.log('   - Role:', backendResponse.user.role);
          console.log('   - Full user object:', backendResponse.user);
          setUser(backendResponse.user);
          localStorage.setItem('pi_user', JSON.stringify(backendResponse.user));
        } else if (response.status === 409) {
          // Handle case where user already exists - refresh token and try again
          console.log('⚠️ User already exists, refreshing authentication...');
          const retryResponse = await fetch('/api/pi/auth/verify', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
              accessToken: auth.accessToken,
              userData: userData,
              update: true // Signal that we want to update existing user
            }),
          });
          
          if (retryResponse.ok) {
            const backendResponse = await retryResponse.json();
            console.log('✅ User data updated successfully');
            console.log('   - User UID:', backendResponse.user.user_uid);
            console.log('   - Username:', backendResponse.user.piUsername);
            console.log('   - Role:', backendResponse.user.role);
            setUser(backendResponse.user);
            localStorage.setItem('pi_user', JSON.stringify(backendResponse.user));
          } else {
            throw new Error('Failed to update existing user');
          }
        } else {
          const errorData = await response.json();
          console.warn('⚠️ Backend verification failed, but authentication succeeded on frontend:', errorData.message);
          // Still proceed with frontend authentication even if backend fails
          console.log('✅ Proceeding with frontend authentication only');
        }
      } catch (error) {
        console.error('⚠️ Backend verification request failed:', error);
        // Still proceed with frontend authentication even if backend fails
        console.log('✅ Proceeding with frontend authentication only');
      }
      
      return auth;
    } catch (error) {
      console.error('Pi Network authentication failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const refreshUser = async () => {
    const savedToken = localStorage.getItem('pi_access_token');
    
    if (!savedToken) {
      console.warn('⚠️ No access token found');
      return;
    }

    try {
      const response = await fetch('/api/pi/auth/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ accessToken: savedToken }),
      });

      if (response.ok) {
        const backendResponse = await response.json();
        console.log('✅ User data refreshed via refreshUser()');
        console.log('   - User UID:', backendResponse.user.user_uid);
        console.log('   - Username:', backendResponse.user.piUsername);
        console.log('   - Role:', backendResponse.user.role);
        setUser(backendResponse.user);
        localStorage.setItem('pi_user', JSON.stringify(backendResponse.user));
        return backendResponse.user;
      } else if (response.status === 401) {
        // Token expired - logout user
        const errorData = await response.json().catch(() => ({}));
        if (errorData.expired) {
          console.warn('⚠️ Access token expired - please log in again');
        } else {
          console.warn('⚠️ Authentication failed - logging out');
        }
        logout();
      }
    } catch (error) {
      console.error('⚠️ Failed to refresh user data:', error);
    }
  };

  const logout = () => {
    setUser(null);
    setAccessToken(null);
    setIsAuthenticated(false);
    setIsPaymentInProgress(false);
    setCurrentPaymentId(null);
    
    // Clear localStorage
    localStorage.removeItem('pi_access_token');
    localStorage.removeItem('pi_user');
  };

  // Helper function to ensure Pi SDK is properly authenticated with payments scope
  const ensurePiAuthentication = async () => {
    if (typeof window === 'undefined' || !window.Pi) {
      throw new Error('Pi SDK not available. Please open in Pi Browser.');
    }

    // Check if Pi SDK is authenticated and has payments scope
    if (!window.Pi.isAuthenticated) {
      console.log('🔐 Pi SDK not authenticated, re-authenticating...');
      await window.Pi.init({ version: "2.0", sandbox: false });
      
      const auth = await window.Pi.authenticate(
        ["username", "payments", "wallet_address"],
        async (payment) => {
          console.log('⚠️ Incomplete payment found during auth:', payment);
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
        }
      );
      
      console.log('✅ Pi SDK re-authenticated with payments scope');
      // Update stored token
      setAccessToken(auth.accessToken);
      localStorage.setItem('pi_access_token', auth.accessToken);
      return auth;
    } else {
      console.log('✅ Pi SDK already authenticated with payments scope');
      return { accessToken: accessToken, user: user };
    }
  };

  const createPayment = async (paymentData) => {
    if (!isAuthenticated) {
      return { success: false, error: 'User must be authenticated to make payments' };
    }

    if (typeof window === 'undefined' || !window.Pi) {
      return { success: false, error: 'Pi SDK not available. Please open in Pi Browser.' };
    }

    setIsPaymentInProgress(true);
    setCurrentPaymentId(null);

    try {
      // Ensure Pi SDK is properly authenticated with payments scope
      await ensurePiAuthentication();
      
      console.log('💰 Creating payment with data:', paymentData);
      
      return new Promise((resolve) => {
        const callbacks = {
          onReadyForServerApproval: async (paymentId) => {
            console.log('✅ Payment created! ID:', paymentId);
            console.log('⏳ Approving payment with backend...');
            setCurrentPaymentId(paymentId);
            
            try {
              const response = await fetch('/api/pi/payments/approve', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ paymentId })
              });

              if (!response.ok) {
                const errorData = await response.json();
                console.error('❌ Payment approval failed:', errorData);
                throw new Error('Payment approval failed');
              }
              
              const result = await response.json();
              console.log('✅ Payment approved successfully:', result);
            } catch (error) {
              console.error('❌ Payment approval error:', error);
              // Don't throw - let Pi SDK handle the error flow
            }
          },

          onReadyForServerCompletion: async (paymentId, txid) => {
            console.log('🎯 Payment ready for completion:', paymentId, txid);
            console.log('📊 Payment completion data:', { paymentId, txid, paymentData });
            try {
              // Determine if this is a donation or purchase based on metadata
              const isPurchase = paymentData.metadata?.type === 'purchase';
              console.log('🔍 Payment type:', isPurchase ? 'Purchase' : 'Donation');
              
              const requestBody = { 
                paymentId, 
                txid
              };

              if (isPurchase) {
                // Handle purchase payment
                requestBody.purchaseData = {
                  userId: user.user_uid || user.uid,
                  sellerId: paymentData.metadata.sellerId,
                  listingType: paymentData.metadata.listingType,
                  listingId: paymentData.metadata.listingId,
                  productPrice: paymentData.metadata.productPrice,
                  logisticsFee: paymentData.metadata.logisticsFee,
                  platformFee: paymentData.metadata.platformFee,
                  totalAmount: paymentData.metadata.totalAmount,
                  shippingDetails: paymentData.metadata.shippingDetails,
                  metadata: paymentData.metadata
                };
                console.log('🛒 Purchase data prepared:', requestBody.purchaseData);
              } else {
                // Handle donation payment
                requestBody.donationData = {
                  userId: user.user_uid || user.uid,
                  amount: paymentData.amount,
                  memo: paymentData.memo,
                  metadata: paymentData.metadata
                };
                console.log('💰 Donation data prepared:', requestBody.donationData);
              }

              console.log('📤 Sending completion request to backend...');
              const response = await fetch('/api/pi/payments/complete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody)
              });

              if (!response.ok) {
                const errorData = await response.json();
                console.error('❌ Payment completion failed:', errorData);
                throw new Error('Payment completion failed');
              }

              const result = await response.json();
              console.log('✅ Payment completed successfully:', result);
              resolve({ success: true, paymentId });
            } catch (error) {
              console.error('❌ Payment completion error:', error);
              resolve({ success: false, error: 'Payment completion failed' });
            } finally {
              setIsPaymentInProgress(false);
            }
          },

          onCancel: (paymentId) => {
            console.log('❌ Payment cancelled:', paymentId);
            setIsPaymentInProgress(false);
            resolve({ success: false, error: 'Payment was cancelled' });
          },

          onError: (error, payment) => {
            console.error('❌ Payment error:', error, payment);
            setIsPaymentInProgress(false);
            
            // Check if error is due to missing payments scope
            const errorMsg = error.message || '';
            console.log('🔍 Payment error details:', {
              message: errorMsg,
              error: error,
              payment: payment
            });
            
            if (errorMsg.includes('payments') && errorMsg.includes('scope')) {
              console.warn('⚠️ Payments scope not granted. User needs to re-authenticate.');
              alert('To enable payments, please logout and login again to grant payment permissions.');
              resolve({ 
                success: false, 
                error: 'Payment permissions required. Please logout and login again.' 
              });
            } else if (errorMsg.includes('Cannot create a payment without "payments" scope')) {
              console.warn('⚠️ Payments scope missing. Forcing re-authentication.');
              alert('Payment permissions are required. Please logout and login again to enable payments.');
              logout(); // Force logout to require re-authentication
              resolve({ 
                success: false, 
                error: 'Payment permissions required. Please login again.' 
              });
            } else {
              resolve({ success: false, error: errorMsg || 'Payment failed' });
            }
          }
        };

        // Create the payment using Pi SDK (following PIFRONTENDINTEGRATION.ts)
        window.Pi.createPayment(paymentData, callbacks);
      });

    } catch (error) {
      console.error('Failed to create Pi payment:', error);
      setIsPaymentInProgress(false);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Payment failed' 
      };
    }
  };

  const value = {
    isAuthenticated,
    user,
    accessToken,
    isLoading,
    authenticate,
    logout,
    refreshUser,
    createPayment,
    ensurePiAuthentication,
    isPaymentInProgress,
    currentPaymentId
  };

  return (
    <PiNetworkContext.Provider value={value}>
      {children}
    </PiNetworkContext.Provider>
  );
}

export function usePiNetwork() {
  const context = useContext(PiNetworkContext);
  if (context === undefined) {
    if (typeof window === 'undefined') {
      // Server-side rendering: return default values
      return {
        isAuthenticated: false,
        user: null,
        accessToken: null,
        isLoading: false,
        authenticate: async () => {},
        logout: () => {},
        refreshUser: async () => {},
        createPayment: async () => ({ success: false, error: 'Not initialized' }),
        ensurePiAuthentication: async () => {},
        isPaymentInProgress: false,
        currentPaymentId: null
      };
    }
    throw new Error('usePiNetwork must be used within a PiNetworkProvider');
  }
  return context;
}