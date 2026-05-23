import Link from "next/link";
import { PENALTY_MATCH_ADDRESS } from "@/lib/contract";
import { activeChain } from "@/lib/chain";

const X_URL = "https://x.com/play_panenka";
const GITHUB_URL = "https://github.com/Magicianhax/panenka";
const XLAYER_URL = "https://www.okx.com/xlayer";

const explorer = activeChain.blockExplorers?.default.url ?? "https://www.oklink.com/xlayer";
const contractUrl = `${explorer}/address/${PENALTY_MATCH_ADDRESS}`;
const shortAddr = `${PENALTY_MATCH_ADDRESS.slice(0, 6)}…${PENALTY_MATCH_ADDRESS.slice(-4)}`;

const PLAY = [
  { label: "Lobby", href: "/lobby" },
  { label: "Create a Match", href: "/create" },
  { label: "Leaderboard", href: "/leaderboard" },
  { label: "Profile", href: "/profile" },
];

const LEARN = [
  { label: "How to Play", href: "/faq" },
  { label: "About", href: "/about" },
];

export function Footer() {
  return (
    <footer style={{ borderTop: "1px solid var(--line)", background: "linear-gradient(180deg, var(--bg) 0%, var(--abyss) 100%)", marginTop: 48 }}>
      <div className="mx-auto max-w-6xl px-6 lg:px-9" style={{ padding: "40px 24px 28px" }}>
        <div className="grid grid-cols-2 md:grid-cols-4" style={{ gap: 32 }}>
          {/* Brand */}
          <div className="col-span-2 md:col-span-1" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <Link href="/" style={{ display: "inline-flex" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/brand/panenka_lockup.png" alt="PANENKA" style={{ display: "block", height: 28, width: "auto" }} />
            </Link>
            <p className="mono" style={{ fontSize: 11, lineHeight: 1.6, color: "var(--fg-muted)", maxWidth: 240 }}>
              1v1 on-chain penalty shootouts. Read your rival, stake OKB, winner takes the pot.
            </p>
            <a
              href={contractUrl}
              target="_blank"
              rel="noreferrer"
              className="mono"
              style={{
                fontSize: 10, letterSpacing: "0.08em", color: "var(--fg-soft)", textDecoration: "none",
                border: "1px solid var(--line)", padding: "6px 10px", clipPath: "var(--chamfer-sm)",
                display: "inline-flex", alignItems: "center", gap: 8, width: "fit-content",
              }}
            >
              <span style={{ color: "var(--gold)" }}>contract</span> {shortAddr} ↗
            </a>
          </div>

          {/* Play */}
          <FooterCol title="Play" links={PLAY} />

          {/* Learn */}
          <FooterCol title="Learn" links={LEARN} />

          {/* Connect */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <ColTitle>Connect</ColTitle>
            <ExtLink href={X_URL}>@play_panenka</ExtLink>
            <ExtLink href={GITHUB_URL}>GitHub</ExtLink>
            <ExtLink href={XLAYER_URL}>X Layer</ExtLink>
          </div>
        </div>

        {/* bottom bar */}
        <div
          className="row"
          style={{
            marginTop: 32, paddingTop: 18, borderTop: "1px solid var(--line-soft)",
            flexWrap: "wrap", gap: 10, justifyContent: "space-between", alignItems: "center",
          }}
        >
          <div className="mono" style={{ fontSize: 10, color: "var(--fg-soft)", letterSpacing: "0.14em", textTransform: "uppercase" }}>
            © 2026 PANENKA · built on X Layer
          </div>
          <div className="mono" style={{ fontSize: 10, color: "var(--fg-soft)", letterSpacing: "0.14em", textTransform: "uppercase" }}>
            not affiliated with FIFA or any football association
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: { label: string; href: string }[] }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <ColTitle>{title}</ColTitle>
      {links.map((l) => (
        <Link
          key={l.href}
          href={l.href}
          className="mono"
          style={{ fontSize: 12, color: "var(--fg-muted)", textDecoration: "none", letterSpacing: "0.04em" }}
        >
          {l.label}
        </Link>
      ))}
    </div>
  );
}

function ColTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="display" style={{ fontSize: 12, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--fg)" }}>
      {children}
    </div>
  );
}

function ExtLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="mono"
      style={{ fontSize: 12, color: "var(--fg-muted)", textDecoration: "none", letterSpacing: "0.04em" }}
    >
      {children} ↗
    </a>
  );
}
