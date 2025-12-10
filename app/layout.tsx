import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "../components/ThemeProvider";
import Sidebar from "../components/Sidebar";
import BottomNav from "../components/BottomNav";

const inter = Inter({
  subsets: ["latin"],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: "Vital",
  description: "Track your life's essentials.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Vital",
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

import ConvexClientProvider from "../components/ConvexClientProvider";
import { ToastProvider } from "../components/ui/ToastContext";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} font-sans antialiased`}
        suppressHydrationWarning
      >
        <ConvexClientProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <ToastProvider>
              <div className="flex h-screen bg-background">
                <Sidebar />
                <main className="flex-1 overflow-y-auto pb-20 sm:pb-0">
                  {children}
                </main>
                <BottomNav />
              </div>
            </ToastProvider>
          </ThemeProvider>
        </ConvexClientProvider>
      </body>
    </html>
  );
}
