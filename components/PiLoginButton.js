// components/PiLoginButton.js
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { usePiNetwork } from '../contexts/PiNetworkContext'

export default function PiLoginButton({ className = '' }) {
  const { user, isLoading, authenticate, logout } = usePiNetwork()
  const [isLoggingIn, setIsLoggingIn] = useState(false)
  const [shouldRedirect, setShouldRedirect] = useState(false)
  const router = useRouter()

  // Debug: Log user state
  useEffect(() => {
    console.log('🔍 PiLoginButton - user state:', user);
  }, [user])

  // Handle redirect when user becomes authenticated
  useEffect(() => {
    if (user && shouldRedirect && router.pathname === '/') {
      console.log('🚀 User authenticated, redirecting to /explore...')
      router.push('/explore')
      setShouldRedirect(false)
    }
  }, [user, shouldRedirect, router])

  const handleLogout = () => {
    logout()
    // Redirect to landing page after logout
    router.push('/')
  }

  const handlePiLogin = async () => {
    setIsLoggingIn(true)
    
    try {
      console.log('🔄 Starting authentication...')
      await authenticate()
      console.log('✅ Login successful!')
      
      // Set flag to trigger redirect via useEffect
      console.log('📍 Current pathname:', router.pathname)
      if (router.pathname === '/') {
        setShouldRedirect(true)
      }
    } catch (error) {
      console.error('❌ Pi authentication error:', error)
      
      // Handle specific error types
      let errorMessage = 'Authentication failed. Please try again.'
      
      if (error.message) {
        if (error.message.includes('Pi SDK not available')) {
          errorMessage = 'Please open this app in Pi Browser to connect your wallet.'
        } else if (error.message.includes('ENOTFOUND') || error.message.includes('api.minepi.com')) {
          errorMessage = 'Pi Network API is currently unavailable. Please check your internet connection and try again.'
        } else if (error.message.includes('Network Error')) {
          errorMessage = 'Network error. Please check your internet connection and try again.'
        } else {
          errorMessage = error.message
        }
      }
      
      alert(errorMessage)
    } finally {
      setIsLoggingIn(false)
    }
  }


  if (isLoading) {
    return (
      <div className={`px-3 py-2 rounded-md bg-gray-300 text-gray-600 ${className}`}>
        Loading...
      </div>
    )
  }

  if (user) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm">Hi, <b>{user.piUsername || user.username || user.user_uid || user.uid}</b></span>
      </div>
    )
  }

  return (
    <button
      onClick={handlePiLogin}
      disabled={isLoggingIn}
      className={`px-3 py-2 rounded-md transition shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/60 disabled:opacity-50 disabled:cursor-not-allowed ${className || 'bg-brand-blue text-white hover:bg-brand-dark'}`}
    >
      {isLoggingIn ? 'Logging in...' : 'Login with Pi'}
    </button>
  )
}
