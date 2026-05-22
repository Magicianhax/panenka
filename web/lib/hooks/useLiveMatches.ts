"use client";

import { useEffect, useState } from "react";
import { usePublicClient } from "wagmi";
import type { Address } from "viem";
import { GameState, scanGames } from "../games";

export type LiveMatch = {
  id: bigint;
  p1: Address;
  p2: Address;
  c1: number;
  c2: number;
  score1: number;
  score2: number;
  round: number; // currentRound (0-based)
  stake: bigint;
};

const POLL = 5000;
const LIMIT = 300;

/** Active matches anyone can spectate. Polls every 5s. */
export function useLiveMatches() {
  const publicClient = usePublicClient();
  const [matches, setMatches] = useState<LiveMatch[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!publicClient) return;
    let cancelled = false;

    const scan = async () => {
      try {
        const rows = await scanGames(publicClient, LIMIT);
        if (cancelled) return;
        setMatches(
          rows
            .filter((g) => g.state === GameState.Active)
            .map((g) => ({
              id: g.id, p1: g.p1, p2: g.p2, c1: g.c1, c2: g.c2,
              score1: g.score1, score2: g.score2, round: g.round, stake: g.stake,
            }))
        );
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : String(e));
      }
    };

    scan();
    const t = setInterval(scan, POLL);
    return () => { cancelled = true; clearInterval(t); };
  }, [publicClient]);

  return { matches, error };
}
