import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface InstagramPost {
  id: string;
  image: string;
  permalink: string;
  caption: string;
  isVideo: boolean;
  timestamp: string;
}

// Legge gli ultimi post dell'account Instagram tramite la edge function "instagram-feed".
// Se la funzione non è configurata o fallisce, restituisce una lista vuota e la Gallery
// mostra le immagini statiche di riserva.
export const useInstagramFeed = () =>
  useQuery({
    queryKey: ["instagram-feed"],
    queryFn: async (): Promise<InstagramPost[]> => {
      const { data, error } = await supabase.functions.invoke("instagram-feed", { method: "GET" });
      if (error) throw error;
      return (data?.items ?? []) as InstagramPost[];
    },
    staleTime: 10 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
  });
