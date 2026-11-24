export function getTryoutCountdown(startDate?: string | null, endDate?: string | null, now = Date.now()): string {
  const start = startDate ? Date.parse(startDate) : NaN;
  const end = endDate ? Date.parse(endDate) : NaN;
  const isUpcoming = Number.isFinite(start) && now < start;
  const target = isUpcoming ? start : end;
  if (!Number.isFinite(target)) return 'Jadwal belum ditentukan';
  const diff = target - now;
  if (diff <= 0) return 'Selesai';
  const days = Math.floor(diff / 86_400_000);
  const hours = Math.floor((diff / 3_600_000) % 24);
  const minutes = Math.floor((diff / 60_000) % 60);
  const seconds = Math.floor((diff / 1000) % 60);
  const remaining = days > 0
    ? `${String(days).padStart(2, '0')}d ${hours}h ${minutes}m ${seconds}s`
    : `${hours}h ${minutes}m ${seconds}s`;
  return `${isUpcoming ? 'Mulai dalam' : 'Berakhir dalam'} ${remaining}`;
}
