import { prisma } from '../../../lib/prisma'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { user_uid } = req.query

    if (!user_uid) {
      return res.status(400).json({ error: 'User UID is required' })
    }

    const user = await prisma.user.findUnique({
      where: { user_uid },
      select: {
        id: true,
        user_uid: true,
        piUsername: true,
        from_address: true,
        to_address: true,
        role: true,
        avatar: true,
        bio: true,
        piAuthenticatedAt: true,
        piAppId: true,
        piReceivingEmail: true,
        createdAt: true,
        updatedAt: true,
        // Exclude sensitive data like piAccessToken
      }
    })

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    res.status(200).json({
      success: true,
      user
    })

  } catch (error) {
    console.error('Get user error:', error)
    res.status(500).json({ 
      error: 'Failed to get user data',
      details: error.message 
    })
  }
}
