import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { prisma } from "@/lib/db";
import { agentJobsQuerySchema } from "@/lib/schemas";

import { requireAgentKey } from "../_auth";

export const dynamic = "force-dynamic";

/** GET /api/agent/jobs?status=pending — FIFO untuk pending, maks 100 terbaru. */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const denied = await requireAgentKey(request);
  if (denied) return denied;

  const parsed = agentJobsQuerySchema.safeParse({
    status: request.nextUrl.searchParams.get("status") ?? undefined,
  });
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid status filter" }, { status: 400 });
  }

  const status = parsed.data.status;
  const jobs = await prisma.job.findMany({
    where: status ? { status } : {},
    orderBy: status === "pending" ? { createdAt: "asc" } : { createdAt: "desc" },
    take: 100,
    select: { id: true, topic: true, title: true, description: true, privacy: true, status: true, createdAt: true },
  });
  return NextResponse.json({ jobs });
}
