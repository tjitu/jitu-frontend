import type { Metadata } from "next";
import LatihanModule from "@/modules/LatihanModule";

export const metadata: Metadata = {
  title: "Sandbox Preview QC · Jitu",
  description:
    "Pratinjau tampilan soal dan pembahasan interaktif untuk antrean Quality Control (QC_SANDBOX).",
};

export default function SandboxPage() {
  return <LatihanModule forceSandboxMode />;
}
