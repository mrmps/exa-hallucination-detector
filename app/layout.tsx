import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
import {
  ClerkProvider,
} from "@clerk/nextjs";
import NavBar from "@/components/NavBar";
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: "FactFilter - Find Accurate Facts in Minutes",
  description: "Get facts faster. Create content, add claims and quickly verify thousands of well-researched sources from around the web.",
  metadataBase: new URL("https://factfilter.co"),

  // Favicon
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico", 
    apple: "/favicon.ico",
  },

  // Open Graph
  openGraph: {
    title: "FactFilter - Find Accurate Facts in Minutes",
    description: "Get facts faster. Create content, add claims and quickly verify thousands of well-researched sources from around the web.",
    url: "https://factfilter.co",
    siteName: "FactFilter",
    images: [
      {
        url: "/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: "FactFilter - AI-Powered Fact Checking",
      },
    ],
    locale: "en_US",
    type: "website",
  },

  // Twitter
  twitter: {
    card: "summary_large_image",
    title: "FactFilter - Find Accurate Facts in Minutes",
    description: "Get facts faster. Create content, add claims and quickly verify thousands of well-researched sources from around the web.",
    images: ["https://factfilter.co/opengraph-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" className="bg-gradient-to-b from-[#FDFBF9] to-[#F9F7F5]">
        <body className={GeistSans.className}>
          <NavBar />
          <main>
            {children}
          </main>
          <Toaster />
          <Analytics />
        </body>
      </html>
    </ClerkProvider>
  );
}
