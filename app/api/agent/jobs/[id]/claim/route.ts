import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { claimJob } from "@/lib/jobs";

import { requireAgentKey } from "../../../_auth";

export const dynamic = "force-dynamic";

/** POST /api/agent/jobs/[id]/claim — atomik, tepat satu pemenang (§8). */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const denied = await requireAgentKey(request);
  if (denied) return denied;

  const { id } = await params;
  const { result, job } = await claimJob(id);
  if (result === "not-found") return NextResponse.json({ error: "Job not found" }, { status: 404 });
  if (result === "conflict") return NextResponse.json({ error: "Job already claimed" }, { status: 409 });
  return NextResponse.json({ job });
}
