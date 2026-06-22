import type { Metadata } from "next";
import PricingModule from "@/modules/PricingModule";

export const metadata: Metadata = {
  title: "Pricing Bimbel & Tryout | JituPTN",
  description:
    "Pilih paket Bimbel dan Tryout Online JituPTN untuk persiapan UTBK SNBT.",
};

export default function PricingPage() {
  return <PricingModule />;
}
