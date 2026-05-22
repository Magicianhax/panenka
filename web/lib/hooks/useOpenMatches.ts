"use client";

import { useEffect, useState } from "react";
import { usePublicClient } from "wagmi";
import type { Address } from "viem";
import { PENALTY_MATCH_ADDRESS, penaltyMatchAbi } from "../contract";

export type OpenMatch = {
  id: bigint;
  player1: Address;
  country: number;
  stake: bigint;
};

/** Fetches open (state === Open) matches by scanning the contract's id range via multicall. */
export function useOpenMatches() {
  const publicClient = usePublicClient();
  const [matches, setMatches] = useState<OpenMatch[] | null>(null);
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
        const scanFrom = Math.max(1, total - 200);
        for (let i = total; i >= scanFrom; i--) ids.push(BigInt(i));

        const games = await publicClient.multicall({
          contracts: ids.map((id) => ({
            address: PENALTY_MATCH_ADDRESS,
            abi: penaltyMatchAbi,
            functionName: "games",
            args: [id],
          })),
        });

        const open: OpenMatch[] = [];
        games.forEach((res, idx) => {
          if (res.status !== "success") return;
          const g = res.result as unknown as readonly [
            Address, Address, bigint, number, number, number, number, number, number, bigint
          ];
          if (Number(g[8]) === 1) {
            open.push({ id: ids[idx], player1: g[0], country: Number(g[3]), stake: g[2] });
          }
        });

        if (!cancelled) setMatches(open);
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
