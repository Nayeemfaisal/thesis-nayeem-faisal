import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://nayeemfaisal.com"),
  title: "Nayeem Faisal — Data, Intelligence & Ideas",
  description: "Portfolio of Nayeem Faisal, an International Information Systems student exploring software development, data engineering, artificial intelligence and research.",
  openGraph: {
    title: "Nayeem Faisal — Connecting data, intelligence, and ideas.",
    description: "Software development, data engineering, artificial intelligence and research.",
    type: "website",
    url: "/",
    images: [{ url: "/og.jpg", width: 1200, height: 630, alt: "Nayeem Faisal — data, intelligence, and systems" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Nayeem Faisal — Connecting data, intelligence, and ideas.",
    description: "Software development, data engineering, artificial intelligence and research.",
    images: ["/og.jpg"],
  },
  icons: {
    icon: "/nayeem-logo.png",
    shortcut: "/nayeem-logo.png",
    apple: "/nayeem-logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
