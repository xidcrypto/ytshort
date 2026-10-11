import "server-only";

import { createWriteStream } from "node:fs";
import { mkdir, stat, unlink } from "node:fs/promises";
import { join, resolve, sep } from "node:path";
import { pipeline } from "node:stream/promises";
import { Readable } from "node:stream";

import { MAX_VIDEO_BYTES } from "@/lib/constants";
import { prisma } from "@/lib/db";
import { getEnv } from "@/lib/env";

export type VideoUploadError = { code: "NOT_FOUND" | "TOO_LARGE" | "NOT_MP4"; message: string };

function isMp4Mime(mime: string): boolean {
  return mime === "video/mp4" || mime === "application/mp4";
}

/**
 * Simpan upload MP4 via stream ke UPLOAD_DIR/<jobId>.mp4 (§8).
 * - Validasi: ukuran ≤200MB, MIME MP4, magic bytes `ftyp` pada offset 4.
 * - Nama file buatan server; nama klien tidak pernah dipakai (path traversal).
 * - Hanya 12 byte header yang di-buffer; sisanya stream ke disk.
 */
export async function saveAgentVideo(
  jobId: string,
  file: File,
): Promise<{ ok: true; size: number } | { ok: false; error: VideoUploadError }> {
  const job = await prisma.job.findUnique({ where: { id: jobId }, select: { id: true } });
  if (!job) return { ok: false, error: { code: "NOT_FOUND", message: "Job not found" } };

  if (file.size > MAX_VIDEO_BYTES) {
    return { ok: false, error: { code: "TOO_LARGE", message: "File too large (max 200MB)" } };
  }
  if (!isMp4Mime(file.type)) {
    return { ok: false, error: { code: "NOT_MP4", message: "File must be MP4" } };
  }

  const env = getEnv();
  const dir = resolve(process.cwd(), env.UPLOAD_DIR);
  await mkdir(dir, { recursive: true });
  const dest = join(dir, `${jobId}.mp4`);
  if (!dest.startsWith(dir + sep)) throw new Error("Invalid upload path");

  const source = Readable.fromWeb(file.stream() as unknown as Parameters<typeof Readable.fromWeb>[0]);

  // Kumpulkan 12 byte header untuk cek ftyp, lalu tulis semuanya via stream.
  const headerChunks: Buffer[] = [];
  let headerLen = 0;
  let headerChecked = false;
  let headerOk = false;
  const { Transform } = await import("node:stream");
  const checker = new Transform({
    transform(chunk: Buffer, _enc, cb): void {
      if (!headerChecked) {
        headerChunks.push(Buffer.from(chunk));
        headerLen += chunk.length;
        if (headerLen >= 12) {
          const header = Buffer.concat(headerChunks);
          headerOk = header.length >= 8 && header.subarray(4, 8).toString("ascii") === "ftyp";
          headerChecked = true;
          if (!headerOk) {
            cb(new Error("NOT_MP4"));
            return;
          }
        }
      }
      cb(null, chunk);
    },
    flush(cb): void {
      if (!headerChecked) {
        const header = Buffer.concat(headerChunks);
        headerOk = header.length >= 8 && header.subarray(4, 8).toString("ascii") === "ftyp";
        headerChecked = true;
      }
      cb(headerOk ? null : new Error("NOT_MP4"));
    },
  });

  try {
    await pipeline(source, checker, createWriteStream(dest));
  } catch {
    await unlink(dest).catch(() => {});
    return { ok: false, error: { code: "NOT_MP4", message: "File must be MP4 (ftyp box missing)" } };
  }

  const st = await stat(dest);
  await prisma.job.update({ where: { id: jobId }, data: { videoFile: `${jobId}.mp4` } });
  return { ok: true, size: st.size };
}
