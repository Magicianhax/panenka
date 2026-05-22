"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useAccount } from "wagmi";
import { formatEther } from "viem";
import { TopBar } from "@/components/layout/TopBar";
import { Brackets } from "@/components/ui/Brackets";
import { short, handleFor } from "@/lib/format";
import { HexCrest, crestFor } from "@/lib/crests";
import { useOpenMatches, type OpenMatch } from "@/lib/hooks/useOpenMatches";
import { useLiveMatches, type LiveMatch } from "@/lib/hooks/useLiveMatches";

type Sort = "pot" | "new";
type Filter = "all" | "small" | "mid" | "big";

export default function LobbyPage() {
  const { address } = useAccount();
  const { matches, error } = useOpenMatches();
  const { matches: live } = useLiveMatches();
  const [sort, setSort] = useState<Sort>("pot");
  const [filter, setFilter] = useState<Filter>("all");

  const { yours, feed, stats } = useMemo(() => {
    const all = matches ?? [];
    const inRange = (m: OpenMatch) => {
      const v = Number(formatEther(m.stake));
      if (filter === "small") return v <= 1;
      if (filter === "mid") return v > 1 && v < 10;
      if (filter === "big") return v >= 10;
      return true;
    };
    const sorter = (a: OpenMatch, b: OpenMatch) => (sort === "pot" ? Number(b.stake - a.stake) : Number(b.id - a.id));
    const mine = address ? all.filter((m) => m.player1.toLowerCase() === address.toLowerCase()) : [];
    const rest = (address ? all.filter((m) => m.player1.toLowerCase() !== address.toLowerCase()) : all)
      .filter(inRange)
      .sort(sorter);
    const totalStaked = all.reduce((acc, m) => acc + m.stake, 0n);
    const biggest = all.reduce((acc, m) => (m.stake > acc ? m.stake : acc), 0n);
    return { yours: mine.sort(sorter), feed: rest, stats: { count: all.length, totalStaked, biggest } };
  }, [matches, sort, filter, address]);

  return (
    <div className="arena-bg" style={{ minHeight: "100dvh" }}>
      <TopBar active="lobby" />

      <section className="mx-auto max-w-6xl px-6 lg:px-9" style={{ padding: "32px 24px 0" }}>
        <div className="row between" style={{ alignItems: "flex-end", marginBottom: 28, flexWrap: "wrap", gap: 16 }}>
          <div>
            <div className="eyebrow eyebrow--cyan">◆ live battle feed</div>
            <div className="display" style={{ fontSize: "clamp(64px,14vw,140px)", color: "var(--fg)", lineHeight: 0.85, marginTop: 4, letterSpacing: "-0.03em" }}>
              THE FLOOR.
            </div>
          </div>
          <Link href="/create" className="btn btn--primary btn--lg">+ DEPLOY CHALLENGE</Link>
        </div>

        {/* KPI tiles */}
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
          {[
            { l: "open challenges", v: String(stats.count), c: "var(--cyan)", live: true },
            { l: "okb at stake", v: Number(formatEther(stats.totalStaked)).toFixed(2), c: "var(--gold)" },
            { l: "biggest pot", v: Number(formatEther(stats.biggest * 2n)).toFixed(2), c: "var(--magenta)" },
          ].map((k, i) => (
            <div key={i} className="panel" style={{ padding: "18px 20px", position: "relative" }}>
              {k.live && (
                <span className="tag tag--live" style={{ position: "absolute", top: 14, right: 14 }}>
                  <span className="live-pulse" style={{ background: "var(--fg-strong)" }} />LIVE
                </span>
              )}
              <div className="label-xs">{k.l}</div>
              <div className="display tabular" style={{ fontSize: 44, color: k.c, lineHeight: 0.9, letterSpacing: "-0.025em", marginTop: 6 }}>{k.v}</div>
            </div>
          ))}
        </div>
      </section>

      {error && (
        <section className="mx-auto max-w-6xl px-6 lg:px-9" style={{ paddingTop: 16 }}>
          <div className="panel" style={{ padding: 16, color: "var(--save)" }}>{error}</div>
        </section>
      )}

      {/* LIVE NOW — spectate in-progress matches */}
      {live && live.length > 0 && (
        <section className="mx-auto max-w-6xl px-6 lg:px-9" style={{ padding: "32px 24px 12px" }}>
          <div className="eyebrow eyebrow--goal" style={{ marginBottom: 10 }}>
            <span className="live-pulse" style={{ background: "var(--goal)", marginRight: 6 }} />live now · spectate
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {live.map((m) => <LiveRow key={m.id.toString()} m={m} />)}
          </div>
        </section>
      )}

      {yours.length > 0 && (
        <section className="mx-auto max-w-6xl px-6 lg:px-9" style={{ padding: "32px 24px 12px" }}>
          <div className="eyebrow eyebrow--magenta" style={{ marginBottom: 10 }}>★ your deployed challenges</div>
          <div className="col gap-3">
            {yours.map((m) => <BattleRow key={m.id.toString()} m={m} mine />)}
          </div>
        </section>
      )}

      {/* filters */}
      <section className="mx-auto max-w-6xl px-6 lg:px-9" style={{ padding: "24px 24px 4px" }}>
        <div className="row between" style={{ flexWrap: "wrap", gap: 12 }}>
          <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
            <span className="label-xs" style={{ marginRight: 6 }}>filter</span>
            {([["all", "ALL"], ["small", "≤ 1"], ["mid", "1–10"], ["big", "≥ 10"]] as [Filter, string][]).map(([f, l]) => (
              <Chip key={f} on={filter === f} onClick={() => setFilter(f)}>{l}</Chip>
            ))}
          </div>
          <div className="row" style={{ gap: 8 }}>
            <span className="label-xs" style={{ marginRight: 6 }}>sort</span>
            <Chip on={sort === "pot"} onClick={() => setSort("pot")}>★ BIGGEST POT</Chip>
            <Chip on={sort === "new"} onClick={() => setSort("new")}>↓ NEWEST</Chip>
          </div>
        </div>
      </section>

      {/* feed */}
      <section className="mx-auto max-w-6xl px-6 lg:px-9" style={{ padding: "20px 24px 64px" }}>
        {matches === null ? (
          <div className="col gap-3">{[0, 1, 2, 3].map((i) => <div key={i} className="panel" style={{ height: 96, opacity: 0.5 }} />)}</div>
        ) : feed.length === 0 && yours.length === 0 ? (
          <div className="panel" style={{ padding: 48, textAlign: "center" }}>
            <div className="display" style={{ fontSize: 36, color: "var(--fg-muted)" }}>NO OPEN CHALLENGES.</div>
            <Link href="/create" className="btn btn--primary btn--lg" style={{ marginTop: 20 }}>DEPLOY THE FIRST →</Link>
          </div>
        ) : (
          <div className="col gap-3">
            {feed.map((m, i) => <BattleRow key={m.id.toString()} m={m} idx={i + 1} />)}
          </div>
        )}
      </section>
    </div>
  );
}

