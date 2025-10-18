// pages/phones/index.js
import Head from 'next/head'
import { useMemo, useState, useEffect } from 'react'
import CategoryChips from '@/components/CategoryChips'
import ListingCard from '@/components/ListingCard'
import Carousel from '@/Carousel'

export async function getServerSideProps() {
  try {
    const { prisma } = await import('@/lib/prisma')
    
    const phones = await prisma.phone.findMany({
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
        { isNew: 'desc' },
        { year: 'desc' }
      ]
    })
    
    // Format data (handle arrays properly)
    const formattedPhones = phones.map(phone => ({
      ...phone,
      images: Array.isArray(phone.images) ? phone.images : [],
      features: Array.isArray(phone.features) ? phone.features : [],
      safetyFeatures: Array.isArray(phone.safetyFeatures) ? phone.safetyFeatures : [],
      docs: Array.isArray(phone.docs) ? phone.docs : [],
      accessories: Array.isArray(phone.accessories) ? phone.accessories : [],
      connectivity: Array.isArray(phone.connectivity) ? phone.connectivity : [],
      _meta: {
        sellerName: phone.seller?.piUsername || phone.seller?.user_uid || 'Seller'
      }
    }))
    
    return { props: { phones: JSON.parse(JSON.stringify(formattedPhones)) } }
  } catch (error) {
    console.error('Error fetching phones:', error)
    return { props: { phones: [] } }
  }
}

/* ---------- helpers ---------- */
// parse storage "128GB" -> 128
const parseStorage = (s) => {
  if (typeof s === 'number') return s
  if (!s) return 0
  const n = parseInt(String(s).replace(/[^\d]/g, ''), 10)
  return Number.isNaN(n) ? 0 : n
}

/* ---------- small UI atoms (outside JSX to avoid compile issues) ---------- */
function StatPill({ icon, children }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-xl bg-white/10 backdrop-blur-sm px-4 py-2 border border-white/20">
      <Icon name={icon} className="h-4 w-4 text-white" />
      <span className="text-white font-medium">{children}</span>
    </span>
  )
}

function FeaturePill({ icon, children }) {
  return (
    <li className="inline-flex items-center gap-2 rounded-full bg-white/5 backdrop-blur-sm px-4 py-2 border border-white/10">
      <Icon name={icon} className="h-4 w-4 text-gray-300" />
      <span className="text-gray-300">{children}</span>
    </li>
  )
}

