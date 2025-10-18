import { prisma } from '../../../lib/prisma';

export default async function handler(req, res) {
  const { id } = req.query;

  if (req.method === 'GET') {
    // Get specific seller application
    try {
      const application = await prisma.sellerApplication.findUnique({
        where: { id },
        include: {
          user: {
            select: {
              id: true,
              user_uid: true,
              piUsername: true,
              createdAt: true
            }
          }
        }
      });

      if (!application) {
        return res.status(404).json({
          success: false,
          error: 'Application not found'
        });
      }

      res.status(200).json({
        success: true,
        application
      });

    } catch (error) {
      console.error('Error fetching seller application:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch application'
      });
    }
  } else if (req.method === 'PUT') {
    // Update seller application (admin only)
    try {
      const { status, notes, reviewedBy } = req.body;

      if (!status || !['approved', 'rejected'].includes(status)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid status. Must be approved or rejected'
        });
      }

      const application = await prisma.sellerApplication.update({
        where: { id },
        data: {
          status,
          notes,
          reviewedBy,
          reviewedAt: new Date()
        },
        include: {
          user: {
            select: {
              id: true,
              user_uid: true,
              piUsername: true
            }
          }
        }
      });

      // If approved, update user role to seller (unless they're already admin)
      if (status === 'approved') {
        const applicantUser = await prisma.user.findUnique({
          where: { id: application.userId }
        });
        
        // Only update role if user is not already an admin
        if (applicantUser && applicantUser.role !== 'admin') {
          await prisma.user.update({
            where: { id: application.userId },
            data: { role: 'seller' }
          });
        } else {
          console.log('ℹ️ User is already an admin, keeping admin role');
        }
      }

      res.status(200).json({
        success: true,
        application
      });

    } catch (error) {
      console.error('Error updating seller application:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update application'
      });
    }
  } else if (req.method === 'DELETE') {
    // Delete seller application
    try {
      await prisma.sellerApplication.delete({
        where: { id }
      });

      res.status(200).json({
        success: true,
        message: 'Application deleted successfully'
      });

    } catch (error) {
      console.error('Error deleting seller application:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete application'
      });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
