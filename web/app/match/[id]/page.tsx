"use client";

import { use, useEffect, useMemo, useRef, useState } from "react";
import { notFound } from "next/navigation";
import {
  useAccount,
  useReadContract,
  useReadContracts,
} from "wagmi";
import { formatEther, type Address } from "viem";
import { TopBar } from "@/components/layout/TopBar";
import { useToast } from "@/components/ui/Toast";
import { playSfx, setCrowd } from "@/lib/sound";
import { crestFor } from "@/lib/crests";
import { PENALTY_MATCH_ADDRESS, penaltyMatchAbi } from "@/lib/contract";
import { ArenaBg } from "@/components/match/ArenaBg";
import { ProfilePanel, OpenProfilePanel, CenterHud, SideScore } from "@/components/match/Hud";
import { Slam, Victory } from "@/components/match/Overlays";
import { Deck, ActiveDeck, JoinDeck, WaitingDeck, PotRibbon } from "@/components/match/Decks";
import { UrgentClock } from "@/components/match/UrgentClock";
import { PlayerChat, CrowdChat } from "@/components/match/MatchChat";
import { POLL, REVEAL_WINDOW, ZERO_ADDR, slotsFor, type GameTuple, type RoundTuple } from "@/components/match/types";

/** Fires toasts on the transitions a player would otherwise miss while looking away. */
function MatchNotifier({ joined, st, isP1, youAreIn }: { joined: boolean; st: number; isP1: boolean; youAreIn: boolean }) {
  const toast = useToast();
  const prevJoined = useRef(joined);
  const prevSt = useRef(st);
  useEffect(() => {
    if (joined && !prevJoined.current && isP1) toast("Challenger joined — game on!", "success");
    prevJoined.current = joined;
  }, [joined, isP1, toast]);
  useEffect(() => {
    if (st === 3 && prevSt.current === 2 && youAreIn) toast("Full time — check your claim", "warn");
    if (st === 2 && prevSt.current === 1 && youAreIn) toast("Match is live — round 1", "info");
    prevSt.current = st;
  }, [st, youAreIn, toast]);
  // crowd ambience while the match is live; whistle when it kicks off
  useEffect(() => {
    if (st === 2) { setCrowd(true); playSfx("whistle"); }
    else setCrowd(false);
    return () => setCrowd(false);
  }, [st]);
  return null;
}

