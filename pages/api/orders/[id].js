import { prisma } from '../../../../lib/prisma';

export default async function handler(req, res) {
  const { orderId } = req.query;

  if (!orderId) {
    return res.status(400).json({ error: 'Order ID is required' });
  }

  if (req.method === 'GET') {
    // Get specific order details
    try {
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: {
          buyer: {
            select: {
              id: true,
              user_uid: true,
              piUsername: true
            }
          },
          seller: {
            select: {
              id: true,
              user_uid: true,
              piUsername: true
            }
          }
        }
      });

      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }

      res.status(200).json({ order });
    } catch (error) {
      console.error('Error fetching order:', error);
      res.status(500).json({ error: 'Failed to fetch order' });
    }
  } else if (req.method === 'PUT') {
    // Update order status
    try {
      const { status, trackingNumber, estimatedDelivery, notes } = req.body;

      const updateData = {};
      if (status) updateData.status = status;
      if (trackingNumber) updateData.trackingNumber = trackingNumber;
      if (estimatedDelivery) updateData.estimatedDelivery = new Date(estimatedDelivery);
      if (notes) updateData.notes = notes;

      const updatedOrder = await prisma.order.update({
        where: { id: orderId },
        data: updateData,
        include: {
          buyer: {
            select: {
              id: true,
              user_uid: true,
              piUsername: true
            }
          },
          seller: {
            select: {
              id: true,
              user_uid: true,
              piUsername: true
            }
          }
        }
      });

      res.status(200).json({ order: updatedOrder });
    } catch (error) {
      console.error('Error updating order:', error);
      res.status(500).json({ error: 'Failed to update order' });
    }
  } else if (req.method === 'PATCH') {
    // Handle specific actions
    try {
      const { action } = req.body;

      if (action === 'complete') {
        const updatedOrder = await prisma.order.update({
          where: { id: orderId },
          data: {
            status: 'completed',
            completedAt: new Date(),
            updatedAt: new Date()
          },
          include: {
            buyer: {
              select: {
                id: true,
                user_uid: true,
                piUsername: true
              }
            },
            seller: {
              select: {
                id: true,
                user_uid: true,
                piUsername: true
              }
            }
          }
        });

        res.status(200).json({ order: updatedOrder });
      } else {
        res.status(400).json({ error: 'Invalid action' });
      }
    } catch (error) {
      console.error('Error completing order:', error);
      res.status(500).json({ error: 'Failed to complete order' });
    }
  } else if (req.method === 'DELETE') {
    // Cancel order
    try {
      const updatedOrder = await prisma.order.update({
        where: { id: orderId },
        data: { status: 'cancelled' }
      });

      res.status(200).json({ message: 'Order cancelled', order: updatedOrder });
    } catch (error) {
      console.error('Error cancelling order:', error);
      res.status(500).json({ error: 'Failed to cancel order' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
