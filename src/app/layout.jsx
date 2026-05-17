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
  title: "Editorial Devotion — Your 4H Quiet Time Sanctuary",
  description:
    "Engage with God through the ECWA 4H framework: Hear, Heart, Head, Help. A digital sanctuary for your daily selah.",
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
  maximumScale: 1,
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
