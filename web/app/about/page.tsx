"use client";

import Link from "next/link";
import { TopBar } from "@/components/layout/TopBar";
import { Brackets } from "@/components/ui/Brackets";
import { PENALTY_MATCH_ADDRESS } from "@/lib/contract";
import { short } from "@/lib/format";

const EXPLORER = `https://www.oklink.com/xlayer/address/${PENALTY_MATCH_ADDRESS}`;

export default function AboutPage() {
  return (
    <div className="arena-bg" style={{ minHeight: "100dvh" }}>
      <TopBar active="about" />

      <section className="mx-auto max-w-4xl px-6 lg:px-9" style={{ padding: "32px 24px 12px" }}>
        <div className="eyebrow eyebrow--cyan">◆ about</div>
        <div className="display" style={{ fontSize: "clamp(52px,11vw,112px)", color: "var(--fg)", lineHeight: 0.85, marginTop: 4, letterSpacing: "-0.03em" }}>
          PANENKA.
        </div>
        <p style={{ fontSize: 18, color: "var(--fg-muted)", marginTop: 20, lineHeight: 1.6, maxWidth: 620 }}>
          A 1v1 <span style={{ color: "var(--cyan)" }}>on-chain penalty shootout</span>. Stake <span style={{ color: "var(--gold)" }}>OKB</span>,
          pick a nation, and read your opponent for five rounds. It&apos;s rock-paper-scissors with real stakes — pure nerve and mind games.
          <span style={{ color: "var(--fg)" }}> Winner takes the pot.</span>
        </p>
      </section>

      <section className="mx-auto max-w-4xl px-6 lg:px-9 grid gap-4 md:grid-cols-2" style={{ padding: "24px 24px" }}>
        <Card title="The name" accent="var(--gold)">
          A <em>Panenka</em> is the cheekiest penalty in football — you don&apos;t out-power the keeper, you <strong style={{ color: "var(--fg)" }}>out-think</strong> him.
          That&apos;s the whole game here: every round is a duel of reads and bluffs.
        </Card>
        <Card title="Provably fair" accent="var(--cyan)">
          Each round both players <strong style={{ color: "var(--fg)" }}>commit</strong> a hashed move, then <strong style={{ color: "var(--fg)" }}>reveal</strong> it.
          Nobody — not even us — can see your pick before it&apos;s locked. The contract resolves every goal on-chain.
        </Card>
        <Card title="Winner takes the pot" accent="var(--goal)">
          Both stakes form the pot. The winner takes <strong style={{ color: "var(--fg)" }}>97.5%</strong>; a flat 2.5% fee keeps the lights on.
          A draw refunds both players in full.
        </Card>
        <Card title="Fully on X Layer" accent="var(--magenta)">
          Stakes are escrowed by the smart contract and paid out trustlessly. No house, no custody — just two players and the chain.
          Built for the <strong style={{ color: "var(--fg)" }}>X Cup</strong> · World Cup 2026 season.
        </Card>
      </section>

      <section className="mx-auto max-w-4xl px-6 lg:px-9" style={{ padding: "12px 24px 64px" }}>
        <div className="panel brackets" style={{ padding: 24 }}>
          <Brackets />
          <div className="eyebrow eyebrow--gold" style={{ marginBottom: 12 }}>◆ on-chain</div>
          <Row label="Network" value="X Layer mainnet · chainId 196" />
          <Row label="Token" value="OKB (native)" />
          <Row label="Contract" value={short(PENALTY_MATCH_ADDRESS)} href={EXPLORER} />
          <Row label="Fee" value="2.5% of the pot" />
          <div className="row" style={{ gap: 12, marginTop: 20, flexWrap: "wrap" }}>
            <Link href="/faq" className="btn btn--ghost">how to play →</Link>
            <Link href="/create" className="btn btn--primary">deploy a challenge →</Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function Card({ title, accent, children }: { title: string; accent: string; children: React.ReactNode }) {
  return (
    <div className="panel" style={{ padding: 22 }}>
      <div className="display" style={{ fontSize: 22, color: accent, lineHeight: 1 }}>{title}</div>
      <p style={{ fontSize: 14, color: "var(--fg-muted)", marginTop: 10, lineHeight: 1.6 }}>{children}</p>
    </div>
  );
}

function Row({ label, value, href }: { label: string; value: string; href?: string }) {
  return (
    <div className="row between" style={{ padding: "10px 0", borderBottom: "1px solid var(--line-soft)", gap: 12 }}>
      <span className="label-xs">{label}</span>
      {href ? (
        <a href={href} target="_blank" rel="noreferrer" className="mono" style={{ fontSize: 13, color: "var(--cyan)", textDecoration: "none" }}>{value} ↗</a>
      ) : (
        <span className="mono" style={{ fontSize: 13, color: "var(--fg)" }}>{value}</span>
      )}
    </div>
  );
}
