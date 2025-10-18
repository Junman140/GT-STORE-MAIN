import { prisma } from '../../../lib/prisma';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    // Create new seller application
    try {
      const {
        userId,
        businessName,
        businessType,
        location,
        description,
        email,
        phone,
        ownershipProof
      } = req.body;

      if (!userId || !businessName || !businessType || !location || !description || !email) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields'
        });
      }

      // Find or create the user in the database
      // userId might be user_uid from Pi Network, so we need to find the actual DB user
      let user = await prisma.user.findFirst({
        where: {
          OR: [
            { id: userId },
            { user_uid: userId }
          ]
        }
      });

      if (!user) {
        // Create the user if they don't exist
        user = await prisma.user.create({
          data: {
            user_uid: userId,
            role: 'reader' // Default role
          }
        });
      }

      // Check if user already has an application
      const existingApplication = await prisma.sellerApplication.findUnique({
        where: { userId: user.id }
      });

      if (existingApplication) {
        return res.status(400).json({
          success: false,
          error: 'You already have a pending application'
        });
      }

      // Create the application with the database user ID
      const application = await prisma.sellerApplication.create({
        data: {
          userId: user.id,
          businessName,
          businessType,
          location,
          description,
          email,
          phone,
          ownershipProof: ownershipProof || [],
          status: 'pending'
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

      res.status(201).json({
        success: true,
        application
      });

    } catch (error) {
      console.error('Error creating seller application:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create application'
      });
    }
  } else if (req.method === 'GET') {
    // Get seller applications (admin only)
    try {
      const { status, page = 1, limit = 10 } = req.query;
      
      const where = status ? { status } : {};
      
      const applications = await prisma.sellerApplication.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              user_uid: true,
              piUsername: true,
              createdAt: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip: (page - 1) * limit,
        take: parseInt(limit)
      });

      const total = await prisma.sellerApplication.count({ where });

      res.status(200).json({
        success: true,
        applications,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      });

    } catch (error) {
      console.error('Error fetching seller applications:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch applications'
      });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
