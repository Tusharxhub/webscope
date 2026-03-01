import type { Metadata } from "next";
import { Inter } from "next/font/google";
import SessionProvider from "@/components/SessionProvider";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "WebScope Pro — Web Scraper Dashboard",
  description: "Analyze any website in seconds. Scrape titles, headings, meta descriptions, and monitor request history in real time.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
