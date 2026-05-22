"use client";

import { useEffect, useState } from "react";
import { usePublicClient } from "wagmi";
import type { Address } from "viem";
import { PENALTY_MATCH_ADDRESS, penaltyMatchAbi } from "../contract";

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

/** Active (state === 2) matches anyone can spectate. Scans the id range via multicall. */
export function useLiveMatches() {
  const publicClient = usePublicClient();
  const [matches, setMatches] = useState<LiveMatch[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!publicClient) return;
    let cancelled = false;

    const scan = async () => {
      try {
        const nextId = (await publicClient.readContract({
          address: PENALTY_MATCH_ADDRESS, abi: penaltyMatchAbi, functionName: "nextId",
        })) as bigint;
        const total = Number(nextId) - 1;
        if (total <= 0) { if (!cancelled) setMatches([]); return; }

        const ids: bigint[] = [];
        for (let i = total; i >= Math.max(1, total - 300); i--) ids.push(BigInt(i));

        const games = await publicClient.multicall({
          contracts: ids.map((id) => ({
            address: PENALTY_MATCH_ADDRESS, abi: penaltyMatchAbi, functionName: "games", args: [id],
          })),
        });

        const live: LiveMatch[] = [];
        games.forEach((res, idx) => {
          if (res.status !== "success") return;
          const g = res.result as unknown as readonly [
            Address, Address, bigint, number, number, number, number, number, number, bigint
          ];
          if (Number(g[8]) !== 2) return; // 2 = Active
          live.push({
            id: ids[idx], p1: g[0], p2: g[1], c1: Number(g[3]), c2: Number(g[4]),
            score1: Number(g[5]), score2: Number(g[6]), round: Number(g[7]), stake: g[2],
          });
        });
        if (!cancelled) setMatches(live);
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
