import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Lithium Battery Energy Forecasting — Nayeem Faisal’s Thesis",
  description: "Nayeem Faisal’s independently researched and written bachelor’s thesis on lithium battery remaining useful life, synthetic data, LSTM and XGBoost.",
  openGraph: { title: "Lithium Battery Energy Forecasting — Nayeem Faisal", description: "A revolution in battery research, independently written and developed by Nayeem Faisal.", url: "/thesis", images: ["/og.png"] },
  twitter: { card: "summary_large_image", title: "Lithium Battery Energy Forecasting — Nayeem Faisal", description: "A revolution in battery research, independently written and developed by Nayeem Faisal.", images: ["/og.png"] },
};

export default function ThesisLayout({ children }: { children: React.ReactNode }) { return children; }
