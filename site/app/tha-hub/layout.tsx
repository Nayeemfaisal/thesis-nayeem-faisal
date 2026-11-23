import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "THA Q&A Hub — Nayeem Faisal",
  description: "Interaktiver Prototyp für Fragen von Studierenden, geprüfte Hochschulantworten und kontrollierte Veröffentlichung.",
  openGraph: {
    title: "THA Q&A Hub – Interaktiver Prototyp",
    description: "Ein funktionsfähiges Softwarekonzept zur Unterstützung von Studierenden von Nayeem Faisal.",
    url: "/tha-hub",
    images: [],
  },
  twitter: {
    card: "summary",
    title: "THA Q&A Hub – Interaktiver Prototyp",
    description: "Ein funktionsfähiges Softwarekonzept zur Unterstützung von Studierenden von Nayeem Faisal.",
    images: [],
  },
};

export default function ThaHubLayout({ children }: { children: React.ReactNode }) {
  return children;
}
