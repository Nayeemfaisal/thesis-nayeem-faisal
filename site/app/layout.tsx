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
  metadataBase: new URL("https://nayeem-battery-thesis-wiki.earlyelm32.chatgpt.site"),
  title: "Nayeem Faisal — Battery Thesis Wiki",
  description: "An LLM-ready knowledge base mapping open battery datasets for health estimation, degradation, safety and reproducible modelling.",
  openGraph: {
    title: "Battery Thesis Wiki — Nayeem Faisal",
    description: "Open battery intelligence for reproducible thesis research.",
    type: "website",
    url: "/",
    images: ["https://raw.githubusercontent.com/Nayeemfaisal/thesis-nayeem-faisal/main/site/public/og.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Battery Thesis Wiki — Nayeem Faisal",
    description: "Open battery intelligence for reproducible thesis research.",
    images: ["https://raw.githubusercontent.com/Nayeemfaisal/thesis-nayeem-faisal/main/site/public/og.png"],
  },
  icons: {
    icon: "/nayeem-faisal.png",
    shortcut: "/nayeem-faisal.png",
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
