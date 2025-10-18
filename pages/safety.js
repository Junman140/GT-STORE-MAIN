export default function Safety() {
  return (
    <div className="min-h-screen bg-black">
      <div className="container py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-6">Safety Tips</h1>
          <div className="rounded-2xl border border-white/20 bg-white/5 backdrop-blur-sm p-8 shadow-soft">
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-white mb-3">Meeting Safely</h2>
                <ul className="space-y-2 text-gray-300">
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">•</span>
                    Meet in safe, public places during daylight hours
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">•</span>
                    Bring a friend or family member with you
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">•</span>
                    Inform someone about your meeting location and time
                  </li>
                </ul>
              </div>
              
              <div>
                <h2 className="text-xl font-semibold text-white mb-3">Verification</h2>
                <ul className="space-y-2 text-gray-300">
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">•</span>
                    Verify ownership and documents before payment
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">•</span>
                    Test devices thoroughly before completing purchase
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">•</span>
                    Ask for receipts and warranty information
                  </li>
                </ul>
              </div>
              
              <div>
                <h2 className="text-xl font-semibold text-white mb-3">Payment Safety</h2>
                <ul className="space-y-2 text-gray-300">
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">•</span>
                    Use Pi with trusted parties and follow local laws
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">•</span>
                    Never send payment before meeting and verifying the item
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">•</span>
                    Keep records of all transactions
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
