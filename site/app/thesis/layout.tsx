import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Lithium-Ion Battery RUL Prediction — Nayeem Faisal’s Thesis",
  description: "Read Nayeem Faisal’s independently researched and written bachelor’s thesis in an interactive hardcover-style reader.",
  openGraph: { title: "Lithium-Ion Battery RUL Prediction — Nayeem Faisal", description: "Explore the battery research and read the final thesis in an interactive hardcover-style reader.", url: "/thesis", images: ["/og.png"] },
  twitter: { card: "summary_large_image", title: "Lithium-Ion Battery RUL Prediction — Nayeem Faisal", description: "Explore the battery research and read the final thesis in an interactive hardcover-style reader.", images: ["/og.png"] },
};

export default function ThesisLayout({ children }: { children: React.ReactNode }) { return children; }
