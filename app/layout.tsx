import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Toaster } from "sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: "Whiskarz - Professional Pet Sitting Services",
  description: "Toronto's most trusted in-home pet care service. Professional, experienced, and insured pet sitters who will love your pets like their own.",
  keywords: "pet sitting, dog walking, cat care, pet care Toronto, professional pet sitters",
  authors: [{ name: "Whiskarz Team" }],
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
      <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
        <head>
          <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        </head>
        <body className="min-h-screen bg-background font-sans text-foreground antialiased">
          {children}
          <Toaster richColors position="top-right" />
        </body>
      </html>
  );
}
