"use client";

import { useEffect, useState } from "react";
import { usePublicClient } from "wagmi";
import type { Address } from "viem";
import { GameState, scanGames } from "../games";

export type OpenMatch = {
  id: bigint;
  player1: Address;
  country: number;
  stake: bigint;
};

const LIMIT = 200;

/** Open matches waiting for an opponent. */
export function useOpenMatches() {
  const publicClient = usePublicClient();
  const [matches, setMatches] = useState<OpenMatch[] | null>(null);
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
            .filter((g) => g.state === GameState.Open)
            .map((g) => ({ id: g.id, player1: g.p1, country: g.c1, stake: g.stake }))
        );
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : String(e));
      }
    })();

    return () => { cancelled = true; };
  }, [publicClient]);

  return { matches, error };
}
