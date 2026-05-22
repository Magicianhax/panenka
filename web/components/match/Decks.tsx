"use client";

import { useEffect, useState } from "react";
import {
  useSignMessage,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { formatEther, type Address, type Hex } from "viem";
import { Countdown } from "@/components/ui/Countdown";
import { HexCrest, CRESTS } from "@/lib/crests";
import { PENALTY_MATCH_ADDRESS, penaltyMatchAbi } from "@/lib/contract";
import { computeCommit, ensureSeed, loadMove, recoverMove, saltFor, saveMove } from "@/lib/salt";
import { playSfx } from "@/lib/sound";
import { REVEAL_WINDOW, ZERO_HASH, ZONES, type RoundTuple } from "./types";

export function Deck({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ background: "linear-gradient(180deg, transparent, rgba(5,7,20,0.95))", padding: "24px 16px 16px", display: "flex", gap: 16, alignItems: "flex-end" }}>{children}</div>
  );
}

/** Right-aligned timer chip: "time left mm:ss", or a pulsing red TIME UP badge once expired. */
function Clock({ deadline, expired }: { deadline: number; expired: boolean }) {
  if (expired) {
    return (
      <span className="tag tag--save" style={{ animation: "clock-pulse 1s ease-in-out infinite" }}>
        <span className="live-pulse" style={{ background: "var(--save)" }} />TIME UP
      </span>
    );
  }
  return (
    <span className="row" style={{ gap: 6 }}>
      <span className="label-xs">time left</span>
      <Countdown deadline={deadline} />
    </span>
  );
}

function ZoneGrid({ value, onChange, accent, disabled }: { value: number | null; onChange: (v: number) => void; accent: string; disabled?: boolean }) {
  return (
    <div className="grid grid-cols-3" style={{ gap: 6, padding: 6, background: "rgba(5,7,20,0.6)", border: `1px solid ${accent}33`, clipPath: "var(--chamfer-sm)" }}>
      {ZONES.map((z) => {
        const on = value === z.v;
        return (
          <button
            key={z.v}
            disabled={disabled}
            onClick={() => onChange(z.v)}
            style={{
              height: 48,
              background: on ? accent : "rgba(255,255,255,0.03)",
              color: on ? "var(--void)" : "var(--fg-muted)",
              border: `1px solid ${on ? accent : "var(--line)"}`,
              fontFamily: "var(--display)",
              fontWeight: 700,
              fontSize: 13,
              letterSpacing: "0.06em",
              cursor: disabled ? "not-allowed" : "pointer",
              clipPath: "var(--chamfer-sm)",
              boxShadow: on ? `0 0 12px ${accent}88` : "none",
            }}
          >
            {z.label}
          </button>
        );
      })}
    </div>
  );
}

