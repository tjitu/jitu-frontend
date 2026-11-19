"use client";

import { useState } from "react";

interface Props {
  questionId: string;
  disabled: boolean;
  getAuthHeaders: () => Promise<Record<string, string>>;
  onRevised: (id: string) => void;
}

export function SandboxRevisionButton({ questionId, disabled, getAuthHeaders, onRevised }: Props) {
  const [open, setOpen] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!feedback.trim() || sending || disabled) return;
    setSending(true);
    setError("");
    try {
      const response = await fetch("/api/practice/revision", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...await getAuthHeaders() },
        body: JSON.stringify({ questionId, feedback: feedback.trim() }),
      });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.error || "Feedback gagal disimpan.");
      setOpen(false);
      setFeedback("");
      onRevised(questionId);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Feedback gagal disimpan.");
    } finally {
      setSending(false);
    }
  }

  return <>
    <button type="button" disabled={disabled} onClick={() => setOpen(true)}
      className="rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-bold text-text hover:bg-surface-muted disabled:opacity-50">
      Minta Revisi
    </button>
    {open && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <form onSubmit={submit} onKeyDown={event => { if (event.key === "Escape" && !sending) setOpen(false); }} role="dialog" aria-modal="true" aria-labelledby="revision-title"
        className="w-full max-w-lg space-y-4 rounded-2xl border border-border bg-surface p-6 shadow-xl">
        <h2 id="revision-title" className="text-lg font-bold text-text">Kirim Soal ke Revisi</h2>
        <label className="block text-sm text-text">
          Feedback untuk penyusun soal
          <textarea required autoFocus maxLength={10000} rows={6} value={feedback} disabled={sending}
            onChange={event => setFeedback(event.target.value)}
            placeholder="Jelaskan bagian yang perlu diperbaiki dan alasan atau contoh perbaikannya."
            className="mt-2 w-full rounded-xl border border-border bg-surface p-3 text-text" />
        </label>
        {error && <p role="alert" className="text-sm text-text">{error}</p>}
        <div className="flex justify-end gap-3">
          <button type="button" disabled={sending} onClick={() => setOpen(false)}
            className="rounded-xl border border-border px-4 py-2 text-sm font-semibold text-text">Batal</button>
          <button type="submit" disabled={disabled || sending || !feedback.trim()}
            className="rounded-xl bg-primary px-4 py-2 text-sm font-bold text-on-primary disabled:opacity-50">
            {sending ? "Menyimpan..." : "Kirim Feedback"}
          </button>
        </div>
      </form>
    </div>}
  </>;
}
