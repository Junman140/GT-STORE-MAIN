// pages/laptops/[id].js
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import React from 'react'
import ListingCard from '@/components/ListingCard'
import Carousel from '@/Carousel'
import ChatButton from '@/components/ChatButton'
import PurchaseModal from '@/components/PurchaseModal'
import { usePiNetwork } from '@/contexts/PiNetworkContext'

/* ---------------- helpers ---------------- */
const maskMid = (str = '', left = 2, right = 2) => {
  if (!str) return ''
  if (str.length <= left + right) return str
  return `${str.slice(0, left)}•••${str.slice(-right)}`
}

/* -------------- SSR --------------- */
export async function getServerSideProps({ params }) {
  const { prisma } = await import('@/lib/prisma')
  
  try {
    // Fetch the laptop with seller info
    const laptop = await prisma.laptop.findUnique({
      where: { id: params.id },
      include: {
        seller: {
          select: {
            id: true,
            user_uid: true,
            piUsername: true
          }
        }
      }
    })

    if (!laptop) {
      return { notFound: true }
    }

    // Fetch related laptops (same type first, or new ones)
    const related = await prisma.laptop.findMany({
      where: {
        id: { not: laptop.id }
      },
      include: {
        seller: {
          select: {
            id: true,
            user_uid: true,
            piUsername: true
          }
        }
      },
      orderBy: [
        { type: laptop.type ? 'asc' : 'desc' },
        { isNew: 'desc' },
        { createdAt: 'desc' }
      ],
      take: 8
    })

    // Format the data to match expected structure
    const item = {
      ...laptop,
      _meta: {
        brand: laptop.brand,
        model: laptop.model,
        processor: laptop.processor,
        ram: laptop.ram,
        storage: laptop.storage,
        graphicsCard: laptop.graphicsCard,
        screenSize: laptop.screenSize,
        resolution: laptop.resolution,
        operatingSystem: laptop.operatingSystem,
        color: laptop.color,
        batteryLife: laptop.batteryLife,
        weight: laptop.weight,
        ports: laptop.ports,
        wifi: laptop.wifi,
        bluetooth: laptop.bluetooth,
        webcam: laptop.webcam,
        speakers: laptop.speakers,
        keyboard: laptop.keyboard,
        trackpad: laptop.trackpad,
        condition: laptop.condition,
        scratches: laptop.scratches,
        screenCondition: laptop.screenCondition,
        batteryHealth: laptop.batteryHealth,
        chargingPort: laptop.chargingPort,
        repairHistory: laptop.repairHistory,
        accessories: laptop.accessories || [],
        features: laptop.features || [],
        safetyFeatures: laptop.safetyFeatures || [],
        videoUrl: laptop.videoUrl,
        docs: laptop.docs || [],
        contactMethod: laptop.contactMethod,
        contactHandle: laptop.contactHandle,
        notes: laptop.repairHistory
      }
    }

    return {
      props: {
        item: JSON.parse(JSON.stringify(item)),
        related: JSON.parse(JSON.stringify(related))
      }
    }
  } catch (error) {
    console.error('Error fetching laptop:', error)
    return { notFound: true }
  }
}

