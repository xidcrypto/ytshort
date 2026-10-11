import "server-only";

import { cookies } from "next/headers";

import { SESSION_COOKIE_NAME } from "./constants";
import { verifySessionToken } from "./session";

/** Pengecekan ulang sesi di server component/handler (lapis 2, §7). */
export async function isAdminLoggedIn(): Promise<boolean> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return false;
  return verifySessionToken(token);
}
