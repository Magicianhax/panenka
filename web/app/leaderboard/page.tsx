"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useAccount } from "wagmi";
import { formatEther, type Address } from "viem";
import { TopBar } from "@/components/layout/TopBar";
import { short, handleFor } from "@/lib/format";
import { HexCrest, crestFor } from "@/lib/crests";
import { useSettledMatches, type SettledMatch } from "@/lib/hooks/useSettledMatches";

type Row = {
  addr: Address;
  played: number;
  wins: number;
  losses: number;
  draws: number;
  net: bigint; // net OKB (wei)
};

export default function LeaderboardPage() {
  const { address } = useAccount();
  const { matches, error } = useSettledMatches();

  const { board, results, totals } = useMemo(() => {
    const list = matches ?? [];
    const map = new Map<string, Row>();
    const get = (a: Address): Row => {
      const k = a.toLowerCase();
      let r = map.get(k);
      if (!r) {
        r = { addr: a, played: 0, wins: 0, losses: 0, draws: 0, net: 0n };
        map.set(k, r);
      }
      return r;
    };
    let volume = 0n;
    for (const m of list) {
      volume += m.stake * 2n;
      const a = get(m.p1);
      const b = get(m.p2);
      a.played++;
      b.played++;
      const profit = (m.stake * 19500n) / 10000n - m.stake; // payout(2*0.975) - stake = stake*0.95
      if (m.winner === null) {
        a.draws++;
        b.draws++;
      } else if (m.winner.toLowerCase() === m.p1.toLowerCase()) {
        a.wins++;
        b.losses++;
        a.net += profit;
        b.net -= m.stake;
      } else {
        b.wins++;
        a.losses++;
        b.net += profit;
        a.net -= m.stake;
      }
    }
    const board = [...map.values()].sort((x, y) => y.wins - x.wins || (y.net > x.net ? 1 : -1)).slice(0, 50);
    return { board, results: list, totals: { games: list.length, volume } };
  }, [matches]);

  return (
    <div className="arena-bg" style={{ minHeight: "100dvh" }}>
      <TopBar active="ranked" />

      <section className="mx-auto max-w-6xl px-6 lg:px-9" style={{ padding: "32px 24px 0" }}>
        <div className="eyebrow eyebrow--gold">◆ season 01 · records</div>
        <div className="display" style={{ fontSize: "clamp(56px,12vw,128px)", color: "var(--fg)", lineHeight: 0.85, marginTop: 4, letterSpacing: "-0.03em" }}>
          LEADERBOARD.
        </div>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-3" style={{ marginTop: 24 }}>
          <Kpi label="settled matches" value={String(totals.games)} c="var(--cyan)" />
          <Kpi label="total volume" value={`${Number(formatEther(totals.volume)).toFixed(2)}`} unit="OKB" c="var(--gold)" />
          <Kpi label="ranked players" value={String(board.length)} c="var(--magenta)" />
        </div>
      </section>

      {error && (
        <section className="mx-auto max-w-6xl px-6 lg:px-9" style={{ paddingTop: 16 }}>
          <div className="panel" style={{ padding: 16, color: "var(--save)" }}>{error}</div>
        </section>
      )}

      <section className="mx-auto grid max-w-6xl gap-6 px-6 lg:grid-cols-[1.2fr_1fr] lg:px-9" style={{ padding: "28px 24px 64px" }}>
        {/* leaderboard table */}
        <div>
          <div className="eyebrow eyebrow--cyan" style={{ marginBottom: 12 }}>★ top players</div>
          {matches === null ? (
            <div className="col gap-2">{[0, 1, 2, 3, 4].map((i) => <div key={i} className="panel" style={{ height: 56, opacity: 0.5 }} />)}</div>
          ) : board.length === 0 ? (
            <Empty />
          ) : (
            <div className="panel" style={{ padding: 0, overflow: "hidden" }}>
              <div className="lb-row mono" style={{ padding: "12px 16px", borderBottom: "1px solid var(--line)", fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--fg-soft)" }}>
                <span>#</span><span>player</span><span>w-l-d</span><span className="lb-wr">win %</span><span style={{ textAlign: "right" }}>net okb</span>
              </div>
              {board.map((r, i) => {
                const me = address && r.addr.toLowerCase() === address.toLowerCase();
                const wr = r.played ? Math.round((r.wins / r.played) * 100) : 0;
                const net = Number(formatEther(r.net));
                return (
                  <div key={r.addr} className="lb-row" style={{ padding: "12px 16px", borderBottom: "1px solid rgba(46,56,119,0.4)", background: me ? "rgba(0,229,255,0.06)" : "transparent" }}>
                    <span className="display tabular" style={{ fontSize: 18, color: i === 0 ? "var(--gold)" : i === 1 ? "var(--cyan)" : i === 2 ? "var(--magenta)" : "var(--fg-soft)" }}>{String(i + 1).padStart(2, "0")}</span>
                    <span className="mono" style={{ fontSize: 12, color: "var(--fg)", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {handleFor(r.addr)} <span style={{ color: "var(--fg-soft)" }}>· {short(r.addr)}</span>{me && <span style={{ color: "var(--cyan)" }}> · you</span>}
                    </span>
                    <span className="mono tabular" style={{ fontSize: 13 }}>
                      <span style={{ color: "var(--goal)" }}>{r.wins}</span>-<span style={{ color: "var(--save)" }}>{r.losses}</span>-<span style={{ color: "var(--fg-muted)" }}>{r.draws}</span>
                    </span>
                    <span className="lb-wr mono tabular" style={{ fontSize: 13, color: "var(--fg-muted)" }}>{wr}%</span>
                    <span className="display tabular" style={{ fontSize: 16, textAlign: "right", color: net > 0 ? "var(--goal)" : net < 0 ? "var(--save)" : "var(--fg-muted)" }}>
                      {net > 0 ? "+" : ""}{net.toFixed(3)}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* recent results */}
        <div>
          <div className="eyebrow eyebrow--magenta" style={{ marginBottom: 12 }}>● recent results</div>
          {matches === null ? (
            <div className="col gap-2">{[0, 1, 2].map((i) => <div key={i} className="panel" style={{ height: 72, opacity: 0.5 }} />)}</div>
          ) : results.length === 0 ? (
            <Empty />
          ) : (
            <div className="col gap-2">
              {results.slice(0, 12).map((m) => <ResultRow key={m.id.toString()} m={m} />)}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function ResultRow({ m }: { m: SettledMatch }) {
  const n1 = crestFor(m.c1);
  const n2 = crestFor(m.c2);
  const p1Won = m.winner?.toLowerCase() === m.p1.toLowerCase();
  const p2Won = m.winner?.toLowerCase() === m.p2.toLowerCase();
  const prize = Number(formatEther((m.stake * 19500n) / 10000n));
  return (
    <Link href={`/match/${m.id.toString()}`} className="panel" style={{ padding: 14, textDecoration: "none", display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: 10, alignItems: "center" }}>
      <div className="row" style={{ gap: 8 }}>
        <HexCrest code={m.c1} size={36} ring={p1Won ? "var(--gold)" : "var(--line)"} glow={p1Won} />
        <span className="display" style={{ fontSize: 13, color: p1Won ? "var(--gold)" : "var(--fg-muted)" }}>{n1.code}</span>
      </div>
      <div style={{ textAlign: "center" }}>
        <div className="display tabular" style={{ fontSize: 24, lineHeight: 0.9 }}>
          <span style={{ color: p1Won ? "var(--gold)" : "var(--fg)" }}>{m.score1}</span>
          <span style={{ color: "var(--fg-faint)" }}>–</span>
          <span style={{ color: p2Won ? "var(--gold)" : "var(--fg)" }}>{m.score2}</span>
        </div>
        <div className="mono" style={{ fontSize: 9, color: "var(--gold)", letterSpacing: "0.12em" }}>{prize.toFixed(2)} OKB</div>
      </div>
      <div className="row" style={{ gap: 8, justifyContent: "flex-end" }}>
        <span className="display" style={{ fontSize: 13, color: p2Won ? "var(--gold)" : "var(--fg-muted)" }}>{n2.code}</span>
        <HexCrest code={m.c2} size={36} ring={p2Won ? "var(--gold)" : "var(--line)"} glow={p2Won} />
      </div>
    </Link>
  );
}

function Kpi({ label, value, unit, c }: { label: string; value: string; unit?: string; c: string }) {
  return (
    <div className="panel" style={{ padding: "16px 18px" }}>
      <div className="label-xs">{label}</div>
      <div className="display tabular" style={{ fontSize: 40, color: c, lineHeight: 0.9, marginTop: 6, letterSpacing: "-0.025em" }}>
        {value}{unit && <span style={{ fontSize: 12, color: "var(--fg-muted)", marginLeft: 6, letterSpacing: "0.12em" }}>{unit}</span>}
      </div>
    </div>
  );
}

function Empty() {
  return (
    <div className="panel" style={{ padding: 40, textAlign: "center" }}>
      <div className="display" style={{ fontSize: 28, color: "var(--fg-muted)" }}>NO MATCHES YET.</div>
      <Link href="/create" className="btn btn--primary btn--sm" style={{ marginTop: 16 }}>play the first →</Link>
    </div>
  );
}
