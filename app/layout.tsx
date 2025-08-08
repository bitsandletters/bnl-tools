import type { Metadata } from "next";
import "./globals.css";
import "./theme.css";
import Navigation from "@/components/Navigation";

export const metadata: Metadata = {
  title: "Bits & Letters Tools",
  description: "Professional design tools for color scales, typography, and spacing",
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
