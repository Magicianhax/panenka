"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAccount, useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { decodeEventLog, parseEther } from "viem";
import { TopBar } from "@/components/layout/TopBar";
import { Brackets } from "@/components/ui/Brackets";
import { HexCrest, HexSlot, crestFor, CRESTS } from "@/lib/crests";
import { PENALTY_MATCH_ADDRESS, penaltyMatchAbi } from "@/lib/contract";

const TILES = [
  { v: 0.01, label: "0.01" },
  { v: 0.05, label: "0.05" },
  { v: 0.1, label: "0.1" },
  { v: 0.5, label: "0.5" },
  { v: 1, label: "1" },
  { v: 5, label: "5" },
];
const FEE = 0.025;

/** Read rematch prefill (?stake=&nation=) from the URL, client-side only. */
function prefill(): { nation: number; stake: number } {
  const def = { nation: 1, stake: 0.05 };
  if (typeof window === "undefined") return def;
  const q = new URLSearchParams(window.location.search);
  const n = Number(q.get("nation"));
  const s = Number(q.get("stake"));
  return {
    nation: Number.isInteger(n) && n >= 0 && n <= 47 ? n : def.nation,
    stake: Number.isFinite(s) && s > 0 ? s : def.stake,
  };
}

export default function CreatePage() {
  const router = useRouter();
  const { isConnected } = useAccount();
  const [init] = useState(prefill);
  const [nation, setNation] = useState(init.nation);
  const [stake, setStake] = useState(init.stake);

  const { data: hash, writeContract, isPending, error } = useWriteContract();
  const { data: receipt, isLoading: isMining } = useWaitForTransactionReceipt({ hash });

  // After the create tx is mined, find the Created event and navigate to the new match.
  useEffect(() => {
    if (!receipt) return;
    for (const log of receipt.logs) {
      if (log.address.toLowerCase() !== PENALTY_MATCH_ADDRESS.toLowerCase()) continue;
      try {
        const decoded = decodeEventLog({ abi: penaltyMatchAbi, data: log.data, topics: log.topics });
        if (decoded.eventName === "Created") {
          router.push(`/match/${(decoded.args as { id: bigint }).id.toString()}`);
          return;
        }
      } catch {
        /* not the Created event — keep scanning */
      }
    }
  }, [receipt, router]);

  const n = crestFor(nation);
  const pot = stake * 2;
  const payout = pot * (1 - FEE);
  const busy = isPending || isMining;
  const fmt = (v: number) => (v < 1 ? v.toFixed(3) : v.toFixed(2));

  const onDeploy = () => {
    let value: bigint;
    try {
      value = parseEther(String(stake));
    } catch {
      return;
    }
    writeContract({ address: PENALTY_MATCH_ADDRESS, abi: penaltyMatchAbi, functionName: "createMatch", args: [nation], value });
  };

  return (
    <div className="arena-bg" style={{ minHeight: "100dvh" }}>
      <TopBar active="create" />

      <section className="mx-auto max-w-6xl px-6 lg:px-9" style={{ padding: "32px 24px" }}>
        <div className="eyebrow eyebrow--cyan">◆ loadout</div>
        <div className="display" style={{ fontSize: "clamp(56px,11vw,120px)", color: "var(--fg)", lineHeight: 0.85, marginTop: 4, letterSpacing: "-0.03em" }}>
          DEPLOY <span className="display--ital" style={{ color: "var(--cyan)" }}>CHALLENGE.</span>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]" style={{ marginTop: 32 }}>
          {/* left — selection */}
          <div className="col gap-7">
            {/* selected nation showcase */}
            <div className="panel brackets row" style={{ padding: 24, gap: 20 }}>
              <Brackets />
              <HexCrest code={nation} size={120} ring="var(--cyan)" />
              <div>
                <div className="label-xs">your nation</div>
                <div className="display" style={{ fontSize: 44, color: "var(--fg)", lineHeight: 0.9, marginTop: 4 }}>{n.name.toUpperCase()}</div>
                <div className="mono" style={{ fontSize: 12, color: "var(--fg-muted)", marginTop: 6, letterSpacing: "0.08em" }}>code {n.code} · best of 5 · winner takes pot</div>
              </div>
            </div>

            {/* nation grid */}
            <div>
              <div className="label-xs" style={{ marginBottom: 12 }}>¶ choose your nation · {CRESTS.length}</div>
              <div className="grid grid-cols-5 gap-2 sm:grid-cols-10">
                {CRESTS.map((c, code) => {
                  const active = nation === code;
                  return (
                    <button
                      key={c.code}
                      onClick={() => setNation(code)}
                      aria-pressed={active}
                      style={{
                        padding: 6,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 4,
                        background: active ? "rgba(0,229,255,0.1)" : "rgba(255,255,255,0.02)",
                        border: active ? "1.5px solid var(--cyan)" : "1px solid var(--line)",
                        clipPath: "var(--chamfer-sm)",
                        cursor: "pointer",
                      }}
                    >
                      <HexCrest code={code} size={40} ring={active ? "var(--cyan)" : "var(--fg-soft)"} glow={active} />
                      <span className="mono" style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.08em", color: active ? "var(--cyan)" : "var(--fg-muted)" }}>{c.code}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* stake tiles */}
            <div>
              <div className="label-xs" style={{ marginBottom: 12 }}>¶ set your stake · OKB</div>
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
                {TILES.map((t) => {
                  const active = stake === t.v;
                  return (
                    <button
                      key={t.v}
                      onClick={() => setStake(t.v)}
                      style={{
                        padding: "14px 8px",
                        background: active ? "rgba(255,201,64,0.12)" : "rgba(255,255,255,0.02)",
                        border: active ? "1.5px solid var(--gold)" : "1px solid var(--line)",
                        clipPath: "var(--chamfer-sm)",
                        cursor: "pointer",
                        textAlign: "center",
                      }}
                    >
                      <div className="display tabular" style={{ fontSize: 22, color: active ? "var(--gold)" : "var(--fg)" }}>{t.label}</div>
                      <div className="label-xs" style={{ marginTop: 2 }}>OKB</div>
                    </button>
                  );
                })}
              </div>
              <input
                type="range"
                className="slider"
                min={0.01}
                max={10}
                step={0.01}
                value={stake}
                onChange={(e) => setStake(parseFloat(e.target.value))}
                aria-label="Stake"
                style={{ marginTop: 18 }}
              />
            </div>
          </div>

          {/* right — VS preview / payout */}
          <div className="lg:sticky lg:top-6 lg:self-start">
            <div className="panel panel--gold" style={{ padding: 28 }}>
              <div className="row between" style={{ marginBottom: 20 }}>
                <span className="tag tag--gold">★ NEW WAGER</span>
                <span className="mono" style={{ fontSize: 10, color: "var(--fg-soft)", letterSpacing: "0.16em", textTransform: "uppercase" }}>best of 5</span>
              </div>
              <div className="grid items-center" style={{ gridTemplateColumns: "1fr auto 1fr", gap: 12, marginBottom: 24 }}>
                <div style={{ textAlign: "center" }}>
                  <div className="flex justify-center"><HexCrest code={nation} size={92} ring="var(--cyan)" /></div>
                  <div className="display" style={{ fontSize: 16, color: "var(--fg)", marginTop: 10 }}>{n.name.toUpperCase()}</div>
                  <div className="label-xs" style={{ marginTop: 2, color: "var(--cyan)" }}>you</div>
                </div>
                <div className="display" style={{ fontSize: 40, color: "var(--fg-faint)" }}>VS</div>
                <div style={{ textAlign: "center", opacity: 0.6 }}>
                  <div className="flex justify-center"><HexSlot size={92} /></div>
                  <div className="display" style={{ fontSize: 16, color: "var(--fg-muted)", marginTop: 10 }}>AWAITING</div>
                  <div className="label-xs" style={{ marginTop: 2 }}>open</div>
                </div>
              </div>

              <div style={{ background: "var(--void)", padding: 20, clipPath: "var(--chamfer-sm)", marginBottom: 18 }}>
                <div className="label-xs" style={{ color: "var(--gold)" }}>↗ if you win</div>
                <div className="display tabular" style={{ fontSize: 56, color: "var(--gold)", lineHeight: 0.9, marginTop: 4, letterSpacing: "-0.03em" }}>
                  {payout.toFixed(3)}<span style={{ fontSize: 16, color: "var(--fg-muted)", marginLeft: 6 }}>OKB</span>
                </div>
                <div className="mono" style={{ fontSize: 11, color: "var(--fg-soft)", marginTop: 6 }}>
                  pot {pot.toFixed(3)} · fee {(pot * FEE).toFixed(4)} · net <span style={{ color: "var(--goal)" }}>+{(payout - stake).toFixed(3)}</span>
                </div>
              </div>

              {isConnected ? (
                <button className="btn btn--primary btn--xl" style={{ width: "100%" }} onClick={onDeploy} disabled={busy || stake <= 0}>
                  {isPending ? "CONFIRM IN WALLET…" : isMining ? "DEPLOYING…" : `DEPLOY · ${fmt(stake)} OKB →`}
                </button>
              ) : (
                <div className="btn btn--ghost btn--xl" style={{ width: "100%", cursor: "default" }}>CONNECT WALLET ↑</div>
              )}
              <div className="mono" style={{ fontSize: 10, color: "var(--fg-soft)", textAlign: "center", marginTop: 12, letterSpacing: "0.06em", lineHeight: 1.5 }}>
                escrows {fmt(stake)} OKB into the x cup contract · cancel any time before match starts
              </div>
              {error && <div className="mono" style={{ fontSize: 10, color: "var(--save)", marginTop: 10, wordBreak: "break-word" }}>{error.message}</div>}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
