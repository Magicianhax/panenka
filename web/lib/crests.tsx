"use client";

import { useId, type CSSProperties } from "react";

export type CrestSpec = { code: string; name: string };

// Indexed by the contract's country code (uint8). Order is FIXED — existing
// on-chain matches reference these indices. `iso` is the flag-icons code.
type Team = CrestSpec & { iso: string };

export const CRESTS: Team[] = [
  { code: "ARG", name: "Argentina", iso: "ar" },
  { code: "BRA", name: "Brasil", iso: "br" },
  { code: "FRA", name: "France", iso: "fr" },
  { code: "ENG", name: "England", iso: "gb-eng" },
  { code: "ESP", name: "España", iso: "es" },
  { code: "GER", name: "Germany", iso: "de" },
  { code: "POR", name: "Portugal", iso: "pt" },
  { code: "NED", name: "Nederland", iso: "nl" },
  { code: "ITA", name: "Italia", iso: "it" },
  { code: "BEL", name: "België", iso: "be" },
  { code: "CRO", name: "Hrvatska", iso: "hr" },
  { code: "URU", name: "Uruguay", iso: "uy" },
  { code: "MEX", name: "México", iso: "mx" },
  { code: "USA", name: "United States", iso: "us" },
  { code: "JPN", name: "Nippon", iso: "jp" },
  { code: "KOR", name: "Daehan", iso: "kr" },
  { code: "MAR", name: "Maroc", iso: "ma" },
  { code: "SEN", name: "Sénégal", iso: "sn" },
  { code: "CAN", name: "Canada", iso: "ca" },
  { code: "AUS", name: "Australia", iso: "au" },
  // ---- World Cup 2026 field — appended (indices 20+) ----
  { code: "SUI", name: "Suisse", iso: "ch" },
  { code: "DEN", name: "Danmark", iso: "dk" },
  { code: "POL", name: "Polska", iso: "pl" },
  { code: "SRB", name: "Srbija", iso: "rs" },
  { code: "WAL", name: "Cymru", iso: "gb-wls" },
  { code: "COL", name: "Colombia", iso: "co" },
  { code: "ECU", name: "Ecuador", iso: "ec" },
  { code: "GHA", name: "Ghana", iso: "gh" },
  { code: "NGA", name: "Nigeria", iso: "ng" },
  { code: "EGY", name: "Misr", iso: "eg" },
  { code: "CMR", name: "Cameroun", iso: "cm" },
  { code: "CIV", name: "Côte d'Ivoire", iso: "ci" },
  { code: "TUN", name: "Tounes", iso: "tn" },
  { code: "DZA", name: "Al-Jaza'ir", iso: "dz" },
  { code: "KSA", name: "As-Su'udiyya", iso: "sa" },
  { code: "QAT", name: "Qatar", iso: "qa" },
  { code: "IRN", name: "Iran", iso: "ir" },
  { code: "CRC", name: "Costa Rica", iso: "cr" },
  { code: "PER", name: "Perú", iso: "pe" },
  { code: "CHI", name: "Chile", iso: "cl" },
  { code: "PAR", name: "Paraguay", iso: "py" },
  { code: "NOR", name: "Norge", iso: "no" },
  { code: "SWE", name: "Sverige", iso: "se" },
  { code: "AUT", name: "Österreich", iso: "at" },
  { code: "TUR", name: "Türkiye", iso: "tr" },
  { code: "GRE", name: "Hellas", iso: "gr" },
  { code: "SCO", name: "Scotland", iso: "gb-sct" },
  { code: "UKR", name: "Ukraïna", iso: "ua" },
];

export function crestFor(code: number | undefined): Team {
  if (code === undefined || code < 0 || code >= CRESTS.length) return CRESTS[0];
  return CRESTS[code];
}

const SHIELD = "M 4 4 L 56 4 L 56 38 Q 56 60 30 68 Q 4 60 4 38 Z";

/** Real flag clipped into a football-style shield crest (border + sheen). `size` may be a
 *  number (px) or any CSS length (e.g. "clamp(64px,22vw,120px)") to scale on small screens. */
export function Crest({
  code,
  size = 72,
  style = {},
}: {
  code: number;
  size?: number | string;
  style?: CSSProperties;
}) {
  const t = crestFor(code);
  const id = useId().replace(/:/g, "");
  const W = 60;
  const H = 72;
  return (
    <div style={{ width: size, aspectRatio: `${W} / ${H}`, position: "relative", flexShrink: 0, lineHeight: 0, ...style }}>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%" style={{ display: "block" }}>
        <defs>
          <clipPath id={`clip-${id}`}>
            <path d={SHIELD} />
          </clipPath>
          <linearGradient id={`sheen-${id}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.18" />
            <stop offset="48%" stopColor="#ffffff" stopOpacity="0" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0.22" />
          </linearGradient>
        </defs>
        <g clipPath={`url(#clip-${id})`}>
          <foreignObject x="0" y="0" width={W} height={H}>
            <span
              className={`fi fi-${t.iso}`}
              role="img"
              aria-label={t.name}
              style={{ display: "block", width: "100%", height: "100%", backgroundSize: "cover", backgroundPosition: "center" }}
            />
          </foreignObject>
          <rect x="0" y="0" width={W} height={H} fill={`url(#sheen-${id})`} />
        </g>
        <path d={SHIELD} fill="none" stroke="#050813" strokeWidth="2.5" strokeLinejoin="round" />
        <path d={SHIELD} fill="none" stroke="rgba(244,239,226,0.3)" strokeWidth="0.7" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

/** Shield crest with a neon glow (arena HUD). */
export function HexCrest({
  code,
  size = 100,
  ring = "var(--cyan)",
  glow = true,
}: {
  code: number;
  size?: number | string;
  ring?: string;
  mirror?: boolean;
  glow?: boolean;
}) {
  const blur = typeof size === "number" ? `${size / 9}px` : "10px";
  return (
    <div style={{ display: "inline-flex", lineHeight: 0, flexShrink: 0, filter: glow ? `drop-shadow(0 0 ${blur} ${ring})` : "none" }}>
      <Crest code={code} size={size} />
    </div>
  );
}

/** Empty "awaiting challenger" slot — dashed shield with a ?. */
export function HexSlot({ size = 100, ring = "var(--fg-faint)" }: { size?: number | string; ring?: string }) {
  const W = 60;
  const H = 72;
  return (
    <div style={{ width: size, aspectRatio: `${W} / ${H}`, position: "relative", display: "inline-block", flexShrink: 0 }}>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%">
        <path d={SHIELD} fill="var(--abyss)" stroke={ring} strokeWidth="2" strokeDasharray="5 4" strokeLinejoin="round" />
        <text x={W / 2} y={H / 2 - 2} dominantBaseline="central" textAnchor="middle" fill="var(--fg-faint)" style={{ fontFamily: "var(--display)", fontSize: 30, fontWeight: 700 }}>
          ?
        </text>
      </svg>
    </div>
  );
}
