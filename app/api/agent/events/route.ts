import { prisma } from "@/lib/db";
import { claimUndeliveredEvents, pruneDeliveredEvents } from "@/lib/agent-events";

import { requireAgentKey } from "../_auth";

export const dynamic = "force-dynamic";

const POLL_MS = 2_000;
const HEARTBEAT_MS = 20_000;

const encoder = new TextEncoder();

/**
 * GET /api/agent/events — notifikasi realtime (SSE) untuk assistant eksternal.
 * Dipakai server-to-server: client membuka koneksi dan menahannya tetap
 * terbuka. Bukan untuk browser. Guard x-api-key sama seperti endpoint agent lain.
 *
 * Pengiriman berbasis tabel `sse_events` (bukan memori proses): tiap poll
 * koneksi mengklaim event `deliveredAt` NULL via updateMany lalu mengirimnya
 * sebagai baris data SSE. Aman untuk multi-proses maupun restart.
 *
 * Stream memakai pola pull + async-iterator sesuai dokumentasi Next.js agar
 * tiap chunk di-flush ke socket segera setelah di-enqueue.
 */
export async function GET(request: Request): Promise<Response> {
  const denied = await requireAgentKey(request);
  if (denied) return denied;

  let closed = false;
  request.signal.addEventListener("abort", () => {
    closed = true;
  }, { once: true });

  async function* makeIterator(): AsyncGenerator<Uint8Array> {
    // Sinkronisasi awal: daftar id job pending saat ini supaya client
    // yang baru tersambung tidak kehilangan job. Hanya id, tanpa detail.
    try {
      const pending = await prisma.job.findMany({
        where: { status: "pending" },
        select: { id: true },
        orderBy: { createdAt: "asc" },
        take: 100,
      });
      yield encoder.encode(
        `data: ${JSON.stringify({ type: "sync", jobIds: pending.map((j) => j.id), at: new Date().toISOString() })}\n\n`,
      );
    } catch {
      // DB bermasalah — koneksi tetap dibuka; poll berikut mencoba lagi.
    }

    let lastHeartbeat = Date.now();
    while (!closed) {
      try {
        const now = new Date();
        const claimed = await claimUndeliveredEvents(now);
        for (const ev of claimed) {
          yield encoder.encode(
            `data: ${JSON.stringify({ type: ev.type, jobId: ev.jobId, at: ev.createdAt.toISOString() })}\n\n`,
          );
          if (closed) return;
        }
        await pruneDeliveredEvents(now);
      } catch {
        // Gagal poll (mis. DB restart) — coba lagi di interval berikut.
      }

      if (Date.now() - lastHeartbeat >= HEARTBEAT_MS) {
        lastHeartbeat = Date.now();
        yield encoder.encode(": ping\n\n");
      }

      await new Promise((r) => setTimeout(r, POLL_MS));
    }
  }

  const stream = new ReadableStream<Uint8Array>({
    async pull(controller) {
      const { value, done } = await iterator.next();
      if (done || closed) {
        try {
          controller.close();
        } catch {
          // Abaikan.
        }
      } else {
        controller.enqueue(value);
      }
    },
    cancel() {
      closed = true;
    },
  });
  const iterator = makeIterator();

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
