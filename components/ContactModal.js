import { useState } from 'react'

export default function ContactModal({ item, onClose }) {
  const [name, setName] = useState('')
  const [message, setMessage] = useState('')
  const [sent, setSent] = useState(false)

  const submit = async () => {
    const res = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ listingId: item.id, name, message })
    })
    if (res.ok) setSent(true)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Contact Seller</h3>
          <button onClick={onClose} className="text-gray-500">✕</button>
        </div>
        {!sent ? (
          <>
            <p className="text-sm text-gray-600">Message the seller about <b>{item.title}</b>. All exchanges are in π.</p>
            <input className="w-full rounded-lg border p-2" placeholder="Your name" value={name} onChange={e=>setName(e.target.value)} />
            <textarea className="w-full rounded-lg border p-2" rows={4} placeholder="Message" value={message} onChange={e=>setMessage(e.target.value)} />
            <button onClick={submit} className="w-full py-2 rounded-lg bg-brand.blue text-white">Send</button>
          </>
        ) : (
          <div className="text-center space-y-2">
            <div className="text-brand.dark font-semibold">Message sent!</div>
            <p className="text-sm text-gray-600">The seller will reply if still available.</p>
            <button onClick={onClose} className="px-4 py-2 rounded-lg border">Close</button>
          </div>
        )}
      </div>
    </div>
  )
}
