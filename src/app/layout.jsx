import { Playfair_Display, Outfit } from "next/font/google";
import "./globals.css";
import ShellWrapper from "@/components/ShellWrapper";
import { AuthProvider } from "@/context/AuthContext";
import PwaRegistration from "@/components/PwaRegistration";
import InstallPopup from "@/components/InstallPopup";
import ChangelogModal from "@/components/ChangelogModal";
import { ThemeProvider } from "@/components/ThemeProvider";

const outfit = Outfit({
  variable: "--font-kalam", // keeping the variable name mapping
  subsets: ["latin"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-caveat", // keeping the variable name mapping
  subsets: ["latin"],
  display: "swap",
});

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://4h-devotional.vercel.app'),
  applicationName: '4H Devotional',
  title: {
    template: '%s | 4H Devotional',
    default: '4H Devotional — Your Quiet Time Sanctuary',
  },
  description:
    "Engage with God through the ECWA 4H framework: Head, Heart, Hand, Help. A digital sanctuary for your daily selah.",
  keywords: [
    "ECWA",
    "Quiet Time",
    "4H Framework",
    "Daily Devotion",
    "Selah",
    "Head Heart Hand Help",
    "Christian Journal",
    "Bible Study Nigeria",
    "Devotional Tracker",
  ],
  authors: [{ name: "4H Devotional Team" }],
  verification: {
    google: 'Ykcg3U3qh9erCb9MXomRUBaPeGXaz7zIPXWlqyrScnw',
    other: {
      'msvalidate.01': '1FEA02B66374EDE7B489A87F535D4982',
    },
  },
  openGraph: {
    title: '4H Devotional — Your Quiet Time Sanctuary',
    description: 'Engage with God through the ECWA 4H framework: Head, Heart, Hand, Help. A digital sanctuary for your daily selah.',
    url: '/',
    siteName: '4H Devotional',
    images: [
      {
        url: '/icons/icon-512.png',
        width: 512,
        height: 512,
        alt: '4H Devotional Logo',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: '4H Devotional — Your Quiet Time Sanctuary',
    description: 'Engage with God through the ECWA 4H framework: Head, Heart, Hand, Help. A digital sanctuary for your daily selah.',
    images: ['/icons/icon-512.png'],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "4H Devotional",
  },
  icons: {
    icon: '/icons/icon-192.png',
    shortcut: '/icons/icon-192.png',
    apple: '/icons/icon-192.png',
    other: {
      rel: 'apple-touch-icon-precomposed',
      url: '/icons/icon-192.png',
    },
  },
};

export const viewport = {
  themeColor: "var(--clr-primary)",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${outfit.variable} ${playfair.variable} antialiased`}>
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "4H Devotional",
              "alternateName": "4H Devotion Tracker",
              "url": "https://4h-devotional.vercel.app/"
            })
          }}
        />
        {/* Prevent flash of wrong theme on load */}
        <script dangerouslySetInnerHTML={{ __html: `(function(){var t=localStorage.getItem('theme')||'light';document.documentElement.setAttribute('data-theme',t)})()` }} />
      </head>
      <body>
        <AuthProvider>
          <ThemeProvider>
            <PwaRegistration />
            <InstallPopup />
            <ChangelogModal />
            <ShellWrapper>{children}</ShellWrapper>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
