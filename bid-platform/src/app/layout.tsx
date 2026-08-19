import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'BID Trust — Business Identity & Due Diligence',
  description: 'Verify the businesses and people your organization does business with.',
  icons: { icon: '/icon.svg' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
