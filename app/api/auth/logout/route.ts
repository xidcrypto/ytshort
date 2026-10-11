import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { SESSION_COOKIE_NAME } from "@/lib/constants";
import { publicUrl } from "@/lib/public-url";

export const dynamic = "force-dynamic";

/** POST /api/auth/logout — hapus cookie sesi, kembali ke /login. */
export async function POST(request: NextRequest): Promise<NextResponse> {
  const res = NextResponse.redirect(publicUrl(request, "/login"), { status: 303 });
  res.cookies.delete(SESSION_COOKIE_NAME);
  return res;
}
