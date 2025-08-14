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
        <head>
          <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        </head>
        <body className="h-screen bg-gray-50 font-sans antialiased overflow-hidden">
          <NavigationProvider>
            <div className="h-screen flex flex-col">
              <CentralizedHeader />
              <main className="flex-1 overflow-auto bg-gray-50">
                <div className="min-h-full w-full">
                  {children}
                </div>
              </main>
            </div>
            <Toaster />
          </NavigationProvider>
        </body>
      </html>
  );
}
