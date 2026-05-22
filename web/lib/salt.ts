import { encodePacked, keccak256, type Address, type Hex } from "viem";

// ---------------------------------------------------------------------------
// Commit-reveal secrets.
//
// The salt is the linchpin of fairness: if it leaks, an opponent could brute-force
// your move (only 9 shoot×dive combos); if you lose it, you can't reveal and forfeit.
//
// Instead of a random salt trapped in localStorage (lost on clear / new device), we
// derive a per-match SEED from a wallet signature over a fixed message. The signature
// depends on the private key (secret, high-entropy) and is reproducible on any device
// by re-signing — no single point of failure. Per-round salts are hashed from the seed.
// ---------------------------------------------------------------------------

const SEED_KEY = (matchId: string, addr: Address) => `pm:seed:${matchId}:${addr.toLowerCase()}`;
const MOVE_KEY = (matchId: string, round: number, addr: Address) =>
  `pm:move:${matchId}:${round}:${addr.toLowerCase()}`;

/** Stable message the player signs once per match to derive their secret seed. */
export function seedMessage(matchId: string): string {
  return `X Cup — authorize your secret moves for match #${matchId}.\n\nThis signature stays on your device, proves nothing on-chain, and costs no gas. Re-signing always produces the same result, so your moves are recoverable on any device.`;
}

/** Cached per-match seed, or null if not derived yet. */
export function loadSeed(matchId: string, addr: Address): Hex | null {
  if (typeof window === "undefined") return null;
  const v = window.localStorage.getItem(SEED_KEY(matchId, addr));
  return v && v.startsWith("0x") ? (v as Hex) : null;
}

/**
 * Derive (or load) the per-match seed. Prompts a wallet signature only the first time
 * per match per device; the result is cached and is identical across devices.
 */
export async function ensureSeed(
  matchId: string,
  addr: Address,
  signMessageAsync: (args: { message: string }) => Promise<Hex>
): Promise<Hex> {
  const cached = loadSeed(matchId, addr);
  if (cached) return cached;
  const signature = await signMessageAsync({ message: seedMessage(matchId) });
  const seed = keccak256(signature);
  if (typeof window !== "undefined") window.localStorage.setItem(SEED_KEY(matchId, addr), seed);
  return seed;
}

/** Deterministic per-round salt derived from the match seed. */
export function saltFor(seed: Hex, round: number): Hex {
  return keccak256(encodePacked(["bytes32", "uint8"], [seed, round]));
}

export function computeCommit(
  shoot: number,
  dive: number,
  salt: Hex,
  sender: Address,
  matchId: bigint,
  round: number
): Hex {
  return keccak256(
    encodePacked(
      ["uint8", "uint8", "bytes32", "address", "uint256", "uint8"],
      [shoot, dive, salt, sender, matchId, round]
    )
  );
}

export function saveMove(matchId: string, round: number, addr: Address, shoot: number, dive: number) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(MOVE_KEY(matchId, round, addr), JSON.stringify({ shoot, dive }));
}

export function loadMove(matchId: string, round: number, addr: Address) {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(MOVE_KEY(matchId, round, addr));
  if (!raw) return null;
  try {
    return JSON.parse(raw) as { shoot: number; dive: number };
  } catch {
    return null;
  }
}

/**
 * Recover a lost move by brute-forcing the 9 shoot×dive combinations against the
 * on-chain commit. Safe because only the holder of the seed can do this.
 */
export function recoverMove(
  seed: Hex,
  addr: Address,
  matchId: bigint,
  round: number,
  commit: Hex
): { shoot: number; dive: number } | null {
  const salt = saltFor(seed, round);
  const target = commit.toLowerCase();
  for (let shoot = 0; shoot < 3; shoot++) {
    for (let dive = 0; dive < 3; dive++) {
      if (computeCommit(shoot, dive, salt, addr, matchId, round).toLowerCase() === target) {
        return { shoot, dive };
      }
    }
  }
  return null;
}
