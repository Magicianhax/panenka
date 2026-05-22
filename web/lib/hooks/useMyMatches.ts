"use client";

import { useEffect, useState } from "react";
import { usePublicClient } from "wagmi";
import type { Address } from "viem";
import { PENALTY_MATCH_ADDRESS, penaltyMatchAbi } from "../contract";

export type MyMatch = {
  id: bigint;
  p1: Address;
  p2: Address;
  c1: number;
  c2: number;
  score1: number;
  score2: number;
  stake: bigint;
  state: number; // 1 Open, 2 Active, 3 Settled, 4 Cancelled
  isP1: boolean;
};

type Bucketed = {
  open: MyMatch[];
  active: MyMatch[];
  settled: MyMatch[];
  record: { played: number; wins: number; losses: number; draws: number; net: bigint };
};

const ZERO = "0x0000000000000000000000000000000000000000";

/** Scans the id range via multicall and returns every match the address is part of, bucketed. */
export function useMyMatches(address?: Address) {
  const publicClient = usePublicClient();
  const [data, setData] = useState<Bucketed | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!publicClient || !address) {
      setData(null);
      return;
    }
    let cancelled = false;
    const me = address.toLowerCase();

    (async () => {
      try {
        const nextId = (await publicClient.readContract({
          address: PENALTY_MATCH_ADDRESS,
          abi: penaltyMatchAbi,
          functionName: "nextId",
        })) as bigint;

        const total = Number(nextId) - 1;
        if (total <= 0) {
          if (!cancelled) setData({ open: [], active: [], settled: [], record: { played: 0, wins: 0, losses: 0, draws: 0, net: 0n } });
          return;
        }

        const ids: bigint[] = [];
        const scanFrom = Math.max(1, total - 1000);
        for (let i = total; i >= scanFrom; i--) ids.push(BigInt(i));

        const games = await publicClient.multicall({
          contracts: ids.map((id) => ({
            address: PENALTY_MATCH_ADDRESS,
            abi: penaltyMatchAbi,
            functionName: "games",
            args: [id],
          })),
        });

        const open: MyMatch[] = [];
        const active: MyMatch[] = [];
        const settled: MyMatch[] = [];
        let wins = 0, losses = 0, draws = 0;
        let net = 0n;

        games.forEach((res, idx) => {
          if (res.status !== "success") return;
          const g = res.result as unknown as readonly [
            Address, Address, bigint, number, number, number, number, number, number, bigint
          ];
          const p1 = g[0], p2 = g[1];
          const mine = p1.toLowerCase() === me || p2.toLowerCase() === me;
          if (!mine) return;
          const m: MyMatch = {
            id: ids[idx], p1, p2, c1: Number(g[3]), c2: Number(g[4]),
            score1: Number(g[5]), score2: Number(g[6]), stake: g[2],
            state: Number(g[8]), isP1: p1.toLowerCase() === me,
          };
          if (m.state === 1) open.push(m);
          else if (m.state === 2) active.push(m);
          else if (m.state === 3) {
            settled.push(m);
            // record only counts real 2-player games
            if (p2 !== ZERO) {
              const profit = (m.stake * 19500n) / 10000n - m.stake; // payout(2*0.975) - stake
              const tie = m.score1 === m.score2;
              const iWon = m.isP1 ? m.score1 > m.score2 : m.score2 > m.score1;
              if (tie) draws++;
              else if (iWon) { wins++; net += profit; }
              else { losses++; net -= m.stake; }
            }
          }
        });

        if (!cancelled) setData({ open, active, settled, record: { played: wins + losses + draws, wins, losses, draws, net } });
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : String(e));
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [publicClient, address]);

  return { data, error };
}
