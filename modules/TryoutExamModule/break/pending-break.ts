/** Find a locally recorded break for this attempt that has not advanced yet. */
export function pendingBreakOrder(storage: Storage, attemptId: string, currentOrder: number): number | null {
  const prefix = `break_started_at_${attemptId}_`;
  let nextOrder: number | null = null;
  for (let index = 0; index < storage.length; index++) {
    const key = storage.key(index);
    if (!key?.startsWith(prefix)) continue;
    const order = Number(key.slice(prefix.length));
    const startedAt = Date.parse(storage.getItem(key) || "");
    if (!Number.isSafeInteger(order) || order <= currentOrder || !Number.isFinite(startedAt)) continue;
    if (nextOrder === null || order < nextOrder) nextOrder = order;
  }
  return nextOrder;
}