export function ActiveDeck({ matchId, round, roundData, isP1, address, lastActionAt, onProgress, onAim }: { matchId: bigint; round: number; roundData: RoundTuple; isP1: boolean; address: Address; lastActionAt: number; onProgress: () => void; onAim: (v: number | null) => void }) {
  const idStr = matchId.toString();
  const persisted = loadMove(idStr, round, address);
  const [shoot, setShoot] = useState<number | null>(persisted?.shoot ?? null);
  const [dive, setDive] = useState<number | null>(persisted?.dive ?? null);
  const [now, setNow] = useState(() => Math.floor(Date.now() / 1000));

  const myCommit = isP1 ? roundData.commit1 : roundData.commit2;
  const oppCommit = isP1 ? roundData.commit2 : roundData.commit1;
  const myRevealed = isP1 ? roundData.revealed1 : roundData.revealed2;
  const oppRevealed = isP1 ? roundData.revealed2 : roundData.revealed1;
  const haveCommitted = myCommit !== ZERO_HASH;
  const oppCommitted = oppCommit !== ZERO_HASH;
  const bothCommitted = haveCommitted && oppCommitted;
  const phase = !haveCommitted ? "commit" : !bothCommitted ? "waitCommit" : !myRevealed ? "reveal" : !oppRevealed ? "waitReveal" : "advancing";
  const waiting = phase === "waitCommit" || phase === "waitReveal";
  const deadline = lastActionAt + REVEAL_WINDOW;
  const expired = now >= deadline; // derived live, so it resets when the window advances

  // tick once per second to drive the expired state
  useEffect(() => {
    const id = setInterval(() => setNow(Math.floor(Date.now() / 1000)), 1000);
    return () => clearInterval(id);
  }, []);

  // feed the live aim arrow: show the chosen shoot zone only while picking
  useEffect(() => {
    onAim(phase === "commit" ? shoot : null);
    return () => onAim(null);
  }, [shoot, phase, onAim]);

  const { data: hash, writeContract, isPending, error } = useWriteContract();
  const { signMessageAsync } = useSignMessage();
  const { isSuccess, isLoading } = useWaitForTransactionReceipt({ hash });
  const [signing, setSigning] = useState(false);
  const [localErr, setLocalErr] = useState<string | null>(null);
  if (isSuccess) onProgress();
  const busy = isPending || isLoading || signing;

  const onCommit = async () => {
    if (shoot === null || dive === null) return;
    setLocalErr(null);
    try {
      setSigning(true);
      const seed = await ensureSeed(idStr, address, signMessageAsync);
      setSigning(false);
      const salt = saltFor(seed, round);
      saveMove(idStr, round, address, shoot, dive);
      playSfx("lockin");
      writeContract({ address: PENALTY_MATCH_ADDRESS, abi: penaltyMatchAbi, functionName: "commitMove", args: [matchId, computeCommit(shoot, dive, salt, address, matchId, round)] });
    } catch (e) {
      setSigning(false);
      setLocalErr(e instanceof Error ? e.message : "Failed to sign");
    }
  };
  const onReveal = async () => {
    setLocalErr(null);
    try {
      setSigning(true);
      const seed = await ensureSeed(idStr, address, signMessageAsync);
      setSigning(false);
      const salt = saltFor(seed, round);
      // recover the move from cache, current selection, or the on-chain commit (brute-force of 9)
      const move =
        loadMove(idStr, round, address) ??
        (shoot !== null && dive !== null ? { shoot, dive } : null) ??
        recoverMove(seed, address, matchId, round, myCommit as Hex);
      if (!move) {
        setLocalErr("Could not recover your move — pick the same shoot & dive you committed.");
        return;
      }
      writeContract({ address: PENALTY_MATCH_ADDRESS, abi: penaltyMatchAbi, functionName: "revealMove", args: [matchId, move.shoot, move.dive, salt] });
    } catch (e) {
      setSigning(false);
      setLocalErr(e instanceof Error ? e.message : "Failed to sign");
    }
  };
  const onClaim = () => writeContract({ address: PENALTY_MATCH_ADDRESS, abi: penaltyMatchAbi, functionName: "claimTimeout", args: [matchId] });

  if (waiting) {
    return (
      <Deck>
        <div className="panel" style={{ flex: 1, padding: 16, borderColor: "var(--gold)" }}>
          <div className="row between" style={{ flexWrap: "wrap", gap: 8 }}>
            <span className="display" style={{ fontSize: 16, color: "var(--gold)", letterSpacing: "0.12em" }}>
              {phase === "waitCommit" ? "◇ COMMITTED · WAITING" : "● REVEALED · WAITING"}
            </span>
            <span className="row" style={{ gap: 8 }}><span className="label-xs">timeout</span><Countdown deadline={deadline} /></span>
          </div>
          {expired && <button className="btn btn--danger btn--lg" style={{ width: "100%", marginTop: 12 }} disabled={busy} onClick={onClaim}>{busy ? "claiming…" : "opponent stalled — claim pot"}</button>}
          {error && <div className="mono" style={{ fontSize: 11, color: "var(--save)", marginTop: 8 }}>{error.message}</div>}
        </div>
      </Deck>
    );
  }
  if (phase === "reveal") {
    return (
      <Deck>
        <div style={{ flex: 1 }}>
          <div className="row between" style={{ marginBottom: 8, flexWrap: "wrap", gap: 6 }}>
            <span className="label-xs" style={{ color: expired ? "var(--save)" : "var(--cyan)" }}>
              {expired ? "⚠ TIME UP — reveal NOW or the opponent claims the pot" : "◆ reveal your move — or you forfeit"}
            </span>
            <Clock deadline={deadline} expired={expired} />
          </div>
          <button className={`btn btn--xl ${expired ? "btn--danger btn--alarm" : "btn--cyan"}`} style={{ width: "100%" }} disabled={busy} onClick={onReveal}>
            {signing ? "SIGN IN WALLET…" : isPending ? "CONFIRM…" : isLoading ? "REVEALING…" : expired ? "● REVEAL NOW →" : "● REVEAL YOUR MOVE"}
          </button>
          {(localErr || error) && <div className="mono" style={{ fontSize: 11, color: "var(--save)", marginTop: 8, wordBreak: "break-word" }}>{localErr || error?.message}</div>}
        </div>
      </Deck>
    );
  }
  // commit phase — two zone pickers side by side, full-width lock-in below
  return (
    <div style={{ background: "linear-gradient(180deg, transparent, rgba(5,7,20,0.95))", padding: "20px 16px 16px" }}>
      <div className="row between" style={{ marginBottom: 12, flexWrap: "wrap", gap: 6 }}>
        <span className="label-xs" style={{ color: expired ? "var(--save)" : "var(--gold)" }}>
          {expired ? "⚠ TIME UP — lock in NOW before the opponent claims the pot" : "◇ pick shoot + dive, then lock in"}
        </span>
        <Clock deadline={deadline} expired={expired} />
      </div>
      <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div>
          <div className="row between" style={{ marginBottom: 8 }}>
            <span className="display" style={{ fontSize: 15, color: "var(--goal)", letterSpacing: "0.1em" }}>◇ SHOOT</span>
          </div>
          <ZoneGrid value={shoot} onChange={setShoot} accent="var(--goal)" />
        </div>
        <div>
          <div className="row between" style={{ marginBottom: 8 }}>
            <span className="display" style={{ fontSize: 15, color: "var(--save)", letterSpacing: "0.1em" }}>◆ DIVE</span>
          </div>
          <ZoneGrid value={dive} onChange={setDive} accent="var(--save)" />
        </div>
      </div>
      <button className={`btn btn--lg ${expired ? "btn--danger btn--alarm" : "btn--magenta"}`} disabled={shoot === null || dive === null || busy} onClick={onCommit} style={{ width: "100%", marginTop: 12 }}>
        ★ {signing ? "SIGN IN WALLET…" : isPending ? "CONFIRM IN WALLET…" : isLoading ? "LOCKING IN…" : expired ? "LOCK IN NOW — OR FORFEIT →" : "LOCK IN MOVE →"}
      </button>
      {(localErr || error) && <div className="mono" style={{ fontSize: 11, color: "var(--save)", marginTop: 10, textAlign: "center", wordBreak: "break-word" }}>{localErr || error?.message}</div>}
    </div>
  );
}

