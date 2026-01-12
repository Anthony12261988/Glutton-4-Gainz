import type { Metadata } from "next";
import { inter, oswald } from "@/lib/fonts";
import { Toaster } from "@/components/ui/toaster";
import { ServiceWorkerRegister } from "@/components/pwa/service-worker-register";
import { InstallPrompt } from "@/components/pwa/install-prompt";
import { AuthProvider } from "@/lib/auth/auth-context";
import "./globals.css";

export const metadata: Metadata = {
  title: "Glutton4Gainz - Military Fitness Training",
  description:
    "A tactical approach to fitness. Complete missions, earn ranks, dominate your goals.",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: [
      { url: '/icons/icon-152x152.png', sizes: '152x152', type: 'image/png' },
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "G4G",
  },
  openGraph: {
    title: "Glutton4Gainz – Your Mission Starts Now",
    description: "Join the elite tactical fitness platform that treats every workout like a mandatory mission.",
    url: "https://glutton4gainz.com",
    siteName: "Glutton4Gainz",
    images: [
      {
        url: '/social/og-image.jpg',
        width: 820,
        height: 360,
        alt: 'Glutton4Gainz - Military Fitness Training',
      },
    ],
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Glutton4Gainz – Your Mission Starts Now",
    description: "Join the elite tactical fitness platform that treats every workout like a mandatory mission.",
    images: ['/social/twitter-image.jpg'],
  },
};

export const viewport = {
  themeColor: "#0a0a0a",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.variable} ${oswald.variable} font-sans antialiased`}
      >
        <AuthProvider>
          <ServiceWorkerRegister />
          <InstallPrompt />
          {children}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