/* -------------- Page --------------- */
export default function LaptopDetail({ item, related }) {
  const router = useRouter()
  const { user, isAuthenticated } = usePiNetwork()
  const [imgIdx, setImgIdx] = React.useState(0)
  const [saved, setSaved] = React.useState(false)
  const [copied, setCopied] = React.useState(false)
  const [detailsOpen, setDetailsOpen] = React.useState(false)
  const [showPurchaseModal, setShowPurchaseModal] = React.useState(false)

  const images = Array.isArray(item.images) && item.images.length ? item.images : ['/placeholder.png']

  const onShare = async () => {
    try {
      const url = typeof window !== 'undefined' ? window.location.href : ''
      if (navigator.share) {
        await navigator.share({ title: item.title, url })
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(url)
        setCopied(true)
        setTimeout(() => setCopied(false), 1500)
      }
    } catch {}
  }

  const metaDesc =
    `${item.title} • ${item.location}` +
    (item.brand ? ` • ${item.brand}` : '') +
    (item.model ? ` • ${item.model}` : '') +
    (item.storage ? ` • ${item.storage}` : '')

  return (
    <>
      <Head>
        <title>{item.title} • Laptops • GT Store</title>
        <meta name="description" content={metaDesc} />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        {/* JSON-LD: Product (basic) */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Product',
              name: item.title,
              description: metaDesc,
              url: typeof window !== 'undefined' ? window.location?.href : '',
              image: images,
              offers: {
                '@type': 'Offer',
                priceCurrency: 'XPI',
                price: item.pricePi ?? 0,
                availability: 'https://schema.org/InStock',
              },
            }),
          }}
        />
      </Head>

      <div className="min-h-screen bg-black text-white">
        <div className="container py-8">
        {/* Back + New badge */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-sm text-gray-300 hover:text-white transition-colors duration-200"
          >
            <Icon name="arrow-left" className="h-4 w-4" />
            Back
          </button>
          {item.isNew && (
            <span className="inline-flex items-center gap-1 rounded-lg bg-white/10 backdrop-blur-sm px-3 py-1 text-xs font-medium text-white border border-white/20">
              <Icon name="sparkles" className="h-3.5 w-3.5" /> New
            </span>
          )}
        </div>

        {/* Title */}
        <div className="mt-6">
          <h1 className="text-2xl sm:text-3xl font-light text-white tracking-tight">
            {item.title}
          </h1>
          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 px-3 py-1.5">
              <Icon name="map-pin" className="h-4 w-4 text-white" />
              <span className="text-white text-sm">{item.location || '—'}</span>
            </span>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 px-3 py-1.5">
              <Icon name="laptop" className="h-4 w-4 text-white" />
              <span className="text-white text-sm">{item.type || 'Laptop'}</span>
            </span>
            {item.storage ? (
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 px-3 py-1.5">
                <Icon name="hard-drive" className="h-4 w-4 text-white" />
                <span className="text-white text-sm">{item.storage}</span>
              </span>
            ) : null}
            <PiBadge />
          </div>

          <div className="mt-4 text-white text-xl sm:text-2xl font-light">
            {Number(item.pricePi || 0).toLocaleString()} π
          </div>
        </div>

        {/* Main grid */}
        <div className="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5">
          {/* Left: gallery + details */}
          <div className="lg:col-span-2 space-y-4">
            {/* Gallery */}
            <section className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-sm overflow-hidden">
              <div className="aspect-[16/10] w-full bg-gray-100">
                <img
                  src={images[imgIdx]}
                  alt={`${item.title} photo ${imgIdx + 1}`}
                  className="h-full w-full object-cover"
                />
              </div>
              {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto p-2 no-scrollbar">
                  {images.map((src, i) => (
                    <button
                      key={i}
                      onClick={() => setImgIdx(i)}
                      className={`relative h-16 w-24 overflow-hidden rounded-lg border ${
                        imgIdx === i ? 'ring-2 ring-brand-blue' : 'opacity-90 hover:opacity-100'
                      }`}
                      aria-label={`View image ${i + 1}`}
                    >
                      <img src={src} alt={`thumb ${i + 1}`} className="h-full w-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </section>

            {/* Laptop details */}
            <section className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-sm p-6 sm:p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-light text-white">Laptop Details</h2>
                <span className="text-sm text-gray-400">Pi-only • Contact-first</span>
              </div>

              {/* PRIMARY FACTS — always visible */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                <Fact label="Brand" value={item._meta?.brand} />
                <Fact label="Model" value={item._meta?.model} />
                <Fact label="Type" value={item.type} />
                <Fact label="Processor" value={item._meta?.processor} />
                <Fact label="RAM" value={item._meta?.ram} />
                <Fact label="Storage" value={item._meta?.storage} />
                <Fact label="Price (π)" value={(item.pricePi ?? 0).toLocaleString()} />
                <Fact label="Location" value={item.location} />
              </div>

              {/* Centered dropdown to reveal more */}
              <div className="mt-3 flex justify-center">
                <button
                  onClick={() => setDetailsOpen((o) => !o)}
                  aria-expanded={detailsOpen}
                  aria-controls="more-property-details"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 backdrop-blur-sm px-4 py-2 text-sm font-medium transition text-white hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/60"
                >
                  {detailsOpen ? 'Hide full details' : 'Show full details'}
                  <svg
                    className={`h-4 w-4 transition-transform ${detailsOpen ? 'rotate-180' : ''}`}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </button>
              </div>

              {/* EXTRA DETAILS — collapsible */}
              <div id="more-laptop-details" className={`${detailsOpen ? 'mt-4' : 'hidden'}`}>
                {/* Spec grid (the rest) */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                  {/* Hardware specs */}
                  <Fact label="Graphics Card" value={item._meta?.graphicsCard} />
                  <Fact label="Screen Size" value={item._meta?.screenSize} />
                  <Fact label="Resolution" value={item._meta?.resolution} />
                  <Fact label="Operating System" value={item._meta?.operatingSystem} />
                  <Fact label="Color" value={item._meta?.color} />
                  <Fact label="Battery Life" value={item._meta?.batteryLife} />
                  <Fact label="Weight" value={item._meta?.weight} />

                  {/* Connectivity */}
                  <Fact label="Ports" value={item._meta?.ports} />
                  <Fact label="WiFi" value={item._meta?.wifi} />
                  <Fact label="Bluetooth" value={item._meta?.bluetooth} />
                  <Fact label="Webcam" value={item._meta?.webcam} />
                  <Fact label="Speakers" value={item._meta?.speakers} />
                  <Fact label="Keyboard" value={item._meta?.keyboard} />
                  <Fact label="Trackpad" value={item._meta?.trackpad} />

                  {/* Condition details */}
                  <Fact label="Condition" value={item._meta?.condition} />
                  <Fact label="Scratches" value={item._meta?.scratches} />
                  <Fact label="Screen Condition" value={item._meta?.screenCondition} />
                  <Fact label="Battery Health" value={item._meta?.batteryHealth} />
                  <Fact label="Charging Port" value={item._meta?.chargingPort} />
                  <Fact label="Repair History" value={item._meta?.repairHistory} />
                </div>

                {/* Features */}
                {Array.isArray(item._meta?.features) && item._meta.features.length > 0 && (
                  <div className="mt-4">
                    <h3 className="text-sm font-semibold mb-2 text-white">Features</h3>
                    <ul className="flex flex-wrap gap-2">
                      {item._meta.features.map((f, i) => (
                        <li
                          key={i}
                          className="rounded-full bg-white/10 backdrop-blur-sm text-white text-xs px-3 py-1 border border-white/20"
                        >
                          {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Safety features */}
                {Array.isArray(item._meta?.safetyFeatures) && item._meta.safetyFeatures.length > 0 && (
                  <div className="mt-3">
                    <h3 className="text-sm font-semibold mb-2 text-white">Safety</h3>
                    <ul className="flex flex-wrap gap-2">
                      {item._meta.safetyFeatures.map((f, i) => (
                        <li key={i} className="rounded-full bg-white/10 backdrop-blur-sm text-white text-xs px-3 py-1 border border-white/20">
                          {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Accessories */}
                {Array.isArray(item._meta?.accessories) && item._meta.accessories.length > 0 && (
                  <div className="mt-4">
                    <h3 className="text-sm font-semibold mb-2 text-white">Included Accessories</h3>
                    <ul className="flex flex-wrap gap-2">
                      {item._meta.accessories.map((a, i) => (
                        <li key={i} className="rounded-full bg-green-900/20 text-green-300 text-xs px-3 py-1 border border-green-400/30">
                          {a}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Documents */}
                {Array.isArray(item._meta?.docs) && item._meta.docs.length > 0 && (
                  <div className="mt-4">
                    <h3 className="text-sm font-semibold mb-2 text-white">Documents</h3>
                    <div className="flex gap-2 overflow-x-auto no-scrollbar">
                      {item._meta.docs.map((d, i) => (
                        <a
                          key={i}
                          href={d}
                          target="_blank"
                          rel="noreferrer"
                          className="h-24 w-36 overflow-hidden rounded-lg border border-white/20 bg-white/5 backdrop-blur-sm"
                        >
                          <img src={d} alt={`Document ${i + 1}`} className="h-full w-full object-cover" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* About / Safety tips */}
            <section className="rounded-2xl border border-white/20 bg-white/5 backdrop-blur-sm p-4 sm:p-5 shadow-soft">
              <h2 className="text-base font-semibold text-white">About this laptop</h2>
              <p className="mt-1 text-sm text-gray-300">
                Message the seller to arrange viewing and complete the exchange in Pi. This marketplace is contact-first —
                no on-site payments.
              </p>

              {item._meta?.notes ? (
                <div className="mt-3 rounded-xl border border-white/20 bg-white/5 backdrop-blur-sm p-3 text-sm text-gray-300">
                  <div className="font-semibold mb-1 text-white">Seller notes</div>
                  <p>{item._meta.notes}</p>
                </div>
              ) : null}

              <div className="mt-4">
                <h3 className="text-sm font-semibold mb-1 text-white">Safety checks</h3>
                <ul className="list-disc ml-5 text-sm text-gray-300 space-y-1">
                  <li>Meet in public; bring a friend where possible.</li>
                  <li>Test all functions and check for damage.</li>
                  <li>Verify battery health and charging capability.</li>
                  <li>Never share sensitive info; use a wallet you trust.</li>
                </ul>
              </div>
            </section>
          </div>

          {/* Right: seller / actions */}
          <aside className="lg:col-span-1 space-y-4">
            <section className="rounded-2xl border border-white/20 bg-white/5 backdrop-blur-sm p-4 sm:p-5 shadow-soft">
              <h2 className="text-base font-semibold text-white">Seller</h2>

              {/* Seller Identity - Show Pi Username */}
              {item.seller && (
                <div className="mt-3 flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
                  <div className="flex-shrink-0">
                    <div className="h-12 w-12 rounded-full bg-brand-blue flex items-center justify-center">
                      <span className="text-white font-bold text-lg">
                        {(item.seller.piUsername || item.seller.user_uid).charAt(0).toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white">
                      {item.seller.piUsername || item.seller.user_uid}
                    </p>
                    <p className="text-xs text-gray-400">Pi Network User</p>
                  </div>
                </div>
              )}

              {item._meta?.contactMethod && item._meta?.contactHandle ? (
                <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                  <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                    <div className="text-gray-400">Method</div>
                    <div className="font-semibold text-white">{item._meta.contactMethod}</div>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                    <div className="text-gray-400">Handle</div>
                    <div className="font-semibold text-white break-all">{item._meta.contactHandle}</div>
                  </div>
                </div>
              ) : (
                <p className="mt-2 text-sm text-gray-300">Contact details provided after you tap the button below.</p>
              )}

              <div className="mt-3 grid grid-cols-2 gap-2">
                {item.seller && (
                  <ChatButton
                    listing={{
                      type: 'laptop',
                      id: item.id,
                      title: item.title
                    }}
                    seller={item.seller}
                    className="col-span-2 inline-flex items-center justify-center rounded-xl bg-brand-blue px-4 py-2 text-white font-semibold hover:bg-brand-dark"
                  />
                )}
                {isAuthenticated && item.seller && (
                  <button
                    onClick={() => setShowPurchaseModal(true)}
                    className="col-span-2 inline-flex items-center justify-center rounded-xl bg-green-600 px-4 py-2 text-white font-semibold hover:bg-green-700"
                  >
                    <Icon name="shopping-cart" className="h-4 w-4 inline mr-2" />
                    Buy Now - {Number(item.pricePi || 0).toLocaleString()} π
                  </button>
                )}
                 
              </div>

              <p className="mt-2 text-[11px] text-gray-400">
                By contacting, you agree to follow community rules and transact in π.
              </p>
            </section>

            {/* Quick links */}
            <section className="rounded-2xl border border-white/20 bg-white/5 backdrop-blur-sm p-4 sm:p-5 shadow-soft">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <Link href="/help" className="rounded-xl border border-white/20 bg-white/5 backdrop-blur-sm px-3 py-2 text-center text-white hover:bg-white/10">
                  Help Center
                </Link>
                <Link href="/safety" className="rounded-xl border border-white/20 bg-white/5 backdrop-blur-sm px-3 py-2 text-center text-white hover:bg-white/10">
                  Safety Tips
                </Link>
                <button className="col-span-2 rounded-xl border border-white/20 bg-white/5 backdrop-blur-sm px-3 py-2 text-white hover:bg-white/10">Report Listing</button>
              </div>
            </section>
          </aside>
        </div>

        {/* Similar listings */}
        {Array.isArray(related) && related.length > 0 && (
          <section className="mt-6">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-base sm:text-lg font-semibold text-white">Similar Listings</h2>
              <Link href="/laptops" className="text-sm text-brand-blue hover:underline">
                View all
              </Link>
            </div>

            <Carousel>
              {related.map((l) => (
                <div key={l.id} className="snap-start shrink-0 basis-full sm:basis-1/2 lg:basis-1/3 px-2">
                  <ListingCard item={l} href={`/laptops/${l.id}`} />
                </div>
              ))}
            </Carousel>
          </section>
        )}
      </div>
      </div>

      {/* Purchase Modal */}
      <PurchaseModal
        isOpen={showPurchaseModal}
        onClose={() => setShowPurchaseModal(false)}
        listing={item}
        seller={item.seller}
      />
    </>
  )
}

/* -------------- Small UI bits --------------- */
function Fact({ label, value }) {
  const display =
    value === null || value === undefined || value === '' ? '—' : String(value)
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm px-4 py-3 text-sm">
      <div className="text-gray-400 text-xs uppercase tracking-wide">{label}</div>
      <div className="font-medium text-white break-words mt-1">{display}</div>
    </div>
  )
}

function PiBadge() {
  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 px-3 py-1.5 text-xs font-medium text-white">
      <svg viewBox="0 0 24 24" className="h-4 w-4 text-white" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M4 7h16M8 7v10a3 3 0 0 0 3 3" />
        <path d="M16 7v10a3 3 0 0 1-3 3" />
      </svg>
      Pi-only
    </span>
  )
}

function Icon({ name, className }) {
  switch (name) {
    case 'arrow-left':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M15 18l-6-6 6-6" />
        </svg>
      )
    case 'sparkles':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M5 3l2 6 6 2-6 2-2 6-2-6-6-2 6-2 2-6z" />
        </svg>
      )
    case 'map-pin':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 21s8-7 8-12a8 8 0 1 0-16 0c0 5 8 12 8 12z" />
          <circle cx="12" cy="9" r="2.5" />
        </svg>
      )
    case 'home':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M4 22V10l8-6 8 6v12H4z" />
        </svg>
      )
    case 'laptop':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
          <line x1="8" y1="21" x2="16" y2="21"/>
          <line x1="12" y1="17" x2="12" y2="21"/>
        </svg>
      )
    case 'hard-drive':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="4" width="18" height="16" rx="2"/>
          <line x1="7" y1="8" x2="7" y2="8"/>
          <line x1="7" y1="12" x2="7" y2="12"/>
        </svg>
      )
    case 'ruler':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 8h18M3 12h18M3 16h18" />
        </svg>
      )
    case 'message':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 15a4 4 0 0 1-4 4H7l-4 4V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z" />
        </svg>
      )
    case 'heart':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 1 0-7.8 7.8l1 1L12 22l7.8-8.6 1-1a5.5 5.5 0 0 0 0-7.8z" />
        </svg>
      )
    case 'heart-solid':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.45 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.55 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
      )
    case 'share':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="18" cy="5" r="3" />
          <circle cx="6" cy="12" r="3" />
          <circle cx="18" cy="19" r="3" />
          <path d="M8.59 13.51l6.83 3.98" />
          <path d="M15.41 6.51L8.59 10.49" />
        </svg>
      )
    case 'shopping-cart':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="9" cy="21" r="1" />
          <circle cx="20" cy="21" r="1" />
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
        </svg>
      )
    default:
      return null
  }
}

