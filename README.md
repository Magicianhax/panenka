<div align="center">

<img src="web/public/brand/panenka.png" alt="PANENKA" width="180" />

# PANENKA

**A 1v1 on-chain penalty-shootout wager game.**
Pick a nation, stake OKB, read your opponent's mind across five rounds. Winner takes the pot.

Season: **X CUP · WC26** — built for the [OKX X Cup Hackathon](https://www.okx.com/x-layer) on **X Layer**.

[![Chain](https://img.shields.io/badge/X%20Layer-mainnet%20196-1a1f3a)](https://www.oklink.com/xlayer)
[![Solidity](https://img.shields.io/badge/Solidity-0.8.24-363636)](https://soliditylang.org)
[![Next.js](https://img.shields.io/badge/Next.js-15-000000)](https://nextjs.org)
[![License](https://img.shields.io/badge/license-MIT-green)](#license)

**Live contract:** [`0x51F6DbeFCeE8ad9B491f08615211E09027f45110`](https://www.oklink.com/xlayer/address/0x51F6DbeFCeE8ad9B491f08615211E09027f45110) · verified on OKLink

</div>

---

## What it is

PANENKA turns the penalty-shootout mind-game into a trustless wager. Two players each stake the same amount of OKB and play a best-of-five shootout. Every round is a simultaneous guess: the shooter picks a corner, the keeper picks a dive. **You score when your shot goes where the keeper didn't.** No oracle, no referee — the chain settles it. The winner pulls the pot (minus a 2.5% fee); a draw refunds both in full.

Because moves are simultaneous, naive on-chain play would leak your choice in the mempool. PANENKA uses **commit-reveal** so neither player can see the other's move until both are locked, and a **deterministic, signature-derived salt** so a player can always recover and reveal their move from any device — no fragile local storage to lose funds over.

## How a match plays out

1. **Create** — Player 1 picks a nation, stakes any amount of OKB, and gets a shareable match link.
2. **Join** — Player 2 opens the link, matches the stake, picks their nation. The match goes live.
3. **Shoot out** — up to **5 rounds**. Each round, both players:
   - **Commit** `keccak256(shoot, dive, salt, sender, matchId, round)` on-chain.
   - Once both have committed, both **reveal** their `(shoot, dive, salt)`.
   - Goals resolve: `shoot ≠ opponent's dive` → goal. Both players shoot *and* keep every round.
4. **Settle** — first to an uncatchable lead **clinches early**; otherwise the lead after 5 rounds wins. Level scores → both refunded.
5. **Withdraw** — winnings, refunds, and cancelled stakes are all **claimed manually** by the player. Forget to claim at full-time? Pull it from your profile any time.

> Directions are encoded `L = 0`, `M = 1`, `R = 2`.

### Scoring grid

A round from one shooter's perspective — the keeper dives, you shoot:

| Shoot ↓ / Dive → | **L** | **M** | **R** |
|:---:|:---:|:---:|:---:|
| **L** | SAVE | GOAL | GOAL |
| **M** | GOAL | SAVE | GOAL |
| **R** | GOAL | GOAL | SAVE |

## Why the contract is safe

The on-chain design is deliberately small and defensive:

- **Pull-payment.** The contract never pushes funds. Every payout, refund, and cancellation is *credited* to your `pending` balance and claimed via `withdraw()`. One un-payable address can never block another player or freeze a game.
- **Commit-reveal.** Moves are hidden until both are locked; the salt binds the hash to `sender`, `matchId`, and `round`, so commits can't be replayed across games or rounds.
- **No admin over funds.** The `owner` can only pause the *creation/joining* of new matches. It can never touch stakes, force a result, or drain the contract. Fees accrue separately and only the immutable `treasury` can collect them.
- **Early clinch.** A match settles the moment a lead becomes mathematically insurmountable, saving rounds (and gas) instead of always playing all five.
- **Timeout protection.** If an opponent stalls past the 60-second reveal window, the honest player claims the win (or both are refunded if neither moved).

| Parameter | Value |
|---|---|
| Rounds | 5 (best-of, early clinch) |
| Reveal window | 60 seconds |
| Protocol fee | 2.5% of the pot (winner-only) |
| Tie outcome | full refund to both |
| Nations | 48 (`MAX_COUNTRY = 47`) |

## Tech stack

| Layer | Tech |
|---|---|
| **Contract** | Solidity 0.8.24, Foundry — `PenaltyMatch.sol`, 23 passing tests |
| **Chain** | X Layer (zkEVM) — mainnet `196`, testnet `195` |
| **Frontend** | Next.js 15, React 19, wagmi v2, viem, RainbowKit, Tailwind CSS 3 |
| **3D** | Three.js + React Three Fiber / drei — penalty arena & rigged goalkeeper |
| **Realtime** | Ably (token-auth) for cross-device crowd & player chat, with a BroadcastChannel fallback |
| **Audio** | ElevenLabs-generated SFX + crowd ambience + music, per-channel mixer |
| **Package manager** | pnpm |

## App surface

| Route | Purpose |
|---|---|
| `/` | Landing — 3D hero, featured fixture, **live match ticker** |
| `/lobby` | Open matches to join + **LIVE NOW** games to spectate |
| `/create` | Challenge slip — pick nation, set stake, mint a match link |
| `/match/[id]` | The arena — 3D scene, commit-reveal decks, scoreboard, chat |
| `/profile` | Your match history + claim all pending OKB |
| `/leaderboard` | Standings |
| `/about`, `/faq` | The pitch and a how-to-play with the scoring grid |

Matches are spectatable by anyone — from the landing ticker, the lobby, or a direct link. Spectators get a public **crowd chat** and reactions; the two players get a separate **private chat**.

## Repository layout

```
contracts/   Foundry project — PenaltyMatch.sol, tests, deploy script
web/         Next.js frontend
  app/         routes (landing, lobby, create, match, profile, …)
  components/  layout · match · three · ui
  lib/         contract ABI, chain config, salt, sound, hooks
  public/      brand, audio, 3D assets
tasks/       build plan + lessons
```

## Quick start

### 1. Contracts

```powershell
cd contracts
forge install foundry-rs/forge-std --no-git
forge build
forge test -vv
```

Deploy (testnet):

```powershell
copy .env.example .env          # set PRIVATE_KEY and TREASURY
forge script script/Deploy.s.sol --rpc-url xlayer_testnet --broadcast
```

### 2. Frontend

```powershell
cd web
pnpm install
copy .env.example .env.local    # paste the deployed contract address
pnpm dev                        # http://localhost:3000
```

### Environment

| Variable | Where | Purpose |
|---|---|---|
| `NEXT_PUBLIC_CHAIN_ID` | client | `196` mainnet / `195` testnet |
| `NEXT_PUBLIC_PENALTY_MATCH_ADDRESS` | client | deployed `PenaltyMatch` address |
| `NEXT_PUBLIC_WC_PROJECT_ID` | client | WalletConnect ID for mobile wallets ([reown.com](https://cloud.reown.com)) |
| `ABLY_API_KEY` | **server only** | enables cross-device chat; omit to fall back to single-device BroadcastChannel |

## X Layer networks

| Network | Chain ID | RPC | Explorer |
|---|---|---|---|
| Mainnet | 196 | `https://rpc.xlayer.tech` | [oklink.com/xlayer](https://www.oklink.com/xlayer) |
| Testnet | 195 | `https://testrpc.xlayer.tech` | [oklink.com/xlayer-test](https://www.oklink.com/xlayer-test) |

Get testnet OKB from the [X Layer faucet](https://www.okx.com/xlayer/faucet).

## License

MIT — see [`contracts/src/PenaltyMatch.sol`](contracts/src/PenaltyMatch.sol) for the contract SPDX header.
