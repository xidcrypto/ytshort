import "server-only";

import { createHash, timingSafeEqual } from "node:crypto";

/** Auth agent: bandingkan x-api-key dgn timingSafeEqual (hash SHA-256 dulu, §8). */
export function isValidAgentKey(provided: string | null, expected: string): boolean {
  if (!provided) return false;
  const a = createHash("sha256").update(provided).digest();
  const b = createHash("sha256").update(expected).digest();
  return a.length === b.length && timingSafeEqual(a, b);
}

/** Ambil key dari header x-api-key. */
export function getAgentKeyFromHeaders(headers: Headers): string | null {
  return headers.get("x-api-key");
}
