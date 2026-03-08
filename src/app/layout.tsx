import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: 'GitHub Wrapped',
  description: 'Interactive visualization of your GitHub activity using physics-based universe',
  keywords: ['github', 'visualization', 'physics', 'nextjs', 'typescript', 'canvas'],
  authors: [{ name: 'GitHub Wrapped Team' }],
  openGraph: {
    title: 'GitHub Wrapped',
    description: 'Interactive visualization of your GitHub activity using physics-based universe',
    type: 'website',
    locale: 'en_US',
    siteName: 'GitHub Wrapped'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GitHub Wrapped',
    description: 'Interactive visualization of your GitHub activity using physics-based universe'
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true
    }
  }
}

export default function RootLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className={`${inter.className} antialiased`}>
        <div className="min-h-screen bg-background text-foreground">
          {children}
        </div>
      </body>
    </html>
  )
}