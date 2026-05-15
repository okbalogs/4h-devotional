import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ShellWrapper from "@/components/ShellWrapper";
import { AuthProvider } from "@/context/AuthContext";
import PwaRegistration from "@/components/PwaRegistration";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
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
      className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>
      <body>
        <AuthProvider>
          <PwaRegistration />
          <ShellWrapper>{children}</ShellWrapper>
        </AuthProvider>
      </body>
    </html>
  );
}
