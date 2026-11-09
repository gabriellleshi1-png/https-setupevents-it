import { useQuery } from "@tanstack/react-query";

export interface InstagramPost {
  id: string;
  image: string;
  permalink: string;
  caption: string;
  isVideo: boolean;
  timestamp: string;
}

// URL del feed JSON di Behold (https://behold.so), es. "https://feeds.behold.so/XXXXXXXX".
// È un URL pubblico per costruzione (non contiene token), quindi può stare nel codice.
// In alternativa si può impostare la variabile d'ambiente VITE_INSTAGRAM_FEED_URL.
const INSTAGRAM_FEED_URL: string =
  import.meta.env.VITE_INSTAGRAM_FEED_URL ?? "https://feeds.behold.so/NeepXWCbq3lBpR3PyVfl";

interface BeholdPost {
  id: string;
  timestamp: string;
  permalink: string;
  mediaType: "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM";
  mediaUrl?: string;
  thumbnailUrl?: string;
  caption?: string;
  sizes?: Record<string, { mediaUrl?: string } | undefined>;
}

// Legge gli ultimi post dell'account Instagram dal feed JSON di Behold.
// Se l'URL non è configurato o la richiesta fallisce, restituisce una lista vuota
// e la Gallery mostra le immagini statiche di riserva.
export const useInstagramFeed = () =>
  useQuery({
    queryKey: ["instagram-feed", INSTAGRAM_FEED_URL],
    enabled: !!INSTAGRAM_FEED_URL,
    queryFn: async (): Promise<InstagramPost[]> => {
      const res = await fetch(INSTAGRAM_FEED_URL);
      if (!res.ok) throw new Error(`Instagram feed error ${res.status}`);
      const data = (await res.json()) as { posts?: BeholdPost[] };
      return (data.posts ?? [])
        .map((p) => ({
          id: p.id,
          // Immagine ottimizzata se disponibile; per i video si usa la miniatura.
          image:
            p.sizes?.large?.mediaUrl ??
            p.sizes?.medium?.mediaUrl ??
            (p.mediaType === "VIDEO" ? p.thumbnailUrl : p.mediaUrl) ??
            "",
          permalink: p.permalink,
          caption: (p.caption ?? "").slice(0, 200),
          isVideo: p.mediaType === "VIDEO",
          timestamp: p.timestamp,
        }))
        .filter((p) => !!p.image);
    },
    staleTime: 10 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
  });
