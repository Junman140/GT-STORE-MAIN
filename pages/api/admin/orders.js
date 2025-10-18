import { prisma } from '../../../lib/prisma';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get all orders with buyer and seller information
    const orders = await prisma.order.findMany({
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
      },
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json({ orders });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
}
