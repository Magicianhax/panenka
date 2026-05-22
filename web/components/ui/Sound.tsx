"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { primeAudio, playSfx, toggleMuted, getSettings, update, subscribe, type SoundSettings } from "@/lib/sound";

/** Mount once globally: unlocks audio on first user gesture + plays a click on any button. */
export function SoundController() {
  useEffect(() => {
    const unlock = () => primeAudio();
    window.addEventListener("pointerdown", unlock, { once: true });
    window.addEventListener("keydown", unlock, { once: true });
    const onClick = (e: MouseEvent) => {
      const t = e.target as HTMLElement | null;
      if (t?.closest("button, .btn")) playSfx("click");
    };
    window.addEventListener("click", onClick);
    return () => {
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
      window.removeEventListener("click", onClick);
    };
  }, []);
  return null;
}

const SERVER: SoundSettings = { master: 0.7, music: 1, crowd: 1, sfx: 1, muted: false };

export function VolumeControl() {
  const s = useSyncExternalStore(subscribe, getSettings, () => SERVER);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); };
    window.addEventListener("pointerdown", close);
    return () => window.removeEventListener("pointerdown", close);
  }, [open]);

  const silent = s.muted || s.master === 0;
  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        type="button"
        aria-label="Sound settings"
        onClick={() => { primeAudio(); setOpen((o) => !o); }}
        style={{
          width: 40, height: 40, display: "inline-flex", alignItems: "center", justifyContent: "center",
          background: "var(--panel-2)", border: "1.5px solid var(--line)", clipPath: "var(--chamfer-sm)",
          color: silent ? "var(--fg-soft)" : "var(--cyan)", cursor: "pointer",
        }}
      >
        <Speaker muted={silent} />
      </button>
      {open && (
        <div className="panel" style={{ position: "absolute", top: "calc(100% + 8px)", right: 0, zIndex: 30, padding: 16, width: 232, display: "flex", flexDirection: "column", gap: 12 }}>
          <div className="row between">
            <span className="eyebrow eyebrow--cyan" style={{ fontSize: 10 }}>◆ sound</span>
            <button
              type="button" className="mono"
              onClick={() => { primeAudio(); toggleMuted(); }}
              style={{ fontSize: 10, color: s.muted ? "var(--gold)" : "var(--fg-soft)", letterSpacing: "0.12em", background: "none", border: 0, cursor: "pointer", textTransform: "uppercase" }}
            >
              {s.muted ? "● muted" : "mute all"}
            </button>
          </div>
          <Slider label="master" value={s.master} disabled={s.muted} onChange={(v) => { primeAudio(); update({ master: v }); }} />
          <Slider label="music" value={s.music} disabled={s.muted} onChange={(v) => { primeAudio(); update({ music: v }); }} />
          <Slider label="crowd" value={s.crowd} disabled={s.muted} onChange={(v) => { primeAudio(); update({ crowd: v }); }} />
          <Slider label="sfx" value={s.sfx} disabled={s.muted} onChange={(v) => { primeAudio(); update({ sfx: v }); }} />
        </div>
      )}
    </div>
  );
}

function Slider({ label, value, onChange, disabled }: { label: string; value: number; onChange: (v: number) => void; disabled?: boolean }) {
  return (
    <div style={{ opacity: disabled ? 0.4 : 1 }}>
      <div className="row between" style={{ marginBottom: 4 }}>
        <span className="label-xs">{label}</span>
        <span className="mono" style={{ fontSize: 10, color: "var(--fg-soft)" }}>{Math.round(value * 100)}</span>
      </div>
      <input
        type="range" min={0} max={1} step={0.05} value={value} disabled={disabled}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label={label}
        className="slider"
        style={{ width: "100%" }}
      />
    </div>
  );
}

function Speaker({ muted }: { muted: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 5 6 9H2v6h4l5 4V5z" fill="currentColor" stroke="none" />
      {muted ? (
        <>
          <line x1="22" y1="9" x2="16" y2="15" />
          <line x1="16" y1="9" x2="22" y2="15" />
        </>
      ) : (
        <>
          <path d="M15.5 8.5a5 5 0 0 1 0 7" />
          <path d="M18.5 6a9 9 0 0 1 0 12" />
        </>
      )}
    </svg>
  );
}
