import axios from 'axios';

// Pi Network Payment Service
export class PiPaymentService {
  constructor(apiKey) {
    if (!apiKey) {
      throw new Error("Pi Network API Key is required.");
    }
    this.apiKey = apiKey;
    this.baseUrl = "https://api.minepi.com/v2";
    
    this.piNetworkApi = axios.create({
      baseURL: this.baseUrl,
      timeout: 20000,
      headers: {
        Authorization: `Key ${this.apiKey}`,
      },
    });
  }

  // Verify user token with Pi Network
  async verifyUserToken(accessToken) {
    try {
      const response = await this.piNetworkApi.get("/me", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error verifying user token:", error);
      throw error;
    }
  }

  // Approve payment
  async approvePayment(paymentId) {
    try {
      await this.piNetworkApi.post(`/payments/${paymentId}/approve`);
      console.log(`Payment ${paymentId} approved successfully.`);
    } catch (error) {
      console.error(`Error approving payment ${paymentId}:`, error);
      throw error;
    }
  }

  // Complete payment
  async completePayment(paymentId, transactionId) {
    try {
      await this.piNetworkApi.post(`/payments/${paymentId}/complete`, {
        txid: transactionId
      });
      console.log(`Payment ${paymentId} completed successfully with txid: ${transactionId}.`);
    } catch (error) {
      console.error(`Error completing payment ${paymentId}:`, error);
      throw error;
    }
  }

  // Cancel payment
  async cancelPayment(paymentId) {
    try {
      await this.piNetworkApi.post(`/payments/${paymentId}/cancel`);
      console.log(`Payment ${paymentId} cancelled successfully.`);
    } catch (error) {
      console.error(`Error cancelling payment ${paymentId}:`, error);
      throw error;
    }
  }

  // Get payment information
  async getPaymentInfo(paymentId) {
    try {
      const response = await this.piNetworkApi.get(`/payments/${paymentId}`);
      return response.data;
    } catch (error) {
      console.error(`Error getting payment info for ${paymentId}:`, error);
      throw error;
    }
  }

  // Get incomplete server payments
  async getIncompletePayments() {
    try {
      const response = await this.piNetworkApi.get("/payments/incomplete_server_payments");
      return response.data.incomplete_server_payments || [];
    } catch (error) {
      console.error("Error getting incomplete payments:", error);
      throw error;
    }
  }
}

// Singleton instance
let piPaymentServiceInstance = null;

export function getPiPaymentService() {
  if (!piPaymentServiceInstance) {
    const apiKey = process.env.PI_API_KEY;
    if (!apiKey) {
      throw new Error("PI_API_KEY environment variable is required");
    }
    piPaymentServiceInstance = new PiPaymentService(apiKey);
  }
  return piPaymentServiceInstance;
}

// Frontend payment service
export class PiPaymentFrontend {
  constructor() {
    this.isInitialized = false;
  }

  // Initialize Pi SDK
  async initialize() {
    if (typeof window === 'undefined' || !window.Pi) {
      throw new Error('Pi SDK not available. Please open in Pi Browser.');
    }

    if (!this.isInitialized) {
      const isDevelopment = process.env.NODE_ENV === 'development';
      await window.Pi.init({ 
        version: "2.0", 
        sandbox: isDevelopment 
      });
      this.isInitialized = true;
      console.log('Pi SDK initialized with sandbox:', isDevelopment);
    }
  }

  // Authenticate user
  async authenticate() {
    await this.initialize();
    
    const onIncompletePaymentFound = (payment) => {
      console.log('Incomplete payment found:', payment);
      // Handle incomplete payment if needed
    };

    const authResult = await window.Pi.authenticate(
      ["username", "payments", "wallet_address"],
      onIncompletePaymentFound
    );

    return authResult;
  }

  // Create payment
  async createPayment(paymentData, callbacks) {
    await this.initialize();
    
    return new Promise((resolve, reject) => {
      const paymentCallbacks = {
        onReadyForServerApproval: async (paymentId) => {
          console.log('Payment ready for approval:', paymentId);
          try {
            const response = await fetch('/api/pi/payments/approve', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ paymentId })
            });

            if (!response.ok) {
              throw new Error('Payment approval failed');
            }
            
            callbacks?.onReadyForServerApproval?.(paymentId);
          } catch (error) {
            console.error('Payment approval error:', error);
            reject(error);
          }
        },

        onReadyForServerCompletion: async (paymentId, txid) => {
          console.log('Payment ready for completion:', paymentId, txid);
          try {
            const response = await fetch('/api/pi/payments/complete', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ paymentId, txid })
            });

            if (!response.ok) {
              throw new Error('Payment completion failed');
            }

            callbacks?.onReadyForServerCompletion?.(paymentId, txid);
            resolve({ success: true, paymentId, txid });
          } catch (error) {
            console.error('Payment completion error:', error);
            reject(error);
          }
        },

        onCancel: (paymentId) => {
          console.log('Payment cancelled:', paymentId);
          callbacks?.onCancel?.(paymentId);
          resolve({ success: false, error: 'Payment was cancelled' });
        },

        onError: (error, payment) => {
          console.error('Payment error:', error, payment);
          callbacks?.onError?.(error, payment);
          reject(error);
        }
      };

      window.Pi.createPayment(paymentData, paymentCallbacks);
    });
  }
}

// Export singleton instance
export const piPaymentFrontend = new PiPaymentFrontend();
