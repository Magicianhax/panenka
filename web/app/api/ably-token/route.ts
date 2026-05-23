import * as Ably from "ably";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Mints a short-lived Ably token for the browser, so the ABLY_API_KEY stays server-side
 * (never shipped to the client). Returns 501 when no key is configured — the client then
 * falls back to BroadcastChannel (local-only).
 */
export async function GET(req: Request) {
  const key = process.env.ABLY_API_KEY;
  if (!key) return new Response("ably not configured", { status: 501 });

  const clientId = (new URL(req.url).searchParams.get("clientId") || "anon").slice(0, 64);
  // Restrict the token to our app's channel namespace so it can't be used to
  // publish/subscribe on arbitrary Ably channels. Note: this does NOT prevent
  // a spectator from spoofing clientId to impersonate a player on :players
  // channels — that requires server-side wallet-signature auth (TODO).
  const capability = JSON.stringify({ "xcup:match:*": ["subscribe", "publish", "presence"] });
  try {
    const rest = new Ably.Rest(key);
    const tokenRequest = await rest.auth.createTokenRequest({ clientId, capability });
    return Response.json(tokenRequest);
  } catch {
    return new Response("token error", { status: 500 });
  }
}
