"use client";
import { useRef, useEffect } from "react";
import { useGifSearch } from "@/hooks/useGifSearch";

interface GifPickerProps {
  onSelect: (gifUrl: string) => void;
  onClose: () => void;
  searchPlaceholder?: string;
}

export default function GifPicker({ onSelect, onClose, searchPlaceholder = "Search GIFs..." }: GifPickerProps) {
  const { query, setQuery, gifs, loading } = useGifSearch();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  return (
    <div
      ref={containerRef}
      className="absolute bottom-16 left-0 w-80 bg-[rgba(10,15,20,0.98)] border border-[#4fdfff]/30 rounded-xl shadow-2xl z-50 overflow-hidden"
    >
      {/* Search input */}
      <div className="p-2 border-b border-[#4fdfff]/20">
        <input
          autoFocus
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={searchPlaceholder}
          className="w-full px-3 py-1.5 bg-black/50 border border-[#4fdfff]/30 rounded-lg text-white text-sm placeholder:text-white/40 outline-none focus:border-[#4fdfff]"
        />
      </div>

      {/* GIF grid */}
      <div className="h-64 overflow-y-auto p-2">
        {loading ? (
          <div className="flex items-center justify-center h-full text-white/40 text-sm">
            Loading...
          </div>
        ) : gifs.length === 0 ? (
          <div className="flex items-center justify-center h-full text-white/40 text-sm">
            No GIFs found
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-1.5">
            {gifs.map((gif) => (
              <button
                key={gif.id}
                onClick={() => {
                  onSelect(gif.images.original.url);
                  onClose();
                }}
                className="rounded overflow-hidden hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-[#4fdfff]"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={gif.images.fixed_height.url}
                  alt={gif.title}
                  className="w-full h-24 object-cover"
                  loading="lazy"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Powered by GIPHY */}
      <div className="px-2 py-1 border-t border-[#4fdfff]/10 text-right">
        <span className="text-[10px] text-white/20">Powered by GIPHY</span>
      </div>
    </div>
  );
}
