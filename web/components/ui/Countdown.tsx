"use client";

import { useEffect, useState } from "react";

/** Counts down to a unix-second deadline, fires onExpire once, renders mm:ss. */
export function Countdown({
  deadline,
  onExpire,
}: {
  deadline: number;
  onExpire?: () => void;
}) {
  const [now, setNow] = useState(() => Math.floor(Date.now() / 1000));

  useEffect(() => {
    const id = setInterval(() => setNow(Math.floor(Date.now() / 1000)), 1000);
    return () => clearInterval(id);
  }, []);

  const remaining = Math.max(0, deadline - now);
  useEffect(() => {
    if (remaining === 0) onExpire?.();
  }, [remaining, onExpire]);

  const mm = String(Math.floor(remaining / 60)).padStart(2, "0");
  const ss = String(remaining % 60).padStart(2, "0");
  const urgent = remaining > 0 && remaining <= 30;

  return (
    <span
      className={`tnum font-mono text-sm font-semibold ${
        remaining === 0 ? "text-red-400" : urgent ? "animate-pulse text-red-300" : "text-slate-300"
      }`}
    >
      {remaining === 0 ? "expired" : `${mm}:${ss}`}
    </span>
  );
}
