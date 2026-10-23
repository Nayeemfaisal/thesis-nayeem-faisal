import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "EV Battery Intelligence — Thesis Wiki",
  description: "Nayeem Faisal’s interactive catalogue of open battery datasets for health, ageing, safety and reproducible modelling.",
  openGraph: { title: "EV Battery Intelligence — Thesis Wiki", description: "Interactive open-battery research catalogue by Nayeem Faisal.", url: "/thesis", images: [] },
  twitter: { card: "summary", title: "EV Battery Intelligence — Thesis Wiki", description: "Interactive open-battery research catalogue by Nayeem Faisal.", images: [] },
};

export default function ThesisLayout({ children }: { children: React.ReactNode }) { return children; }
