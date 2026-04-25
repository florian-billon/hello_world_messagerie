import { useState, useEffect, useRef } from "react";

interface GiphyGif {
  id: string;
  title: string;
  images: {
    fixed_height: { url: string; width: string; height: string };
    original: { url: string };
  };
}

function sanitizePublicEnvValue(value?: string): string {
  if (!value) {
    return "";
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return "";
  }

  return (
    ((trimmed.startsWith('"') && trimmed.endsWith('"')) ||
      (trimmed.startsWith("'") && trimmed.endsWith("'"))
      ? trimmed.slice(1, -1)
      : trimmed)
  ).trim();
}

const BASE_URL = "https://api.giphy.com/v1/gifs";

export function useGifSearch() {
  const [query, setQuery] = useState("");
  const [gifs, setGifs] = useState<GiphyGif[]>([]);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      console.log("🔍 Giphy Search triggered for query:", query);
      const key = sanitizePublicEnvValue(process.env.NEXT_PUBLIC_GIPHY_API_KEY);
      
      if (!key) {
        setGifs([]);
        return;
      }

      setLoading(true);
      try {
        const endpoint = query.trim()
          ? `${BASE_URL}/search?api_key=${key}&q=${encodeURIComponent(query)}&limit=20&rating=g`
          : `${BASE_URL}/trending?api_key=${key}&limit=20&rating=g`;

        const res = await fetch(endpoint, {
          method: "GET",
          headers: {
            "Accept": "application/json",
          },
        });

        const data = await res.json();
        console.log("🎁 Giphy Response Data:", data);
        
        if (!res.ok) {
          console.error(`Giphy API error: ${res.status} ${res.statusText}`, data);
          setGifs([]);
          return;
        }

        setGifs(data.data ?? []);
      } catch (err) {
        console.error("Giphy fetch network error:", err);
        setGifs([]);
      } finally {
        setLoading(false);
      }
    }, 400);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  return { query, setQuery, gifs, loading };
}
