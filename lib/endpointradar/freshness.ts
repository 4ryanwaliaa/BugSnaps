/** Maximum age before a device is overdue. Return null for invalid schedules. */
export function overdueAfterMs(intervalMinutes: unknown): number | null {
  if (typeof intervalMinutes !== "number" || !Number.isInteger(intervalMinutes) || intervalMinutes < 15 || intervalMinutes > 10080) return null;
  // The agent polls every 15 minutes and a task may take up to 14 minutes.
  // Allow a further 2 minutes for scheduler timing before raising an alert.
  return Math.max(2 * intervalMinutes, intervalMinutes + 15 + 14 + 2) * 60_000;
}
