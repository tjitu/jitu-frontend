'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { BACKEND_URL } from '@/lib/api';
import { fetchGrowthState, notifyGrowthChanged, trackGrowth } from '@/lib/growth/client';
import { normalizeInstagram, validInstagram, type GrowthState, type SocialItem } from '@/lib/growth/types';

type Stage = 'loading' | 'legacy' | 'social' | 'outcome' | 'error';
export function useRegistrationGrowth({ tryoutId, userId, open, cost, onClose, onChanged }: {
  tryoutId: string; userId: string | undefined; open: boolean; cost: number; onClose: () => void; onChanged?: () => void;
}) {
  const [state, setState] = useState<GrowthState | null>(null), [stage, setStage] = useState<Stage>('loading');
  const [username, setUsername] = useState('');
  const [checks, setChecks] = useState<Record<SocialItem, boolean>>({ follow: false, likeTag: false, story: false });
  const [error, setError] = useState(''), [busy, setBusy] = useState(false), [retry, setRetry] = useState(0);
  const busyRef = useRef(false), changed = useRef(false), requestKey = useRef(''), sessionId = useRef('');
  const clicked = useRef(false);
  const callbacks = useRef({ onClose, onChanged }); callbacks.current = { onClose, onChanged };
  const storageKey = userId ? `jitu:growth:${userId}:${tryoutId}` : null;
  useEffect(() => {
    if (!open || !tryoutId) return;
    const controller = new AbortController();
    setStage('loading'); setError(''); changed.current = false; clicked.current = false;
    requestKey.current = crypto.randomUUID(); sessionId.current = crypto.randomUUID();
    fetchGrowthState(tryoutId, controller.signal).then(value => {
      if (controller.signal.aborted) return;
      setState(value);
      setUsername(value.verification?.instagramUsername ?? '');
      setChecks({ follow: Boolean(value.verification?.submittedChecklist.follow), likeTag: Boolean(value.verification?.submittedChecklist.likeTag), story: Boolean(value.verification?.submittedChecklist.story) });
      if (storageKey && (!value.verification || value.verification.status === 'REJECTED')) {
        try {
          const saved = JSON.parse(sessionStorage.getItem(storageKey) ?? 'null') as { username?: string; checks?: Partial<Record<SocialItem, boolean>> } | null;
          if (saved) { setUsername(saved.username ?? ''); setChecks({ follow: Boolean(saved.checks?.follow), likeTag: Boolean(saved.checks?.likeTag), story: Boolean(saved.checks?.story) }); }
        } catch { /* Form still works when browser storage is unavailable. */ }
      }
      const active = value.config.enabled || value.config.community.enabled || value.config.prize.enabled || Boolean(value.verification);
      if (active && !value.exempt && cost <= 0) { trackGrowth(tryoutId, sessionId.current, 'registration_button_clicked'); clicked.current = true; }
      if (value.exempt) setStage('legacy');
      else if (value.verification?.status === 'REJECTED') setStage(value.config.enabled ? 'social' : 'legacy');
      else if (value.verification) setStage('outcome');
      else setStage(!value.exempt && value.config.enabled && cost <= 0 && !value.isRegistered ? 'social' : 'legacy');
    }).catch(cause => { if (!controller.signal.aborted) { setError(cause instanceof Error ? cause.message : 'Pendaftaran belum dapat dimuat.'); setStage('error'); } });
    return () => controller.abort();
  }, [open, tryoutId, storageKey, cost, retry]);
  useEffect(() => {
    if (!open || stage !== 'social') return;
    trackGrowth(tryoutId, sessionId.current, 'social_engagement_modal_viewed');
    const leave = () => trackGrowth(tryoutId, sessionId.current, 'social_engagement_modal_abandoned');
    window.addEventListener('pagehide', leave);
    return () => window.removeEventListener('pagehide', leave);
  }, [open, stage, tryoutId]);
  useEffect(() => {
    if (open && stage === 'social' && storageKey) {
      try { sessionStorage.setItem(storageKey, JSON.stringify({ username, checks })); } catch { /* Optional browser storage. */ }
    }
  }, [open, stage, storageKey, username, checks]);
  useEffect(() => {
    if (!open || state?.verification?.status !== 'PENDING_VERIFICATION') return;
    const timer = setInterval(() => {
      if (document.visibilityState !== 'visible') return;
      void fetchGrowthState(tryoutId).then(value => {
        setState(value);
        if (value.verification?.status !== 'PENDING_VERIFICATION') {
          changed.current = true;
          if (value.verification?.status === 'APPROVED') toast.success('Pendaftaran Berhasil!');
          if (value.verification?.status === 'REJECTED') toast.error('Pendaftaran Belum Disetujui');
        }
      }).catch(() => {});
    }, 10000);
    return () => clearInterval(timer);
  }, [open, state?.verification?.status, tryoutId]);
  const close = useCallback(() => {
    if (busyRef.current) return;
    if (stage === 'social') trackGrowth(tryoutId, sessionId.current, 'social_engagement_modal_abandoned');
    callbacks.current.onClose();
    if (changed.current) { notifyGrowthChanged(); callbacks.current.onChanged?.(); }
  }, [stage, tryoutId]);
  async function submit() {
    if (!state || busyRef.current) return;
    busyRef.current = true; setBusy(true); setError('');
    try {
      const response = await fetch(`${BACKEND_URL}/tryout/${encodeURIComponent(tryoutId)}/register`, {
        method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'FREE', expectedSolutionPrice: state.solutionPrice ?? cost, growth: {
          instagramUsername: normalizeInstagram(username), checklist: checks, configVersion: state.configVersion,
          version: state.verification?.version, requestKey: requestKey.current, sessionId: sessionId.current,
        } }),
      });
      const result = await response.json() as GrowthState & { message?: string };
      if (!response.ok) throw new Error(result.message || 'Pendaftaran gagal. Coba lagi.');
      setState(result); setStage('outcome'); changed.current = true;
      if (storageKey) try { sessionStorage.removeItem(storageKey); } catch { /* Optional browser storage. */ }
      if (result.verification?.status === 'APPROVED') toast.success('Pendaftaran Berhasil!');
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Pendaftaran gagal. Coba lagi.'); }
    finally { busyRef.current = false; setBusy(false); }
  }
  const ready = Boolean(state && !state.registrationClosed && (Object.keys(state.config.items) as SocialItem[]).every(key =>
    !state.config.items[key].enabled || !state.config.items[key].required || checks[key]) &&
    (state.config.manualVerification ? validInstagram(username) : !username || validInstagram(username)));
  function free(legacy: () => void) {
    if (!state) return;
    if (state.exempt || (state.isRegistered && !state.verification)) { legacy(); return; }
    if (!clicked.current && (state.config.enabled || state.config.community.enabled || state.config.prize.enabled)) {
      trackGrowth(tryoutId, sessionId.current, 'registration_button_clicked'); clicked.current = true;
    }
    if (state.config.enabled) setStage('social');
    else if (state.config.community.enabled || state.config.prize.enabled || state.verification) void submit();
    else legacy();
  }
  return { state, stage, username, setUsername, checks, setChecks, error, busy, ready, submit, close, free,
    reload: () => setRetry(value => value + 1), resubmit: () => { requestKey.current = crypto.randomUUID(); setError('');
      if (state?.config.enabled) setStage('social'); else void submit(); },
    track: (event: string, link?: string) => trackGrowth(tryoutId, sessionId.current, event, link) };
}
