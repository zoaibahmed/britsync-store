import type { Metadata } from "next";
import { Inter, Outfit, Playfair_Display, Cormorant_Garamond } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CookieBanner from "@/components/CookieBanner";
import ToastContainer from "@/components/ToastContainer";
import ChatAssistant from "@/components/ChatAssistant";
import TransitionProvider from "@/components/TransitionProvider";
import CustomCursor from "@/components/CustomCursor";
import SmoothScroll from "@/components/SmoothScroll";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit", display: "swap" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair", display: "swap" });
const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-cormorant",
  display: "swap",
  weight: ["300", "400", "600"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "Britsync Market",
  description: "A premium global managed commerce ecosystem connecting you with authentic makers.",
};

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Britsync Marketplace",
  "url": "https://britsync.com",
  "logo": "https://britsync.com/logo.svg",
  "description": "A premium global managed commerce ecosystem connecting discerning patrons with authentic makers.",
  "sameAs": [
    "https://twitter.com/britsync",
    "https://instagram.com/britsync"
  ]
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable} ${playfair.variable} ${cormorant.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
      </head>
      <body style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <SmoothScroll>
          <CustomCursor />
          <Navbar />
          <TransitionProvider>
            {children}
          </TransitionProvider>
          <CookieBanner />
          <ToastContainer />
          <ChatAssistant />
          <Footer />
        </SmoothScroll>
      </body>
    </html>
  );
}
