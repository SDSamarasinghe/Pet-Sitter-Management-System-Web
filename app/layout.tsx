import type { Metadata } from "next";
import { Toaster } from "@/components/ui/toaster";
import { NavigationProvider } from "@/components/providers/NavigationProvider";
import { MainLayout } from "@/components/layout/MainLayout";
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
      <html lang="en" className="scroll-smooth">
        <head>
          <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
        </head>
        <body className="min-h-screen bg-background text-foreground antialiased">
          <NavigationProvider>
            <MainLayout>
              {children}
            </MainLayout>
            <Toaster />
          </NavigationProvider>
        </body>
      </html>
  );
}
