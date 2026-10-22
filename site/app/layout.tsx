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
  title: "EV Battery Intelligence — Nayeem Faisal",
  description: "A futuristic, LLM-ready thesis wiki mapping open battery datasets with research potential for global EV and battery teams.",
  openGraph: {
    title: "EV Battery Intelligence — Nayeem Faisal",
    description: "Open battery evidence for the electric future.",
    type: "website",
    url: "/",
    images: ["https://raw.githubusercontent.com/Nayeemfaisal/thesis-nayeem-faisal/main/site/public/og.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "EV Battery Intelligence — Nayeem Faisal",
    description: "Open battery evidence for the electric future.",
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
