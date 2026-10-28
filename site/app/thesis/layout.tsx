import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Lithium-Ion Battery RUL Prediction — Nayeem Faisal’s Thesis",
  description: "Nayeem Faisal’s independently researched and written bachelor’s thesis evaluating machine-learning models for lithium-ion battery remaining useful life prediction.",
  openGraph: { title: "Lithium-Ion Battery RUL Prediction — Nayeem Faisal", description: "Development and evaluation of machine-learning models for lithium-ion battery remaining useful life prediction.", url: "/thesis", images: ["/og.png"] },
  twitter: { card: "summary_large_image", title: "Lithium-Ion Battery RUL Prediction — Nayeem Faisal", description: "Development and evaluation of machine-learning models for lithium-ion battery remaining useful life prediction.", images: ["/og.png"] },
};

export default function ThesisLayout({ children }: { children: React.ReactNode }) { return children; }
