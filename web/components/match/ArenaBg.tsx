"use client";

import dynamic from "next/dynamic";
import type { RoundTuple } from "./types";

const PenaltyScene3D = dynamic(() => import("@/components/three/PenaltyScene3D"), { ssr: false });

/** Picks the player's own reveal state and feeds shoot/dive + aim arrow into the 3D scene. */
export function ArenaBg({ round, isP1, aimShoot }: { round: RoundTuple | undefined; isP1: boolean; aimShoot: number | null }) {
  const myRevealed = round ? (isP1 ? round.revealed1 : round.revealed2) : false;
  const oppRevealed = round ? (isP1 ? round.revealed2 : round.revealed1) : false;
  const shoot = round ? (isP1 ? round.shoot1 : round.shoot2) : 0;
  const dive = round ? (isP1 ? round.dive1 : round.dive2) : 1;
  const animate = myRevealed && oppRevealed;
  return <PenaltyScene3D shootDir={animate ? shoot : null} diveDir={animate ? dive : 1} animate={animate} aimShoot={animate ? null : aimShoot} />;
}
