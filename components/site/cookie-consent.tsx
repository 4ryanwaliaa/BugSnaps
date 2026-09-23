"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import {
  COOKIE_SETTINGS_EVENT,
  readCookieConsent,
  saveCookieConsent,
  type CookieConsentChoice,
} from "@/lib/cookie-consent";
import styles from "./cookie-consent.module.css";

export function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const [closing, setClosing] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!readCookieConsent()) setVisible(true);

    function openSettings() {
      if (closeTimer.current) clearTimeout(closeTimer.current);
      setClosing(false);
      setVisible(true);
    }

    window.addEventListener(COOKIE_SETTINGS_EVENT, openSettings);
    return () => {
      window.removeEventListener(COOKIE_SETTINGS_EVENT, openSettings);
      if (closeTimer.current) clearTimeout(closeTimer.current);
    };
  }, []);

  function choose(choice: CookieConsentChoice) {
    saveCookieConsent(choice);
    setClosing(true);
    closeTimer.current = setTimeout(() => {
      setVisible(false);
      setClosing(false);
      closeTimer.current = null;
    }, 240);
  }

  if (!visible) return null;

  return (
    <aside
      aria-labelledby="cookie-consent-title"
      className={`${styles.toast} ${closing ? styles.closing : ""}`}
    >
      <div className={styles.heading}>
        <span className={styles.icon} aria-hidden="true"><ShieldCheck size={17} strokeWidth={1.8} /></span>
        <h2 id="cookie-consent-title">Cookies, minus the fuss.</h2>
      </div>
      <p className={styles.description}>
        Essential storage keeps sign-in and checkout working. With your OK, we’ll also remember whether you prefer
        monthly or yearly prices. No ad tracking. <Link href="/privacy">Privacy details</Link>
      </p>
      <div className={styles.actions}>
        <button type="button" className={styles.accept} onClick={() => choose("all")}>Sounds good</button>
        <button type="button" className={styles.essential} onClick={() => choose("essential")}>Essential only</button>
      </div>
    </aside>
  );
}

export function CookieSettingsButton({ className }: { className?: string }) {
  return (
    <button
      type="button"
      className={className}
      onClick={() => window.dispatchEvent(new Event(COOKIE_SETTINGS_EVENT))}
    >
      Cookie settings
    </button>
  );
}
