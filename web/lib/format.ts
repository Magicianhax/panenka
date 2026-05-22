/** Address + display formatting helpers (no on-chain identity exists, so handles are cosmetic). */

export function short(addr: string) {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

/** Derive a stable @handle from an address. */
export function handleFor(addr: string) {
  return `@${addr.slice(2, 8).toLowerCase()}`;
}
