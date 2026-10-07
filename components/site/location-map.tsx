"use client";

import { useEffect, useState } from "react";
import { MapPin, ArrowUpRight } from "lucide-react";

/** Load the third-party map only after a visitor chooses to view it. */
export function LocationMap() {
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    // A Next.js transition retains the previous document's CSP. Reload once
    // when arriving from another public page so the map's contact policy loads.
    const documentUrl = performance.getEntriesByType("navigation")[0]?.name ?? window.location.href;
    if (!/^\/contact\/?$/.test(new URL(documentUrl, window.location.href).pathname)) {
      window.location.replace(window.location.href);
    }
  }, []);
  return (
    <section aria-labelledby="location-title" className="mt-14 rounded-2xl border border-white/10 bg-surface p-6 sm:p-8">
      <div className="grid gap-6 md:grid-cols-[0.7fr_1.3fr]">
        <div>
          <MapPin className="h-5 w-5 text-accent" aria-hidden="true" />
          <h2 id="location-title" className="mt-3 text-2xl font-semibold">Gurugram, India</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            Talk to BugSnaps about remote website and API security assessments or a separately scoped expert engagement. Arrange meetings through our contact form.
          </p>
          <p className="mt-3 text-xs leading-relaxed text-muted-2">The map shows the city, not a public office or a street address.</p>
          <a href="https://www.google.com/maps/search/?api=1&query=Gurugram%2C%20India" target="_blank" rel="noopener noreferrer" className="mt-5 inline-flex items-center gap-2 text-sm text-accent hover:underline">
            View Gurugram in Google Maps <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
          </a>
        </div>
        <div className="flex min-h-64 items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-background">
          {loaded ? (
            <iframe
              src="https://www.openstreetmap.org/export/embed.html?bbox=76.94%2C28.39%2C77.12%2C28.53&layer=mapnik&marker=28.4595%2C77.0266"
              title="City-level map of Gurugram, India"
              loading="lazy"
              referrerPolicy="no-referrer"
              className="h-72 w-full border-0"
            />
          ) : (
            <div className="p-7 text-center">
              <p className="text-sm text-muted">Explore the city-level location.</p>
              <button type="button" onClick={() => setLoaded(true)} className="mt-4 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-white hover:bg-accent">
                Load location map
              </button>
              <p className="mt-3 max-w-xs text-xs leading-relaxed text-muted-2">Loads a map from OpenStreetMap, which receives the request when you click.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
