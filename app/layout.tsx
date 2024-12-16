import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
import {
  ClerkProvider,
  SignInButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";
import NavBar from "@/components/NavBar";
import { Toaster } from "@/components/ui/toaster"

export const metadata: Metadata = {
  title: "Hallucinations Detector Tool",
  description: "Detect Hallucinations in Your Content Instantly for Free.",
  metadataBase: new URL("https://demo.exa.ai/hallucination-detector"),

  // Favicon
  icons: {
    icon: "/favicon1.ico",
    shortcut: "/favicon1.ico",
    apple: "/favicon1.ico",
  },

  // Open Graph
  openGraph: {
    title: "Hallucinations Detector Tool",
    description: "Detect Hallucinations in Your Content Instantly for Free.",
    url: "https://demo.exa.ai/hallucination-detector",
    siteName: "Hallucinations Detector Tool",
    images: [
      {
        url: "/opengraph-image.jpg",
        width: 1200,
        height: 630,
        alt: "Hallucinations Detector Tool",
      },
    ],
    locale: "en_US",
    type: "website",
  },

  // Twitter
  twitter: {
    card: "summary_large_image",
    title: "Hallucinations Detector Tool",
    description: "Detect Hallucinations in Your Content Instantly for Free.",
    images: ["https://demo.exa.ai/hallucination-detector/opengraph-image.jpg"],
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
          <main className="flex relative min-h-screen flex-col items-center justify-center md:p-4 pt-16">
            {children}
          </main>
          <Toaster />
          <Analytics />
        </body>
      </html>
    </ClerkProvider>
  );
}
