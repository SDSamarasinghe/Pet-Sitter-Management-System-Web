import type { Metadata } from "next";
import { Toaster } from "@/components/ui/toaster";
import { NavigationProvider } from "@/components/providers/NavigationProvider";
import CentralizedHeader from "@/components/CentralizedHeader";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pet-Sitting System",
  description: "Professional in-home pet care services in Toronto",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background font-sans antialiased">
        <NavigationProvider>
          <CentralizedHeader />
          <main className="min-h-screen">
            {children}
          </main>
          <Toaster />
        </NavigationProvider>
      </body>
    </html>
  );
}
