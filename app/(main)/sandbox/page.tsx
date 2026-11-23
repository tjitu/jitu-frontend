import type { Metadata } from "next";
import LatihanModule from "@/modules/LatihanModule";
import { SandboxTestTryouts } from "@/components/sandbox/SandboxTestTryouts";

export const metadata: Metadata = {
  title: "Sandbox Preview QC · Jitu",
  description:
    "Pratinjau tampilan soal dan pembahasan interaktif untuk antrean Quality Control (QC_SANDBOX).",
};

export default function SandboxPage() {
  return <><SandboxTestTryouts /><LatihanModule forceSandboxMode /></>;
}
