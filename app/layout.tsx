import type { Metadata } from 'next'
import { inter, oswald } from '@/lib/fonts'
import { Toaster } from '@/components/ui/toaster'
import { ServiceWorkerRegister } from '@/components/pwa/service-worker-register'
import { InstallPrompt } from '@/components/pwa/install-prompt'
import './globals.css'

export const metadata: Metadata = {
  title: 'Glutton4Games - Military Fitness Training',
  description: 'A tactical approach to fitness. Complete missions, earn ranks, dominate your goals.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'G4G',
  },
}

export const viewport = {
  themeColor: '#0a0a0a',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} ${oswald.variable} font-sans antialiased`}>
        <ServiceWorkerRegister />
        <InstallPrompt />
        {children}
        <Toaster />
      </body>
    </html>
  )
}
