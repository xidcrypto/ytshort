import "server-only";

import type { Job, JobEvent, Prisma } from "@prisma/client";

import { prisma } from "./db";
import { broadcastAgentEvent } from "./agent-events";

export type JobWithEvents = Job & { events: JobEvent[] };

/** Potong topic jadi judul YouTube (maks 100 char) bila title kosong (§5). */
export function defaultTitle(topic: string, title?: string | null): string {
  const t = (title ?? "").trim();
  if (t) return t.slice(0, 100);
  return topic.trim().slice(0, 100);
}

export async function createJob(input: {
  topic: string;
  title?: string | null;
  description?: string | null;
  privacy: string;
}): Promise<Job> {
  const title = defaultTitle(input.topic, input.title);
  const job = await prisma.$transaction(async (tx) => {
    const created = await tx.job.create({
      data: {
        topic: input.topic.trim(),
        title,
        description: input.description?.trim() ? input.description.trim() : null,
        privacy: input.privacy,
        status: "pending",
      },
    });
    await tx.jobEvent.create({
      data: { jobId: created.id, fromStatus: null, toStatus: "pending", note: "Job dibuat" },
    });
    return created;
  });
  // Sinyal bangun di luar transaksi, hanya bila sukses. Detail diambil
  // assistant lewat GET /api/agent/jobs?status=pending.
  broadcastAgentEvent({ type: "job_created", jobId: job.id, at: new Date().toISOString() });
  return job;
}

/**
 * Claim atomik: tepat satu pemenang bila dua request bersamaan (§8).
 * Return "claimed" | "conflict" | "not-found". Event ditulis dlm transaksi yg sama.
 */
export async function claimJob(id: string): Promise<{ result: "claimed" | "conflict" | "not-found"; job?: Job }> {
  return prisma.$transaction(async (tx) => {
    const res = await tx.job.updateMany({
      where: { id, status: "pending" },
      data: { status: "processing" },
    });
    if (res.count === 0) {
      const exists = await tx.job.findUnique({ where: { id }, select: { id: true } });
      return { result: exists ? ("conflict" as const) : ("not-found" as const) };
    }
    await tx.jobEvent.create({
      data: { jobId: id, fromStatus: "pending", toStatus: "processing", note: "Job diklaim agent" },
    });
    const job = await tx.job.findUniqueOrThrow({ where: { id } });
    return { result: "claimed" as const, job };
  });
}

/** Update done/failed — hanya dari processing, else conflict (§8). */
export async function updateJobStatus(
  id: string,
  data: { status: "done" | "failed"; youtubeUrl?: string; youtubeVideoId?: string; error?: string },
): Promise<{ result: "updated" | "conflict" | "not-found"; job?: Job }> {
  return prisma.$transaction(async (tx) => {
    const current = await tx.job.findUnique({ where: { id } });
    if (!current) return { result: "not-found" as const };
    if (current.status !== "processing") return { result: "conflict" as const };
    const job = await tx.job.update({
      where: { id },
      data: {
        status: data.status,
        youtubeUrl: data.status === "done" ? (data.youtubeUrl ?? null) : current.youtubeUrl,
        youtubeVideoId: data.youtubeVideoId ?? current.youtubeVideoId,
        error: data.status === "failed" ? (data.error ?? null) : null,
      },
    });
    await tx.jobEvent.create({
      data: {
        jobId: id,
        fromStatus: "processing",
        toStatus: data.status,
        note: data.status === "done" ? "Video selesai" : (data.error ?? "Gagal").slice(0, 500),
      },
    });
    return { result: "updated" as const, job };
  });
}

/** Admin: ulangi job failed → pending. */
export async function retryJob(id: string): Promise<boolean> {
  const ok = await prisma.$transaction(async (tx) => {
    const res = await tx.job.updateMany({
      where: { id, status: "failed" },
      data: { status: "pending", error: null },
    });
    if (res.count === 0) return false;
    await tx.jobEvent.create({
      data: { jobId: id, fromStatus: "failed", toStatus: "pending", note: "Diulangi admin" },
    });
    return true;
  });
  if (ok) broadcastAgentEvent({ type: "job_created", jobId: id, at: new Date().toISOString() });
  return ok;
}

/** Admin: reset job processing yg macet → pending. */
export async function resetStuckJob(id: string, stuckBefore: Date): Promise<boolean> {
  const ok = await prisma.$transaction(async (tx) => {
    const res = await tx.job.updateMany({
      where: { id, status: "processing", updatedAt: { lt: stuckBefore } },
      data: { status: "pending" },
    });
    if (res.count === 0) return false;
    await tx.jobEvent.create({
      data: { jobId: id, fromStatus: "processing", toStatus: "pending", note: "Direset admin (macet)" },
    });
    return true;
  });
  if (ok) broadcastAgentEvent({ type: "job_created", jobId: id, at: new Date().toISOString() });
  return ok;
}

export async function listJobs(options: { status?: string; take: number; skip: number }): Promise<{ jobs: Job[]; total: number }> {
  const where: Prisma.JobWhereInput = options.status ? { status: options.status } : {};
  const [jobs, total] = await Promise.all([
    prisma.job.findMany({ where, orderBy: { createdAt: "desc" }, take: options.take, skip: options.skip }),
    prisma.job.count({ where }),
  ]);
  return { jobs, total };
}

export async function getJobDetail(id: string): Promise<JobWithEvents | null> {
  return prisma.job.findUnique({
    where: { id },
    include: { events: { orderBy: { createdAt: "asc" } } },
  });
}

/** Jam server (helper agar Server Component tidak memanggil Date.now di render). */
export async function serverNow(): Promise<number> {
  return Date.now();
}
