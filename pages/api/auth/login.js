import { prisma } from '../../../lib/prisma'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { 
      user_uid, 
      piUsername, 
      from_address, 
      to_address, 
      piAccessToken,
      piAppId,
      piReceivingEmail,
      piCredentials
    } = req.body

    if (!user_uid) {
      return res.status(400).json({ error: 'Pi User UID is required' })
    }

    // Check if user already exists
    let user = await prisma.user.findUnique({
      where: { user_uid }
    })

    if (user) {
      // Update existing user with new authentication data
      user = await prisma.user.update({
        where: { user_uid },
        data: {
          piUsername,
          from_address,
          to_address,
          piAccessToken,
          piAppId,
          piReceivingEmail,
          piCredentials,
          piAuthenticatedAt: new Date(),
        }
      })
    } else {
      // Create new user
      user = await prisma.user.create({
        data: {
          user_uid,
          piUsername,
          from_address,
          to_address,
          piAccessToken,
          piAppId,
          piReceivingEmail,
          piCredentials,
          piAuthenticatedAt: new Date(),
          role: 'reader', // Default role
        }
      })
    }

    // Return user data without sensitive information
    const { piAccessToken: _, ...userData } = user

    res.status(200).json({
      success: true,
      user: userData,
      message: user ? 'Login successful' : 'Registration successful'
    })

  } catch (error) {
    console.error('Authentication error:', error)
    res.status(500).json({ 
      error: 'Authentication failed',
      details: error.message 
    })
  }
}
