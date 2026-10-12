"use client";

import { useState } from "react";
import { Play } from "lucide-react";

export function TutorialVideo() {
  const [loaded, setLoaded] = useState(false);

  return (
    <section id="how-to-use" aria-labelledby="tutorial-title" className="mx-auto w-full max-w-6xl px-6 py-16 lg:px-8">
      <p className="font-mono text-xs uppercase tracking-wider text-accent">Video walkthrough</p>
      <h2 id="tutorial-title" className="mt-3 text-3xl font-semibold tracking-tight">How to use BugSnaps</h2>
      <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted">
        Get to know MyPentest, BugSnaps&apos; web application security assessment tool, in this quick video.
      </p>
      <div className="mt-8 aspect-video overflow-hidden rounded-2xl border border-white/10 bg-surface">
        {loaded ? (
          <iframe
            src="https://www.youtube-nocookie.com/embed/wZM29H-GTvU?autoplay=1"
            title="How to use BugSnaps: MyPentest video walkthrough"
            className="h-full w-full border-0"
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
          />
        ) : (
          <button
            type="button"
            onClick={() => setLoaded(true)}
            className="flex h-full w-full flex-col items-center justify-center gap-4 bg-gradient-to-br from-primary/20 via-surface to-accent/10 px-6 text-center transition-colors hover:bg-white/5 focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-accent"
          >
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-white"><Play className="h-7 w-7" aria-hidden="true" /></span>
            <span className="text-lg font-semibold sm:text-2xl">Watch the MyPentest walkthrough</span>
            <span className="text-xs text-muted">Loads YouTube when you press play</span>
          </button>
        )}
      </div>
      <a href="https://www.youtube.com/watch?v=wZM29H-GTvU" target="_blank" rel="noopener noreferrer" className="mt-4 inline-block text-sm text-accent hover:underline">
        Watch on YouTube ↗
      </a>
    </section>
  );
}
