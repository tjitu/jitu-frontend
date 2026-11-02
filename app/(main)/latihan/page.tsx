import LatihanModule from "@/modules/LatihanModule";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Latihan Soal SNBT & UTBK · Jitu",
  description:
    "Latihan soal SNBT adaptif per subtes dengan Interactive Solution Deck, trik cepat, dan rumus kunci.",
};

export default function LatihanPage() {
  return <LatihanModule />;
}

