// // app/layout.tsx
// import type { Metadata } from 'next';
// import { Inter } from 'next/font/google';
// import './globals.css';

// const inter = Inter({ subsets: ['latin'] });

// export const metadata: Metadata = {
//   title: 'Problem List - CodeFlip Clone',
//   description: 'A CodeFlip clone built with Next.js',
// };

// export default function RootLayout({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   return (
//     <html lang="en" className="dark">
//       <head>
//         {/* Material Icons */}
//         <link
//           href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
//           rel="stylesheet"
//         />
//       </head>
//       <body className={`${inter.className} antialiased selection:bg-primary/30`}>
//         {children}
//       </body>
//     </html>
//   );
// }

// app/layout.tsx
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

export const metadata: Metadata = {
  title: 'CodeFlip - Master Your Coding Skills',
  description: 'A competitive coding platform for developers.',
  openGraph: {
    title: 'CodeFlip - Master Your Coding Skills',
    description: 'A competitive coding platform for developers.',
    url: 'https://www.codeflip.co.in', // Replace with your actual domain
    siteName: 'CodeFlip',
    images: [
      {
        url: 'https://www.codeflip.co.in/og-image.png', // Replace with actual OG image URL
        width: 1200,
        height: 630,
        alt: 'CodeFlip - Competitive Coding Platform',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
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
