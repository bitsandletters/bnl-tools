import type { Metadata } from "next";
import "./globals.css";
import "./theme.css";
import Navigation from "@/components/Navigation";

export const metadata: Metadata = {
  title: "Bits&Letters Color Tool",
  description: "Professional color scale generator for creating consistent, accessible color systems",
  icons: {
    icon: '/favicon.svg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <Navigation />
        <main>
          {children}
        </main>
      </body>
    </html>
  );
}
