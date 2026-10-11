import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { saveAgentVideo } from "@/lib/video-upload";

import { requireAgentKey } from "../../../_auth";

export const dynamic = "force-dynamic";

/** POST /api/agent/jobs/[id]/video — multipart field `file`, harus MP4 ≤200MB. */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const denied = await requireAgentKey(request);
  if (denied) return denied;

  const { id } = await params;
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid multipart body" }, { status: 400 });
  }
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Missing file field" }, { status: 400 });
  }

  const saved = await saveAgentVideo(id, file);
  if (!saved.ok) {
    const status = saved.error.code === "NOT_FOUND" ? 404 : 400;
    return NextResponse.json({ error: saved.error.message }, { status });
  }
  return NextResponse.json({ ok: true, size: saved.size });
}
