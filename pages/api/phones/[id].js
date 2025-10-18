import { prisma } from '@/lib/prisma';

export default async function handler(req, res) {
  const { id } = req.query;

  if (req.method === 'GET') {
    // Get specific phone
    try {
      const phone = await prisma.phone.findUnique({
        where: { id },
        include: {
          seller: {
            select: {
              id: true,
              user_uid: true,
              piUsername: true
            }
          }
        }
      });

      if (!phone) {
        return res.status(404).json({
          success: false,
          error: 'Phone not found'
        });
      }

      res.status(200).json({
        success: true,
        phone
      });

    } catch (error) {
      console.error('Error fetching phone:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch phone'
      });
    }
  } else if (req.method === 'DELETE') {
    // Delete phone (seller or admin only)
    try {
      const { userId } = req.body;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'User ID required'
        });
      }

      // Find the phone
      const phone = await prisma.phone.findUnique({
        where: { id },
        include: { seller: true }
      });

      if (!phone) {
        return res.status(404).json({
          success: false,
          error: 'Phone not found'
        });
      }

      // Find the requesting user
      const user = await prisma.user.findFirst({
        where: {
          OR: [
            { id: userId },
            { user_uid: userId }
          ]
        }
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        });
      }

      // Check if user is the seller or an admin
      if (phone.sellerId !== user.id && user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          error: 'You can only delete your own listings'
        });
      }

      // Delete the phone
      await prisma.phone.delete({
        where: { id }
      });

      res.status(200).json({
        success: true,
        message: 'Phone deleted successfully'
      });

    } catch (error) {
      console.error('Error deleting phone:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete phone'
      });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}

