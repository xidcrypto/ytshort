import "server-only";

import { NextResponse } from "next/server";

import { getAgentKeyFromHeaders, isValidAgentKey } from "@/lib/agent-auth";
import { getEnv } from "@/lib/env";

/** 401 konsisten bila x-api-key salah (§8). Jangan bocorkan detail. */
export function unauthorized(): NextResponse {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

/** Guard tiap handler /api/agent/*: return null bila lolos, else respons 401. */
export function requireAgentKey(request: Request): NextResponse | null {
  const provided = getAgentKeyFromHeaders(request.headers);
  if (!isValidAgentKey(provided, getEnv().AGENT_API_KEY)) return unauthorized();
  return null;
}
