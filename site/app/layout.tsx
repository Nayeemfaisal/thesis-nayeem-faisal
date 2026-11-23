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
  title: "Nayeem Faisal – Daten, Intelligenz und Ideen",
  description: "Portfolio von Nayeem Faisal, Student der Internationalen Wirtschaftsinformatik mit Schwerpunkten in Softwareentwicklung, Datenengineering, künstlicher Intelligenz und Forschung.",
  openGraph: {
    title: "Nayeem Faisal – Daten, Intelligenz und Ideen verbinden.",
    description: "Softwareentwicklung, Datenengineering, künstliche Intelligenz und Forschung.",
    type: "website",
    url: "/",
    images: [{ url: "/og.jpg", width: 1200, height: 630, alt: "Nayeem Faisal – Daten, Intelligenz und Systeme" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Nayeem Faisal – Daten, Intelligenz und Ideen verbinden.",
    description: "Softwareentwicklung, Datenengineering, künstliche Intelligenz und Forschung.",
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
    <html lang="de">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
