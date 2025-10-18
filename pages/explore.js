import { useMemo, useState } from 'react'
import Carousel from '@/Carousel'
import ListingCard from '@/components/ListingCard'

export async function getServerSideProps() {
  try {
    const { prisma } = await import('@/lib/prisma');
    
    // Fetch directly from database
    const [laptops, phones] = await Promise.all([
      prisma.laptop.findMany({
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
          { pricePi: 'desc' }
        ]
      }),
      prisma.phone.findMany({
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
    ]);
    
    // Format data
    const formattedLaptops = laptops.map(laptop => ({
      ...laptop,
      images: Array.isArray(laptop.images) ? laptop.images : [],
      features: Array.isArray(laptop.features) ? laptop.features : [],
      safetyFeatures: Array.isArray(laptop.safetyFeatures) ? laptop.safetyFeatures : [],
      accessories: Array.isArray(laptop.accessories) ? laptop.accessories : []
    }));
    
    const formattedPhones = phones.map(phone => ({
      ...phone,
      images: Array.isArray(phone.images) ? phone.images : [],
      features: Array.isArray(phone.features) ? phone.features : [],
      safetyFeatures: Array.isArray(phone.safetyFeatures) ? phone.safetyFeatures : [],
      accessories: Array.isArray(phone.accessories) ? phone.accessories : [],
      connectivity: Array.isArray(phone.connectivity) ? phone.connectivity : []
    }));
    
    return { 
      props: { 
        laptops: JSON.parse(JSON.stringify(formattedLaptops)), 
        phones: JSON.parse(JSON.stringify(formattedPhones))
      } 
    };
  } catch (error) {
    console.error('Error fetching listings:', error);
    return { props: { laptops: [], phones: [] } };
  }
}

export default function Home({ laptops, phones }) {
  const [section, setSection] = useState('All') // 'All' | 'Phones' | 'Laptops'

  // ---------- Helpers ----------
  const orderLaptops = ['Gaming', 'Business', 'Ultrabook', 'Workstation', 'Accessories']
  const orderPhones  = ['Smartphone', 'Tablet', 'Smartwatch', 'Accessories']

  const uniq = (arr) => Array.from(new Set(arr))
  const inOrder = (types, order) =>
    order.filter((t) => types.includes(t)).concat(uniq(types).filter(t => !order.includes(t)))

  // Data slices (Laptops)
  const laptopNew = useMemo(() => laptops.filter(l => l.isNew), [laptops])
  const laptopTypes = useMemo(
    () => inOrder(uniq(laptops.map(l => l.type)), orderLaptops),
    [laptops]
  )
  const laptopsByType = useMemo(() =>
    laptopTypes.map(t => ({
      type: t,
      items: laptops.filter(l => l.type === t && !l.isNew),
    })), [laptops, laptopTypes]
  )

  // Data slices (Phones)
  const phoneNew = useMemo(() => phones.filter(p => p.isNew), [phones])
  const phoneTypes = useMemo(
    () => inOrder(uniq(phones.map(p => p.type)), orderPhones),
    [phones]
  )
  const phonesByType = useMemo(() =>
    phoneTypes.map(t => ({
      type: t,
      items: phones.filter(p => p.type === t && !p.isNew),
    })), [phones, phoneTypes]
  )

  // All items combined (latest first)
  const allItems = useMemo(() => {
    const combined = [...laptops, ...phones]
    return combined.sort((a, b) => new Date(b.createdAt || b.updatedAt) - new Date(a.createdAt || a.updatedAt))
  }, [laptops, phones])

  const allNew = useMemo(() => allItems.filter(item => item.isNew), [allItems])

  // ---------- UI ----------
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero */}
      <section className="relative overflow-hidden bg-black">
        {/* Subtle background elements */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-white/3 rounded-full blur-3xl"></div>
        </div>

        <div className="relative container py-8 sm:py-16">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-light text-white mb-6 tracking-tight">
              Discover{' '}
              <span className="font-medium">Gadgets</span>
            </h1>

            {/* Segmented Control */}
            <div
              className="inline-flex items-center rounded-3xl border border-white/20 bg-white/5 backdrop-blur-sm p-1 shadow-lg"
              role="tablist"
              aria-label="Select section"
              aria-orientation="horizontal"
              onKeyDown={(e) => {
                if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
                  const sections = ['All', 'Phones', 'Laptops']
                  const currentIndex = sections.indexOf(section)
                  const nextIndex = e.key === 'ArrowRight' 
                    ? (currentIndex + 1) % sections.length
                    : (currentIndex - 1 + sections.length) % sections.length
                  setSection(sections[nextIndex])
                }
              }}
            >
              <button
                id="tab-all"
                onClick={() => setSection('All')}
                role="tab"
                aria-selected={section === 'All'}
                aria-controls="panel-all"
                tabIndex={section === 'All' ? 0 : -1}
                className={`min-w-[8rem] px-4 py-3 rounded-2xl text-sm font-medium transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30 active:scale-95
                ${section === 'All'
                  ? 'bg-white text-black shadow-lg'
                  : 'text-gray-300 hover:text-white hover:bg-white/10'}`}
              >
                All
              </button>
              <button
                id="tab-phones"
                onClick={() => setSection('Phones')}
                role="tab"
                aria-selected={section === 'Phones'}
                aria-controls="panel-phones"
                tabIndex={section === 'Phones' ? 0 : -1}
                className={`min-w-[8rem] px-4 py-3 rounded-2xl text-sm font-medium transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30 active:scale-95
                ${section === 'Phones'
                  ? 'bg-white text-black shadow-lg'
                  : 'text-gray-300 hover:text-white hover:bg-white/10'}`}
              >
                Phones
              </button>
              <button
                id="tab-laptops"
                onClick={() => setSection('Laptops')}
                role="tab"
                aria-selected={section === 'Laptops'}
                aria-controls="panel-laptops"
                tabIndex={section === 'Laptops' ? 0 : -1}
                className={`min-w-[8rem] px-4 py-3 rounded-2xl text-sm font-medium transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30 active:scale-95
                ${section === 'Laptops'
                  ? 'bg-white text-black shadow-lg'
                  : 'text-gray-300 hover:text-white hover:bg-white/10'}`}
              >
                Laptops
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* CONTENT */}
      {section === 'All' ? (
        <SectionGroup
          title="Latest Gadgets"
          viewAllHref="/explore"
          newItems={allNew}
          groups={[
            { type: 'Latest Listings', items: allItems.slice(0, 12) }
          ]}
          buildHref={(item) => {
            const isPhone = item.type === 'Smartphone' || item.brand
            return isPhone ? `/phones/${item.id}` : `/laptops/${item.id}`
          }}
        />
      ) : section === 'Laptops' ? (
        <SectionGroup
          title="Laptops"
          viewAllHref="/laptops"
          newItems={laptopNew}
          groups={laptopsByType}
          buildHref={(item) => `/laptops/${item.id}`}
        />
      ) : (
        <SectionGroup
          title="Phones"
          viewAllHref="/phones"
          newItems={phoneNew}
          groups={phonesByType}
          buildHref={(item) => `/phones/${item.id}`}
        />
      )}
    </div>
  )
}

