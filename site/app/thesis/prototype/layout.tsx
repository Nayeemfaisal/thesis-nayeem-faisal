import type { Metadata } from "next";
import "./prototype.css";

export const metadata: Metadata = {
  title: "Batterie-RUL-Labor – Batterieanalyse von Nayeem Faisal",
  description:
    "Lithium-Ionen-Batteriezyklusdaten lokal im Browser analysieren: RUL-Schätzung, Eingabequalität, Degradationsverlauf und Wartungshinweise.",
};

export default function PrototypeLayout({ children }: { children: React.ReactNode }) {
  return children;
}
