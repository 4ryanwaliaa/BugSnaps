import { overdueAfterMs } from "./freshness";

// Pure transaction update: repeated jobs create at most one alert per outage.
// Returning null for an uncached/missing node lets the RTDB transaction retry
// against its server value without creating a device that does not exist.
export function markMissing(current: unknown, now: number): unknown {
  if (current === null) return null;
  if (!current || typeof current !== "object" || Array.isArray(current)) return;
  const device = current as Record<string, unknown>;
  const threshold = overdueAfterMs(device.intervalMinutes);
  if (device.enabled !== true || threshold === null) return;
  const last = typeof device.lastSeenAt === "string" ? device.lastSeenAt : device.createdAt;
  if (typeof last !== "string") return;
  const timestamp = Date.parse(last);
  if (!Number.isFinite(timestamp) || timestamp > now || now - timestamp <= threshold) return;
  if (device.alertMissingSince === last) return;
  const alertId = `missing-${timestamp}`;
  const existing = device.alerts && typeof device.alerts === "object" && !Array.isArray(device.alerts) ? device.alerts as Record<string, unknown> : {};
  const alerts: Record<string, unknown> = { ...existing, [alertId]: { kind: "missing", message: "Device has not reported within its expected interval and grace period.", createdAt: new Date(now).toISOString() } };
  const ordered = Object.keys(alerts).sort((a, b) => String((alerts[b] as { createdAt?: unknown })?.createdAt || "").localeCompare(String((alerts[a] as { createdAt?: unknown })?.createdAt || "")));
  for (const old of ordered.slice(100)) delete alerts[old];
  return { ...device, alertMissingSince: last, alerts };
}
