// app/page.tsx
// -----------------------------------------------------------------------------
// A single-file drop‑in replacement that works both in production (JWT/Bearer
// token) and in local dev behind a VPN (falls back to the raw API key so you
// never hit Cloudflare’s WAF‑protected token endpoint).
// -----------------------------------------------------------------------------

import dynamic from "next/dynamic";
import { redirect } from "next/navigation";

// Lazy‑load the client‑side chat UI so it never renders on the server.
const Chat = dynamic(() => import("@/components/Chat"), { ssr: false });

/**
 * Fetch a short‑lived Bearer token from Hume via OAuth2 client‑credentials.
 * Returns `null` on any error so the caller can fall back to API‑key auth.
 */
async function getHumeAccessToken(): Promise<string | null> {
  const apiKey = process.env.HUME_API_KEY;
  const secretKey = process.env.HUME_SECRET_KEY;

  if (!apiKey || !secretKey) {
    console.warn("Hume keys missing from env");
    return null;
  }

  try {
    const res = await fetch("https://api.hume.ai/oauth2-cc/token", {
      method: "POST",
      headers: {
        Authorization:
          "Basic " +
          Buffer.from(`${apiKey}:${secretKey}`, "utf8").toString("base64"),
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "grant_type=client_credentials",
      cache: "no-store", // keep dev snappy
    });

    if (!res.ok) {
      console.error(
        "Hume token request failed",
        res.status,
        await res.text()
      );
      return null;
    }

    const json = (await res.json()) as { access_token?: string };
    return json.access_token ?? null;
  } catch (err) {
    console.error("Hume token fetch threw", err);
    return null;
  }
}

export default async function Page() {
  // 1 · Prefer the secure JWT flow when possible.
  const accessToken = await getHumeAccessToken();

  // 2 · Fallback for dev / VPN when Cloudflare blocks the token endpoint.
  const apiKey = process.env.HUME_API_KEY ?? null;

  if (!accessToken && !apiKey) {
    // No credentials at all → send the dev to a setup wizard or error page.
    redirect("/setup");
  }

  return (
    <div className="grow flex flex-col">
      {/*
        Pass **exactly one** prop so TypeScript doesn’t see `undefined` →
        avoids “string | undefined not assignable to string” error.
      */}
      <Chat {...(accessToken ? { accessToken } : { apiKey: apiKey! })} />
    </div>
  );
}

/* ---------------------------------------------------------------------------
   QUICK REFERENCE
   ---------------------------------------------------------------------------
   Environment variables (put these in .env.local):

     HUME_API_KEY=pk_live_XXXXXXXXXXXXXXXXXXXXXXXX
     HUME_SECRET_KEY=sk_live_XXXXXXXXXXXXXXXXXXXXXXXX

   Chat component prop interface (for reference):

     interface ChatProps {
       accessToken?: string; // JWT from OAuth2
       apiKey?: string;      // raw key fallback
     }

   The WebSocket or REST call inside <Chat> can pick whichever credential it
   receives:

     const auth = props.accessToken
       ? `access_token=${encodeURIComponent(props.accessToken)}`
       : `api_key=${encodeURIComponent(props.apiKey!)}`;

     const ws = new WebSocket(`wss://api.hume.ai/v0/evi/chat?${auth}`);

   ------------------------------------------------------------------------- */