export function JoinDeck({ matchId, stake, onJoined }: { matchId: bigint; stake: bigint; onJoined: () => void }) {
  const [country, setCountry] = useState(0);
  const { data: hash, writeContract, isPending, error } = useWriteContract();
  const { isSuccess, isLoading } = useWaitForTransactionReceipt({ hash });
  if (isSuccess) onJoined();
  return (
    <div style={{ background: "linear-gradient(180deg, transparent, rgba(5,7,20,0.95))", padding: "20px 16px 16px" }}>
      <div className="row between" style={{ marginBottom: 12, flexWrap: "wrap", gap: 6 }}>
        <span className="display" style={{ fontSize: 16, color: "var(--cyan)", letterSpacing: "0.1em" }}>◆ PICK YOUR NATION & ACCEPT</span>
        <span className="label-xs">stake {formatEther(stake)} OKB</span>
      </div>
      <div className="grid grid-cols-6 gap-1 sm:grid-cols-10" style={{ marginBottom: 14 }}>
        {CRESTS.map((c, code) => (
          <button key={c.code} onClick={() => setCountry(code)} aria-pressed={country === code} style={{ padding: 4, display: "flex", justifyContent: "center", background: country === code ? "rgba(0,229,255,0.12)" : "transparent", border: country === code ? "1.5px solid var(--cyan)" : "1px solid var(--line)", clipPath: "var(--chamfer-sm)", cursor: "pointer" }}>
            <HexCrest code={code} size={32} ring={country === code ? "var(--cyan)" : "var(--fg-soft)"} glow={country === code} />
          </button>
        ))}
      </div>
      <button className="btn btn--primary btn--xl" style={{ width: "100%" }} disabled={isPending || isLoading} onClick={() => writeContract({ address: PENALTY_MATCH_ADDRESS, abi: penaltyMatchAbi, functionName: "joinMatch", args: [matchId, country], value: stake })}>
        {isPending ? "CONFIRM…" : isLoading ? "JOINING…" : `ACCEPT · ${formatEther(stake)} OKB →`}
      </button>
      {error && <div className="mono" style={{ fontSize: 11, color: "var(--save)", marginTop: 8, wordBreak: "break-word" }}>{error.message}</div>}
    </div>
  );
}

