'use client';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { fetchGrowthState } from '@/lib/growth/client';
import type { GrowthState, VerificationStatus } from '@/lib/growth/types';

export function RegistrationStatus({ tryoutId, onOpen, onChanged }: { tryoutId: string; onOpen: () => void; onChanged: () => void }) {
  const [state, setState] = useState<GrowthState | null>(null);
  const [error, setError] = useState('');
  const previous = useRef<VerificationStatus | null>(null);
  const callback = useRef(onChanged); callback.current = onChanged;
  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const next = await fetchGrowthState(tryoutId); if (!active) return;
        setState(next); setError('');
        if (previous.current === 'PENDING_VERIFICATION' && next.verification?.status !== previous.current) {
          if (next.verification?.status === 'APPROVED') toast.success('Pendaftaran Berhasil!');
          if (next.verification?.status === 'REJECTED') toast.error('Pendaftaran Belum Disetujui');
          callback.current();
        }
        previous.current = next.verification?.status ?? null;
      } catch { if (active) setError('Status pendaftaran belum dapat diperbarui.'); }
    }
    void load();
    const timer = setInterval(() => { if (previous.current === 'PENDING_VERIFICATION' && document.visibilityState === 'visible') void load(); }, 10000);
    window.addEventListener('focus', load); window.addEventListener('jitu:registration-changed', load);
    return () => { active = false; clearInterval(timer); window.removeEventListener('focus', load); window.removeEventListener('jitu:registration-changed', load); };
  }, [tryoutId]);
  if (!state?.verification) return null;
  const status = state.verification.status;
  return <section className="space-y-2 rounded-xl border border-border bg-surface p-4" aria-live="polite">
    <h2 className="text-sm font-semibold text-text">{status === 'PENDING_VERIFICATION' ? 'Menunggu Verifikasi' : status === 'REJECTED' ? 'Pendaftaran Belum Disetujui' : 'Pendaftaran Berhasil!'}</h2>
    {status === 'PENDING_VERIFICATION' && <Button variant="outline" size="sm" onClick={onOpen}>Menunggu Verifikasi</Button>}
    {status === 'REJECTED' && <><ul className="list-disc space-y-1 pl-4 text-sm text-text-body">{state.verification.rejectionReasons.map(reason => <li key={reason}>{reason}</li>)}</ul>
      <Button variant="primary" size="sm" disabled={state.registrationClosed} onClick={onOpen}>Ajukan Ulang</Button></>}
    {error && <p role="alert" className="text-xs text-danger-text">{error}</p>}
  </section>;
}
