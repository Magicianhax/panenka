"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type ChatMsg = {
  id: string;
  from: string; // lowercased address
  kind: "emote" | "chat";
  text: string;
  ts: number;
};

const MAX = 40;

function makeMsg(self: string, kind: "emote" | "chat", text: string): ChatMsg {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    from: (self || "anon").toLowerCase(),
    kind,
    text: text.trim().slice(0, 80),
    ts: Date.now(),
  };
}

/**
 * Per-match crowd chat (ephemeral, no persistence).
 *
 * Transport: Ably Realtime when an ABLY_API_KEY is configured server-side (cross-device,
 * with presence for a live spectator count). Otherwise falls back to the browser-native
 * BroadcastChannel (same-machine only) so local dev works with zero config.
 */
export function useMatchChannel(matchId: string, self: string | undefined) {
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [online, setOnline] = useState(0);
  const sendRef = useRef<(kind: "emote" | "chat", text: string) => void>(() => {});

  useEffect(() => {
    if (typeof window === "undefined") return;
    let cancelled = false;
    let cleanup = () => {};
    const push = (m: ChatMsg) => {
      if (m && (m.kind === "emote" || m.kind === "chat") && typeof m.text === "string") {
        setMessages((prev) => [...prev, m].slice(-MAX));
      }
    };
    const clientId = encodeURIComponent(self || "anon");

    (async () => {
      // Probe whether Ably is configured (token endpoint returns 200).
      let ablyOk = false;
      try {
        ablyOk = (await fetch(`/api/ably-token?clientId=${clientId}`)).ok;
      } catch {
        ablyOk = false;
      }
      if (cancelled) return;

      if (ablyOk) {
        const Ably = await import("ably");
        if (cancelled) return;
        // echoMessages:false — we render our own message optimistically, so don't get it echoed back
        const client = new Ably.Realtime({ authUrl: `/api/ably-token?clientId=${clientId}`, echoMessages: false });
        const channel = client.channels.get(`xcup:match:${matchId}`);
        channel.subscribe("msg", (msg) => push(msg.data as ChatMsg));

        const refresh = async () => {
          try { setOnline((await channel.presence.get()).length); } catch { /* noop */ }
        };
        channel.presence.subscribe(refresh);
        channel.presence.enter().catch(() => {});
        refresh();

        sendRef.current = (kind, text) => {
          const m = makeMsg(self || "anon", kind, text);
          push(m);
          channel.publish("msg", m);
        };
        cleanup = () => {
          try { channel.presence.leave(); channel.unsubscribe(); client.close(); } catch { /* noop */ }
        };
        return;
      }

      // Fallback: BroadcastChannel (same browser only)
      if (!("BroadcastChannel" in window)) return;
      const ch = new BroadcastChannel(`xcup:match:${matchId}`);
      ch.onmessage = (e) => push(e.data as ChatMsg);
      sendRef.current = (kind, text) => {
        const m = makeMsg(self || "anon", kind, text);
        push(m);
        ch.postMessage(m);
      };
      cleanup = () => ch.close();
    })();

    return () => { cancelled = true; cleanup(); };
  }, [matchId, self]);

  const send = useCallback(
    (kind: "emote" | "chat", text: string) => {
      if (!self || !text.trim()) return;
      sendRef.current(kind, text);
    },
    [self]
  );

  return { messages, send, enabled: true, online };
}
