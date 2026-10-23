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
  title: "Nayeem Faisal — Systems, Research & Applied Intelligence",
  description: "The personal portfolio of Nayeem Faisal: education, software, applied experience and bachelor’s research.",
  openGraph: {
    title: "Nayeem Faisal — Systems, Research & Applied Intelligence",
    description: "Education, software, applied experience and bachelor’s research.",
    type: "website",
    url: "/",
    images: ["https://raw.githubusercontent.com/Nayeemfaisal/thesis-nayeem-faisal/main/site/public/og.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Nayeem Faisal — Systems, Research & Applied Intelligence",
    description: "Education, software, applied experience and bachelor’s research.",
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
