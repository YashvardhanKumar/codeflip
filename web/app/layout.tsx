import type { Metadata } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/components/auth-provider'
import { Toaster } from 'sonner'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains',
})

const siteUrl = 'https://www.codeflip.co.in'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'CodeFlip - Master Your Coding Skills & Algorithm Contests',
    template: '%s | CodeFlip',
  },
  description:
    'CodeFlip is where developers sharpen their algorithmic skills, compete in real-time coding contests, and master data structures and algorithms.',
  keywords: [
    'CodeFlip',
    'competitive programming',
    'coding platform',
    'algorithm practice',
    'data structures',
    'coding interview prep',
    'online judge',
    'coding contests',
    'code race',
    'leetcode alternative',
  ],
  authors: [{ name: 'CodeFlip Team', url: siteUrl }],
  creator: 'CodeFlip',
  publisher: 'CodeFlip',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: siteUrl,
  },
  openGraph: {
    title: 'CodeFlip - Master Your Coding Skills & Algorithm Contests',
    description:
      'Practice coding problems, compete in real-time developer races, and master data structures and algorithms on CodeFlip.',
    url: siteUrl,
    siteName: 'CodeFlip',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'CodeFlip - Competitive Coding Platform',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CodeFlip - Master Your Coding Skills & Algorithm Contests',
    description:
      'Sharpen your coding skills, compete in real-time developer races, and climb the leaderboard on CodeFlip.',
    images: ['/og-image.png'],
  },
  icons: {
    icon: '/icon.svg',
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      '@id': `${siteUrl}/#website`,
      url: siteUrl,
      name: 'CodeFlip',
      description:
        'Competitive coding platform, live developer contests, and algorithmic problem solving.',
      publisher: {
        '@type': 'Organization',
        name: 'CodeFlip',
        url: siteUrl,
        logo: {
          '@type': 'ImageObject',
          url: `${siteUrl}/logo.svg`,
        },
      },
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: `${siteUrl}/problems?search={search_term_string}`,
        },
        'query-input': 'required name=search_term_string',
      },
    },
    {
      '@type': 'WebApplication',
      '@id': `${siteUrl}/#application`,
      name: 'CodeFlip',
      applicationCategory: 'DeveloperApplication',
      operatingSystem: 'All',
      url: siteUrl,
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
      },
    },
  ],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <head>
        {/* Material Icons */}
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <style
          dangerouslySetInnerHTML={{
            __html: `
          mjx-container {
            display: inline-block !important;
            margin: 0 0.15em !important;
            vertical-align: -0.125em !important;
            max-width: 100%;
          }
          mjx-container svg {
            display: inline !important;
            margin: 0 !important;
          }
          mjx-container[display="true"] {
            display: block !important;
            text-align: center !important;
            margin: 1rem 0 !important;
          }
          mjx-container[display="true"] svg {
            display: inline-block !important;
          }
        `,
          }}
        />
      </head>
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} font-display antialiased selection:bg-primary/30 bg-background-light dark:bg-background-dark text-slate-900 dark:text-white`}
      >
        <AuthProvider>
          {children}
          <Toaster position="top-center" richColors />
        </AuthProvider>
      </body>
    </html>
  )
}
