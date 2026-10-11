import "server-only";

import { NextResponse } from "next/server";

import { getAgentKeyFromHeaders, isValidAgentKey } from "@/lib/agent-auth";
import { getEffectiveAgentKey } from "@/lib/settings";

/** 401 konsisten bila x-api-key salah (§8). Jangan bocorkan detail. */
export function unauthorized(): NextResponse {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

/** Guard tiap handler /api/agent/*: return null bila lolos, else respons 401. */
export async function requireAgentKey(request: Request): Promise<NextResponse | null> {
  const provided = getAgentKeyFromHeaders(request.headers);
  if (!isValidAgentKey(provided, await getEffectiveAgentKey())) return unauthorized();
  return null;
}
