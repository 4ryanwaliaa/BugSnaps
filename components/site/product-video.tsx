"use client";

import { useState } from "react";
import { Play } from "lucide-react";

export function ProductVideo({ name, videoId }: { name: string; videoId: string }) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className="relative w-full">
      <p className="mb-4 font-mono text-xs uppercase tracking-wider text-accent">See {name} in action</p>
      <div className="aspect-video overflow-hidden rounded-2xl border border-white/10 bg-background">
        {loaded ? (
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1`}
            title={`${name} product video`}
            className="h-full w-full border-0"
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
          />
        ) : (
          <button
            type="button"
            onClick={() => setLoaded(true)}
            aria-label={`Play ${name} product video`}
            className="flex h-full w-full flex-col items-center justify-center gap-4 bg-gradient-to-br from-primary/20 via-surface to-accent/10 px-6 text-center transition-colors hover:bg-white/5 focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-accent"
          >
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-white"><Play className="h-7 w-7" aria-hidden="true" /></span>
            <span className="text-lg font-semibold sm:text-2xl">Watch {name}</span>
            <span className="text-xs text-muted">Loads YouTube when you press play</span>
          </button>
        )}
      </div>
      <a href={`https://www.youtube.com/watch?v=${videoId}`} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex min-h-11 items-center text-sm text-accent hover:underline">
        Watch on YouTube <span aria-hidden="true" className="ml-1">↗</span>
      </a>
    </div>
  );
}
