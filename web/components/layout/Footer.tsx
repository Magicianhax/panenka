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
const CONNECT: { label: string; href: string }[] = [
  { label: "@play_panenka", href: X_URL },
  { label: "GitHub", href: GITHUB_URL },
  { label: "X Layer", href: XLAYER_URL },
];

export function Footer() {
  return (
    <footer
      style={{
        marginTop: 64,
        background: "linear-gradient(180deg, rgba(5,7,20,0.55) 0%, rgba(2,4,16,0.85) 100%)",
        backdropFilter: "blur(16px) saturate(140%)",
        WebkitBackdropFilter: "blur(16px) saturate(140%)",
        borderTop: "1px solid var(--line)",
        boxShadow: "inset 0 1px 0 0 rgba(255,201,64,0.22)",
      }}
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-9" style={{ padding: "44px 24px 24px" }}>
        {/* Top CTA strip */}
        <div
          className="row between"
          style={{ flexWrap: "wrap", gap: 24, paddingBottom: 36, borderBottom: "1px solid var(--line-soft)" }}
        >
          <div style={{ maxWidth: 560 }}>
            <div className="eyebrow eyebrow--gold" style={{ marginBottom: 10 }}>◆ join the season</div>
            <div
              className="display"
              style={{ fontSize: "clamp(28px, 4vw, 44px)", color: "var(--fg)", lineHeight: 0.95, letterSpacing: "-0.02em" }}
            >
              READY TO PLAY?{" "}
              <span className="display--ital" style={{ color: "var(--cyan)" }}>your move.</span>
            </div>
          </div>
          <a
            href={X_URL}
            target="_blank"
            rel="noreferrer"
            className="btn btn--primary btn--lg"
            style={{ textDecoration: "none", whiteSpace: "nowrap", maxWidth: "100%" }}
          >
            FOLLOW @play_panenka →
          </a>
        </div>

        {/* Main grid — mobile: brand stacked over a 3-col nav row; desktop: 12-col layout. */}
        <div className="footer-grid" style={{ paddingTop: 36 }}>
          {/* Brand block */}
          <div
            className="footer-brand"
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 18,
              paddingLeft: 16,
              borderLeft: "2px solid var(--gold)",
            }}
          >
            <Link href="/" style={{ display: "inline-flex" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/brand/panenka_lockup.png" alt="PANENKA" style={{ display: "block", height: 34, width: "auto" }} />
            </Link>
            <p
              className="display"
              style={{
                fontSize: 16,
                lineHeight: 1.45,
                color: "var(--fg-muted)",
                maxWidth: 320,
                textTransform: "none",
                fontWeight: 500,
                letterSpacing: 0,
              }}
            >
              1v1 on-chain penalty shootouts. Read your rival, stake OKB, take the pot.
            </p>
            <ContractChip href={contractUrl} addr={shortAddr} />
          </div>

          <div className="footer-nav">
            <FooterCol title="Play" accent="var(--cyan)" links={PLAY} />
            <FooterCol title="Learn" accent="var(--gold)" links={LEARN} />
            <FooterCol title="Connect" accent="var(--magenta)" links={CONNECT} external />
          </div>
        </div>

        {/* Bottom bar */}
        <div
          className="row"
          style={{
            marginTop: 36,
            paddingTop: 18,
            borderTop: "1px solid var(--line-soft)",
            flexWrap: "wrap",
            gap: 12,
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div
            className="mono"
            style={{ fontSize: 11, color: "var(--fg-soft)", letterSpacing: "0.16em", textTransform: "uppercase" }}
          >
            © 2026 <span style={{ color: "var(--gold)" }}>PANENKA</span> · built on X Layer
          </div>
          <div
            className="mono"
            style={{ fontSize: 10, color: "var(--fg-faint)", letterSpacing: "0.14em", textTransform: "uppercase" }}
          >
            not affiliated with FIFA or any football association
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({
  title,
  accent,
  links,
  external,
}: {
  title: string;
  accent: string;
  links: { label: string; href: string }[];
  external?: boolean;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div
        className="mono"
        style={{
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: "0.24em",
          textTransform: "uppercase",
          color: accent,
        }}
      >
        ◆ {title}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {links.map((l) =>
          external ? (
            <a
              key={l.href}
              href={l.href}
              target="_blank"
              rel="noreferrer"
              className="display"
              style={navLinkStyle}
            >
              {l.label} <span style={{ color: accent, marginLeft: 4 }}>↗</span>
            </a>
          ) : (
            <Link key={l.href} href={l.href} className="display" style={navLinkStyle}>
              {l.label}
            </Link>
          )
        )}
      </div>
    </div>
  );
}

const navLinkStyle: React.CSSProperties = {
  fontSize: 17,
  fontWeight: 600,
  color: "var(--fg-muted)",
  textDecoration: "none",
  letterSpacing: "0.005em",
  textTransform: "none",
  lineHeight: 1.1,
};

function ContractChip({ href, addr }: { href: string; addr: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 10,
        padding: "8px 14px",
        background: "rgba(255,201,64,0.06)",
        border: "1px solid rgba(255,201,64,0.35)",
        clipPath: "var(--chamfer-sm)",
        textDecoration: "none",
        width: "fit-content",
      }}
    >
      <span
        className="mono"
        style={{ fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--gold)" }}
      >
        contract
      </span>
      <span
        className="mono tabular"
        style={{ fontSize: 12, color: "var(--fg)", letterSpacing: "0.04em" }}
      >
        {addr}
      </span>
      <span style={{ color: "var(--gold)", fontSize: 12 }}>↗</span>
    </a>
  );
}
