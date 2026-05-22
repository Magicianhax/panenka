import type { Address, PublicClient } from "viem";
import { PENALTY_MATCH_ADDRESS, penaltyMatchAbi } from "./contract";

/** Match lifecycle states, mirroring `enum State` in PenaltyMatch.sol. */
export const GameState = {
  None: 0,
  Open: 1,
  Active: 2,
  Settled: 3,
  Cancelled: 4,
} as const;

export const ZERO_ADDR = "0x0000000000000000000000000000000000000000" as const;

/** Raw tuple returned by the `games(id)` getter, in struct-declaration order. */
type GameTuple = readonly [
  Address, // 0 player1
  Address, // 1 player2
  bigint,  // 2 stake
  number,  // 3 country1
  number,  // 4 country2
  number,  // 5 score1
  number,  // 6 score2
  number,  // 7 currentRound (0-based)
  number,  // 8 state
  bigint,  // 9 lastActionAt
];

/** A decoded on-chain match — the single source of truth for the Game shape. */
export type GameRow = {
  id: bigint;
  p1: Address;
  p2: Address;
  stake: bigint;
  c1: number;
  c2: number;
  score1: number;
  score2: number;
  round: number;
  state: number;
  lastActionAt: number;
};

export function decodeGame(id: bigint, g: GameTuple): GameRow {
  return {
    id,
    p1: g[0],
    p2: g[1],
    stake: g[2],
    c1: Number(g[3]),
    c2: Number(g[4]),
    score1: Number(g[5]),
    score2: Number(g[6]),
    round: Number(g[7]),
    state: Number(g[8]),
    lastActionAt: Number(g[9]),
  };
}

/**
 * Scan the contract's id range newest-first and return decoded matches.
 *
 * X Layer caps `eth_getLogs` at 100 blocks, so we read `nextId` and batch the
 * `games(id)` getter through a single multicall instead of querying events.
 *
 * @param limit how many ids back from the head to fetch (page-specific budget).
 */
export async function scanGames(client: PublicClient, limit: number): Promise<GameRow[]> {
  const nextId = (await client.readContract({
    address: PENALTY_MATCH_ADDRESS,
    abi: penaltyMatchAbi,
    functionName: "nextId",
  })) as bigint;

  const total = Number(nextId) - 1;
  if (total <= 0) return [];

  const ids: bigint[] = [];
  for (let i = total; i >= Math.max(1, total - limit); i--) ids.push(BigInt(i));

  const results = await client.multicall({
    contracts: ids.map((id) => ({
      address: PENALTY_MATCH_ADDRESS,
      abi: penaltyMatchAbi,
      functionName: "games",
      args: [id],
    })),
  });

  const rows: GameRow[] = [];
  results.forEach((res, idx) => {
    if (res.status !== "success") return;
    rows.push(decodeGame(ids[idx], res.result as unknown as GameTuple));
  });
  return rows;
}
