// components/ListingCard.js
import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePiNetwork } from '../contexts/PiNetworkContext'
import PurchaseModal from './PurchaseModal'

export default function ListingCard({ item, href, seller }) {
  const { user, isAuthenticated } = usePiNetwork()
  const [showPurchaseModal, setShowPurchaseModal] = useState(false)
  const imgSrc = item?.images?.[0] || '/placeholder.jpg'
  const [imgError, setImgError] = useState(false)
  const [saved, setSaved] = useState(false)
  
  // Ensure we have a valid image source
  const validImgSrc = imgSrc && imgSrc.trim() !== '' && imgSrc !== '.' ? imgSrc : '/placeholder.jpg'

  const handleBuyNow = () => {
    if (!isAuthenticated) {
      alert('Please login with Pi to make a purchase')
      return
    }
    setShowPurchaseModal(true)
  }

  const handleContactSeller = () => {
    // This will be handled by the existing Contact link
    // For now, we'll just show an alert
    alert('Please use the Contact button to message the seller about international shipping')
  }

  const handleSave = () => {
    if (!isAuthenticated) {
      alert('Please login with Pi to save listings')
      return
    }
    
    // Toggle save state
    setSaved(!saved)
    
    // Here you would typically make an API call to save/unsave the listing
    // For now, we'll just show a message
    if (!saved) {
      alert('Listing saved! (This is a demo - actual save functionality would be implemented)')
    } else {
      alert('Listing removed from saved!')
    }
  }

  return (
    <>
      <article
        className="group relative flex flex-col overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-sm transition-all duration-300 hover:bg-white/10 hover:border-white/20 focus-within:bg-white/10 focus-within:border-white/20"
        aria-label={item?.title}
      >
        {/* Media */}
        <div className="relative h-40 w-full sm:h-44">
          <Image
            src={imgError ? '/placeholder.jpg' : validImgSrc}
            alt={item?.title || 'Listing image'}
            fill
            sizes="(min-width: 640px) 384px, 100vw"
            className="object-cover"
            onError={() => setImgError(true)}
            priority={item?.isNew}
          />

          {/* Badges */}
          {item?.isNew && (
            <span className="absolute left-3 top-3 rounded-full bg-white px-3 py-1 text-xs font-medium text-black shadow-lg">
              New
            </span>
          )}
          {item?.type && (
            <span className="absolute right-3 top-3 rounded-full border border-white/20 bg-white/10 backdrop-blur-sm px-3 py-1 text-xs font-medium text-white">
              {item.type}
            </span>
          )}

          {/* Save (stub) */}
          <button
            type="button"
            onClick={handleSave}
            aria-label={saved ? "Remove from saved" : "Save listing"}
            className={`absolute bottom-3 right-3 rounded-full border border-white/20 backdrop-blur-sm p-2 text-white shadow-lg transition-all duration-200 hover:bg-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30 ${
              saved ? 'bg-red-500/20 border-red-400/30' : 'bg-white/10'
            }`}
          >
            <Icon name={saved ? "heart-solid" : "heart"} className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-1 flex-col p-5">
          <h3 className="line-clamp-2 text-base font-medium text-white">
            {item?.title}
          </h3>

          {/* Price + Pi pill */}
          <div className="mt-2 flex items-center gap-2">
            <span className="text-lg font-light text-white">{formatPi(item?.pricePi)}</span>
            {item?.logisticsFee && (
              <span className="text-xs text-gray-400">+ {item.logisticsFee}π logistics</span>
            )}
          </div>

          {/* Location */}
          {item?.location && (
            <div className="mt-2 flex items-center gap-2 text-xs text-gray-300">
              <Icon name="pin" className="h-4 w-4 text-gray-400" />
              <span className="truncate">{item.location}</span>
            </div>
          )}

          {/* Key facts */}
          <div className="mt-3 grid grid-cols-3 gap-2 text-xs text-gray-300">
            {item?.type === 'Smartphone' || item?.type === 'phone' || item?.brand ? (
              <>
                <Fact icon="year" label={item?.year ?? '—'} />
                <Fact icon="storage" label={item?.storage || '—'} />
                <Fact icon="phone" label={item?.brand || '—'} />
              </>
            ) : item?.type === 'Gaming' || item?.type === 'Business' || item?.type === 'Ultrabook' || item?.type === 'Workstation' || item?.type === 'laptop' || item?.processor ? (
              <>
                <Fact icon="year" label={item?.year ?? '—'} />
                <Fact icon="cpu" label={item?.processor || '—'} />
                <Fact icon="laptop" label={item?.brand || '—'} />
              </>
            ) : (
              <>
                <Fact icon="year" label={item?.year ?? '—'} />
                <Fact icon="storage" label={item?.storage || '—'} />
                <Fact icon="tag" label={item?.type || 'Gadget'} />
              </>
            )}
          </div>

          {/* Actions */}
          <div className="mt-3 flex gap-2">
            <Link
              href={href}
              className="inline-flex flex-1 items-center justify-center rounded-xl bg-brand-blue px-3 py-2 text-sm font-semibold text-white transition hover:bg-brand-dark focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/60"
            >
              More details
            </Link>
            <button
              onClick={handleBuyNow}
              className="inline-flex items-center justify-center rounded-xl bg-green-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-green-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-600/60"
            >
              Buy Now
            </button>
            <Link
              href={`${href}?contact=1`}
              className="inline-flex items-center justify-center rounded-xl border border-white/20 bg-white/5 backdrop-blur-sm px-3 py-2 text-sm font-semibold text-white hover:bg-white/10 hover:border-white/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30 transition-all duration-200"
            >
              Contact
            </Link>
          </div>
        </div>
      </article>

      {/* Purchase Modal */}
      <PurchaseModal
        isOpen={showPurchaseModal}
        onClose={() => setShowPurchaseModal(false)}
        listing={item}
        seller={seller}
      />
    </>
  )
}

