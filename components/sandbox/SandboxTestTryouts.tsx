"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { useSession } from "@/lib/auth-client";

type SandboxTryout = { id: string; title: string; solutionPrice: number };

export function SandboxTestTryouts() {
  const { data: session } = useSession();
  const [tryouts, setTryouts] = useState<SandboxTryout[]>([]);
  const [resetting, setResetting] = useState("");
  useEffect(() => {
    if (!session?.user?.id) { setTryouts([]); return; }
    let active = true;
    fetch("/api/sandbox/test-tryouts", { cache: "no-store" })
      .then((response) => response.ok ? response.json() : { tryouts: [] })
      .then((data: { tryouts: SandboxTryout[] }) => { if (active) setTryouts(data.tryouts); })
      .catch(() => { if (active) setTryouts([]); });
    return () => { active = false; };
  }, [session?.user?.id]);
  if (!tryouts.length) return null;

  async function reset(id: string) {
    if (!window.confirm("Reset jawaban, hasil, dan akses pembahasan tryout ini?")) return;
    setResetting(id);
    try {
      const response = await fetch("/api/sandbox/test-tryouts", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }),
      });
      const result: { message?: string } = await response.json();
      if (!response.ok) throw new Error(result.message || "Reset gagal.");
      toast.success(result.message || "Tryout direset.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Reset gagal.");
    } finally { setResetting(""); }
  }

  return <section className="mx-auto max-w-6xl px-4 pt-6">
    <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-blue-900">
      <h2 className="font-bold">Tryout uji sandbox</h2>
      <p className="mt-1 text-sm">Dua paket privat untuk menguji alur tryout. Reset menghapus pengerjaan dan akses pembahasan paket yang dipilih.</p>
      <div className="mt-3 flex flex-wrap gap-3">{tryouts.map((tryout) =>
        <div key={tryout.id} className="flex flex-wrap items-center gap-2 rounded-lg border border-blue-200 bg-white p-3 text-sm">
          <Link className="font-semibold underline" href={`/tryout/${tryout.id}`}>{tryout.title}</Link>
          <span>({tryout.solutionPrice} coin)</span>
          <button className="rounded border border-blue-300 px-2 py-1" disabled={Boolean(resetting)} onClick={() => void reset(tryout.id)}>{resetting === tryout.id ? "Mereset..." : "Reset"}</button>
        </div>)}</div>
    </div>
  </section>;
}
