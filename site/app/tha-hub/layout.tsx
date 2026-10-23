import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "THA Q&A Hub — Nayeem Faisal",
  description: "Interactive prototype for student questions, verified university answers and professor-reviewed publishing.",
  openGraph: {
    title: "THA Q&A Hub — Interactive Prototype",
    description: "A working student-support software concept by Nayeem Faisal.",
    url: "/tha-hub",
    images: [],
  },
  twitter: {
    card: "summary",
    title: "THA Q&A Hub — Interactive Prototype",
    description: "A working student-support software concept by Nayeem Faisal.",
    images: [],
  },
};

export default function ThaHubLayout({ children }: { children: React.ReactNode }) {
  return children;
}
