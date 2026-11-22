import type { Metadata } from "next";
import ErrorScreen from "@/components/error-screen";

export const metadata: Metadata = {
  title: "Akses ditolak · Jitu",
  robots: { index: false },
};

export default async function AccessDeniedPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  return <ErrorScreen variant={status === "403" ? "forbidden" : "unauthorized"} />;
}
