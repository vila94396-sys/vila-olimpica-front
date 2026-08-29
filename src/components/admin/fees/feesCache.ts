// Simple in-memory cache shared across mounts of fees grids.
// Lets the user switch between FFH / FDP / Instituições without
// refetching everything from scratch.

type Entry<T> = { data: T; ts: number };

const TTL_MS = 5 * 60 * 1000; // 5 minutes

const store = new Map<string, Entry<unknown>>();

export const feesCache = {
  get<T>(key: string): T | null {
    const e = store.get(key) as Entry<T> | undefined;
    if (!e) return null;
    if (Date.now() - e.ts > TTL_MS) {
      store.delete(key);
      return null;
    }
    return e.data;
  },
  set<T>(key: string, data: T) {
    store.set(key, { data, ts: Date.now() });
  },
  invalidate(prefix?: string) {
    if (!prefix) {
      store.clear();
      return;
    }
    for (const k of store.keys()) {
      if (k.startsWith(prefix)) store.delete(k);
    }
  },
};
