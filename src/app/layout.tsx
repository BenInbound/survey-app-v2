import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Stork Diagnosis Tool',
  description: 'Strategic diagnosis survey tool for organizational insights',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="font-sans">
        <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
          {children}
        </main>
      </body>
    </html>
  )
}