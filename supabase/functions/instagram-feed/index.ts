import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

// Restituisce gli ultimi post dell'account Instagram collegato, per popolare la Gallery del sito.
// Richiede il secret INSTAGRAM_ACCESS_TOKEN (token Instagram Graph API di tipo "long-lived").
// Opzionale: INSTAGRAM_FEED_LIMIT (default 24).

const ALLOWED_ORIGINS = [
  "https://setupevents.it",
  "https://www.setupevents.it",
  "https://abrielleshi-events-showcase.lovable.app",
];

function getCorsHeaders(req: Request) {
  const origin = req.headers.get("origin") || "";
  const allowedOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
    Vary: "Origin",
  };
}

interface IgMedia {
  id: string;
  media_type: "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM";
  media_url?: string;
  thumbnail_url?: string;
  permalink: string;
  caption?: string;
  timestamp: string;
}

// Cache in memoria (per istanza) per non consumare il rate limit di Instagram a ogni visita.
const CACHE_TTL_MS = 15 * 60 * 1000;
let cache: { at: number; items: unknown[] } | null = null;

serve(async (req) => {
  const cors = getCorsHeaders(req);
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });

  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), {
      status,
      headers: {
        ...cors,
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=300, s-maxage=900",
      },
    });

  try {
    if (cache && Date.now() - cache.at < CACHE_TTL_MS) return json({ items: cache.items });

    const token = Deno.env.get("INSTAGRAM_ACCESS_TOKEN");
    if (!token) return json({ items: [], error: "not_configured" });

    const limit = Math.min(Number(Deno.env.get("INSTAGRAM_FEED_LIMIT")) || 24, 50);
    const fields = "id,media_type,media_url,thumbnail_url,permalink,caption,timestamp";
    const url = `https://graph.instagram.com/me/media?fields=${fields}&limit=${limit}&access_token=${encodeURIComponent(token)}`;

    const res = await fetch(url);
    if (!res.ok) {
      console.error("Instagram API error", res.status, await res.text());
      // In caso di errore (es. token scaduto) serviamo l'ultima cache valida, se esiste.
      return json({ items: cache?.items ?? [], error: "instagram_error" });
    }

    const data = (await res.json()) as { data?: IgMedia[] };
    const items = (data.data ?? [])
      .map((m) => ({
        id: m.id,
        // Per i video usiamo la thumbnail; per foto e caroselli la prima immagine.
        image: m.media_type === "VIDEO" ? m.thumbnail_url : m.media_url,
        permalink: m.permalink,
        caption: (m.caption ?? "").slice(0, 200),
        isVideo: m.media_type === "VIDEO",
        timestamp: m.timestamp,
      }))
      .filter((m) => !!m.image);

    cache = { at: Date.now(), items };
    return json({ items });
  } catch (e) {
    console.error("instagram-feed failure", e);
    return json({ items: cache?.items ?? [], error: "internal" });
  }
});
