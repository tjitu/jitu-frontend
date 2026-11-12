/**
 * Deterministic display offset (150..300) per tryout ID using FNV-1a 32-bit hash.
 * Fixed across renders/reloads for a given tryout and avoids SSR/CSR hydration mismatch.
 */
export function getFixedParticipantOffset(tryoutId: string): number {
  const input = String(tryoutId || "");
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  const unsigned = hash >>> 0;
  return 150 + (unsigned % 151); // 150..300 inclusive
}

/**
 * Total participants shown in UI: fixed random offset (150..300) + actual registrants.
 */
export function getDisplayedParticipants(
  tryoutId: string,
  actualParticipants?: number | null,
): number {
  const actual = Math.max(0, Number(actualParticipants) || 0);
  return getFixedParticipantOffset(tryoutId) + actual;
}

function formatWibDatePart(date: Date): string {
  return date.toLocaleDateString("id-ID", {
    timeZone: "Asia/Jakarta",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatWibTimePart(date: Date): string {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Jakarta",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(date);
  const hour = parts.find((p) => p.type === "hour")?.value || "00";
  const minute = parts.find((p) => p.type === "minute")?.value || "00";
  return `${hour}:${minute}`;
}

export function formatTryoutDateRange(
  startInput?: Date | string | null,
  endInput?: Date | string | null,
): string {
  if (!startInput && !endInput) return "Jadwal segera diumumkan";

  const start = startInput ? new Date(startInput) : null;
  const end = endInput ? new Date(endInput) : null;
  const validStart = start && !Number.isNaN(start.getTime()) ? start : null;
  const validEnd = end && !Number.isNaN(end.getTime()) ? end : null;

  if (!validStart && !validEnd) return "Jadwal segera diumumkan";
  if (validStart && !validEnd) {
    return `${formatWibDatePart(validStart)}, ${formatWibTimePart(validStart)} WIB`;
  }
  if (!validStart && validEnd) {
    return `s.d. ${formatWibDatePart(validEnd)}, ${formatWibTimePart(validEnd)} WIB`;
  }

  const startDateStr = formatWibDatePart(validStart!);
  const endDateStr = formatWibDatePart(validEnd!);
  const startTimeStr = formatWibTimePart(validStart!);
  const endTimeStr = formatWibTimePart(validEnd!);

  if (startDateStr === endDateStr) {
    return `${startDateStr}, ${startTimeStr} – ${endTimeStr} WIB`;
  }

  return `${startDateStr}, ${startTimeStr} – ${endDateStr}, ${endTimeStr} WIB`;
}
