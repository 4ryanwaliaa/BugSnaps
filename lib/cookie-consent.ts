export type CookieConsentChoice = "all" | "essential";

export const COOKIE_CONSENT_KEY = "bugsnaps:cookie-consent:v1";
export const PRICING_CYCLE_KEY = "bugsnaps:pricing-cycle";
export const COOKIE_CONSENT_CHANGE_EVENT = "bugsnaps:cookie-consent-change";
export const COOKIE_SETTINGS_EVENT = "bugsnaps:open-cookie-settings";

export function readCookieConsent(): CookieConsentChoice | null {
  try {
    const value = window.localStorage.getItem(COOKIE_CONSENT_KEY);
    return value === "all" || value === "essential" ? value : null;
  } catch {
    return null;
  }
}

export function saveCookieConsent(choice: CookieConsentChoice): void {
  try {
    window.localStorage.setItem(COOKIE_CONSENT_KEY, choice);
    if (choice === "essential") window.localStorage.removeItem(PRICING_CYCLE_KEY);
  } catch {
    // Private browsing or blocked storage: the choice still applies for this page.
  }
  window.dispatchEvent(new Event(COOKIE_CONSENT_CHANGE_EVENT));
}
