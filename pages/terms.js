export default function Terms() {
  return (
    <div className="min-h-screen bg-black">
      <div className="container py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-6">Terms & Privacy</h1>
          <div className="rounded-2xl border border-white/20 bg-white/5 backdrop-blur-sm p-8 shadow-soft">
            <p className="text-gray-300 text-lg mb-6">By using this site you agree to our terms. This is a demo with π-only pricing and contact-based deals.</p>
            
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-white mb-3">Terms of Service</h2>
                <div className="space-y-2 text-gray-300">
                  <p>• Users must be 18+ years old to use this platform</p>
                  <p>• All transactions are conducted in Pi cryptocurrency</p>
                  <p>• Sellers are responsible for accurate product descriptions</p>
                  <p>• Buyers should verify items before completing payment</p>
                </div>
              </div>
              
              <div>
                <h2 className="text-xl font-semibold text-white mb-3">Privacy Policy</h2>
                <div className="space-y-2 text-gray-300">
                  <p>• We collect minimal data necessary for platform operation</p>
                  <p>• Pi wallet information is used for authentication only</p>
                  <p>• Personal messages are encrypted and stored securely</p>
                  <p>• We do not share user data with third parties</p>
                </div>
              </div>
              
              <div>
                <h2 className="text-xl font-semibold text-white mb-3">Platform Rules</h2>
                <div className="space-y-2 text-gray-300">
                  <p>• No fraudulent listings or misrepresentation</p>
                  <p>• Respectful communication between users</p>
                  <p>• Follow local laws regarding cryptocurrency transactions</p>
                  <p>• Report suspicious activity to platform administrators</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
