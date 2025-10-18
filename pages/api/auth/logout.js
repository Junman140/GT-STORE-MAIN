export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // For Pi Network, logout is typically handled client-side
    // We can optionally clear server-side session data here if needed
    
    res.status(200).json({
      success: true,
      message: 'Logout successful'
    })

  } catch (error) {
    console.error('Logout error:', error)
    res.status(500).json({ 
      error: 'Logout failed',
      details: error.message 
    })
  }
}
