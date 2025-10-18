import { prisma } from '../../../lib/prisma';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { page = 1, limit = 50, role } = req.query;
    
    const where = role ? { role } : {};
    
    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        user_uid: true,
        piUsername: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        piAuthenticatedAt: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip: (page - 1) * limit,
      take: parseInt(limit)
    });

    const total = await prisma.user.count({ where });

    res.status(200).json({
      success: true,
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch users'
    });
  }
}
