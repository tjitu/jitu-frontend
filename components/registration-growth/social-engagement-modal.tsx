'use client';
import { ExternalLink, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import type { SocialItem } from '@/lib/growth/types';
import type { useRegistrationGrowth } from './use-registration-growth';

export function SocialEngagementModal({ flow, open }: { flow: ReturnType<typeof useRegistrationGrowth>; open: boolean }) {
  const config = flow.state!.config;
  const labels: Record<SocialItem, string> = { follow: 'Follow Instagram @jituptn', likeTag: 'Like & tag 3 teman di postingan tryout',
    story: config.mentionRequired ? 'Share ke Instagram Story & mention @jituptn' : 'Share ke Instagram Story' };
  return <Dialog open={open} onOpenChange={value => { if (!value) flow.close(); }}>
    <DialogContent className="sm:max-w-md max-h-dvh overflow-y-auto gap-4 p-5 sm:p-6">
      <DialogHeader><DialogTitle>Daftar Tryout Gratis</DialogTitle><DialogDescription>Lengkapi persyaratan berikut.</DialogDescription></DialogHeader>
      <form className="space-y-4" onSubmit={event => { event.preventDefault(); if (flow.ready) void flow.submit(); }}>
        {flow.state?.verification?.status === 'REJECTED' && <ul className="list-disc space-y-1 pl-4 text-xs text-danger-text">{flow.state.verification.rejectionReasons.map(reason => <li key={reason}>{reason}</li>)}</ul>}
        <fieldset className="space-y-3" disabled={flow.busy}>
          {(Object.keys(labels) as SocialItem[]).filter(key => config.items[key].enabled).map(key => <div className="flex items-start gap-2" key={key}>
            <input id={`growth-${key}`} type="checkbox" className="mt-1 size-4 accent-primary" checked={flow.checks[key]} required={config.items[key].required}
              onChange={event => flow.setChecks(value => ({ ...value, [key]: event.target.checked }))} />
            <label htmlFor={`growth-${key}`} className="flex-1 text-sm text-text">{labels[key]}{!config.items[key].required && <span className="text-xs text-text-muted"> (opsional)</span>}</label>
            <a href={key === 'follow' ? config.profileUrl : config.campaignUrl} target="_blank" rel="noopener noreferrer" className="shrink-0 p-1 text-primary"
              aria-label={`Buka Instagram: ${labels[key]}`} onClick={() => flow.track('social_engagement_link_clicked', key)}><ExternalLink className="size-4" /></a>
          </div>)}
          <div className="space-y-1.5 pt-1">
            <label htmlFor="growth-instagram" className="text-sm font-medium text-text">Username Instagram</label>
            <div className="flex items-center rounded-lg border border-border bg-surface focus-within:ring-2 focus-within:ring-primary">
              <span className="pl-3 text-text-muted" aria-hidden="true">@</span>
              <input id="growth-instagram" className="min-w-0 flex-1 rounded-lg bg-transparent px-2 py-2.5 text-sm outline-none" placeholder="usernamekamu"
                autoComplete="off" autoCapitalize="none" spellCheck={false} maxLength={31} required={config.manualVerification}
                value={flow.username} onChange={event => flow.setUsername(event.target.value.replace(/^@/, '').toLowerCase())}
                aria-describedby="growth-instagram-help" />
            </div>
            <p id="growth-instagram-help" className="text-xs text-text-muted">Gunakan akun Instagram yang sama.</p>
          </div>
        </fieldset>
        {config.manualVerification && <p className="text-xs text-text-muted">Pendaftaranmu akan diverifikasi terlebih dahulu.</p>}
        {flow.state?.registrationClosed && <p role="alert" className="text-sm text-danger-text">Masa pendaftaran tryout sudah berakhir.</p>}
        {flow.error && <div role="alert" className="text-sm text-danger-text">{flow.error} <button type="button" className="underline" onClick={flow.reload}>Muat ulang</button></div>}
        <Button type="submit" variant="primary" className="w-full" disabled={!flow.ready || flow.busy}>
          {flow.busy ? <><Loader2 className="mr-2 size-4 animate-spin" />Mendaftarkan...</> : 'Daftar Gratis'}
        </Button>
      </form>
    </DialogContent>
  </Dialog>;
}