function Icon({ name, className }) {
  switch (name) {
    case 'phone':
      return (<svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2"><rect x="7" y="2" width="10" height="20" rx="2"/><line x1="12" y1="18" x2="12" y2="18"/></svg>)
    case 'plus':
      return (<svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14"/></svg>)
    case 'pi':
      return (<svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 7h16M8 7v10a3 3 0 0 0 3 3"/><path d="M16 7v10a3 3 0 0 1-3 3"/></svg>)
    case 'speed':
      return (<svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 1 1-9-9"/><path d="M12 12l6-6"/></svg>)
    case 'shield':
      return (<svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V6l-8-3-8 3v6c0 6 8 10 8 10z"/></svg>)
    case 'tag':
      return (<svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V4h8l10.59 9.41z"/><circle cx="7.5" cy="7.5" r="1.5"/></svg>)
    case 'smartphone':
      return (<svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2"><rect x="7" y="2" width="10" height="20" rx="2"/><line x1="12" y1="18" x2="12" y2="18"/></svg>)
    case 'tablet':
      return (<svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2"><rect x="4" y="2" width="16" height="20" rx="2"/><line x1="12" y1="18" x2="12" y2="18"/></svg>)
    case 'watch':
      return (<svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="7"/><path d="M12 9v3l2 2"/><path d="M7 3l2 2"/><path d="M17 3l-2 2"/><path d="M7 21l2-2"/><path d="M17 21l-2-2"/></svg>)
    default:
      return null
  }
}

/* ---------- page ---------- */
export default function Phones({ phones }) {
  // Categories / UI
  const categories = ['All','Smartphone','Tablet','Smartwatch','Accessories','New Listings']
  const [cat, setCat] = useState('All')
  const [query, setQuery] = useState('')
  const [filtersOpen, setFiltersOpen] = useState(false)

  // Filters
  const [minYear, setMinYear] = useState('')
  const [maxStorage, setMaxStorage] = useState('')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')

  // Sort
  const [sort, setSort] = useState('Featured') // Featured | Price ↑ | Price ↓ | Year ↓ | Storage ↑

  // Pagination
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(6)

  const newOnly = cat === 'New Listings'

  const base = useMemo(() => {
    let arr = phones.slice()

    // Category
    if (cat !== 'All' && !newOnly) arr = arr.filter(p => p.type === cat)
    if (newOnly) arr = arr.filter(p => p.isNew)

    // Search (title/location)
    if (query.trim()) {
      const q = query.trim().toLowerCase()
      arr = arr.filter(p =>
        (p.title || '').toLowerCase().includes(q) ||
        (p.location || '').toLowerCase().includes(q) ||
        (p.brand || '').toLowerCase().includes(q) ||
        (p.model || '').toLowerCase().includes(q)
      )
    }

    // Numeric filters
    const yMin  = minYear === '' ? -Infinity : Number(minYear)
    const sMax  = maxStorage === '' ?  Infinity : Number(maxStorage)
    const pMin  = minPrice === '' ? -Infinity : Number(minPrice)
    const pMax  = maxPrice === '' ?  Infinity : Number(maxPrice)

    arr = arr.filter(p =>
      (p.year ?? 0) >= yMin &&
      parseStorage(p.storage) <= sMax &&
      (p.pricePi ?? 0) >= pMin &&
      (p.pricePi ?? 0) <= pMax
    )

    // Sort
    switch (sort) {
      case 'Price ↑':   arr.sort((a,b) => (a.pricePi ?? 0) - (b.pricePi ?? 0)); break
      case 'Price ↓':   arr.sort((a,b) => (b.pricePi ?? 0) - (a.pricePi ?? 0)); break
      case 'Year ↓':    arr.sort((a,b) => (b.year ?? 0) - (a.year ?? 0)); break
      case 'Storage ↑': arr.sort((a,b) => parseStorage(a.storage) - parseStorage(b.storage)); break
      default:          arr.sort((a,b) => (b.isNew === a.isNew ? (b.year ?? 0) - (a.year ?? 0) : (b.isNew ? 1 : -1)))
    }

    return arr
  }, [phones, cat, newOnly, query, minYear, maxStorage, minPrice, maxPrice, sort])

  useEffect(() => { setPage(1) }, [cat, query, minYear, maxStorage, minPrice, maxPrice, sort])

  const total = base.length
  const start = (page - 1) * pageSize
  const end = start + pageSize
  const items = base.slice(start, end)
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const hasNew = phones.some(p => p.isNew)
  const totalNew = phones.filter(p => p.isNew).length

  const resetFilters = () => {
    setMinYear(''); setMaxStorage(''); setMinPrice(''); setMaxPrice(''); setSort('Featured')
  }

  // hero stats (avg price & avg storage)
  const avgPrice = Math.round(
    phones.reduce((s, p) => s + (p.pricePi ?? 0), 0) / Math.max(1, phones.length)
  )
  const avgStorage = Math.round(
    phones.reduce((s, p) => s + parseStorage(p.storage), 0) / Math.max(1, phones.length)
  )

  return (
    <>
      <Head>
        <title>Phones & Accessories • GT Store</title>
        <meta name="description" content="Browse phones and accessories in π. Mobile-first, contact-first marketplace." />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      </Head>

      <div className="min-h-screen bg-black text-white">
        {/* HERO — upgraded */}
        <section className="relative overflow-hidden bg-black">
          {/* ambient blobs */}
          <div className="absolute inset-0">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-white/3 rounded-full blur-3xl"></div>
          </div>

          <div className="relative container py-12 sm:py-20">
            <div className="max-w-3xl mx-auto text-center">
            
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-light text-white mb-6 tracking-tight">
                All Phones & Accessories
              </h1>
              <p className="text-xl text-gray-300 mb-8 font-light leading-relaxed">
                Smartphones, Tablets, Smartwatches &amp; more. Message sellers.
              </p>

              {/* quick stats */}
              <div className="flex flex-wrap justify-center gap-3 text-sm">
                <StatPill icon="phone">{phones.length} total</StatPill>
                {avgPrice > 0 && <StatPill icon="pi">Avg {avgPrice}π</StatPill>}
                {avgStorage > 0 && <StatPill icon="tag">Avg {avgStorage}GB</StatPill>}
              </div>

              {/* actions */}
              <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                <a
                  href="/create"
                  className="inline-flex items-center justify-center px-8 py-3 rounded-2xl bg-white text-black font-medium hover:bg-gray-100 transition-all duration-200"
                >
                  Create Listing
                </a>
                <a
                  href="#results"
                  className="inline-flex items-center justify-center px-8 py-3 rounded-2xl border border-white/20 text-white hover:bg-white/10 transition-all duration-200"
                >
                  Browse listings
                </a>
              </div>

              {/* micro features */}
              <ul className="mt-6 flex flex-wrap items-center justify-center gap-3 text-sm text-gray-400">
                <FeaturePill icon="shield">Safe, contact-first</FeaturePill>
                <FeaturePill icon="phone">Built for pi network</FeaturePill>
              </ul>
            </div>
          </div>
        </section>

   




        {/* NEW LISTINGS — 1 per view */}
        {hasNew && (
          <section className="container py-12">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-light text-white">New Listings</h2>
              <button
                onClick={() => setCat('New Listings')}
                className="text-sm text-gray-400 hover:text-white transition-colors duration-200"
              >
                View only new
              </button>
            </div>

            <Carousel>
              {phones.filter(p => p.isNew).map(p => (
                <div key={p.id} className="snap-start shrink-0 basis-full px-3">
                  <ListingCard item={p} href={`/phones/${p.id}`} seller={p.seller} />
                </div>
              ))}
            </Carousel>
          </section>
        )}
        {/* TOOLBAR — mobile-first */}
        <section className="container py-8">
          {/* row: search + sort + filters (mobile trigger) */}
          <div className="grid grid-cols-4 gap-3 sm:gap-4 items-stretch">
            {/* Search */}
            <div className="relative col-span-4 sm:col-span-2">
              <label htmlFor="phone-search" className="sr-only">Search phones</label>
              <input
                id="phone-search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search brand, model, or location…"
                className="h-12 w-full rounded-2xl border border-white/20 bg-white/5 backdrop-blur-sm pl-12 pr-12 text-sm text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/40"
                aria-label="Search phones"
              />
              {/* search icon */}
              <svg
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400"
                viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
              >
                <circle cx="11" cy="11" r="7" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              {/* clear button */}
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  aria-label="Clear search"
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-md hover:bg-white/10"
                >
                  <svg viewBox="0 0 24 24" className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M6 6l12 12M18 6L6 18" />
                  </svg>
                </button>
              )}
            </div>

  {/* Sort */}
  <div className="relative col-span-2 sm:col-span-1">
    <label htmlFor="sort" className="sr-only">Sort</label>
    <select
      id="sort"
      value={sort}
      onChange={(e) => setSort(e.target.value)}
      className="h-11 w-full appearance-none rounded-xl border border-white/20 bg-white/5 backdrop-blur-sm pl-3 pr-9 text-sm text-white focus:outline-none focus:ring-2 focus:ring-brand-blue/60"
      aria-label="Sort"
    >
      <option className="bg-gray-800 text-white">Featured</option>
      <option className="bg-gray-800 text-white">Price ↑</option>
      <option className="bg-gray-800 text-white">Price ↓</option>
      <option className="bg-gray-800 text-white">Year ↓</option>
      <option className="bg-gray-800 text-white">Storage ↑</option>
    </select>
    {/* chevron */}
    <svg
      className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400"
      viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  </div>

  {/* Filters (mobile only) */}
  <button
    onClick={() => setFiltersOpen(true)}
    className="col-span-2 sm:col-span-1 h-11 rounded-xl border border-white/20 bg-white/5 backdrop-blur-sm text-sm font-medium inline-flex items-center justify-center gap-2 text-white hover:bg-white/10 md:hidden"
    aria-haspopup="dialog"
    aria-expanded={filtersOpen}
  >
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 5h18M6 12h12M10 19h4" />
    </svg>
    Filters
  </button>
</div>


        {/* Desktop inline filters */}
        <div className="hidden md:grid grid-cols-6 gap-2 mt-2">
          <input value={minYear} onChange={(e)=>setMinYear(e.target.value)} className="rounded-xl border border-white/20 bg-white/5 backdrop-blur-sm px-3 py-2 text-sm text-white placeholder:text-gray-400" placeholder="Min year" inputMode="numeric" />
          <input value={maxStorage} onChange={(e)=>setMaxStorage(e.target.value)} className="rounded-xl border border-white/20 bg-white/5 backdrop-blur-sm px-3 py-2 text-sm text-white placeholder:text-gray-400" placeholder="Max GB" inputMode="numeric" />
          <input value={minPrice} onChange={(e)=>setMinPrice(e.target.value)} className="rounded-xl border border-white/20 bg-white/5 backdrop-blur-sm px-3 py-2 text-sm text-white placeholder:text-gray-400" placeholder="Min π" inputMode="decimal" />
          <input value={maxPrice} onChange={(e)=>setMaxPrice(e.target.value)} className="rounded-xl border border-white/20 bg-white/5 backdrop-blur-sm px-3 py-2 text-sm text-white placeholder:text-gray-400" placeholder="Max π" inputMode="decimal" />
          <div className="flex gap-2">
            <button onClick={resetFilters} className="flex-1 px-3 py-2 rounded-xl border border-white/20 bg-white/5 backdrop-blur-sm text-sm text-white hover:bg-white/10">Reset</button>
            <a href="/create" className="px-3 py-2 rounded-xl bg-brand-blue text-white text-sm hover:bg-brand-dark">Create</a>
          </div>
        </div>
      </section>

      {/* MOBILE FILTERS SHEET */}
      {filtersOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/30" onClick={()=>setFiltersOpen(false)} />
          <aside className="absolute bottom-0 left-0 right-0 rounded-t-2xl bg-white/5 backdrop-blur-sm border border-white/20 p-4 shadow-2xl">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-white">Filters</h3>
              <button onClick={()=>setFiltersOpen(false)} className="p-2 rounded-md hover:bg-white/10 text-white" aria-label="Close">✕</button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <input value={minYear} onChange={(e)=>setMinYear(e.target.value)} className="rounded-xl border border-white/20 bg-white/5 backdrop-blur-sm px-3 py-2 text-sm text-white placeholder:text-gray-400" placeholder="Min year" inputMode="numeric" />
              <input value={maxStorage} onChange={(e)=>setMaxStorage(e.target.value)} className="rounded-xl border border-white/20 bg-white/5 backdrop-blur-sm px-3 py-2 text-sm text-white placeholder:text-gray-400" placeholder="Max GB" inputMode="numeric" />
              <input value={minPrice} onChange={(e)=>setMinPrice(e.target.value)} className="rounded-xl border border-white/20 bg-white/5 backdrop-blur-sm px-3 py-2 text-sm text-white placeholder:text-gray-400" placeholder="Min π" inputMode="decimal" />
              <input value={maxPrice} onChange={(e)=>setMaxPrice(e.target.value)} className="rounded-xl border border-white/20 bg-white/5 backdrop-blur-sm px-3 py-2 text-sm text-white placeholder:text-gray-400" placeholder="Max π" inputMode="decimal" />
            </div>
            <div className="mt-3 flex gap-2">
              <button onClick={resetFilters} className="flex-1 px-3 py-2 rounded-xl border border-white/20 bg-white/5 backdrop-blur-sm text-sm text-white hover:bg-white/10">Reset</button>
              <button onClick={()=>setFiltersOpen(false)} className="flex-1 px-3 py-2 rounded-xl bg-brand-blue text-white text-sm">Apply</button>
            </div>
          </aside>
        </div>
      )}
      {/* CATEGORIES — horizontal scroll on mobile */}
{/* CATEGORIES — prominent, scrollable, mobile-first */}
<section className="container mt-4">
  <div className="relative -mx-4 sm:mx-0">
    {/* edge fades to hint horizontal scroll */}
    <div className="pointer-events-none absolute left-0 top-0 h-full w-6 bg-gradient-to-r from-black to-transparent sm:rounded-l-2xl" />
    <div className="pointer-events-none absolute right-0 top-0 h-full w-6 bg-gradient-to-l from-black to-transparent sm:rounded-r-2xl" />

    <div className="overflow-x-auto no-scrollbar">
      <div className="mx-4 sm:mx-0 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/20 shadow-soft px-3 py-2">
        <div className="flex items-center gap-3">
          <span className="hidden sm:inline text-[11px] font-semibold uppercase tracking-wide text-gray-400">
            Categories
          </span>
          <div className="flex-1 min-w-0">
            <CategoryChips
              items={categories}
              active={cat}
              onSelect={setCat}
              aria-label="Filter by category"
            />
          </div>

          {/* quick reset (optional) */}
          {cat !== 'All' && (
            <button
              onClick={() => setCat('All')}
              className="hidden sm:inline-flex shrink-0 rounded-lg border border-white/20 bg-white/5 backdrop-blur-sm px-2.5 py-1.5 text-xs text-white hover:bg-white/10"
            >
              Reset
            </button>
          )}
        </div>
      </div>
    </div>
  </div>
</section>
      {/* RESULTS */}
      <section id="results" className="container py-5">
        {/* Title */}
        <div className="text-center">
          <h2 className="text-xl sm:text-2xl font-extrabold">
            <span className="bg-gradient-to-r from-brand-dark to-brand-blue bg-clip-text text-transparent">
              All Listings
            </span>
          </h2>
        </div>

        {/* stats row */}
        <div className="mt-2 flex items-center justify-between">
          <p className="text-xs sm:text-sm text-gray-400">
            Showing <b>{total ? start + 1 : 0}</b>–<b>{Math.min(total, end)}</b> of <b>{total}</b>
          </p>
          <div className="hidden sm:flex items-center gap-2 text-sm">
            <span className="text-gray-400">Per page</span>
            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className="rounded-lg border border-white/20 bg-white/5 backdrop-blur-sm px-2 py-1 text-white"
            >
              <option className="bg-gray-800 text-white" value={6}>6</option>
              <option className="bg-gray-800 text-white" value={9}>9</option>
              <option className="bg-gray-800 text-white" value={12}>12</option>
            </select>
          </div>
        </div>

        {items.length > 0 ? (
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {items.map(p => (
              <ListingCard key={p.id} item={p} href={`/phones/${p.id}`} seller={p.seller} />
            ))}
          </div>
        ) : (
          <div className="mt-6 rounded-2xl border border-white/20 bg-white/5 backdrop-blur-sm p-6 text-center">
            <div className="text-white font-semibold">No results</div>
            <p className="mt-1 text-sm text-gray-300">Try clearing filters or widening your price range.</p>
            <div className="mt-3 flex justify-center gap-2">
              <button onClick={resetFilters} className="px-4 py-2 rounded-xl border border-white/20 bg-white/5 backdrop-blur-sm text-white hover:bg-white/10">Clear Filters</button>
              <a href="/" className="px-4 py-2 rounded-xl bg-brand-blue text-white">Back Home</a>
            </div>
          </div>
        )}

        {/* Pagination — mobile-friendly */}
        {totalPages > 1 && (
          <div className="mt-6 flex flex-col items-center gap-2">
            <div className="flex w-full sm:w-auto items-center justify-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-3 rounded-xl border border-white/20 bg-white/5 backdrop-blur-sm text-sm text-white disabled:opacity-50 hover:bg-white/10"
                aria-label="Previous page"
              >
                Prev
              </button>
              <span className="text-sm text-gray-300">
                Page <b>{page}</b> / {totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-4 py-3 rounded-xl border border-white/20 bg-white/5 backdrop-blur-sm text-sm text-white disabled:opacity-50 hover:bg-white/10"
                aria-label="Next page"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </section>

      {/* HOW IT WORKS / SAFETY */}
      <section className="container pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-2xl border border-white/20 bg-white/5 backdrop-blur-sm p-5">
            <div className="flex items-center gap-2 mb-3">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-brand-blue text-white">
                {/* play icon */}
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor"><path d="M8 5v14l11-7-11-7z"/></svg>
              </span>
              <h4 className="text-lg font-semibold text-white">How it works</h4>
            </div>
            <ol className="space-y-3">
              <li className="flex items-start gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-blue text-white text-sm font-bold">1</span>
                <div className="text-sm">
                  <div className="font-medium text-white">Browse phones priced in π</div>
                  <div className="text-gray-300">Filter by type, price, year, and storage capacity.</div>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-blue text-white text-sm font-bold">2</span>
                <div className="text-sm">
                  <div className="font-medium text-white">Open a listing &amp; tap <b>Contact Seller</b></div>
                  <div className="text-gray-300">Ask questions, arrange a viewing &amp; test the device.</div>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-blue text-white text-sm font-bold">3</span>
                <div className="text-sm">
                  <div className="font-medium text-white">Meet &amp; verify</div>
                  <div className="text-gray-300">Check condition, functionality, and accessories.</div>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-blue text-white text-sm font-bold">4</span>
                <div className="text-sm">
                  <div className="font-medium text-white">Complete in Pi</div>
                  <div className="text-gray-300">Agree terms and exchange via your trusted Pi wallet.</div>
                </div>
              </li>
            </ol>
          </div>

          <div className="rounded-2xl border border-white/20 bg-white/5 backdrop-blur-sm p-5">
            <div className="flex items-center gap-2 mb-3">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-brand-dark text-white">
                {/* shield icon */}
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V6l-8-3-8 3v6c0 6 8 10 8 10z"/>
                </svg>
              </span>
              <h4 className="text-lg font-semibold text-white">Safety &amp; checks</h4>
            </div>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm text-white">
                  <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 6L9 17l-5-5"/>
                  </svg>
                </span>
                <span className="text-gray-300"><b>Meet safely</b> and consider bringing a friend.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm text-white">
                  <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 6L9 17l-5-5"/>
                  </svg>
                </span>
                <span className="text-gray-300"><b>Test functionality</b> and check for any hardware issues or damage.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm text-white">
                  <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 6L9 17l-5-5"/>
                  </svg>
                </span>
                <span className="text-gray-300"><b>Verify accessories</b> (charger, case, screen protector) and check battery health.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm text-white">
                  <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 6L9 17l-5-5"/>
                  </svg>
                </span>
                <span className="text-gray-300"><b>Protect your info</b> and only use wallets you trust.</span>
              </li>
            </ul>

            <div className="mt-4 grid grid-cols-2 gap-2">
              <a href="/create" className="rounded-xl bg-brand-blue px-4 py-2 text-center text-sm font-semibold text-white hover:bg-brand-dark">Create listing</a>
              <a href="/safety" className="rounded-xl border border-white/20 bg-white/5 backdrop-blur-sm px-4 py-2 text-center text-sm font-semibold text-white hover:bg-white/10">Safety guide</a>
            </div>
          </div>
        </div>
      </section>
      </div>
    </>
  )
}
