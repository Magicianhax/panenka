"use client";

import { useEffect, useState } from "react";
import { usePublicClient } from "wagmi";
import type { Address } from "viem";
import { PENALTY_MATCH_ADDRESS, penaltyMatchAbi } from "../contract";

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

const ZERO = "0x0000000000000000000000000000000000000000";

/** Reads all settled matches (state === 3) via nextId + multicall. Newest first. */
export function useSettledMatches() {
  const publicClient = usePublicClient();
  const [matches, setMatches] = useState<SettledMatch[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!publicClient) return;
    let cancelled = false;

    (async () => {
      try {
        const nextId = (await publicClient.readContract({
          address: PENALTY_MATCH_ADDRESS,
          abi: penaltyMatchAbi,
          functionName: "nextId",
        })) as bigint;

        const total = Number(nextId) - 1;
        if (total <= 0) {
          if (!cancelled) setMatches([]);
          return;
        }

        const ids: bigint[] = [];
        const scanFrom = Math.max(1, total - 500);
        for (let i = total; i >= scanFrom; i--) ids.push(BigInt(i));

        const games = await publicClient.multicall({
          contracts: ids.map((id) => ({
            address: PENALTY_MATCH_ADDRESS,
            abi: penaltyMatchAbi,
            functionName: "games",
            args: [id],
          })),
        });

        const settled: SettledMatch[] = [];
        games.forEach((res, idx) => {
          if (res.status !== "success") return;
          const g = res.result as unknown as readonly [
            Address, Address, bigint, number, number, number, number, number, number, bigint
          ];
          // state 3 = Settled; require a real opponent (exclude refunded-open edge cases)
          if (Number(g[8]) !== 3 || g[1] === ZERO) return;
          const s1 = Number(g[5]);
          const s2 = Number(g[6]);
          settled.push({
            id: ids[idx],
            p1: g[0],
            p2: g[1],
            c1: Number(g[3]),
            c2: Number(g[4]),
            score1: s1,
            score2: s2,
            stake: g[2],
            winner: s1 > s2 ? g[0] : s2 > s1 ? g[1] : null,
          });
        });

        if (!cancelled) setMatches(settled);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : String(e));
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [publicClient]);

  return { matches, error };
}
