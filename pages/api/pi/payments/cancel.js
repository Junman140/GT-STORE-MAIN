import { piNetworkService } from '../../../../lib/pi-network-backend';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { paymentId } = req.body;

    if (!paymentId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Payment ID is required' 
      });
    }

    // Use the Pi Network backend service (following PiBackend.ts pattern)
    await piNetworkService.cancelPayment(paymentId);

    res.status(200).json({
      success: true,
      message: 'Payment cancelled successfully'
    });
  } catch (error) {
    console.error('Payment cancellation error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Payment cancellation failed',
      error: error.message 
    });
  }
}
