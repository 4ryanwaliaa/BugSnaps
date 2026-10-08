export type CookieConsentChoice = "all" | "essential";

// v1 did not include analytics. Ask again before using the new optional cookie.
export const COOKIE_CONSENT_KEY = "bugsnaps:cookie-consent:v2";
const LEGACY_COOKIE_CONSENT_KEY = "bugsnaps:cookie-consent:v1";
const LEGACY_PRICING_CYCLE_KEY = "bugsnaps:pricing-cycle";
export const COOKIE_CONSENT_CHANGE_EVENT = "bugsnaps:cookie-consent-change";
export const COOKIE_SETTINGS_EVENT = "bugsnaps:open-cookie-settings";
let pageChoice: CookieConsentChoice | null = null;

export function readCookieConsent(): CookieConsentChoice | null {
  if (pageChoice) return pageChoice;
  try {
    const value = window.localStorage.getItem(COOKIE_CONSENT_KEY);
    return value === "all" || value === "essential" ? value : null;
  } catch {
    return null;
  }
}

export function saveCookieConsent(choice: CookieConsentChoice): void {
  // Apply the choice immediately, including when browser storage is blocked.
  pageChoice = choice;
  try {
    window.localStorage.setItem(COOKIE_CONSENT_KEY, choice);
    window.localStorage.removeItem(LEGACY_COOKIE_CONSENT_KEY);
    window.localStorage.removeItem(LEGACY_PRICING_CYCLE_KEY);
    pageChoice = null;
  } catch {
    // Private browsing or blocked storage: the choice still applies for this page.
  }
  window.dispatchEvent(new Event(COOKIE_CONSENT_CHANGE_EVENT));
}
