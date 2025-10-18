// pages/index.js
import Image from 'next/image'
import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { usePiNetwork } from '@/contexts/PiNetworkContext'
import PiLoginButton from '@/components/PiLoginButton'

export default function Landing() {
  // Hide header and footer on landing page
  Landing.hideChrome = true
  
  const { user } = usePiNetwork()
  const router = useRouter()

  // Redirect authenticated users to explore page
  useEffect(() => {
    if (user) {
      console.log('✅ User already authenticated, redirecting to /explore...')
      router.push('/explore')
    }
  }, [user, router])

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-black">
        {/* Subtle background elements */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-white/3 rounded-full blur-3xl"></div>
        </div>

        <div className="relative container py-20 sm:py-32 lg:py-40">
          <div className="max-w-4xl mx-auto text-center">
            {/* Main Headline */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-light text-white mb-8 tracking-tight">
              Welcome to{' '}
              <span className="font-medium">
                GT Store
              </span>
            </h1>
            
            <p className="text-xl sm:text-2xl text-gray-300 mb-12 max-w-2xl mx-auto leading-relaxed font-light">
              The ultimate destination for premium gadgets and electronics
            </p>

            {/* Key Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
              <div className="bg-white/5 backdrop-blur-sm rounded-3xl p-8 border border-white/10">
                <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-medium text-white mb-3">Premium Phones</h3>
                <p className="text-gray-400 text-sm leading-relaxed">Latest smartphones, tablets, and smart devices from top brands</p>
              </div>

              <div className="bg-white/5 backdrop-blur-sm rounded-3xl p-8 border border-white/10">
                <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-medium text-white mb-3">Professional Laptops</h3>
                <p className="text-gray-400 text-sm leading-relaxed">High-performance laptops for work, gaming, and creativity</p>
              </div>

              <div className="bg-white/5 backdrop-blur-sm rounded-3xl p-8 border border-white/10">
                <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="text-xl font-medium text-white mb-3">Secure Payments</h3>
                <p className="text-gray-400 text-sm leading-relaxed">Powered by Pi Network for safe, decentralized transactions</p>
              </div>
            </div>

            {/* CTA Button */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <div className="transform hover:-translate-y-1 transition-all duration-300">
                <PiLoginButton className="inline-flex items-center justify-center px-12 py-4 bg-white text-black font-medium rounded-2xl hover:bg-gray-100 focus:outline-none focus:ring-4 focus:ring-white/20 transition-all duration-300" />
              </div>
              
              <p className="text-sm text-gray-400">
                Connect with Pi Network to access GT Store
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 sm:py-32 bg-gray-900">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center mb-20">
            <h2 className="text-4xl sm:text-5xl font-light text-white mb-6 tracking-tight">
              Why Choose GT Store?
            </h2>
            <p className="text-xl text-gray-300 font-light">
              Experience cutting-edge technology through our curated marketplace
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center group">
              <div className="w-20 h-20 bg-white/10 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:bg-white/20 transition-all duration-300">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-medium text-white mb-3">Lightning Fast</h3>
              <p className="text-gray-400 text-sm leading-relaxed">Quick transactions powered by Pi Network</p>
            </div>

            <div className="text-center group">
              <div className="w-20 h-20 bg-white/10 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:bg-white/20 transition-all duration-300">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-medium text-white mb-3">Verified Products</h3>
              <p className="text-gray-400 text-sm leading-relaxed">All gadgets are authenticated and quality-checked</p>
            </div>

            <div className="text-center group">
              <div className="w-20 h-20 bg-white/10 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:bg-white/20 transition-all duration-300">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-medium text-white mb-3">Community Driven</h3>
              <p className="text-gray-400 text-sm leading-relaxed">Built by and for the Pi Network community</p>
            </div>

            <div className="text-center group">
              <div className="w-20 h-20 bg-white/10 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:bg-white/20 transition-all duration-300">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-xl font-medium text-white mb-3">Secure & Private</h3>
              <p className="text-gray-400 text-sm leading-relaxed">Your data and transactions are protected</p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 sm:py-32 bg-white text-black">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-4xl sm:text-5xl font-light text-black mb-6 tracking-tight">
              Ready to Get Started?
            </h2>
            <p className="text-xl text-gray-600 mb-12 font-light">
              Join tech enthusiasts on GT Store
            </p>
            <div className="transform hover:-translate-y-1 transition-all duration-300">
              <PiLoginButton className="inline-flex items-center justify-center px-12 py-4 bg-black text-white font-medium rounded-2xl hover:bg-gray-800 focus:outline-none focus:ring-4 focus:ring-black/20 transition-all duration-300" />
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
