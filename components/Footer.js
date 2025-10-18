export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-white/10 bg-black/95 backdrop-blur-sm">
      <div className="container py-6 flex flex-col items-center gap-2 text-center text-sm text-gray-400">
        <span>© {year} GT Store • Built by Team GT Store</span>
        <div className="flex items-center gap-4 text-xs">
          <a href="/terms" className="hover:text-white transition-colors duration-200">Terms</a>
          <a href="/privacy" className="hover:text-white transition-colors duration-200">Privacy</a>
          <a href="/help" className="hover:text-white transition-colors duration-200">Help</a>
        </div>
      </div>
    </footer>
  )
}
