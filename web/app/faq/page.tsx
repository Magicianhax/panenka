"use client";

import Link from "next/link";
import { TopBar } from "@/components/layout/TopBar";
import { Brackets } from "@/components/ui/Brackets";

const STEPS = [
  { n: "01", t: "Connect your wallet", b: "Connect on X Layer (chainId 196). You'll stake and win in native OKB." },
  { n: "02", t: "Create or join", b: "Deploy a challenge — pick your nation and set an OKB stake — or accept an open one from the lobby. Both stakes form the pot." },
  { n: "03", t: "Pick shoot + dive", b: "Each of 5 rounds you secretly choose where you SHOOT (left / centre / right) and, as keeper, where you DIVE. Lock it in. One wallet signature per match secures your secret moves." },
  { n: "04", t: "Reveal", b: "Once both players have locked in, reveal. You score when your shot ≠ your opponent's dive; they score when their shot ≠ your dive." },
  { n: "05", t: "Win the pot", b: "Most goals after five rounds wins (it settles early once a lead is uncatchable). A draw refunds both. Winner takes 97.5% of the pot." },
  { n: "06", t: "Claim", b: "Winnings, refunds and cancelled stakes collect in your Profile. Hit Claim to withdraw to your wallet — any time, even later." },
];

const FAQ = [
  { q: "Is it fair?", a: "Yes — it's a commit-reveal scheme. Both players submit a hash of their move first, then reveal. No one can see your pick (or change theirs) until both are locked. Every goal is resolved on-chain." },
  { q: "What does it cost?", a: "A flat 2.5% fee on the pot. The winner takes the other 97.5%. Draws are refunded in full, with no fee." },
  { q: "What token and chain?", a: "Native OKB on X Layer mainnet (chainId 196). Stakes are escrowed by the smart contract — there's no house or custodian." },
  { q: "What if my opponent stalls?", a: "Each move has a 60-second window. If they let it expire, you can claim the pot (or get refunded if neither of you committed). The non-staller never loses to a no-show." },
  { q: "Can I cancel a challenge?", a: "Yes — while it's still open and nobody has joined, the creator can cancel for a full refund (claimable from your Profile)." },
  { q: "Do I need to stay on the same device?", a: "No. Your secret moves are derived from a wallet signature, so they're recoverable on any device by re-signing — clearing your browser won't make you forfeit." },
  { q: "Why does it ask me to sign a message?", a: "That signature deterministically generates your secret salt for the match. It never leaves your device, costs no gas, and makes your commit-reveal both private and recoverable." },
  { q: "How many rounds?", a: "Best of five. Both players shoot AND defend every round, so scores like 4–2 are normal — that's total goals across the five rounds, not five separate kicks each." },
];

const DIRS = ["L", "C", "R"] as const;

/** 3×3 payoff grid: GOAL everywhere your shot ≠ the keeper's dive; SAVE on the diagonal. */
function ScoringMatrix() {
  return (
    <div className="panel" style={{ padding: 22 }}>
      <div className="display" style={{ fontSize: 18, color: "var(--fg)" }}>The payoff</div>
      <p className="mono" style={{ fontSize: 11, color: "var(--fg-soft)", margin: "6px 0 16px", letterSpacing: "0.04em" }}>
        keeper dives →
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "auto repeat(3, 1fr)", gap: 6 }}>
        <div />
        {DIRS.map((d) => (
          <div key={`h${d}`} className="mono" style={{ textAlign: "center", fontSize: 11, color: "var(--magenta)", fontWeight: 700 }}>{d}</div>
        ))}
        {DIRS.map((shoot) => (
          <FragmentRow key={shoot} shoot={shoot} />
        ))}
      </div>
      <p className="mono" style={{ fontSize: 11, color: "var(--fg-soft)", marginTop: 12, letterSpacing: "0.04em" }}>
        ↑ you shoot · <span style={{ color: "var(--goal)" }}>green = goal</span> · <span style={{ color: "var(--save)" }}>red = saved</span>
      </p>
    </div>
  );
}

function FragmentRow({ shoot }: { shoot: string }) {
  return (
    <>
      <div className="mono" style={{ display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: "var(--goal)", fontWeight: 700, paddingRight: 4 }}>{shoot}</div>
      {DIRS.map((dive) => {
        const goal = shoot !== dive;
        const c = goal ? "var(--goal)" : "var(--save)";
        return (
          <div key={`${shoot}${dive}`} style={{ aspectRatio: "1", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, background: `${c}1a`, border: `1px solid ${c}`, clipPath: "var(--chamfer-sm)" }}>
            {goal ? "⚽" : "🧤"}
          </div>
        );
      })}
    </>
  );
}

