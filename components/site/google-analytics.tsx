"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { COOKIE_CONSENT_CHANGE_EVENT, COOKIE_CONSENT_KEY, readCookieConsent } from "@/lib/cookie-consent";

type Gtag = (...args: unknown[]) => void;
type AnalyticsWindow = Window & {
  dataLayer?: unknown[];
  gtag?: Gtag;
} & Partial<Record<`ga-disable-${string}`, boolean>>;

const SCRIPT_ID = "bugsnaps-google-analytics";
const deniedConsent = {
  analytics_storage: "denied",
  ad_storage: "denied",
  ad_user_data: "denied",
  ad_personalization: "denied",
};

function clearAnalyticsCookies() {
  const names = document.cookie.split(";").map((cookie) => cookie.trim().split("=")[0])
    .filter((name) => name === "_ga" || name.startsWith("_ga_"));
  const host = window.location.hostname.split(".");
  const domains = ["", ...host.flatMap((_, index) => {
    const domain = host.slice(index).join(".");
    return host.length - index >= 2 ? [domain, `.${domain}`] : [];
  })];
  for (const name of names) {
    for (const domain of domains) {
      document.cookie = `${name}=; Max-Age=0; Path=/; SameSite=Lax${domain ? `; Domain=${domain}` : ""}`;
    }
  }
}

function publicReferrer(pages: Record<string, string>, origin: string) {
  try {
    const referrer = new URL(document.referrer);
    if (!/^https?:$/.test(referrer.protocol)) return "";
    // External traffic sources need only their origin. Private/internal paths
    // and every query string or fragment stay out of analytics.
    return referrer.origin === origin
      ? (Object.hasOwn(pages, referrer.pathname) ? `${origin}${referrer.pathname}` : "")
      : `${referrer.origin}/`;
  } catch {
    return "";
  }
}

/** Basic consent mode: do not even load Google's tag before explicit opt-in. */
export function GoogleAnalytics({ measurementId, pages, origin }: {
  measurementId: string;
  pages: Record<string, string>;
  origin: string;
}) {
  const pathname = usePathname();
  const configured = useRef(false);
  const enabled = useRef(false);
  const lastPage = useRef<string | null>(null);
  const synchronize = useRef<(() => void) | null>(null);

  useEffect(() => {
    const analytics = window as unknown as AnalyticsWindow;
    const disableKey = `ga-disable-${measurementId}` as const;

    function sync() {
      const consent = readCookieConsent();
      const publicPage = window.location.hostname === new URL(origin).hostname
        && pathname !== null && Object.hasOwn(pages, pathname);
      if (consent !== "all" || !publicPage) {
        // Set the kill switch synchronously before queuing a consent update.
        analytics[disableKey] = true;
        if (enabled.current) analytics.gtag?.("consent", "update", deniedConsent);
        enabled.current = false;
        lastPage.current = null;
        if (consent !== "all") clearAnalyticsCookies();
        return;
      }

      analytics[disableKey] = false;
      const location = `${origin}${pathname}`;
      const page = {
        page_location: location,
        page_title: pages[pathname],
        page_referrer: lastPage.current ?? publicReferrer(pages, origin),
      };

      if (!configured.current) {
        analytics.dataLayer ??= [];
        analytics.gtag ??= function () { analytics.dataLayer!.push(arguments); };
        analytics.gtag("consent", "default", deniedConsent);
        analytics.gtag("js", new Date());
        analytics.gtag("set", { ...page, ads_data_redaction: true, url_passthrough: false });
        analytics.gtag("consent", "update", { ...deniedConsent, analytics_storage: "granted" });
        analytics.gtag("config", measurementId, {
          ...page,
          send_page_view: false,
          allow_google_signals: false,
          allow_ad_personalization_signals: false,
          cookie_path: "/",
        });
        configured.current = true;
        enabled.current = true;

        const script = document.createElement("script");
        script.id = SCRIPT_ID;
        script.async = true;
        script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
        script.addEventListener("load", () => {
          script.dataset.loaded = "true";
          synchronize.current?.();
        }, { once: true });
        document.head.appendChild(script);
      } else if (!enabled.current) {
        analytics.gtag?.("consent", "update", { ...deniedConsent, analytics_storage: "granted" });
        enabled.current = true;
      }

      if (lastPage.current === location) return;
      analytics.gtag?.("set", page);
      // A delayed tag load uses the current path and choice, never an old view
      // queued before navigation or withdrawal. Strict Mode/repeated consent
      // events also cannot count the same consecutive view twice.
      if (document.getElementById(SCRIPT_ID)?.dataset.loaded !== "true") return;
      analytics.gtag?.("event", "page_view", { ...page, send_to: measurementId });
      lastPage.current = location;
    }

    function storageChanged(event: StorageEvent) {
      if (event.key === COOKIE_CONSENT_KEY || event.key === null) sync();
    }

    synchronize.current = sync;
    sync();
    window.addEventListener(COOKIE_CONSENT_CHANGE_EVENT, sync);
    window.addEventListener("storage", storageChanged);
    return () => {
      synchronize.current = null;
      window.removeEventListener(COOKIE_CONSENT_CHANGE_EVENT, sync);
      window.removeEventListener("storage", storageChanged);
    };
  }, [measurementId, origin, pages, pathname]);

  return null;
}
