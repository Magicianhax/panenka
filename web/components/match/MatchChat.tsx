"use client";

import { useEffect, useRef, useState } from "react";
import { useMatchChannel, type ChatMsg } from "@/lib/hooks/useMatchChannel";
import { short } from "@/lib/format";
import { playSfx } from "@/lib/sound";

const EMOTES = ["🔥", "😱", "😂", "🧤", "⚽", "💀", "GG", "LET'S GO"] as const;

type Role = "p1" | "p2" | "spec";
const ACCENT: Record<Role, string> = { p1: "var(--cyan)", p2: "var(--magenta)", spec: "var(--fg-soft)" };
const TAG: Record<Role, string> = { p1: "HOME", p2: "AWAY", spec: "CROWD" };
type Players = { p1: string; p2: string };

/** Spectators: a single public crowd chat. */
export function CrowdChat({ matchId, self, players }: { matchId: string; self: string; players: Players }) {
  const ch = useMatchChannel(`${matchId}:crowd`, self);
  return (
    <Shell>
      <ChatBody
        title="◆ crowd chat · public"
        titleRight={ch.online > 0 ? `● ${ch.online} watching` : "cheer them on"}
        messages={ch.messages} send={ch.send} self={self} players={players}
      />
    </Shell>
  );
}

/** Players: private 1v1 chat by default, with a separate Crowd tab so the public never floods it. */
export function PlayerChat({ matchId, self, players }: { matchId: string; self: string; players: Players }) {
  const priv = useMatchChannel(`${matchId}:players`, self);
  const crowd = useMatchChannel(`${matchId}:crowd`, self);
  const [tab, setTab] = useState<"players" | "crowd">("players");
  const active = tab === "players" ? priv : crowd;
  return (
    <Shell>
      <div className="row" style={{ gap: 6, marginBottom: 10 }}>
        <Tab on={tab === "players"} onClick={() => setTab("players")}>● players</Tab>
        <Tab on={tab === "crowd"} onClick={() => setTab("crowd")}>crowd{crowd.online > 0 ? ` · ${crowd.online}` : ""}</Tab>
      </div>
      <ChatBody
        title={tab === "players" ? "private · just you two" : "public · everyone watching"}
        messages={active.messages} send={active.send} self={self} players={players}
        placeholder={tab === "players" ? "trash talk your opponent…" : "talk to the crowd…"}
      />
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return <div style={{ background: "var(--abyss)", borderTop: "1px solid var(--line)", padding: "10px 12px" }}>{children}</div>;
}

function Tab({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className="mono"
      style={{
        height: 26, padding: "0 12px", fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase",
        background: on ? "rgba(0,229,255,0.14)" : "transparent", color: on ? "var(--cyan)" : "var(--fg-muted)",
        border: `1px solid ${on ? "var(--cyan)" : "var(--line)"}`, clipPath: "var(--chamfer-sm)", cursor: "pointer",
      }}
    >
      {children}
    </button>
  );
}

function ChatBody({ title, titleRight, messages, send, self, players, placeholder }: {
  title: string; titleRight?: string; messages: ChatMsg[]; send: (k: "emote" | "chat", t: string) => void;
  self: string; players: Players; placeholder?: string;
}) {
  const [text, setText] = useState("");
  const feedRef = useRef<HTMLDivElement>(null);
  const lastId = useRef<string | null>(null);

  useEffect(() => {
    feedRef.current?.scrollTo({ top: feedRef.current.scrollHeight });
    const newest = messages[messages.length - 1];
    if (newest && newest.id !== lastId.current) {
      lastId.current = newest.id;
      if (newest.kind === "emote") playSfx("reaction");
    }
  }, [messages]);

  const roleOf = (addr: string): Role =>
    addr === players.p1.toLowerCase() ? "p1" : addr === players.p2.toLowerCase() ? "p2" : "spec";

  const onSend = () => { if (!text.trim()) return; send("chat", text); setText(""); };

  return (
    <>
      <div className="row between" style={{ marginBottom: 8 }}>
        <span className="label-xs" style={{ color: "var(--cyan)" }}>{title}</span>
        {titleRight && <span className="mono" style={{ fontSize: 9, color: "var(--fg-soft)", letterSpacing: "0.14em", textTransform: "uppercase" }}>{titleRight}</span>}
      </div>
      {messages.length > 0 && (
        <div ref={feedRef} style={{ maxHeight: 110, overflowY: "auto", display: "flex", flexDirection: "column", gap: 6, marginBottom: 10 }}>
          {messages.map((m) => <Bubble key={m.id} m={m} mine={m.from === self.toLowerCase()} role={roleOf(m.from)} />)}
        </div>
      )}
      <div className="row" style={{ gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
        {EMOTES.map((e) => (
          <button
            key={e}
            onClick={() => send("emote", e)}
            style={{
              height: 34, padding: "0 10px", background: "rgba(255,255,255,0.04)", border: "1px solid var(--line)",
              clipPath: "var(--chamfer-sm)", cursor: "pointer", color: "var(--fg)",
              fontFamily: e.length > 2 ? "var(--display)" : "inherit", fontWeight: e.length > 2 ? 700 : 400,
              fontSize: e.length > 2 ? 11 : 17, letterSpacing: e.length > 2 ? "0.08em" : 0,
            }}
          >
            {e}
          </button>
        ))}
      </div>
      <div className="row" style={{ gap: 8 }}>
        <input
          value={text} maxLength={80}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") onSend(); }}
          placeholder={placeholder ?? "say something… (80 max)"}
          style={{ flex: 1, minWidth: 0, height: 38, padding: "0 12px", background: "rgba(5,7,20,0.6)", border: "1px solid var(--line)", clipPath: "var(--chamfer-sm)", color: "var(--fg)", fontFamily: "var(--mono)", fontSize: 13, outline: "none" }}
        />
        <button className="btn btn--sm btn--cyan" onClick={onSend} disabled={!text.trim()}>send</button>
      </div>
    </>
  );
}

function Bubble({ m, mine, role }: { m: ChatMsg; mine: boolean; role: Role }) {
  const accent = ACCENT[role];
  return (
    <div className="row" style={{ justifyContent: mine ? "flex-end" : "flex-start", gap: 6, alignItems: "baseline" }}>
      {!mine && (
        <span className="mono" style={{ fontSize: 8, color: accent, letterSpacing: "0.12em", flexShrink: 0 }}>
          {TAG[role]}·{short(m.from)}
        </span>
      )}
      <span style={{
        maxWidth: "76%", padding: m.kind === "emote" ? "2px 10px" : "6px 12px",
        background: role === "spec" ? "rgba(255,255,255,0.05)" : `${accent}1a`, border: `1px solid ${accent}`,
        clipPath: "var(--chamfer-sm)", color: "var(--fg)", fontFamily: m.kind === "emote" ? "inherit" : "var(--mono)",
        fontSize: m.kind === "emote" ? 24 : 13, lineHeight: 1.3, wordBreak: "break-word",
      }}>
        {m.text}
      </span>
    </div>
  );
}
