import type { Metadata } from "next";
import PracticeHistoryDetail from "@/modules/LatihanModule/PracticeHistoryDetail";

export const metadata: Metadata = {
  title: "Pembahasan Soal Latihan · Jitu",
};

export default async function PracticeHistoryDetailPage({
  params,
}: {
  params: Promise<{ attemptId: string }>;
}) {
  const { attemptId } = await params;
  return <PracticeHistoryDetail attemptId={attemptId} />;
}
