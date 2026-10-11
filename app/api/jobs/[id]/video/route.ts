import { createReadStream, promises as fs } from "node:fs";
import { join, resolve, sep } from "node:path";
import { Readable } from "node:stream";
import { redirect } from "next/navigation";

import { isAdminLoggedIn } from "@/lib/auth-guard";
import { prisma } from "@/lib/db";
import { getEnv } from "@/lib/env";

export const dynamic = "force-dynamic";

/** GET /api/jobs/[id]/video — unduhan MP4 khusus admin (attachment). */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  if (!(await isAdminLoggedIn())) redirect("/login");
  const { id } = await params;
  const job = await prisma.job.findUnique({ where: { id }, select: { videoFile: true } });
  if (!job?.videoFile) {
    return new Response(JSON.stringify({ error: "Video tidak ditemukan" }), {
      status: 404,
      headers: { "content-type": "application/json" },
    });
  }

  const dir = resolve(process.cwd(), getEnv().UPLOAD_DIR);
  const path = join(dir, job.videoFile);
  if (!path.startsWith(dir + sep)) return new Response("Forbidden", { status: 403 });
  try {
    const st = await fs.stat(path);
    const nodeStream = createReadStream(path);
    const webStream = Readable.toWeb(nodeStream) as unknown as ReadableStream<Uint8Array>;
    return new Response(webStream, {
      headers: {
        "content-type": "video/mp4",
        "content-length": String(st.size),
        "content-disposition": `attachment; filename="${id}.mp4"`,
      },
    });
  } catch {
    return new Response(JSON.stringify({ error: "Video tidak ditemukan" }), {
      status: 404,
      headers: { "content-type": "application/json" },
    });
  }
}