export default function MatchPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  // BigInt() throws on non-numeric input; bad URLs (e.g. /match/abc) trigger
  // the not-found page instead of an uncaught render error.
  const matchId = useMemo(() => {
    try { return BigInt(id); } catch { notFound(); }
  }, [id]);
  const { address, isConnected } = useAccount();
  const [aimShoot, setAimShoot] = useState<number | null>(null);

  const { data: game, refetch: refetchGame } = useReadContract({
    address: PENALTY_MATCH_ADDRESS,
    abi: penaltyMatchAbi,
    functionName: "games",
    args: [matchId],
    query: { refetchInterval: POLL },
  }) as { data: GameTuple | undefined; refetch: () => void };

  const { data: roundsRaw, refetch: refetchRounds } = useReadContracts({
    contracts: [0, 1, 2, 3, 4].map((r) => ({
      address: PENALTY_MATCH_ADDRESS, abi: penaltyMatchAbi, functionName: "getRound", args: [matchId, r],
    })),
    query: { refetchInterval: POLL, enabled: !!game },
  });

  const refetchAll = () => { refetchGame(); refetchRounds(); };

  if (!game) {
    return (
      <div className="arena-bg" style={{ minHeight: "100dvh" }}>
        <TopBar active="lobby" />
        <div className="row" style={{ justifyContent: "center", minHeight: 400, color: "var(--fg-soft)", fontFamily: "var(--mono)" }}>loading match #{id}…</div>
      </div>
    );
  }

  const [player1, player2, stake, country1, country2, score1, score2, currentRound, state, lastActionAt] = game;
  const rounds = (roundsRaw ?? []).map((r) => (r?.status === "success" ? (r.result as unknown as RoundTuple) : undefined));
  const isP1 = address?.toLowerCase() === player1.toLowerCase();
  const isP2 = address?.toLowerCase() === player2.toLowerCase();
  const youAreIn = isP1 || isP2;
  const joined = player2 !== ZERO_ADDR;
  const round = rounds[Number(currentRound)];
  const slots1 = slotsFor(rounds, 1);
  const slots2 = slotsFor(rounds, 2);
  const pot = Number(formatEther(stake)) * 2;
  const st = Number(state);

  return (
    <div style={{ minHeight: "100dvh", position: "relative", overflow: "hidden", background: "var(--void)" }}>
      <TopBar active="lobby" />
      <MatchNotifier joined={joined} st={st} isP1={isP1} youAreIn={youAreIn} />

      {/* full-bleed arena */}
      <div className="scanlines" style={{ position: "relative", width: "100%", height: "min(58vh, 640px)", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0 }}>
          <ArenaBg round={round} isP1={isP1} aimShoot={st === 2 ? aimShoot : null} />
        </div>

        {/* top HUD */}
        <div className="grid" style={{ position: "absolute", top: 0, left: 0, right: 0, padding: "12px 12px 0", zIndex: 5, gridTemplateColumns: "1fr auto 1fr", gap: 8, alignItems: "flex-start" }}>
          <ProfilePanel ring="var(--cyan)" country={country1} addr={player1} you={isP1} side="home" />
          <CenterHud st={st} currentRound={Number(currentRound)} />
          {joined ? (
            <ProfilePanel ring="var(--magenta)" country={country2} addr={player2} you={isP2} side="away" />
          ) : (
            <OpenProfilePanel />
          )}
        </div>

        {/* side scores */}
        <div style={{ position: "absolute", left: 12, top: "44%", zIndex: 5 }}>
          <SideScore label={crestFor(country1).code} score={score1} slots={slots1} current={st === 2 ? Number(currentRound) : -1} accent="var(--cyan)" />
        </div>
        <div style={{ position: "absolute", right: 12, top: "44%", zIndex: 5, textAlign: "right" }}>
          <SideScore label={joined ? crestFor(country2).code : "—"} score={score2} slots={slots2} accent="var(--magenta)" align="right" />
        </div>

        {/* urgent countdown — big center alert in the final seconds */}
        {st === 2 && youAreIn && <UrgentClock deadline={Number(lastActionAt) + REVEAL_WINDOW} />}

        {/* outcome slam */}
        <Slam rounds={rounds} isP1={isP1} />

        {/* victory / cancelled */}
        {st === 3 && <Victory score1={score1} score2={score2} stake={stake} c1={country1} c2={country2} isP1={isP1} isP2={isP2} />}
        {st === 4 && (
          <div className="row" style={{ position: "absolute", inset: 0, zIndex: 9, justifyContent: "center", background: "rgba(5,7,20,0.9)" }}>
            <div className="display" style={{ fontSize: "clamp(56px,16vw,96px)", color: "var(--fg-muted)" }}>CANCELLED.</div>
          </div>
        )}
      </div>

      {/* bottom control deck */}
      <div style={{ position: "relative", zIndex: 6 }}>
        {!isConnected && st !== 3 && (
          <Deck><div className="display" style={{ fontSize: 20, color: "var(--cyan)", textAlign: "center", width: "100%" }}>CONNECT WALLET ↑ TO PLAY OR CHEER</div></Deck>
        )}
        {isConnected && st === 1 && !youAreIn && <JoinDeck matchId={matchId} stake={stake} onJoined={refetchAll} />}
        {isConnected && st === 1 && isP1 && <WaitingDeck matchId={matchId} stake={stake} onCancelled={refetchAll} />}
        {isConnected && st === 2 && youAreIn && round && (
          <ActiveDeck matchId={matchId} round={Number(currentRound)} roundData={round} isP1={isP1} address={address!} lastActionAt={Number(lastActionAt)} onProgress={refetchAll} onAim={setAimShoot} />
        )}
        {isConnected && st === 2 && !youAreIn && (
          <Deck><div className="display" style={{ fontSize: 18, color: "var(--fg-muted)", width: "100%", textAlign: "center" }}>● SPECTATING · ROUND {Number(currentRound) + 1} / 5</div></Deck>
        )}
        {isConnected && address && st !== 4 && (
          youAreIn ? (
            <PlayerChat matchId={id} self={address} players={{ p1: player1, p2: player2 }} />
          ) : (
            <CrowdChat matchId={id} self={address} players={{ p1: player1, p2: player2 }} />
          )
        )}
        <PotRibbon pot={pot} id={id} />
      </div>
    </div>
  );
}
