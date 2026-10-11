import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { updateJobStatus } from "@/lib/jobs";
import { agentPatchSchema } from "@/lib/schemas";

import { requireAgentKey } from "../../_auth";
export const dynamic = "force-dynamic";

/** PATCH /api/agent/jobs/[id] — done (wajib youtubeUrl YT) / failed (wajib error). */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const denied = requireAgentKey(request);
  if (denied) return denied;

  const { id } = await params;
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  const parsed = agentPatchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.issues.map((i) => i.message) },
      { status: 400 },
    );
  }

  const { result, job } = await updateJobStatus(id, parsed.data);
  if (result === "not-found") return NextResponse.json({ error: "Job not found" }, { status: 404 });
  if (result === "conflict")
    return NextResponse.json({ error: "Job is not in processing status" }, { status: 409 });
  return NextResponse.json({ job });
}
