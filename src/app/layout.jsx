import { Geist, Geist_Mono, Playfair_Display } from "next/font/google";
import "./globals.css";
import ShellWrapper from "@/components/ShellWrapper";
import { AuthProvider } from "@/context/AuthContext";
import PwaRegistration from "@/components/PwaRegistration";
import InstallPopup from "@/components/InstallPopup";
import ChangelogModal from "@/components/ChangelogModal";
import { ThemeProvider } from "@/components/ThemeProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://4h-devotional.vercel.app'),
  title: {
    template: '%s | Editorial Devotion',
    default: 'Editorial Devotion — Your 4H Quiet Time Sanctuary',
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
  authors: [{ name: "Editorial Devotion Team" }],
  verification: {
    google: 'Ykcg3U3qh9erCb9MXomRUBaPeGXaz7zIPXWlqyrScnw',
  },
  openGraph: {
    title: 'Editorial Devotion — Your 4H Quiet Time Sanctuary',
    description: 'Engage with God through the ECWA 4H framework: Head, Heart, Hand, Help. A digital sanctuary for your daily selah.',
    url: '/',
    siteName: 'Editorial Devotion',
    images: [
      {
        url: '/icons/icon-512.png',
        width: 512,
        height: 512,
        alt: 'Editorial Devotion Logo',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Editorial Devotion — Your 4H Quiet Time Sanctuary',
    description: 'Engage with God through the ECWA 4H framework: Head, Heart, Hand, Help. A digital sanctuary for your daily selah.',
    images: ['/icons/icon-512.png'],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Editorial Devotion",
  },
};

export const viewport = {
  themeColor: "#9d4f14",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${playfair.variable} antialiased`}>
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
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
