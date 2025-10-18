import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* Favicon */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon-16x16.png" sizes="16x16" type="image/png" />
        <link rel="icon" href="/favicon-32x32.png" sizes="32x32" type="image/png" />
        
        {/* Apple Touch Icon */}
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        
        {/* Android Chrome Icons */}
        <link rel="icon" href="/android-chrome-192x192.png" sizes="192x192" type="image/png" />
        <link rel="icon" href="/android-chrome-512x512.png" sizes="512x512" type="image/png" />
        
        {/* Web App Manifest */}
        <link rel="manifest" href="/site.webmanifest" />
        
        {/* Theme Color */}
        <meta name="theme-color" content="#ffffff" />
        <meta name="msapplication-TileColor" content="#ffffff" />
        
        {/* Additional Meta Tags */}
        <meta name="description" content="GT Store - Discover and buy gadgets with Pi cryptocurrency" />
        <meta name="keywords" content="gadgets, phones, laptops, pi cryptocurrency, marketplace" />
        <meta name="author" content="GT Store" />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content="GT Store" />
        <meta property="og:description" content="Discover and buy gadgets with Pi cryptocurrency" />
        <meta property="og:image" content="/gtstore.png" />
        
        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:title" content="GT Store" />
        <meta property="twitter:description" content="Discover and buy gadgets with Pi cryptocurrency" />
        <meta property="twitter:image" content="/gtstore.png" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
