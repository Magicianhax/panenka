"use client";

import { useEffect, useState } from "react";
import { usePublicClient } from "wagmi";
import type { Address } from "viem";
import { GameState, ZERO_ADDR, scanGames } from "../games";

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

const LIMIT = 1000;

/** Every match the address is part of, bucketed, with a win/loss/net record. */
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
        const rows = await scanGames(publicClient, LIMIT);
        if (cancelled) return;

        const open: MyMatch[] = [];
        const active: MyMatch[] = [];
        const settled: MyMatch[] = [];
        let wins = 0, losses = 0, draws = 0;
        let net = 0n;

        for (const g of rows) {
          const isP1 = g.p1.toLowerCase() === me;
          const isP2 = g.p2.toLowerCase() === me;
          if (!isP1 && !isP2) continue;

          const m: MyMatch = {
            id: g.id, p1: g.p1, p2: g.p2, c1: g.c1, c2: g.c2,
            score1: g.score1, score2: g.score2, stake: g.stake, state: g.state, isP1,
          };

          if (m.state === GameState.Open) open.push(m);
          else if (m.state === GameState.Active) active.push(m);
          else if (m.state === GameState.Settled) {
            settled.push(m);
            // record only counts real 2-player games
            if (g.p2 !== ZERO_ADDR) {
              const profit = (m.stake * 19500n) / 10000n - m.stake; // payout (2 * 0.975) - stake
              const tie = m.score1 === m.score2;
              const iWon = isP1 ? m.score1 > m.score2 : m.score2 > m.score1;
              if (tie) draws++;
              else if (iWon) { wins++; net += profit; }
              else { losses++; net -= m.stake; }
            }
          }
        }

        if (!cancelled) setData({ open, active, settled, record: { played: wins + losses + draws, wins, losses, draws, net } });
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : String(e));
      }
    })();

    return () => { cancelled = true; };
  }, [publicClient, address]);

  return { data, error };
}
