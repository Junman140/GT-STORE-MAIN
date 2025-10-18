import { useRef } from 'react'

export default function Carousel({ children }) {
  const ref = useRef(null)
  const scrollBy = (delta) => ref.current?.scrollBy({ left: delta, behavior: 'smooth' })

  return (
    <div className="relative">
      <div ref={ref} className="flex overflow-x-auto gap-4 snap-x pb-2 no-scrollbar">
        {children}
      </div>
      <div className="hidden sm:flex absolute -top-10 right-0 items-center gap-2">
        <button onClick={() => scrollBy(-320)} className="px-3 py-1 rounded border">◀</button>
        <button onClick={() => scrollBy(320)} className="px-3 py-1 rounded border">▶</button>
      </div>
    </div>
  )
}
