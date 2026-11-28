'use client';
import { useEffect } from 'react';
import { Trophy } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import type { useRegistrationGrowth } from './use-registration-growth';

export function RegistrationOutcomeModal({ flow, open }: { flow: ReturnType<typeof useRegistrationGrowth>; open: boolean }) {
  const state = flow.state!;
  const pending = state.verification?.status === 'PENDING_VERIFICATION';
  const rejected = state.verification?.status === 'REJECTED';
  const config = state.config;
  const track = flow.track;
  useEffect(() => { if (open && !rejected && config.community.enabled) track('community_invitation_viewed'); }, [open, rejected, config.community.enabled]);
  return <Dialog open={open} onOpenChange={value => { if (!value) flow.close(); }}>
    <DialogContent className="sm:max-w-md max-h-dvh overflow-y-auto gap-4 p-5 sm:p-6">
      <DialogHeader><DialogTitle>{pending ? 'Menunggu Verifikasi' : rejected ? 'Pendaftaran Belum Disetujui' : 'Pendaftaran Berhasil!'}</DialogTitle>
        <DialogDescription>{pending ? `Pendaftaranmu untuk ${state.tryoutName} telah diterima.` : state.tryoutName}</DialogDescription>
      </DialogHeader>
      {pending && config.items.story.enabled && config.items.story.required && <p className="text-xs text-text-muted">Pastikan Instagram Story masih dapat dilihat.</p>}
      {rejected ? <>
        <ul className="list-disc space-y-1 pl-4 text-sm text-text-body">{state.verification?.rejectionReasons.map(reason => <li key={reason}>{reason}</li>)}</ul>
        <Button type="button" variant="primary" className="w-full" disabled={state.registrationClosed} onClick={flow.resubmit}>Ajukan Ulang</Button>
        {state.registrationClosed && <p className="text-xs text-text-muted">Masa pendaftaran tryout sudah berakhir.</p>}
      </> : <>
        {config.prize.enabled && <section className="flex items-start gap-2 rounded-lg bg-yellow-100 p-3 text-yellow-700">
          <Trophy className="mt-0.5 size-5 shrink-0" aria-hidden="true" /><div><h3 className="text-sm font-semibold">Hadiah {config.prize.type} untuk {config.prize.winners} Besar!</h3>{config.prize.info && <p className="mt-1 text-xs">{config.prize.info}</p>}</div>
        </section>}
        {config.community.enabled && <section className="space-y-2">
          <h3 className="text-sm font-semibold text-text">Jangan sampai ketinggalan informasi tryout!</h3>
          <p className="text-sm text-text-body">Yuk, gabung Komunitas JITU untuk mendapatkan:</p>
          <ul className="list-disc space-y-1 pl-4 text-sm text-text-body"><li>Update dan reminder tryout</li><li>{config.prize.enabled ? 'Pengumuman hasil dan pemenang' : 'Pengumuman hasil tryout'}</li><li>Diskusi soal UTBK</li><li>Informasi tryout berikutnya</li></ul>
          <a href={config.community.url} target="_blank" rel="noopener noreferrer" onClick={() => track('community_invitation_clicked')}
            className="inline-flex min-h-11 w-full items-center justify-center rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">Gabung Komunitas JITU</a>
        </section>}
      </>}
      <Button type="button" variant="outline" className="w-full" onClick={flow.close}>Kembali ke Tryout</Button>
    </DialogContent>
  </Dialog>;
}