/* ---------- Reusable Section Group ---------- */
function SectionGroup({ title, viewAllHref, newItems = [], groups = [], buildHref }) {
  return (
    <>
      {/* New Listings */}
      {newItems.length > 0 && (
        <section className="container py-12">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-light text-white">New {title}</h2>
            <a href={viewAllHref} className="text-sm text-gray-400 hover:text-white transition-colors duration-200">View all</a>
          </div>

          <Carousel>
            {newItems.map((it) => (
              <div key={it.id} className="snap-start shrink-0 basis-full sm:basis-1/2 lg:basis-1/3 px-3">
                <ListingCard item={it} href={buildHref(it)} seller={it.seller} />
              </div>
            ))}
          </Carousel>
        </section>
      )}

      {/* By Type */}
      {groups.map(({ type, items }) => (
        items.length > 0 && (
          <section key={type} className="container pb-12">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-light text-white">{type}</h3>
              <a href={viewAllHref} className="text-sm text-gray-400 hover:text-white transition-colors duration-200">View all</a>
            </div>

            <Carousel>
              {items.map((it) => (
                <div key={it.id} className="snap-start shrink-0 basis-full sm:basis-1/2 lg:basis-1/3 px-3">
                  <ListingCard item={it} href={buildHref(it)} seller={it.seller} />
                </div>
              ))}
            </Carousel>
          </section>
        )
      ))}

      {/* Empty state (if absolutely nothing) */}
      {newItems.length === 0 && groups.every(g => g.items.length === 0) && (
        <section className="container py-20">
          <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-sm p-12 text-center">
            <div className="w-20 h-20 bg-white/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <div className="text-xl font-medium text-white mb-3">No {title.toLowerCase()} yet</div>
            <p className="text-gray-400 mb-8">Check back soon or become a seller.</p>
            <div>
              <a href="/apply-seller" className="inline-flex items-center justify-center rounded-2xl bg-white text-black px-8 py-3 text-sm font-medium hover:bg-gray-100 transition-all duration-200">
                Become a Seller
              </a>
            </div>
          </div>
        </section>
      )}
    </>
  )
}