import { prisma } from '@/lib/prisma';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    // Get orders for a user (buyer or seller)
    try {
      const { userId, role } = req.query; // role: 'buyer' or 'seller'

      if (!userId) {
        return res.status(400).json({ error: 'User ID is required' });
      }

      const user = await prisma.user.findUnique({
        where: { user_uid: userId }
      });

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      let orders;
      if (role === 'seller') {
        orders = await prisma.order.findMany({
          where: { sellerId: user.id },
          include: {
            buyer: {
              select: {
                id: true,
                user_uid: true,
                piUsername: true
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        });
      } else {
        orders = await prisma.order.findMany({
          where: { buyerId: user.id },
          include: {
            seller: {
              select: {
                id: true,
                user_uid: true,
                piUsername: true
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        });
      }

      res.status(200).json({ orders });
    } catch (error) {
      console.error('Error fetching orders:', error);
      res.status(500).json({ error: 'Failed to fetch orders' });
    }
  } else if (req.method === 'POST') {
    // Create a new order (this is handled by payment completion, but we can have a manual endpoint)
    try {
      const { buyerId, sellerId, listingType, listingId, amount, productPrice, logisticsFee, platformFee, shippingAddress } = req.body;

      if (!buyerId || !sellerId || !listingType || !listingId || !amount) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      // Find users
      const buyer = await prisma.user.findUnique({
        where: { user_uid: buyerId }
      });

      const seller = await prisma.user.findUnique({
        where: { user_uid: sellerId }
      });

      if (!buyer || !seller) {
        return res.status(404).json({ error: 'Buyer or seller not found' });
      }

      const order = await prisma.order.create({
        data: {
          buyerId: buyer.id,
          sellerId: seller.id,
          listingType,
          listingId,
          amount,
          productPrice: productPrice || amount,
          logisticsFee: logisticsFee || 0,
          platformFee: platformFee || 0,
          status: 'pending',
          shippingAddress: shippingAddress || null
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

      res.status(201).json({ order });
    } catch (error) {
      console.error('Error creating order:', error);
      res.status(500).json({ error: 'Failed to create order' });
    }
  } else if (req.method === 'PUT') {
    // Update order status
    try {
      const { orderId, status, trackingNumber, estimatedDelivery, notes } = req.body;

      if (!orderId || !status) {
        return res.status(400).json({ error: 'Order ID and status are required' });
      }

      const updateData = { status };
      if (trackingNumber) updateData.trackingNumber = trackingNumber;
      if (estimatedDelivery) updateData.estimatedDelivery = new Date(estimatedDelivery);
      if (notes) updateData.notes = notes;

      const order = await prisma.order.update({
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

      res.status(200).json({ order });
    } catch (error) {
      console.error('Error updating order:', error);
      res.status(500).json({ error: 'Failed to update order' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
