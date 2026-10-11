import "server-only";

const WINDOW_MS = 15 * 60 * 1000;
const SWEEP_INTERVAL_MS = 60 * 1000;

type Bucket = { count: number; resetAt: number };

const globalForLoginLimit = globalThis as unknown as {
  __shortsLoginLimit?: { buckets: Map<string, Bucket>; lastSweep: number };
};

function getStore(): { buckets: Map<string, Bucket>; lastSweep: number } {
  if (!globalForLoginLimit.__shortsLoginLimit) {
    globalForLoginLimit.__shortsLoginLimit = { buckets: new Map(), lastSweep: Date.now() };
  }
  return globalForLoginLimit.__shortsLoginLimit;
}

/** Rate limit login: 5 gagal per IP per 15 menit (§7). */
export function checkLoginRateLimit(ip: string): { allowed: boolean; retryAfterSec: number } {
  const store = getStore();
  const now = Date.now();
  if (now - store.lastSweep >= SWEEP_INTERVAL_MS) {
    store.lastSweep = now;
    for (const [key, bucket] of store.buckets) {
      if (bucket.resetAt <= now) store.buckets.delete(key);
    }
  }
  const bucket = store.buckets.get(ip);
  if (!bucket || bucket.resetAt <= now) {
    store.buckets.set(ip, { count: 0, resetAt: now + WINDOW_MS });
    return { allowed: true, retryAfterSec: 0 };
  }
  if (bucket.count >= 5) {
    return { allowed: false, retryAfterSec: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)) };
  }
  return { allowed: true, retryAfterSec: 0 };
}

export function recordLoginFailure(ip: string): void {
  const store = getStore();
  const now = Date.now();
  const bucket = store.buckets.get(ip);
  if (!bucket || bucket.resetAt <= now) {
    store.buckets.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return;
  }
  bucket.count += 1;
}

export function clearLoginFailures(ip: string): void {
  getStore().buckets.delete(ip);
}

/** IP client di belakang nginx (X-Forwarded-For dipercaya, server ini memang pakai proxy). */
export function getClientIp(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  const first = forwarded?.split(",")[0]?.trim();
  if (first) return first;
  return headers.get("x-real-ip")?.trim() || "direct";
}
