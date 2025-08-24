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
      <body className="font-sans bg-custom-gray" suppressHydrationWarning={true}>
        <main className="min-h-screen">
          {children}
        </main>
      </body>
    </html>
  )
}