export function WaitingDeck({ matchId, stake, onCancelled }: { matchId: bigint; stake: bigint; onCancelled: () => void }) {
  const [copied, setCopied] = useState(false);
  const { data: hash, writeContract, isPending, error } = useWriteContract();
  const { isSuccess, isLoading } = useWaitForTransactionReceipt({ hash });
  if (isSuccess) onCancelled();
  const url = typeof window !== "undefined" ? window.location.href : "";
  return (
    <Deck>
      <div className="panel" style={{ flex: 1, padding: 16 }}>
        <div className="row between" style={{ flexWrap: "wrap", gap: 12 }}>
          <div>
            <div className="display" style={{ fontSize: 16, color: "var(--magenta)", letterSpacing: "0.1em" }}>★ AWAITING CHALLENGER</div>
            <div className="mono" style={{ fontSize: 10, color: "var(--fg-soft)", marginTop: 4 }}>share the link · cancel for full {formatEther(stake)} OKB refund</div>
          </div>
          <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
            <button className="btn btn--ghost btn--sm" onClick={async () => { try { await navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 1500); } catch { /* noop */ } }}>{copied ? "copied ✓" : "↗ copy link"}</button>
            <button className="btn btn--danger btn--sm" disabled={isPending || isLoading} onClick={() => writeContract({ address: PENALTY_MATCH_ADDRESS, abi: penaltyMatchAbi, functionName: "cancelOpen", args: [matchId] })}>{isPending ? "confirm…" : isLoading ? "refunding…" : "cancel · refund"}</button>
          </div>
        </div>
        {error && <div className="mono" style={{ fontSize: 11, color: "var(--save)", marginTop: 8 }}>{error.message}</div>}
      </div>
    </Deck>
  );
}

export function PotRibbon({ pot, id }: { pot: number; id: string }) {
  return (
    <div className="row between" style={{ background: "var(--abyss)", borderTop: "1px solid var(--line)", padding: "10px 16px", fontFamily: "var(--mono)", fontSize: 11, color: "var(--fg-muted)", letterSpacing: "0.16em", textTransform: "uppercase", flexWrap: "wrap", gap: 8 }}>
      <span><span style={{ color: "var(--cyan)" }}>★</span> X CUP · BEST OF 5 · ON-CHAIN</span>
      <span>POT <span className="display tabular" style={{ color: "var(--gold)", fontSize: 16, marginLeft: 8 }}>{pot.toFixed(3)} OKB</span> · WINNER TAKES ALL</span>
      <span>#{id} · X LAYER</span>
    </div>
  );
}
