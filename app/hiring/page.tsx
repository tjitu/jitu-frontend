import type { Metadata } from "next";
import HiringModule from "@/modules/HiringModule";

export const metadata: Metadata = {
  title: "JITU Open Hiring 2026 · Build Something That Pays Off",
  description:
    "Early-Stage EdTech Startup | Part-Time | Remote. What if your organizational experience actually paid off? Apply for 8 open positions across Technology, Product & Operations, and Marketing & Growth.",
};

export default function HiringPage() {
  return <HiringModule />;
}