function BattleRow({ m, idx, mine }: { m: OpenMatch; idx?: number; mine?: boolean }) {
  const n = crestFor(m.country);
  const stake = Number(formatEther(m.stake));
  const profit = stake * 2 * 0.975 - stake;
  const hot = stake >= 10;
  return (
    <Link
      href={`/match/${m.id.toString()}`}
      className="panel brackets"
      style={{
        padding: 16,
        textDecoration: "none",
        display: "flex",
        flexWrap: "wrap",
        gap: 12,
        alignItems: "center",
        borderColor: mine ? "var(--magenta)" : hot ? "var(--gold)" : "var(--line)",
        boxShadow: mine ? "0 0 24px -8px var(--magenta-glow)" : "none",
      }}
    >
      <Brackets />
      {/* nation cluster — grows, can shrink */}
      <div className="row" style={{ gap: 12, flex: "1 1 200px", minWidth: 0 }}>
        <span className="display tabular" style={{ fontSize: 16, color: mine ? "var(--magenta)" : "var(--fg-soft)", flexShrink: 0, width: 24 }}>
          {idx ? String(idx).padStart(2, "0") : "★"}
        </span>
        <HexCrest code={m.country} size={52} ring={mine ? "var(--magenta)" : "var(--cyan)"} />
        <div style={{ minWidth: 0 }}>
          <div className="display" style={{ fontSize: "clamp(18px,5vw,22px)", color: "var(--fg)", lineHeight: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{n.name.toUpperCase()}</div>
          <div className="mono" style={{ fontSize: 10, color: "var(--fg-soft)", letterSpacing: "0.06em", marginTop: 4, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {handleFor(m.player1)} · #{m.id.toString()}
          </div>
        </div>
      </div>
      {/* stake + action */}
      <div className="row" style={{ gap: 12, marginLeft: "auto", flexShrink: 0 }}>
        <div>
          <div className="label-xs">stake / win</div>
          <div className="display tabular" style={{ fontSize: 24, color: hot ? "var(--gold)" : "var(--fg)", lineHeight: 0.9, marginTop: 4 }}>
            {stake} <span style={{ fontSize: 12, color: "var(--goal)" }}>+{profit.toFixed(2)}</span>
          </div>
        </div>
        <span className={`btn btn--sm ${mine ? "btn--danger" : "btn--primary"}`}>{mine ? "manage" : "accept →"}</span>
      </div>
    </Link>
  );
}

function LiveRow({ m }: { m: LiveMatch }) {
  const n1 = crestFor(m.c1);
  const n2 = crestFor(m.c2);
  const pot = Number(formatEther(m.stake)) * 2;
  return (
    <Link
      href={`/match/${m.id.toString()}`}
      className="panel brackets"
      style={{ padding: 16, textDecoration: "none", display: "flex", alignItems: "center", gap: 12, borderColor: "var(--goal)", boxShadow: "0 0 24px -10px var(--goal)" }}
    >
      <Brackets />
      <span className="tag tag--goal" style={{ flexShrink: 0 }}>
        <span className="live-pulse" style={{ background: "var(--goal)" }} />LIVE
      </span>
      <div className="row" style={{ gap: 8, flex: 1, minWidth: 0, justifyContent: "center" }}>
        <HexCrest code={m.c1} size={34} ring="var(--cyan)" />
        <span className="display tabular" style={{ fontSize: 22, color: "var(--cyan)" }}>{m.score1}</span>
        <span className="display" style={{ fontSize: 13, color: "var(--fg-faint)" }}>—</span>
        <span className="display tabular" style={{ fontSize: 22, color: "var(--magenta)" }}>{m.score2}</span>
        <HexCrest code={m.c2} size={34} ring="var(--magenta)" />
      </div>
      <div style={{ textAlign: "right", flexShrink: 0 }}>
        <div className="mono" style={{ fontSize: 9, color: "var(--fg-soft)", letterSpacing: "0.12em" }}>R{m.round + 1}/5 · {pot.toFixed(2)} OKB</div>
        <div className="display" style={{ fontSize: 14, color: "var(--goal)", letterSpacing: "0.06em" }}>{n1.code} v {n2.code} · watch ▶</div>
      </div>
    </Link>
  );
}

function Chip({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      style={{
        height: 30,
        padding: "0 14px",
        background: on ? "rgba(0,229,255,0.14)" : "transparent",
        color: on ? "var(--cyan)" : "var(--fg-muted)",
        border: "1px solid " + (on ? "var(--cyan)" : "var(--line)"),
        clipPath: "var(--chamfer-sm)",
        fontFamily: "var(--mono)",
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: "0.14em",
        textTransform: "uppercase",
        cursor: "pointer",
      }}
    >
      {children}
    </button>
  );
}
