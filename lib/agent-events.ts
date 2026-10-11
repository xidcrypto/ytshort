import "server-only";

import { prisma } from "./db";

/**
 * Antrean event SSE berbasis tabel `sse_events` (pengganti broadcaster in-memory).
 *
 * broadcast = INSERT satu baris; tiap koneksi SSE di route
 * app/api/agent/events mengklaim baris `deliveredAt` NULL via updateMany lalu
 * mengirimnya. Tidak bergantung memori satu proses Node — aman untuk
 * multi-proses maupun restart.
 *
 * Tidak pernah membocorkan AGENT_API_KEY lewat event — payload hanya sinyal
 * bangun (type + jobId); detail job tetap diambil lewat
 * GET /api/agent/jobs?status=pending.
 */

/** Tipe event yang dikenal. */
export const SSE_EVENT_TYPES = ["job_created"] as const;
export type SseEventType = (typeof SSE_EVENT_TYPES)[number];

/** Payload event yang dikirim ke agent. Hanya sinyal — tanpa data sensitif. */
export type AgentEventPayload = {
  type: "sync" | SseEventType;
  jobIds?: string[];
  jobId?: string;
  at?: string;
};

/**
 * Tulis sinyal ke antrean database. Fire-and-forget dari pemanggil:
 * kegagalan tulis tidak boleh menggagalkan transaksi job utama.
 */
export async function broadcastAgentEvent(payload: { type: SseEventType; jobId: string }): Promise<void> {
  try {
    await prisma.sseEvent.create({
      data: { type: payload.type, jobId: payload.jobId },
    });
  } catch {
    // Antrean event bersifat best-effort; client juga mendapat daftar
    // pending lewat event sync + polling biasa. Jangan lempar error.
  }
}

/**
 * Klaim event yang belum terkirim: tandai deliveredAt, kembalikan baris
 * yang berhasil diklaim. Dipakai route SSE tiap poll 2 detik.
 */
export async function claimUndeliveredEvents(
  now: Date,
): Promise<Array<{ id: string; type: string; jobId: string | null; createdAt: Date }>> {
  // Ambil kandidat dulu (id saja), lalu klaim atomik per baris agar dua
  // koneksi SSE tidak mengirim event yang sama.
  const candidates = await prisma.sseEvent.findMany({
    where: { deliveredAt: null },
    select: { id: true },
    orderBy: { createdAt: "asc" },
    take: 50,
  });
  const claimed: Array<{ id: string; type: string; jobId: string | null; createdAt: Date }> = [];
  for (const c of candidates) {
    const res = await prisma.sseEvent.updateMany({
      where: { id: c.id, deliveredAt: null },
      data: { deliveredAt: now },
    });
    if (res.count === 0) continue;
    const row = await prisma.sseEvent.findUnique({
      where: { id: c.id },
      select: { id: true, type: true, jobId: true, createdAt: true },
    });
    if (row) claimed.push(row);
  }
  return claimed;
}

/** Hapus baris yang sudah terkirim lebih dari 1 jam (oportunistik tiap poll). */
export async function pruneDeliveredEvents(now: Date): Promise<void> {
  try {
    await prisma.sseEvent.deleteMany({
      where: { deliveredAt: { lt: new Date(now.getTime() - 60 * 60 * 1000) } },
    });
  } catch {
    // Best-effort; kegagalan cleanup tidak mengganggu pengiriman.
  }
}
