// Vulnerabilities BugSnaps found and disclosed through coordinated disclosure.
// Only add an entry once its advisory is public: every entry must link to the
// published CVE/GHSA/vendor advisory. The homepage section stays hidden while
// this list is empty.

export type Severity = "Critical" | "High" | "Medium" | "Low";

export type Disclosure = {
  /** Public identifier, e.g. "CVE-2026-12345" or "GHSA-xxxx-xxxx-xxxx". */
  id: string;
  /** Affected product, as the vendor names it. */
  product: string;
  vendor: string;
  /** Bug class, e.g. "Authentication bypass", "Stored XSS". */
  kind: string;
  severity: Severity;
  /** Month the advisory was published, "YYYY-MM". */
  published: string;
  /** Public advisory URL. */
  advisory: string;
};

export const DISCLOSURES: Disclosure[] = [];
