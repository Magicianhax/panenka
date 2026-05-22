"use client";

import type { Address } from "viem";
import { Brackets } from "@/components/ui/Brackets";
import { HexCrest, HexSlot, crestFor } from "@/lib/crests";
import { short } from "@/lib/format";
import type { Slot } from "./types";

export function ProfilePanel({ ring, country, addr, you, side }: { ring: string; country: number; addr: Address; you: boolean; side: "home" | "away" }) {
  const n = crestFor(country);
  const right = side === "away";
  return (
    <div className="panel brackets" style={{ padding: 8, background: "rgba(10,15,34,0.85)", backdropFilter: "blur(6px)", borderColor: ring, boxShadow: `0 0 24px -8px ${ring}`, justifySelf: right ? "end" : "start", width: "fit-content", maxWidth: "44vw" }}>
      <Brackets />
      <div className="row" style={{ gap: 8, flexDirection: right ? "row-reverse" : "row" }}>
        <div style={{ flexShrink: 0 }}>
          <HexCrest code={country} size={40} ring={ring} />
        </div>
        <div style={{ textAlign: right ? "right" : "left", minWidth: 0 }}>
          <span className="label-xs" style={{ color: ring }}>{side}{you ? " · you" : ""}</span>
          <div className="display" style={{ fontSize: "clamp(14px,3.6vw,18px)", color: "var(--fg)", lineHeight: 1, marginTop: 3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{n.name.toUpperCase()}</div>
          <div className="mono" style={{ fontSize: 10, color: "var(--fg-soft)", marginTop: 3 }}>{short(addr)}</div>
        </div>
      </div>
    </div>
  );
}

export function OpenProfilePanel() {
  return (
    <div className="panel" style={{ padding: 8, background: "rgba(10,15,34,0.85)", backdropFilter: "blur(6px)", opacity: 0.7, justifySelf: "end", width: "fit-content", maxWidth: "44vw" }}>
      <div className="row" style={{ gap: 8, flexDirection: "row-reverse" }}>
        <div style={{ flexShrink: 0 }}><HexSlot size={40} /></div>
        <div style={{ textAlign: "right" }}>
          <div className="label-xs">away</div>
          <div className="display" style={{ fontSize: "clamp(14px,3.6vw,18px)", color: "var(--fg-muted)", lineHeight: 1, marginTop: 3 }}>AWAITING</div>
          <div className="mono" style={{ fontSize: 10, color: "var(--fg-faint)", marginTop: 3 }}>open slot</div>
        </div>
      </div>
    </div>
  );
}

export function CenterHud({ st, currentRound }: { st: number; currentRound: number }) {
  return (
    <div style={{ textAlign: "center", padding: "2px 4px" }}>
      <div className="row" style={{ gap: 6, justifyContent: "center", flexWrap: "wrap" }}>
        {st === 2 && <span className="tag tag--live"><span className="live-pulse" style={{ background: "var(--fg-strong)" }} />LIVE</span>}
        <span className="tag">{st === 1 ? "OPEN" : st === 3 ? "FULL TIME" : "ON-CHAIN"}</span>
      </div>
      {st === 2 && (
        currentRound + 1 >= 5 ? (
          <div className="display" style={{ fontSize: 15, color: "var(--gold)", lineHeight: 1, letterSpacing: "0.12em", marginTop: 6, textShadow: "0 0 14px rgba(255,201,64,0.6)" }}>
            FINAL ROUND
          </div>
        ) : (
          <div className="display tabular" style={{ fontSize: 18, color: "var(--cyan)", lineHeight: 1, letterSpacing: "0.06em", marginTop: 6, textShadow: "0 0 16px var(--cyan-glow)" }}>
            ROUND {currentRound + 1}<span style={{ color: "var(--fg-faint)" }}> / 5</span>
          </div>
        )
      )}
    </div>
  );
}

export function SideScore({ label, score, slots, current = -1, accent, align = "left" }: { label: string; score: number; slots: Slot[]; current?: number; accent: string; align?: "left" | "right" }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: align === "right" ? "flex-end" : "flex-start" }}>
      <div className="label-xs" style={{ color: accent }}>{label}</div>
      <div className="display tabular" style={{ fontSize: "clamp(56px,14vw,200px)", color: accent, lineHeight: 0.85, letterSpacing: "-0.05em", textShadow: `0 0 36px ${accent}88` }}>{score}</div>
      <div className="pdots" style={{ marginTop: 8 }}>
        {slots.map((s, i) => (
          <span key={i} className={`pdot ${s === "goal" ? "pdot--goal" : s === "save" ? "pdot--save" : i === current ? "pdot--current" : ""}`} style={{ width: 14, height: 14 }} />
        ))}
      </div>
    </div>
  );
}
