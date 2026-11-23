import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "RUL-Prognose für Lithium-Ionen-Batterien – Thesis von Nayeem Faisal",
  description: "Erkunden Sie die Batterieforschung von Nayeem Faisal und lesen Sie die vollständige 87-seitige THA-Druckfassung in einem interaktiven Buchleser.",
  openGraph: { title: "RUL-Prognose für Lithium-Ionen-Batterien – Nayeem Faisal", description: "Batterieforschung erkunden und die vollständige THA-Druckfassung in einem interaktiven Buchleser lesen.", url: "/thesis", images: ["/og.png"] },
  twitter: { card: "summary_large_image", title: "RUL-Prognose für Lithium-Ionen-Batterien – Nayeem Faisal", description: "Batterieforschung erkunden und die vollständige THA-Druckfassung in einem interaktiven Buchleser lesen.", images: ["/og.png"] },
};

export default function ThesisLayout({ children }: { children: React.ReactNode }) { return children; }
