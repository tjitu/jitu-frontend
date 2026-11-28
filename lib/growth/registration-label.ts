import type { VerificationStatus } from './types';
export function registrationLabel(status: VerificationStatus | null | undefined, fallback = 'Daftar tryout') {
  return status === 'PENDING_VERIFICATION' ? 'Menunggu Verifikasi' : status === 'REJECTED' ? 'Ajukan Ulang' : fallback;
}
