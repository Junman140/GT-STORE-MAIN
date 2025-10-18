import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import PiLoginButton from './PiLoginButton'
import { usePiNetwork } from '../contexts/PiNetworkContext'

export default function Header() {
  const [open, setOpen] = useState(false)
  const { user, logout } = usePiNetwork()
  const router = useRouter()

  const handleLogout = () => {
    logout()
    setOpen(false) // Close the menu
    // Redirect to landing page after logout
    router.push('/')
  }

  return (
    <header className="w-full bg-white shadow-sm sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center">

        {/* LEFT: Menu button */}
        <div className="flex items-center gap-3">
          <button
            aria-label="Open menu"
            aria-expanded={open}
            onClick={() => setOpen(true)}
            className="p-2 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-blue/60"
          >
            {/* hamburger icon */}
            <svg
              className="h-6 w-6 text-brand-dark"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M3 6h18M3 12h18M3 18h18"></path>
            </svg>
          </button>
          <span className="hidden md:inline text-sm text-gray-600">Menu</span>
        </div>

        {/* CENTER: Logo */}
        <div className="flex-1 flex justify-center">
          <Link href="/" className="pointer-events-auto" aria-label="GT Store home">
            <img
              src="/logo.jpg"
              alt="GT Store logo"
              className="h-16 w-16 sm:h-14 sm:w-14 md:h-12 md:w-12 rounded-2xl shrink-0"
            />
          </Link>
        </div>

        {/* RIGHT: Pi login */}
        <div className="flex items-center gap-3">
          <PiLoginButton />
        </div>
      </div>

      {/* Slide-over menu (opens on mobile & desktop) */}
      {open && (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/30"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <aside className="absolute left-0 top-0 bottom-0 w-72 bg-white shadow-lg p-4 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div className="text-lg font-semibold">Menu</div>
              <button
                aria-label="Close menu"
                onClick={() => setOpen(false)}
                className="p-1 rounded-md hover:bg-gray-100"
              >
                {/* close icon */}
                <svg
                  className="h-5 w-5 text-gray-700"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>

            <nav className="flex flex-col gap-2 overflow-y-auto flex-1">
              <Link href="/explore" className="py-2 px-2 rounded hover:bg-gray-50" onClick={() => setOpen(false)}>Home</Link>
              <Link href="/phones" className="py-2 px-2 rounded hover:bg-gray-50" onClick={() => setOpen(false)}>Phones</Link>
              <Link href="/laptops" className="py-2 px-2 rounded hover:bg-gray-50" onClick={() => setOpen(false)}>Laptops</Link>
              <Link href="/messages" className="py-2 px-2 rounded hover:bg-gray-50" onClick={() => setOpen(false)}>Messages</Link>
              
              {/* Seller/Admin specific links */}
              {user && (user.role === 'seller' || user.role === 'admin') && (
                <>
                  <div className="border-t my-2"></div>
                  <div className="text-xs text-gray-500 px-2 mb-1">
                    {user.role === 'admin' ? 'Admin' : 'Seller'}
                  </div>
                  <Link href="/seller-dashboard" className="py-2 px-2 rounded hover:bg-gray-50 font-medium" onClick={() => setOpen(false)}>
                    {user.role === 'admin' ? 'Dashboard' : 'My Listings'}
                  </Link>
                  <Link href="/create" className="py-2 px-2 rounded hover:bg-gray-50" onClick={() => setOpen(false)}>Create Listing</Link>
                  {user.role === 'admin' && (
                    <Link href="/admin" className="py-2 px-2 rounded hover:bg-gray-50" onClick={() => setOpen(false)}>Admin Panel</Link>
                  )}
                </>
              )}
              
              {/* Buyer link to become seller */}
              {user && user.role === 'reader' && (
                <>
                  <div className="border-t my-2"></div>
                  <Link href="/apply-seller" className="py-2 px-2 rounded hover:bg-gray-50 text-brand-blue font-medium" onClick={() => setOpen(false)}>
                    Become a Seller
                  </Link>
                </>
              )}
              
              <div className="border-t my-2"></div>
              
              {/* Support links */}
              <div className="text-xs text-gray-500 px-2 mb-1">Support</div>
              <Link href="/help" className="py-2 px-2 rounded hover:bg-gray-50" onClick={() => setOpen(false)}>Help Center</Link>
              <Link href="/safety" className="py-2 px-2 rounded hover:bg-gray-50" onClick={() => setOpen(false)}>Safety Tips</Link>
              <Link href="/terms" className="py-2 px-2 rounded hover:bg-gray-50" onClick={() => setOpen(false)}>Terms & Privacy</Link>
              <Link href="/donate" className="py-2 px-2 rounded hover:bg-gray-50" onClick={() => setOpen(false)}>Support Us</Link>
              
              <div className="border-t my-2"></div>
              
              {/* Socials */}
              <div className="text-xs text-gray-500 px-2 mb-2">Connect</div>
              <div className="flex items-center gap-2 px-2">
                <a
                  href="https://x.com/keybasepi?s=21"
                  aria-label="X (Twitter)"
                  className="p-2 rounded-lg bg-gray-50 border hover:border-brand-blue focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/60 transition"
                >
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
                    <path d="M18.3 2H21l-6.9 7.9L22 22h-6.8l-5.3-6.9L3.7 22H1l7.4-8.5L2 2h6.8l5 6.6L18.3 2zM8.4 4H5.2l10.6 14h3.2L8.4 4z"/>
                  </svg>
                </a>
                <a
                  href="#"
                  aria-label="Telegram"
                  className="p-2 rounded-lg bg-gray-50 border hover:border-brand-blue focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/60 transition"
                >
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
                    <path d="M9.03 15.53l-.38 4.29c.55 0 .79-.23 1.08-.5l2.6-2.48 5.39 3.95c.99.55 1.7.26 1.96-.92l3.56-16.7c.32-1.5-.54-2.1-1.5-1.74L1.2 9.53C-.26 10.11-.24 10.95 1 11.33l5.76 1.8L18.73 6.7c.86-.52 1.64-.23 1 .33"/>
                  </svg>
                </a>
                <a
                  href="#"
                  aria-label="Discord"
                  className="p-2 rounded-lg bg-gray-50 border hover:border-brand-blue focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/60 transition"
                >
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
                    <path d="M20.3 4.4A18 18 0 0015.9 3l-.2.4a16 16 0 00-7.4 0l-.2-.4a18 18 0 00-4.4 1.4C1 9.1.1 13.6.4 18.1a18 18 0 005.5 2.8l.7-1.6a11.8 11.8 0 01-1.7-.8l.4-.3c3.2 1.5 6.7 1.5 9.9 0l.4.3c-.5.3-1.1.6-1.7.8l.7 1.6c2-.7 3.9-1.7 5.5-2.8.5-4.9-.5-9.4-1.8-13.3zM8.9 15.4c-1 0-1.9-1-1.9-2.3 0-1.2.8-2.2 1.9-2.2s1.9 1 1.9 2.2c0 1.3-.8 2.3-1.9 2.3zm6.2 0c-1 0-1.9-1-1.9-2.3 0-1.2.8-2.2 1.9-2.2s1.9 1 1.9 2.2c0 1.3-.8 2.3-1.9 2.3z"/>
                  </svg>
                </a>
              </div>
            </nav>

            <div className="mt-4 border-t pt-4 shrink-0">
              <div className="text-xs text-gray-500 mb-2">Account</div>
              <PiLoginButton />
              {user && (
                <button
                  onClick={handleLogout}
                  className="mt-2 w-full text-left py-2 px-2 rounded hover:bg-gray-50 text-red-600 hover:text-red-700"
                >
                  Logout
                </button>
              )}
            </div>
          </aside>
        </div>
      )}
    </header>
  )
}
