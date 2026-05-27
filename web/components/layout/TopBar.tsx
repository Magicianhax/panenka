"use client";

import { useState } from "react";
import Link from "next/link";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { VolumeControl } from "@/components/ui/Sound";

type NavId = "home" | "lobby" | "create" | "ranked" | "profile" | "how" | "about";

const ITEMS: { id: NavId; label: string; href: string }[] = [
  { id: "home", label: "home", href: "/" },
  { id: "lobby", label: "lobby", href: "/lobby" },
  { id: "create", label: "deploy", href: "/create" },
  { id: "ranked", label: "ranked", href: "/leaderboard" },
  { id: "profile", label: "profile", href: "/profile" },
  { id: "how", label: "how to play", href: "/faq" },
  { id: "about", label: "about", href: "/about" },
];

export function TopBar({ active }: { active?: NavId }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ position: "sticky", top: 0, zIndex: 50, backdropFilter: "blur(10px)" }}>
      <div
        style={{
          background: "linear-gradient(180deg, var(--abyss) 0%, var(--bg) 100%)",
          borderBottom: "1px solid var(--line)",
          padding: "12px 16px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 12,
        }}
      >
        <div className="row" style={{ gap: 28 }}>
          <Link href="/" style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 10 }} onClick={() => setOpen(false)}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/panenka_lockup.png" alt="PANENKA" style={{ display: "block", height: 30, width: "auto" }} />
            <span className="mono" style={{ fontSize: 8, color: "var(--fg-soft)", letterSpacing: "0.22em", whiteSpace: "nowrap", borderLeft: "1px solid var(--line)", paddingLeft: 10 }}>
              X CUP · WC26
            </span>
          </Link>
          <nav className="nav-desktop" style={{ gap: 24 }}>
            {ITEMS.map((it) => (
              <NavLink key={it.id} item={it} active={active === it.id} />
            ))}
          </nav>
        </div>

        <div className="row" style={{ gap: 8 }}>
          <VolumeControl />
          <ConnectButton chainStatus="icon" accountStatus="avatar" showBalance={false} />
          <button
            type="button"
            className="nav-burger"
            aria-label="Toggle menu"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            style={{
              width: 40,
              height: 40,
              background: "var(--panel-2)",
              border: "1.5px solid var(--line)",
              clipPath: "var(--chamfer-sm)",
              color: "var(--fg)",
              cursor: "pointer",
            }}
          >
            <Burger open={open} />
          </button>
        </div>
      </div>

      {/* mobile dropdown */}
      {open && (
        <nav
          className="nav-mobile"
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            background: "var(--bg)",
            borderBottom: "1px solid var(--line)",
            boxShadow: "0 16px 32px -16px rgba(0,0,0,0.8)",
            padding: "8px 12px 14px",
          }}
        >
          {ITEMS.map((it) => (
            <Link
              key={it.id}
              href={it.href}
              onClick={() => setOpen(false)}
              className="display"
              style={{
                fontSize: 18,
                letterSpacing: "0.08em",
                color: active === it.id ? "var(--cyan)" : "var(--fg)",
                textDecoration: "none",
                padding: "14px 8px",
                borderBottom: "1px solid var(--line-soft)",
              }}
            >
              {active === it.id ? "› " : ""}
              {it.label}
            </Link>
          ))}
        </nav>
      )}
    </div>
  );
}

function NavLink({ item, active }: { item: { label: string; href: string }; active: boolean }) {
  return (
    <Link
      href={item.href}
      className="display"
      style={{
        fontSize: 13,
        letterSpacing: "0.1em",
        color: active ? "var(--cyan)" : "var(--fg-muted)",
        textDecoration: "none",
        paddingBottom: 4,
        borderBottom: active ? "2px solid var(--cyan)" : "2px solid transparent",
      }}
    >
      {item.label}
    </Link>
  );
}

function Burger({ open }: { open: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      {open ? (
        <>
          <line x1="4" y1="4" x2="16" y2="16" />
          <line x1="16" y1="4" x2="4" y2="16" />
        </>
      ) : (
        <>
          <line x1="3" y1="6" x2="17" y2="6" />
          <line x1="3" y1="10" x2="17" y2="10" />
          <line x1="3" y1="14" x2="17" y2="14" />
        </>
      )}
    </svg>
  );
}
