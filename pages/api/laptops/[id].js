import { prisma } from '@/lib/prisma';

export default async function handler(req, res) {
  const { id } = req.query;

  if (req.method === 'GET') {
    // Get specific laptop
    try {
      const laptop = await prisma.laptop.findUnique({
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

      if (!laptop) {
        return res.status(404).json({
          success: false,
          error: 'Laptop not found'
        });
      }

      res.status(200).json({
        success: true,
        laptop
      });

    } catch (error) {
      console.error('Error fetching laptop:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch laptop'
      });
    }
  } else if (req.method === 'DELETE') {
    // Delete laptop (seller or admin only)
    try {
      const { userId } = req.body;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'User ID required'
        });
      }

      // Find the laptop
      const laptop = await prisma.laptop.findUnique({
        where: { id },
        include: { seller: true }
      });

      if (!laptop) {
        return res.status(404).json({
          success: false,
          error: 'Laptop not found'
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
      if (laptop.sellerId !== user.id && user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          error: 'You can only delete your own listings'
        });
      }

      // Delete the laptop
      await prisma.laptop.delete({
        where: { id }
      });

      res.status(200).json({
        success: true,
        message: 'Laptop deleted successfully'
      });

    } catch (error) {
      console.error('Error deleting laptop:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete laptop'
      });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}

