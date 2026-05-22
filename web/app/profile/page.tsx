"use client";

import Link from "next/link";
import { useAccount, useReadContract, useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { formatEther } from "viem";
import { TopBar } from "@/components/layout/TopBar";
import { HexCrest, crestFor } from "@/lib/crests";
import { short } from "@/lib/format";
import { PENALTY_MATCH_ADDRESS, penaltyMatchAbi } from "@/lib/contract";
import { useMyMatches, type MyMatch } from "@/lib/hooks/useMyMatches";

export default function ProfilePage() {
  const { address, isConnected } = useAccount();
  const { data, error } = useMyMatches(address);

  const { data: pending, refetch: refetchPending } = useReadContract({
    address: PENALTY_MATCH_ADDRESS,
    abi: penaltyMatchAbi,
    functionName: "pending",
    args: address ? [address] : undefined,
    query: { enabled: !!address, refetchInterval: 5000 },
  }) as { data: bigint | undefined; refetch: () => void };

  const { data: hash, writeContract, isPending: isWriting, error: writeErr } = useWriteContract();
  const { isLoading: isMining, isSuccess } = useWaitForTransactionReceipt({ hash });
  if (isSuccess) refetchPending();
  const claimable = pending ?? 0n;
  const busy = isWriting || isMining;

  const onClaim = () =>
    writeContract({ address: PENALTY_MATCH_ADDRESS, abi: penaltyMatchAbi, functionName: "withdraw", args: [] });

  return (
    <div className="arena-bg" style={{ minHeight: "100dvh" }}>
      <TopBar active="profile" />

      <section className="mx-auto max-w-6xl px-6 lg:px-9" style={{ padding: "32px 24px 0" }}>
        <div className="eyebrow eyebrow--cyan">◆ your locker</div>
        <div className="display" style={{ fontSize: "clamp(56px,12vw,128px)", color: "var(--fg)", lineHeight: 0.85, marginTop: 4, letterSpacing: "-0.03em" }}>
          PROFILE.
        </div>
        {isConnected && address && (
          <div className="mono" style={{ fontSize: 12, color: "var(--fg-soft)", marginTop: 8, letterSpacing: "0.08em" }}>{short(address)}</div>
        )}
      </section>

      {!isConnected ? (
        <section className="mx-auto max-w-6xl px-6 lg:px-9" style={{ padding: "32px 24px" }}>
          <div className="panel" style={{ padding: 40, textAlign: "center" }}>
            <div className="display" style={{ fontSize: 28, color: "var(--fg-muted)" }}>CONNECT WALLET ↑</div>
            <div className="mono muted" style={{ fontSize: 12, marginTop: 8 }}>to see your matches and claim winnings</div>
          </div>
        </section>
      ) : (
        <>
          {/* claimable balance — the pull-payment hub */}
          <section className="mx-auto max-w-6xl px-6 lg:px-9" style={{ padding: "28px 24px 0" }}>
            <div className="panel panel--gold" style={{ padding: 28 }}>
              <div className="row between" style={{ flexWrap: "wrap", gap: 16 }}>
                <div>
                  <div className="label-xs" style={{ color: "var(--gold)" }}>↗ claimable balance</div>
                  <div className="display tabular" style={{ fontSize: "clamp(40px,9vw,64px)", color: claimable > 0n ? "var(--gold)" : "var(--fg-muted)", lineHeight: 0.9, marginTop: 6, letterSpacing: "-0.03em" }}>
                    {Number(formatEther(claimable)).toFixed(4)}<span style={{ fontSize: 16, color: "var(--fg-muted)", marginLeft: 8 }}>OKB</span>
                  </div>
                  <div className="mono" style={{ fontSize: 11, color: "var(--fg-soft)", marginTop: 8, maxWidth: 420, lineHeight: 1.5 }}>
                    winnings, refunds and cancelled stakes collect here — claim any time, even days later
                  </div>
                </div>
                <button className="btn btn--primary btn--xl" disabled={claimable === 0n || busy} onClick={onClaim}>
                  {isWriting ? "CONFIRM…" : isMining ? "CLAIMING…" : claimable > 0n ? `CLAIM ${Number(formatEther(claimable)).toFixed(3)} OKB →` : "NOTHING TO CLAIM"}
                </button>
              </div>
              {writeErr && <div className="mono" style={{ fontSize: 11, color: "var(--save)", marginTop: 12, wordBreak: "break-word" }}>{writeErr.message}</div>}
            </div>
          </section>

          {/* record */}
          <section className="mx-auto max-w-6xl px-6 lg:px-9" style={{ padding: "24px 24px 0" }}>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              <Kpi label="played" value={data ? String(data.record.played) : "—"} c="var(--cyan)" />
              <Kpi label="won" value={data ? String(data.record.wins) : "—"} c="var(--goal)" />
              <Kpi label="lost" value={data ? String(data.record.losses) : "—"} c="var(--save)" />
              <Kpi
                label="net okb"
                value={data ? `${data.record.net > 0n ? "+" : ""}${Number(formatEther(data.record.net)).toFixed(3)}` : "—"}
                c={data && data.record.net > 0n ? "var(--goal)" : data && data.record.net < 0n ? "var(--save)" : "var(--fg)"}
              />
            </div>
          </section>

          {error && (
            <section className="mx-auto max-w-6xl px-6 lg:px-9" style={{ paddingTop: 16 }}>
              <div className="panel" style={{ padding: 16, color: "var(--save)" }}>{error}</div>
            </section>
          )}

          <MatchGroup title="● in progress" accent="var(--cyan)" matches={data?.active} loading={!data} resume />
          <MatchGroup title="★ your open challenges" accent="var(--magenta)" matches={data?.open} loading={!data} />
          <MatchGroup title="◆ history" accent="var(--gold)" matches={data?.settled} loading={!data} history />
        </>
      )}
    </div>
  );
}

function MatchGroup({ title, accent, matches, loading, resume, history }: { title: string; accent: string; matches?: MyMatch[]; loading: boolean; resume?: boolean; history?: boolean }) {
  if (!loading && (!matches || matches.length === 0)) return null;
  return (
    <section className="mx-auto max-w-6xl px-6 lg:px-9" style={{ padding: "28px 24px 0" }}>
      <div className="eyebrow" style={{ color: accent, marginBottom: 12 }}>{title}</div>
      {loading ? (
        <div className="col gap-2">{[0, 1].map((i) => <div key={i} className="panel" style={{ height: 72, opacity: 0.5 }} />)}</div>
      ) : (
        <div className="col gap-2">
          {matches!.map((m) => <ProfileRow key={m.id.toString()} m={m} resume={resume} history={history} />)}
        </div>
      )}
    </section>
  );
}

function ProfileRow({ m, resume, history }: { m: MyMatch; resume?: boolean; history?: boolean }) {
  const mine = crestFor(m.isP1 ? m.c1 : m.c2);
  const opp = crestFor(m.isP1 ? m.c2 : m.c1);
  const myScore = m.isP1 ? m.score1 : m.score2;
  const oppScore = m.isP1 ? m.score2 : m.score1;
  const joined = m.p2 !== "0x0000000000000000000000000000000000000000";
  const tie = m.score1 === m.score2;
  const iWon = m.isP1 ? m.score1 > m.score2 : m.score2 > m.score1;
  const outcome = history ? (tie ? "DRAW" : iWon ? "WON" : "LOST") : null;
  const outcomeColor = !outcome ? "var(--fg)" : outcome === "WON" ? "var(--goal)" : outcome === "LOST" ? "var(--save)" : "var(--fg-muted)";

  return (
    <Link href={`/match/${m.id.toString()}`} className="panel" style={{ padding: 14, textDecoration: "none", display: "flex", flexWrap: "wrap", alignItems: "center", gap: 12 }}>
      <div className="row" style={{ gap: 10, flex: "1 1 200px", minWidth: 0 }}>
        <HexCrest code={m.isP1 ? m.c1 : m.c2} size={44} ring="var(--cyan)" />
        <div style={{ minWidth: 0 }}>
          <div className="display" style={{ fontSize: 18, color: "var(--fg)", lineHeight: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {mine.code} <span style={{ color: "var(--fg-faint)" }}>vs</span> {joined ? opp.code : "—"}
          </div>
          <div className="mono" style={{ fontSize: 10, color: "var(--fg-soft)", marginTop: 4 }}>#{m.id.toString()} · {Number(formatEther(m.stake))} OKB</div>
        </div>
      </div>
      <div className="row" style={{ gap: 14, marginLeft: "auto", flexShrink: 0 }}>
        {history && (
          <div className="display tabular" style={{ fontSize: 22, color: "var(--fg)" }}>
            {myScore}<span style={{ color: "var(--fg-faint)" }}>–</span>{oppScore}
          </div>
        )}
        {outcome ? (
          <span className="display" style={{ fontSize: 14, color: outcomeColor, letterSpacing: "0.1em" }}>{outcome}</span>
        ) : (
          <span className={`btn btn--sm ${resume ? "btn--cyan" : "btn--ghost"}`}>{resume ? "resume →" : "manage"}</span>
        )}
      </div>
    </Link>
  );
}

function Kpi({ label, value, c }: { label: string; value: string; c: string }) {
  return (
    <div className="panel" style={{ padding: "16px 18px" }}>
      <div className="label-xs">{label}</div>
      <div className="display tabular" style={{ fontSize: 36, color: c, lineHeight: 0.9, marginTop: 6, letterSpacing: "-0.025em" }}>{value}</div>
    </div>
  );
}
