import { SubtestBreak } from "@/modules/TryoutExamModule/break/SubtestBreak";

interface BreakPageProps {
  params: Promise<{ id: string; subtestId: string }>;
  searchParams: Promise<{ attemptId?: string; expired?: string }>;
}

export default async function BreakPage({ params, searchParams }: BreakPageProps) {
  const [{ id, subtestId }, { attemptId = "", expired }] = await Promise.all([params, searchParams]);
  return (
    <SubtestBreak
      key={JSON.stringify([id, attemptId, subtestId, expired])}
      tryoutId={id}
      attemptId={attemptId}
      order={Number(subtestId)}
      expiredLink={expired === "true"}
    />
  );
}
