export default function Help() {
  return (
    <div className="min-h-screen bg-black">
      <div className="container py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-6">Help Center</h1>
          <div className="rounded-2xl border border-white/20 bg-white/5 backdrop-blur-sm p-8 shadow-soft">
            <p className="text-gray-300 text-lg">FAQs about listing, contacting sellers, and using π.</p>
            
            <div className="mt-8 space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-white mb-3">Getting Started</h2>
                <div className="space-y-2 text-gray-300">
                  <p>• Create an account with your Pi wallet</p>
                  <p>• Browse available gadgets and electronics</p>
                  <p>• Contact sellers directly through our messaging system</p>
                </div>
              </div>
              
              <div>
                <h2 className="text-xl font-semibold text-white mb-3">Making Purchases</h2>
                <div className="space-y-2 text-gray-300">
                  <p>• All payments are processed in Pi cryptocurrency</p>
                  <p>• Sellers receive immediate payment after purchase</p>
                  <p>• Platform fee is automatically calculated (1%)</p>
                </div>
              </div>
              
              <div>
                <h2 className="text-xl font-semibold text-white mb-3">For Sellers</h2>
                <div className="space-y-2 text-gray-300">
                  <p>• Apply to become a verified seller</p>
                  <p>• Set your own logistics fees</p>
                  <p>• Create detailed listings with photos</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
