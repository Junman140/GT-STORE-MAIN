import { prisma } from '../../../../lib/prisma';

export default async function handler(req, res) {
  const { id: userId } = req.query;

  if (req.method === 'PUT') {
    // Update user role (admin only)
    try {
      const { role } = req.body;

      if (!role || !['reader', 'seller', 'admin'].includes(role)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid role. Must be reader, seller, or admin'
        });
      }

      // Find user by ID or user_uid
      const existingUser = await prisma.user.findFirst({
        where: {
          OR: [
            { id: userId },
            { user_uid: userId }
          ]
        }
      });

      if (!existingUser) {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        });
      }

      const updatedUser = await prisma.user.update({
        where: { id: existingUser.id },
        data: { role },
        select: {
          id: true,
          user_uid: true,
          piUsername: true,
          role: true,
          createdAt: true,
          updatedAt: true
        }
      });

      res.status(200).json({
        success: true,
        user: updatedUser
      });

    } catch (error) {
      console.error('Error updating user role:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update user role'
      });
    }
  } else if (req.method === 'DELETE') {
    // Delete user (admin only)
    try {
      // Find user by ID or user_uid
      const existingUser = await prisma.user.findFirst({
        where: {
          OR: [
            { id: userId },
            { user_uid: userId }
          ]
        }
      });

      if (!existingUser) {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        });
      }

      await prisma.user.delete({
        where: { id: existingUser.id }
      });

      res.status(200).json({
        success: true,
        message: 'User deleted successfully'
      });

    } catch (error) {
      console.error('Error deleting user:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete user'
      });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}


