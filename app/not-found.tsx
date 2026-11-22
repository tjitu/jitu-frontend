import type { Metadata } from "next";
import ErrorScreen from "@/components/error-screen";

export const metadata: Metadata = {
  title: "Halaman tidak ditemukan · Jitu",
  robots: { index: false },
};

export default function NotFound() {
  return <ErrorScreen variant="not-found" />;
}
