// pages/_app.js
import '@/styles/globals.css'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import AuthGuard from '@/components/AuthGuard'
import Script from 'next/script'
import { PiNetworkProvider } from '../contexts/PiNetworkContext'

export default function App({ Component, pageProps, router }) {
  const hideChrome = Component?.hideChrome === true
  const isLandingPage = router.pathname === '/'
  
  // Pages that don't require authentication
  const publicPages = ['/', '/help', '/safety', '/terms']
  const isPublicPage = publicPages.includes(router.pathname)

  // Hide header and footer completely on landing page
  const shouldHideChrome = hideChrome || isLandingPage

  return (
    <PiNetworkProvider>
      <div className="min-h-screen flex flex-col">
        <Script src="https://sdk.minepi.com/pi-sdk.js" strategy="beforeInteractive" />
        {!shouldHideChrome && <Header />}
        <main className={shouldHideChrome ? '' : 'flex-1'}>
          {isPublicPage ? (
            <Component {...pageProps} />
          ) : (
            <AuthGuard>
              <Component {...pageProps} />
            </AuthGuard>
          )}
        </main>
        {!shouldHideChrome && <Footer />}
      </div>
    </PiNetworkProvider>
  )
}
