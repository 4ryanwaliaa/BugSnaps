export function defenderTamperStatus(value: unknown): "Enabled" | "Disabled" | "Unknown" {
  return value === true ? "Enabled" : value === false ? "Disabled" : "Unknown";
}
