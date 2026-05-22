import type { Address } from "viem";

export const ZERO_HASH = "0x0000000000000000000000000000000000000000000000000000000000000000";
export const ZERO_ADDR = "0x0000000000000000000000000000000000000000";
export const REVEAL_WINDOW = 60; // seconds — must match contract REVEAL_WINDOW
export const POLL = 3000;

export const ZONES = [
  { v: 0, label: "LEFT" },
  { v: 1, label: "CENTRE" },
  { v: 2, label: "RIGHT" },
] as const;

export type Slot = "goal" | "save" | "pending";

export type GameTuple = readonly [Address, Address, bigint, number, number, number, number, number, number, bigint];

export type RoundTuple = {
  commit1: `0x${string}`; commit2: `0x${string}`;
  shoot1: number; dive1: number; shoot2: number; dive2: number;
  revealed1: boolean; revealed2: boolean;
};

/** Resolve each of the 5 rounds into goal/save/pending for the given player. */
export function slotsFor(rounds: (RoundTuple | undefined)[], player: 1 | 2): Slot[] {
  return [0, 1, 2, 3, 4].map((r) => {
    const rd = rounds[r];
    if (!rd || !(rd.revealed1 && rd.revealed2)) return "pending";
    const goal = player === 1 ? rd.shoot1 !== rd.dive2 : rd.shoot2 !== rd.dive1;
    return goal ? "goal" : "save";
  });
}
