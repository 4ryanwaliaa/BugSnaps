// Keep a delayed response from being applied after another client/device is selected.
export function asyncSelection() {
  let scope = 0;
  const requests = new Map<string, number>();
  return {
    invalidate() { scope++; requests.clear(); },
    start(channel: string) {
      const generation = scope;
      const id = (requests.get(channel) || 0) + 1;
      requests.set(channel, id);
      return () => generation === scope && requests.get(channel) === id;
    },
  };
}
