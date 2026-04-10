import type { Metadata } from "next";
import localFont from "next/font/local";
import { Inter, Cormorant_Garamond } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-heading",
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "CASA — Real Estate Intelligence",
  description: "AI-powered real estate portfolio management platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${cormorant.variable} ${geistMono.variable} antialiased min-h-screen`}
        style={{ fontFamily: "var(--font-inter)", color: "#1A1A1A", backgroundColor: "#FFFFFF" }}
      >
        {children}
      </body>
    </html>
  );
}