/* --- Small subcomponents --- */

function Fact({ icon, label }) {
  return (
    <div className="inline-flex items-center gap-1 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 px-2 py-1">
      <Icon name={icon} className="h-4 w-4 text-gray-400" />
      <span className="text-gray-300">{label}</span>
    </div>
  )
}

function Icon({ name, className = '' }) {
  switch (name) {
    case 'heart':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
             strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 22l7.8-8.6 1-1a5.5 5.5 0 0 0 0-7.8z" />
        </svg>
      )
    case 'pin':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
             strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <path d="M21 10c0 7-9 12-9 12s-9-5-9-12a9 9 0 1 1 18 0z" />
          <circle cx="12" cy="10" r="3" />
        </svg>
      )
    case 'year':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
             strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <path d="M12 2L2 7l10 5 10-5-10-5z"/>
          <path d="M2 17l10 5 10-5"/>
          <path d="M2 12l10 5 10-5"/>
        </svg>
      )
    case 'storage':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
             strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <rect x="3" y="4" width="18" height="16" rx="2"/>
          <line x1="7" y1="8" x2="7" y2="8"/>
          <line x1="7" y1="12" x2="7" y2="12"/>
        </svg>
      )
    case 'phone':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
             strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <rect x="7" y="2" width="10" height="20" rx="2"/>
          <line x1="12" y1="18" x2="12" y2="18"/>
        </svg>
      )
    case 'cpu':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
             strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <rect x="4" y="4" width="16" height="16" rx="2"/>
          <rect x="9" y="9" width="6" height="6"/>
          <line x1="9" y1="1" x2="9" y2="4"/>
          <line x1="15" y1="1" x2="15" y2="4"/>
          <line x1="9" y1="20" x2="9" y2="23"/>
          <line x1="15" y1="20" x2="15" y2="23"/>
          <line x1="20" y1="9" x2="23" y2="9"/>
          <line x1="20" y1="14" x2="23" y2="14"/>
          <line x1="1" y1="9" x2="4" y2="9"/>
          <line x1="1" y1="14" x2="4" y2="14"/>
        </svg>
      )
    case 'laptop':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
             strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
          <line x1="8" y1="21" x2="16" y2="21"/>
          <line x1="12" y1="17" x2="12" y2="21"/>
        </svg>
      )
    case 'heart-solid':
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.45 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.55 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
      )
    default:
      return null
  }
}

function formatPi(value) {
  if (value == null || value === '') return '— π'
  try {
    return `${Number(value).toLocaleString()} π`
  } catch {
    return `${value} π`
  }
}
