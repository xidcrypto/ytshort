import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import bcrypt from "bcryptjs";

import { SESSION_COOKIE_NAME, SESSION_MAX_AGE_SECONDS } from "@/lib/constants";
import { clearLoginFailures, checkLoginRateLimit, getClientIp, recordLoginFailure } from "@/lib/login-limit";
import { publicUrl } from "@/lib/public-url";
import { createSessionToken } from "@/lib/session";
import { getEffectiveAdminPasswordHash } from "@/lib/settings";

export const dynamic = "force-dynamic";

function loginRedirect(request: NextRequest, message: string, retryAfterSec?: number): NextResponse {
  const url = publicUrl(request, "/login");
  url.searchParams.set("error", message);
  const res = NextResponse.redirect(url, { status: 303 });
  if (retryAfterSec !== undefined) res.headers.set("Retry-After", String(retryAfterSec));
  return res;
}

/** POST /api/auth/login — form password admin. */
export async function POST(request: NextRequest): Promise<NextResponse> {
  const ip = getClientIp(request.headers);
  const limit = checkLoginRateLimit(ip);
  if (!limit.allowed) {
    return loginRedirect(
      request,
      `Terlalu banyak percobaan. Coba lagi dalam ${limit.retryAfterSec} detik.`,
      limit.retryAfterSec,
    );
  }

  const form = await request.formData();
  const password = String(form.get("password") ?? "");

  const ok =
    password.length > 0 && (await bcrypt.compare(password, await getEffectiveAdminPasswordHash()));
  if (!ok) {
    recordLoginFailure(ip);
    // Jeda kecil anti brute-force.
    await new Promise((r) => setTimeout(r, 500));
    return loginRedirect(request, "Kata sandi salah.");
  }

  clearLoginFailures(ip);
  const token = await createSessionToken();
  const res = NextResponse.redirect(publicUrl(request, "/"), { status: 303 });
  res.cookies.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env["NODE_ENV"] === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
  return res;
}
