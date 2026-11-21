import type { Metadata } from "next";
import "./prototype.css";

export const metadata: Metadata = {
  title: "Battery RUL Lab — Nayeem Faisal",
  description:
    "Upload lithium-ion battery cycle data and explore browser-based remaining-useful-life estimates, input quality, degradation trends, and maintenance guidance.",
};

export default function PrototypeLayout({ children }: { children: React.ReactNode }) {
  return children;
}
