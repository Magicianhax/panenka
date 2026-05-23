"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAccount, useReadContract, useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { formatEther } from "viem";
import { crestFor } from "@/lib/crests";
import { PENALTY_MATCH_ADDRESS, penaltyMatchAbi } from "@/lib/contract";
import { playSfx } from "@/lib/sound";
import { slotsFor, type RoundTuple, type Slot } from "./types";

/** Flashes GOAL/SAVE for the player whenever a new round resolves. */
export function Slam({ rounds, isP1 }: { rounds: (RoundTuple | undefined)[]; isP1: boolean }) {
  const slots = slotsFor(rounds, isP1 ? 1 : 2);
  const resolved = slots.filter((s) => s !== "pending").length;
  const last = resolved > 0 ? slots[resolved - 1] : null; // primitive: stable across renders
  const prev = useRef(resolved);
  const [show, setShow] = useState<null | Slot>(null);
  useEffect(() => {
    if (resolved > prev.current && (last === "goal" || last === "save")) {
      setShow(last);
      prev.current = resolved;
      playSfx("kick");
      const sfx = setTimeout(() => playSfx(last === "goal" ? "goal" : "save"), 480);
      const t = setTimeout(() => setShow(null), 1800);
      return () => { clearTimeout(t); clearTimeout(sfx); };
    }
    prev.current = resolved;
  }, [resolved, last]); // primitives only — the effect no longer re-runs every render and cancels its own timer
  if (!show) return null;
  const goal = show === "goal";
  return (
    <div style={{ position: "absolute", inset: 0, zIndex: 8, pointerEvents: "none", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
      <div className="display" style={{ fontSize: "clamp(96px,28vw,320px)", lineHeight: 0.78, letterSpacing: "-0.06em", animation: "slam-v3 800ms cubic-bezier(0.34,1.56,0.64,1) forwards", color: goal ? undefined : "var(--save)", textShadow: goal ? "0 0 60px rgba(0,255,140,0.6)" : "0 0 50px rgba(255,61,90,0.5)" }}>
        <span className={goal ? "holo-anim" : ""}>{goal ? "GOAL." : "SAVED."}</span>
      </div>
    </div>
  );
}

export function Victory({ score1, score2, stake, c1, c2, isP1, isP2 }: { score1: number; score2: number; stake: bigint; c1: number; c2: number; isP1: boolean; isP2: boolean }) {
  const router = useRouter();
  const { address } = useAccount();
  const tie = score1 === score2;
  const p1Won = score1 > score2;
  const youWon = (isP1 && p1Won) || (isP2 && !p1Won && !tie);
  const youLost = !tie && !youWon && (isP1 || isP2);
  const winnerName = tie ? null : p1Won ? crestFor(c1).name : crestFor(c2).name;
  const loserName = p1Won ? crestFor(c2).name : crestFor(c1).name;
  const prize = (stake * 2n * 9750n) / 10000n;
  const myNation = isP1 ? c1 : c2;
  const url = typeof window !== "undefined" ? window.location.href : "";
  const tweet = encodeURIComponent(
    tie
      ? `Penalty shootout ended ${score1}-${score2} — a draw. Play @play_panenka on @XLayerOfficial. ${url}`
      : `${winnerName} beat ${loserName} ${Math.max(score1, score2)}-${Math.min(score1, score2)} and took ${formatEther(prize)} OKB. Play @play_panenka on @XLayerOfficial. ${url}`
  );
  const headline = tie ? "STALEMATE." : youWon ? "VICTORY." : youLost ? "DEFEAT." : `${winnerName?.toUpperCase()} WINS.`;
  const holo = youWon || (!isP1 && !isP2 && !tie);

  const stung = useRef(false);
  useEffect(() => {
    if (stung.current) return;
    stung.current = true;
    if (youWon) playSfx("victory");
    else if (youLost) playSfx("defeat");
  }, [youWon, youLost]);

  // pull-payment: winnings / refunds wait in `pending` until claimed
  const { data: pending, refetch } = useReadContract({
    address: PENALTY_MATCH_ADDRESS,
    abi: penaltyMatchAbi,
    functionName: "pending",
    args: address ? [address] : undefined,
    query: { enabled: !!address && (isP1 || isP2), refetchInterval: 5000 },
  }) as { data: bigint | undefined; refetch: () => void };
  const claimable = pending ?? 0n;
  const myMatch = tie ? stake : youWon ? prize : 0n; // what THIS match added to the balance
  const { data: hash, writeContract, isPending: isWriting } = useWriteContract();
  const { isLoading: isMining, isSuccess } = useWaitForTransactionReceipt({ hash });
  if (isSuccess) refetch();
  const onClaim = () => writeContract({ address: PENALTY_MATCH_ADDRESS, abi: penaltyMatchAbi, functionName: "withdraw", args: [] });

  return (
    <div style={{ position: "absolute", inset: 0, zIndex: 9, background: "rgba(5,7,20,0.93)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 20, textAlign: "center", overflowY: "auto" }}>
      <div className="row" style={{ gap: 8, marginBottom: 12, flexWrap: "wrap", justifyContent: "center" }}>
        <span className="tag tag--gold">★ FULL TIME</span>
        <span className="tag tag--goal"><span className="live-pulse" style={{ background: "var(--goal)" }} />SETTLED ON X LAYER</span>
      </div>
      <div className="display" style={{ fontSize: "clamp(56px,18vw,200px)", lineHeight: 0.82, letterSpacing: "-0.04em" }}>
        <span className={holo ? "holo-anim" : ""} style={{ color: holo ? undefined : tie ? "var(--fg)" : "var(--save)" }}>{headline}</span>
      </div>
      <div className="row" style={{ gap: 32, marginTop: 24, flexWrap: "wrap", justifyContent: "center" }}>
        <Reward label="final score" value={`${score1} – ${score2}`} />
        {!tie && <Reward label="pot" value={`${formatEther(prize)} OKB`} color="var(--gold)" />}
      </div>

      {/* claim — pull-payment (button shows TOTAL balance, not just this match) */}
      {(isP1 || isP2) && claimable > 0n && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, marginTop: 24 }}>
          <button className="btn btn--primary btn--xl" disabled={isWriting || isMining} onClick={onClaim}>
            {isWriting ? "CONFIRM…" : isMining ? "CLAIMING…" : `CLAIM ${Number(formatEther(claimable)).toFixed(3)} OKB →`}
          </button>
          <div className="mono" style={{ fontSize: 11, color: "var(--fg-soft)", letterSpacing: "0.05em", textAlign: "center", maxWidth: 380, lineHeight: 1.5 }}>
            your total claimable balance
            {myMatch > 0n ? ` — incl. ${tie ? "this refund" : "this win"} of ${Number(formatEther(myMatch)).toFixed(3)} OKB` : ""}
          </div>
        </div>
      )}
      {(isP1 || isP2) && claimable === 0n && isSuccess && (
        <div className="mono" style={{ fontSize: 12, color: "var(--goal)", marginTop: 20, letterSpacing: "0.08em" }}>✓ CLAIMED — sent to your wallet</div>
      )}

      <div className="row" style={{ gap: 12, marginTop: 28, flexWrap: "wrap", justifyContent: "center" }}>
        {isP1 || isP2 ? (
          <button className="btn btn--cyan btn--lg" onClick={() => router.push(`/create?stake=${formatEther(stake)}&nation=${myNation}`)}>↻ REMATCH</button>
        ) : (
          <button className="btn btn--cyan btn--lg" onClick={() => router.push("/lobby")}>▶ WATCH ANOTHER</button>
        )}
        <button className="btn btn--ghost btn--lg" onClick={() => router.push("/lobby")}>back to lobby</button>
        <a className="btn btn--ghost btn--lg" href={`https://twitter.com/intent/tweet?text=${tweet}`} target="_blank" rel="noreferrer">SHARE ↗</a>
      </div>
    </div>
  );
}

function Reward({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div style={{ textAlign: "center" }}>
      <div className="label-xs">{label}</div>
      <div className="display tabular" style={{ fontSize: "clamp(32px,9vw,44px)", color: color || "var(--fg)", lineHeight: 0.9, marginTop: 4, letterSpacing: "-0.02em" }}>{value}</div>
    </div>
  );
}
