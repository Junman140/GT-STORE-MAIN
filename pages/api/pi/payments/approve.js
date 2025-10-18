import { piNetworkService } from '../../../../lib/pi-network-backend';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { paymentId } = req.body;
    console.log('Payment approval request received:', { paymentId });

    if (!paymentId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Payment ID is required' 
      });
    }

    console.log('Calling piNetworkService.approvePayment...');
    await piNetworkService.approvePayment(paymentId);
    console.log('Payment approval successful');

    res.status(200).json({
      success: true,
      message: 'Payment approved successfully'
    });
  } catch (error) {
    console.error('Payment approval error:', error);
    console.error('Error details:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
    
    res.status(500).json({ 
      success: false, 
      message: 'Payment approval failed',
      error: error.message,
      details: error.response?.data
    });
  }
}
