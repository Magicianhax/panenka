"use client";

import { useEffect, useState } from "react";
import { usePublicClient } from "wagmi";
import type { Address } from "viem";
import { GameState, ZERO_ADDR, scanGames } from "../games";

export type SettledMatch = {
  id: bigint;
  p1: Address;
  p2: Address;
  c1: number;
  c2: number;
  score1: number;
  score2: number;
  stake: bigint;
  winner: Address | null; // null = draw
};

const LIMIT = 500;

/** All settled two-player matches, newest first. */
export function useSettledMatches() {
  const publicClient = usePublicClient();
  const [matches, setMatches] = useState<SettledMatch[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!publicClient) return;
    let cancelled = false;

    (async () => {
      try {
        const rows = await scanGames(publicClient, LIMIT);
        if (cancelled) return;
        setMatches(
          rows
            // require a real opponent (exclude refunded-open edge cases)
            .filter((g) => g.state === GameState.Settled && g.p2 !== ZERO_ADDR)
            .map((g) => ({
              id: g.id, p1: g.p1, p2: g.p2, c1: g.c1, c2: g.c2,
              score1: g.score1, score2: g.score2, stake: g.stake,
              winner: g.score1 > g.score2 ? g.p1 : g.score2 > g.score1 ? g.p2 : null,
            }))
        );
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : String(e));
      }
    })();

    return () => { cancelled = true; };
  }, [publicClient]);

  return { matches, error };
}
