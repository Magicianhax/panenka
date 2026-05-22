"use client";

import { createContext, useCallback, useContext, useRef, useState } from "react";

type ToastKind = "info" | "success" | "warn";
type Toast = { id: number; msg: string; kind: ToastKind };

const ToastCtx = createContext<(msg: string, kind?: ToastKind) => void>(() => {});

export function useToast() {
  return useContext(ToastCtx);
}

const ACCENT: Record<ToastKind, string> = {
  info: "var(--cyan)",
  success: "var(--goal)",
  warn: "var(--gold)",
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const seq = useRef(0);

  const push = useCallback((msg: string, kind: ToastKind = "info") => {
    const id = ++seq.current;
    setToasts((t) => [...t, { id, msg, kind }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4000);
  }, []);

  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div
        style={{
          position: "fixed",
          left: "50%",
          bottom: 20,
          transform: "translateX(-50%)",
          zIndex: 1000,
          display: "flex",
          flexDirection: "column",
          gap: 8,
          width: "min(92vw, 420px)",
          pointerEvents: "none",
        }}
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            className="panel mono"
            style={{
              padding: "12px 16px",
              fontSize: 12,
              letterSpacing: "0.06em",
              color: "var(--fg)",
              borderColor: ACCENT[t.kind],
              boxShadow: `0 0 24px -8px ${ACCENT[t.kind]}`,
              background: "rgba(10,15,34,0.95)",
              animation: "slam-v3 360ms cubic-bezier(0.34,1.56,0.64,1)",
            }}
          >
            <span style={{ color: ACCENT[t.kind], marginRight: 8 }}>●</span>
            {t.msg}
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}
