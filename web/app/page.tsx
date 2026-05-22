"use client";

import Link from "next/link";
import { formatEther } from "viem";
import { TopBar } from "@/components/layout/TopBar";
import { TrophyIcon } from "@/components/ui/TrophyIcon";
import { Brackets } from "@/components/ui/Brackets";
import { short } from "@/lib/format";
import { HexCrest, HexSlot, crestFor } from "@/lib/crests";
import { useOpenMatches, type OpenMatch } from "@/lib/hooks/useOpenMatches";
import { useSettledMatches } from "@/lib/hooks/useSettledMatches";
import { useLiveMatches, type LiveMatch } from "@/lib/hooks/useLiveMatches";

export default function Home() {
  const { matches } = useOpenMatches();
  const { matches: settled } = useSettledMatches();
  const { matches: live } = useLiveMatches();
  const liveList = live ?? [];
  const list = matches ?? [];
  const sorted = [...list].sort((a, b) => Number(b.stake - a.stake));
  const featured = sorted[0];
  const feed = sorted.slice(0, 3);
  const totalStaked = list.reduce((a, m) => a + m.stake, 0n);

  // global stats from settled matches (real on-chain data)
  const done = settled ?? [];
  const played = done.length;
  const volume = done.reduce((a, m) => a + m.stake * 2n, 0n);
  const goals = done.reduce((a, m) => a + m.score1 + m.score2, 0);
  const playerSet = new Set<string>();
  for (const m of done) {
    playerSet.add(m.p1.toLowerCase());
    playerSet.add(m.p2.toLowerCase());
  }
  for (const m of list) playerSet.add(m.player1.toLowerCase());
  const players = playerSet.size;
  const loadingStats = settled === null;

  return (
    <div className="arena-bg" style={{ minHeight: "100dvh", position: "relative", overflow: "hidden" }}>
      <TopBar active="home" />

      {/* HERO */}
      <section className="mx-auto max-w-6xl px-6 pt-10 lg:px-9">
        <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_1fr]">
          <div>
            <h1 className="display" style={{ fontSize: "clamp(72px,15vw,168px)", color: "var(--fg)", margin: 0, lineHeight: 0.82, letterSpacing: "-0.03em" }}>
              OUTGUESS.
            </h1>
            <h1 className="display display--ital" style={{ fontSize: "clamp(72px,15vw,168px)", lineHeight: 0.82, margin: "-4px 0 0", letterSpacing: "-0.03em" }}>
              <span className="holo-anim">WIN THE POT.</span>
            </h1>
            <p style={{ fontSize: 18, color: "var(--fg-muted)", maxWidth: 540, marginTop: 24, lineHeight: 1.5 }}>
              A 1v1 on-chain penalty shootout. Stake <span style={{ color: "var(--gold)" }}>OKB</span>, pick a nation,
              read your opponent for five rounds. <span style={{ color: "var(--cyan)" }}>Winner takes pot.</span>
            </p>
            <div className="row" style={{ gap: 12, marginTop: 32, flexWrap: "wrap" }}>
              <Link href="/create" className="btn btn--primary btn--xl">ENTER ARENA →</Link>
              <Link href="/lobby" className="btn btn--ghost btn--xl">browse {list.length} battles</Link>
            </div>
            <div className="row" style={{ gap: 32, marginTop: 36, paddingTop: 24, borderTop: "1px solid var(--line)", flexWrap: "wrap" }}>
              <Stat3 label="open pots" value={String(list.length)} color="var(--cyan)" />
              <Stat3 label="matches played" value={loadingStats ? "—" : String(played)} color="var(--gold)" />
              <Stat3 label="players" value={loadingStats ? "—" : String(players)} color="var(--magenta)" />
            </div>
          </div>

          {featured ? <FeaturedVS m={featured} /> : <EmptyFeatured />}
        </div>
      </section>

      {/* LIVE TICKER — spectate in-progress matches straight from the landing */}
      {liveList.length > 0 && (
        <section className="mx-auto max-w-6xl px-6 lg:px-9" style={{ padding: "20px 24px 0" }}>
          <div className="panel row" style={{ padding: "10px 16px", gap: 14, borderColor: "var(--goal)", boxShadow: "0 0 24px -12px var(--goal)" }}>
            <span className="tag tag--goal" style={{ flexShrink: 0 }}><span className="live-pulse" style={{ background: "var(--goal)" }} />LIVE NOW</span>
            <div className="ticker-mask" style={{ flex: 1, minWidth: 0 }}>
              <div className="ticker-track" style={{ animationDuration: `${Math.max(14, liveList.length * 7)}s` }}>
                {[...liveList, ...liveList].map((m, i) => <LiveChip key={`${m.id}-${i}`} m={m} />)}
              </div>
            </div>
            <Link href="/lobby" className="mono" style={{ fontSize: 10, color: "var(--goal)", flexShrink: 0, letterSpacing: "0.14em", textTransform: "uppercase", textDecoration: "none" }}>watch all →</Link>
          </div>
        </section>
      )}

      {/* LIVE STATS BAND */}
      <section className="mx-auto max-w-6xl px-6 lg:px-9" style={{ padding: "48px 24px 0" }}>
        <div className="row between" style={{ marginBottom: 14 }}>
          <div className="eyebrow eyebrow--gold">◆ on-chain · live</div>
          <Link href="/leaderboard" className="mono" style={{ fontSize: 12, color: "var(--gold)", letterSpacing: "0.18em", textTransform: "uppercase", textDecoration: "none" }}>
            full leaderboard →
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
          <BandStat label="matches played" value={loadingStats ? "—" : String(played)} c="var(--cyan)" />
          <BandStat label="total volume" value={loadingStats ? "—" : Number(formatEther(volume)).toFixed(2)} unit="OKB" c="var(--gold)" />
          <BandStat label="goals scored" value={loadingStats ? "—" : String(goals)} c="var(--goal)" />
          <BandStat label="players" value={loadingStats ? "—" : String(players)} c="var(--magenta)" />
          <BandStat label="okb at stake" value={Number(formatEther(totalStaked)).toFixed(2)} unit="OKB" c="var(--fg)" />
        </div>
      </section>

      {/* LIVE FEED */}
      <section className="mx-auto max-w-6xl px-6 lg:px-9" style={{ padding: "48px 24px 28px" }}>
        <div className="row between" style={{ marginBottom: 20, alignItems: "baseline" }}>
          <div>
            <div className="eyebrow eyebrow--cyan">◆ open now</div>
            <div className="display" style={{ fontSize: "clamp(32px,6vw,56px)", color: "var(--fg)", marginTop: 4, lineHeight: 0.9 }}>
              CHALLENGES WAITING.
            </div>
          </div>
          <Link href="/lobby" className="mono" style={{ fontSize: 12, color: "var(--cyan)", letterSpacing: "0.18em", textTransform: "uppercase", textDecoration: "none" }}>
            view all →
          </Link>
        </div>
        {feed.length === 0 ? (
          <div className="panel" style={{ padding: 40, textAlign: "center" }}>
            <div className="muted">No open challenges yet.</div>
            <Link href="/create" className="btn btn--primary btn--sm" style={{ marginTop: 16 }}>deploy the first →</Link>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-3">
            {feed.map((m) => <MiniMatch key={m.id.toString()} m={m} />)}
          </div>
        )}
      </section>

      {/* RULES */}
      <section className="mx-auto max-w-6xl px-6 lg:px-9" style={{ padding: "48px 24px" }}>
        <div style={{ marginBottom: 28 }}>
          <div className="eyebrow eyebrow--magenta">★ the loop</div>
          <div className="display" style={{ fontSize: "clamp(40px,8vw,88px)", color: "var(--fg)", marginTop: 6, lineHeight: 0.9, letterSpacing: "-0.02em" }}>
            FIVE ROUNDS. ONE POT.{" "}
            <span className="display--ital" style={{ color: "var(--cyan)" }}>no draws on tape.</span>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {[
            { n: "01", verb: "STAKE", sub: "put OKB on the line", body: "Pick a nation. Set your wager. Post a public challenge — escrowed on X Layer.", color: "var(--gold)" },
            { n: "02", verb: "COMMIT", sub: "shoot — and dive", body: "Each round you secretly pick a zone for both. Hashed commits, on-chain.", color: "var(--cyan)" },
            { n: "03", verb: "REVEAL", sub: "rock-paper-scissors with money", body: "Both reveal at once. Shot ≠ opponent's dive = goal. Five rounds. Winner takes pot.", color: "var(--goal)" },
          ].map((s) => (
            <div key={s.n} className="panel brackets" style={{ padding: 28, minHeight: 240 }}>
              <Brackets />
              <div className="display tabular" style={{ fontSize: 80, color: s.color, lineHeight: 0.85, letterSpacing: "-0.03em" }}>{s.n}</div>
              <div className="display" style={{ fontSize: 44, color: "var(--fg)", lineHeight: 0.9, marginTop: 14 }}>{s.verb}.</div>
              <div className="display display--ital" style={{ fontSize: 17, color: s.color, marginTop: 6 }}>↳ {s.sub}</div>
              <p style={{ fontSize: 14, color: "var(--fg-muted)", marginTop: 16, lineHeight: 1.5 }}>{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* season strip */}
      <section className="mx-auto max-w-6xl px-6 lg:px-9" style={{ padding: "20px 24px 64px" }}>
        <div className="panel" style={{ padding: "24px 32px" }}>
          <div className="row between" style={{ flexWrap: "wrap", gap: 16 }}>
            <div className="row" style={{ gap: 24 }}>
              <TrophyIcon size={56} />
              <div>
                <div className="eyebrow eyebrow--gold">◆ season 01 · world cup 2026</div>
                <div className="display" style={{ fontSize: 30, color: "var(--fg)", marginTop: 4, lineHeight: 1 }}>
                  THE QUALIFIERS.{" "}
                  <span className="display--ital" style={{ color: "var(--fg-muted)" }}>built on x layer.</span>
                </div>
                <div className="mono" style={{ fontSize: 12, color: "var(--fg-muted)", marginTop: 6, letterSpacing: "0.08em" }}>
                  every match settles on-chain · winner takes 97.5% of the pot
                </div>
              </div>
            </div>
            <Link href="/create" className="btn btn--cyan btn--lg">DEPLOY CHALLENGE →</Link>
          </div>
        </div>
      </section>

      <footer style={{ borderTop: "1px solid var(--line)", padding: "20px 24px" }}>
        <div className="mx-auto max-w-6xl row between" style={{ flexWrap: "wrap", gap: 12 }}>
          <div className="display" style={{ fontSize: 22, color: "var(--fg)" }}>PANENKA</div>
          <div className="mono" style={{ fontSize: 10, color: "var(--fg-soft)", letterSpacing: "0.16em", textTransform: "uppercase" }}>
            built on x layer · @xlayerofficial · not affiliated with FIFA
          </div>
        </div>
      </footer>
    </div>
  );
}

function LiveChip({ m }: { m: LiveMatch }) {
  const n1 = crestFor(m.c1);
  const n2 = crestFor(m.c2);
  return (
    <Link href={`/match/${m.id.toString()}`} className="row" style={{ gap: 7, textDecoration: "none", flexShrink: 0, paddingRight: 24 }}>
      <HexCrest code={m.c1} size={20} ring="var(--cyan)" />
      <span className="display tabular" style={{ fontSize: 15, color: "var(--cyan)" }}>{m.score1}</span>
      <span style={{ color: "var(--fg-faint)" }}>–</span>
      <span className="display tabular" style={{ fontSize: 15, color: "var(--magenta)" }}>{m.score2}</span>
      <HexCrest code={m.c2} size={20} ring="var(--magenta)" />
      <span className="mono" style={{ fontSize: 9, color: "var(--fg-soft)", letterSpacing: "0.1em" }}>{n1.code}v{n2.code} · R{m.round + 1}/5 ▶</span>
    </Link>
  );
}

function FeaturedVS({ m }: { m: OpenMatch }) {
  const n = crestFor(m.country);
  const stake = Number(formatEther(m.stake));
  return (
    <div className="panel panel--cyan brackets" style={{ padding: 28, background: "linear-gradient(180deg, rgba(0,229,255,0.08) 0%, var(--panel) 40%, var(--abyss) 100%)" }}>
      <Brackets />
      <div className="row between" style={{ marginBottom: 20, flexWrap: "wrap", gap: 8 }}>
        <div className="row" style={{ gap: 8 }}>
          <span className="tag tag--live"><span className="live-pulse" style={{ background: "var(--fg-strong)" }} />FEATURED · OPEN</span>
          <span className="tag">★ HOT POT</span>
        </div>
        <span className="mono" style={{ fontSize: 10, color: "var(--fg-soft)", letterSpacing: "0.16em", textTransform: "uppercase" }}>match #{m.id.toString()}</span>
      </div>

      <div className="grid items-start" style={{ gridTemplateColumns: "1fr auto 1fr", gap: 8, marginBottom: 20 }}>
        <div style={{ textAlign: "center", minWidth: 0 }}>
          <div className="flex justify-center"><HexCrest code={m.country} size="clamp(56px,14vw,100px)" ring="var(--cyan)" /></div>
          <div className="display" style={{ fontSize: "clamp(14px,3.6vw,20px)", color: "var(--fg)", marginTop: 12, lineHeight: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{n.name.toUpperCase()}</div>
          <div className="mono" style={{ fontSize: 10, color: "var(--fg-soft)", marginTop: 6, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{short(m.player1)}</div>
        </div>
        <div className="display" style={{ fontSize: "clamp(26px,7vw,44px)", color: "var(--fg-faint)", alignSelf: "center", padding: "0 4px" }}>VS</div>
        <div style={{ textAlign: "center", opacity: 0.6, minWidth: 0 }}>
          <div className="flex justify-center"><HexSlot size="clamp(56px,14vw,100px)" /></div>
          <div className="display" style={{ fontSize: "clamp(14px,3.6vw,20px)", color: "var(--fg-muted)", marginTop: 12, lineHeight: 1 }}>AWAITING</div>
          <div className="mono" style={{ fontSize: 10, color: "var(--fg-faint)", marginTop: 6 }}>open slot</div>
        </div>
      </div>

      {/* POT — own banner row so it never overlaps the crests */}
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 24 }}>
        <div className="row" style={{ gap: 12, padding: "10px 22px", background: "rgba(255,201,64,0.08)", border: "1.5px solid var(--gold)", clipPath: "var(--chamfer-sm)" }}>
          <span className="label-xs" style={{ color: "var(--gold)" }}>pot</span>
          <span className="display tabular" style={{ fontSize: 34, color: "var(--gold)", lineHeight: 1, letterSpacing: "-0.02em" }}>{(stake * 2).toFixed(2)}</span>
          <span className="mono" style={{ fontSize: 11, color: "var(--gold-bright)", letterSpacing: "0.16em" }}>OKB</span>
        </div>
      </div>

      <Link href={`/match/${m.id.toString()}`} className="btn btn--primary btn--lg" style={{ width: "100%" }}>
        ACCEPT · {stake} OKB →
      </Link>
    </div>
  );
}

function EmptyFeatured() {
  return (
    <div className="panel panel--cyan brackets" style={{ padding: 40, textAlign: "center" }}>
      <Brackets />
      <div className="display" style={{ fontSize: 32, color: "var(--fg-muted)" }}>NO OPEN BATTLES</div>
      <div className="mono muted" style={{ fontSize: 12, marginTop: 8 }}>be the first to deploy a challenge</div>
      <Link href="/create" className="btn btn--primary btn--lg" style={{ marginTop: 20 }}>DEPLOY →</Link>
    </div>
  );
}

function MiniMatch({ m }: { m: OpenMatch }) {
  const n = crestFor(m.country);
  const stake = Number(formatEther(m.stake));
  return (
    <Link href={`/match/${m.id.toString()}`} className="panel" style={{ padding: 18, textDecoration: "none", display: "block" }}>
      <div className="row between" style={{ marginBottom: 12 }}>
        <span className="tag tag--cyan">OPEN</span>
        <span className="mono" style={{ fontSize: 10, color: "var(--fg-muted)", letterSpacing: "0.14em", textTransform: "uppercase" }}>#{m.id.toString()}</span>
      </div>
      <div className="grid items-center" style={{ gridTemplateColumns: "1fr auto 1fr", gap: 8 }}>
        <div style={{ textAlign: "center" }}>
          <div className="flex justify-center"><HexCrest code={m.country} size={56} ring="var(--cyan)" /></div>
          <div className="display" style={{ fontSize: 13, marginTop: 8, color: "var(--fg)" }}>{n.name.toUpperCase()}</div>
        </div>
        <div className="display" style={{ fontSize: 32, color: "var(--fg-faint)" }}>VS</div>
        <div style={{ textAlign: "center", opacity: 0.6 }}>
          <div className="flex justify-center"><HexSlot size={56} /></div>
          <div className="display" style={{ fontSize: 13, marginTop: 8, color: "var(--fg-muted)" }}>OPEN</div>
        </div>
      </div>
      <div className="row between" style={{ marginTop: 14, paddingTop: 12, borderTop: "1px solid var(--line)" }}>
        <span className="label-xs">pot</span>
        <span className="display tabular" style={{ fontSize: 20, color: "var(--gold)" }}>{(stake * 2).toFixed(2)} <span style={{ fontSize: 10, color: "var(--fg-muted)" }}>OKB</span></span>
        <span className="btn btn--sm">accept →</span>
      </div>
    </Link>
  );
}

function BandStat({ label, value, unit, c }: { label: string; value: string; unit?: string; c: string }) {
  return (
    <div className="panel" style={{ padding: "16px 18px" }}>
      <div className="label-xs">{label}</div>
      <div className="display tabular" style={{ fontSize: 36, color: c, lineHeight: 0.9, marginTop: 6, letterSpacing: "-0.025em" }}>
        {value}
        {unit && <span style={{ fontSize: 11, color: "var(--fg-muted)", marginLeft: 5, letterSpacing: "0.12em" }}>{unit}</span>}
      </div>
    </div>
  );
}

function Stat3({ label, value, suffix, color }: { label: string; value: string; suffix?: string; color?: string }) {
  return (
    <div>
      <div className="label-xs">{label}</div>
      <div className="display tabular" style={{ fontSize: 32, color: color || "var(--fg)", lineHeight: 0.9, marginTop: 4, letterSpacing: "-0.02em" }}>
        {value}
        {suffix && <span style={{ fontSize: 12, color: "var(--fg-muted)", marginLeft: 6, letterSpacing: "0.12em" }}>{suffix}</span>}
      </div>
    </div>
  );
}