/** Per-round lifecycle. */
function RoundFlow() {
  const steps = [
    { t: "COMMIT", s: "lock a hashed shoot + dive", c: "var(--gold)" },
    { t: "REVEAL", s: "both unlock at once", c: "var(--cyan)" },
    { t: "RESOLVE", s: "goal or save, on-chain", c: "var(--goal)" },
  ];
  return (
    <div className="panel" style={{ padding: 22 }}>
      <div className="display" style={{ fontSize: 18, color: "var(--fg)" }}>Each round</div>
      <div className="col" style={{ gap: 8, marginTop: 14 }}>
        {steps.map((st, i) => (
          <div key={st.t}>
            <div className="row" style={{ gap: 10, alignItems: "baseline" }}>
              <span className="display tabular" style={{ fontSize: 13, color: st.c, width: 18 }}>{i + 1}</span>
              <span className="display" style={{ fontSize: 15, color: "var(--fg)", letterSpacing: "0.08em" }}>{st.t}</span>
            </div>
            <div className="mono" style={{ fontSize: 11, color: "var(--fg-soft)", marginLeft: 28, marginTop: 2 }}>{st.s}</div>
            {i < steps.length - 1 && <div style={{ marginLeft: 27, height: 10, borderLeft: "1px dashed var(--line)" }} />}
          </div>
        ))}
      </div>
      <div className="mono" style={{ fontSize: 11, color: "var(--gold)", marginTop: 14, letterSpacing: "0.06em", borderTop: "1px solid var(--line-soft)", paddingTop: 12 }}>
        ↻ ×5 rounds → most goals takes the pot
      </div>
    </div>
  );
}

export default function FaqPage() {
  return (
    <div className="arena-bg" style={{ minHeight: "100dvh" }}>
      <TopBar active="how" />

      <section className="mx-auto max-w-4xl px-6 lg:px-9" style={{ padding: "32px 24px 8px" }}>
        <div className="eyebrow eyebrow--gold">◆ how to play</div>
        <div className="display" style={{ fontSize: "clamp(48px,10vw,104px)", color: "var(--fg)", lineHeight: 0.85, marginTop: 4, letterSpacing: "-0.03em" }}>
          OUTGUESS.{" "}
          <span className="display--ital" style={{ color: "var(--cyan)" }}>WIN THE POT.</span>
        </div>
      </section>

      {/* steps */}
      <section className="mx-auto max-w-4xl px-6 lg:px-9 grid gap-3 md:grid-cols-2" style={{ padding: "20px 24px" }}>
        {STEPS.map((s) => (
          <div key={s.n} className="panel" style={{ padding: 20 }}>
            <div className="row" style={{ gap: 12, alignItems: "baseline" }}>
              <span className="display tabular" style={{ fontSize: 32, color: "var(--cyan)", lineHeight: 1 }}>{s.n}</span>
              <span className="display" style={{ fontSize: 18, color: "var(--fg)" }}>{s.t}</span>
            </div>
            <p style={{ fontSize: 14, color: "var(--fg-muted)", marginTop: 10, lineHeight: 1.6 }}>{s.b}</p>
          </div>
        ))}
      </section>

      {/* scoring rule callout */}
      <section className="mx-auto max-w-4xl px-6 lg:px-9" style={{ padding: "8px 24px" }}>
        <div className="panel panel--cyan brackets" style={{ padding: 24 }}>
          <Brackets />
          <div className="eyebrow eyebrow--cyan" style={{ marginBottom: 8 }}>★ the one rule that matters</div>
          <div className="display" style={{ fontSize: "clamp(20px,5vw,28px)", color: "var(--fg)", lineHeight: 1.2 }}>
            You score when your <span style={{ color: "var(--goal)" }}>shot</span> goes where the keeper <span style={{ color: "var(--save)" }}>doesn&apos;t dive</span>.
          </div>
          <p className="mono" style={{ fontSize: 12, color: "var(--fg-soft)", marginTop: 10, letterSpacing: "0.04em" }}>
            shoot ≠ opponent&apos;s dive → GOAL · shoot = opponent&apos;s dive → SAVED
          </p>
        </div>
      </section>

      {/* scoring matrix + round flow */}
      <section className="mx-auto max-w-4xl px-6 lg:px-9 grid gap-4 md:grid-cols-2" style={{ padding: "16px 24px" }}>
        <ScoringMatrix />
        <RoundFlow />
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-4xl px-6 lg:px-9" style={{ padding: "24px 24px 64px" }}>
        <div className="eyebrow eyebrow--magenta" style={{ marginBottom: 16 }}>◆ faq</div>
        <div className="col gap-3">
          {FAQ.map((f) => (
            <div key={f.q} className="panel" style={{ padding: 20 }}>
              <div className="display" style={{ fontSize: 17, color: "var(--fg)" }}>{f.q}</div>
              <p style={{ fontSize: 14, color: "var(--fg-muted)", marginTop: 8, lineHeight: 1.6 }}>{f.a}</p>
            </div>
          ))}
        </div>
        <div className="row" style={{ gap: 12, marginTop: 28, flexWrap: "wrap", justifyContent: "center" }}>
          <Link href="/create" className="btn btn--primary btn--lg">deploy a challenge →</Link>
          <Link href="/lobby" className="btn btn--ghost btn--lg">browse the lobby</Link>
        </div>
      </section>
    </div>
  );
}
