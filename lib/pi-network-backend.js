// Pi Network Backend Service using official pi-backend package
import PiNetwork from 'pi-backend';

export class PiNetworkService {
  constructor(apiKey, walletPrivateSeed) {
    if (!apiKey) {
      throw new Error("Pi Network API Key is required.");
    }
    if (!walletPrivateSeed) {
      throw new Error("Pi Network Wallet Private Seed is required.");
    }
    
    this.apiKey = apiKey;
    this.walletPrivateSeed = walletPrivateSeed;
    
    // Initialize the official Pi Network SDK
    this.pi = new PiNetwork(apiKey, walletPrivateSeed);
    
    console.log(`Pi Network Service initialized with official SDK`);
  }

  // Static method to create instance
  static connect() {
    const apiKey = process.env.PI_API_KEY;
    const walletPrivateSeed = process.env.PI_WALLET_PRIVATE_SEED;
    
    if (!apiKey) {
      console.error('❌ PI_API_KEY not found in environment variables!');
      throw new Error('PI_API_KEY is required.');
    }
    
    if (!walletPrivateSeed) {
      console.error('❌ PI_WALLET_PRIVATE_SEED not found in environment variables!');
      throw new Error('PI_WALLET_PRIVATE_SEED is required.');
    }
    
    console.log('✅ Pi Network API Key and Wallet Private Seed loaded from environment');
    return new PiNetworkService(apiKey, walletPrivateSeed);
  }

  // Create A2U payment using official SDK
  async createPayment(paymentData) {
    try {
      console.log('Creating A2U payment with official SDK:', paymentData);
      const paymentId = await this.pi.createPayment(paymentData);
      console.log(`Payment created successfully with ID: ${paymentId}`);
      return paymentId;
    } catch (error) {
      console.error('Error creating payment:', error);
      throw error;
    }
  }

  // Submit payment to Pi Blockchain
  async submitPayment(paymentId) {
    try {
      console.log(`Submitting payment ${paymentId} to Pi Blockchain`);
      const txid = await this.pi.submitPayment(paymentId);
      console.log(`Payment ${paymentId} submitted successfully with txid: ${txid}`);
      return txid;
    } catch (error) {
      console.error(`Error submitting payment ${paymentId}:`, error);
      throw error;
    }
  }

  // Complete payment using official SDK
  async completePayment(paymentId, txid) {
    try {
      console.log(`Completing payment ${paymentId} with txid: ${txid}`);
      
      // For U2A payments, we need to complete via Pi Network API
      // For A2U payments, we use the official SDK
      const response = await fetch(`https://api.minepi.com/v2/payments/${paymentId}/complete`, {
        method: 'POST',
        headers: {
          'Authorization': `Key ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ txid })
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error(`Failed to complete payment ${paymentId}:`, errorData);
        throw new Error(`Payment completion failed: ${errorData.error || response.statusText}`);
      }

      const completedPayment = await response.json();
      console.log(`Payment ${paymentId} completed successfully.`);
      return completedPayment;
    } catch (error) {
      console.error(`Error completing payment ${paymentId}:`, error);
      throw error;
    }
  }

  // Get payment information
  async getPayment(paymentId) {
    try {
      console.log(`Getting payment information for ${paymentId}`);
      const payment = await this.pi.getPayment(paymentId);
      return payment;
    } catch (error) {
      console.error(`Error getting payment info for ${paymentId}:`, error);
      throw error;
    }
  }

  // Cancel payment
  async cancelPayment(paymentId) {
    try {
      console.log(`Cancelling payment ${paymentId}`);
      const cancelledPayment = await this.pi.cancelPayment(paymentId);
      console.log(`Payment ${paymentId} cancelled successfully.`);
      return cancelledPayment;
    } catch (error) {
      console.error(`Error cancelling payment ${paymentId}:`, error);
      throw error;
    }
  }

  // Get incomplete server payments
  async getIncompleteServerPayments() {
    try {
      console.log('Getting incomplete server payments');
      const payments = await this.pi.getIncompleteServerPayments();
      return payments;
    } catch (error) {
      console.error('Error getting incomplete server payments:', error);
      throw error;
    }
  }

  // Legacy methods for backward compatibility
  async authWithPiNetworkApi(accessToken) {
    try {
      // This method is not available in the official SDK
      // You might need to implement this separately if needed
      console.warn('authWithPiNetworkApi is not available in the official pi-backend SDK');
      throw new Error('This method is not available in the official SDK');
    } catch (error) {
      console.error("Error authenticating with Pi Network API:", error);
      throw error;
    }
  }

  async approvePayment(paymentId) {
    try {
      // For U2A payments (user paying app), we need to approve via Pi Network API
      // For A2U payments (app paying user), approval is automatic
      console.log(`Approving U2A payment ${paymentId} via Pi Network API`);
      
      // Make API call to Pi Network to approve the payment
      const response = await fetch(`https://api.minepi.com/v2/payments/${paymentId}/approve`, {
        method: 'POST',
        headers: {
          'Authorization': `Key ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error(`Failed to approve payment ${paymentId}:`, errorData);
        throw new Error(`Payment approval failed: ${errorData.error || response.statusText}`);
      }

      const result = await response.json();
      console.log(`Payment ${paymentId} approved successfully:`, result);
      return result;
    } catch (error) {
      console.error(`Error approving payment ${paymentId}:`, error);
      throw error;
    }
  }

  async getPiNetworkPaymentInformation(paymentId) {
    return this.getPayment(paymentId);
  }

  async cancelPiNetworkIncompletePayment(paymentId, _PiNetworkPaymentDTO) {
    return this.cancelPayment(paymentId);
  }
}

// Export singleton instance
export const piNetworkService = PiNetworkService.connect();
