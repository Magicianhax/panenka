"use client";

import { useEffect, useState } from "react";

/**
 * Big center-screen countdown that only appears in the final `threshold` seconds of the
 * current action window — a loud alert so a player doesn't let the timer run out.
 */
export function UrgentClock({ deadline, threshold = 10 }: { deadline: number; threshold?: number }) {
  const [now, setNow] = useState(() => Math.floor(Date.now() / 1000));
  useEffect(() => {
    const id = setInterval(() => setNow(Math.floor(Date.now() / 1000)), 500);
    return () => clearInterval(id);
  }, []);

  const remaining = deadline - now;
  if (remaining > threshold || remaining <= 0) return null;
  const critical = remaining <= 5;
  const accent = critical ? "var(--save)" : "var(--cyan)";

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 7,
        pointerEvents: "none",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        className="label-xs"
        style={{ color: accent, letterSpacing: "0.5em", marginBottom: 4, textShadow: `0 0 12px ${accent}` }}
      >
        {critical ? "HURRY" : "TIME LEFT"}
      </div>
      <div
        className="display tabular"
        style={{
          fontSize: "clamp(160px, 38vw, 380px)",
          lineHeight: 0.8,
          letterSpacing: "-0.04em",
          color: critical ? "var(--save)" : undefined,
          textShadow: critical ? "0 0 70px rgba(255,61,90,0.65)" : "0 0 70px var(--cyan-glow)",
          animation: "clock-pulse 1s ease-in-out infinite",
        }}
      >
        <span className={critical ? "" : "holo-anim"}>{remaining}</span>
      </div>
    </div>
  );
}
