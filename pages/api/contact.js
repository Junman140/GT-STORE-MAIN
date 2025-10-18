export default function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  const { listingId, name, message } = req.body || {}
  console.log('Contact message:', { listingId, name, message })
  res.status(200).json({ ok: true })
}
