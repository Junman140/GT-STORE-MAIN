// components/AuthGuard.js
import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { usePiNetwork } from '../contexts/PiNetworkContext'

export default function AuthGuard({ children }) {
  const { user, isLoading } = usePiNetwork()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) {
      // Redirect to landing page if not authenticated
      router.push('/')
    }
  }, [user, isLoading, router])

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-blue mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Don't render children if not authenticated
  if (!user) {
    return null
  }

  // Render children if authenticated
  return children
}
