import { prisma } from "@/lib/db";
import { addAgentClient, heartbeatAgentClients, removeAgentClient } from "@/lib/agent-events";

import { requireAgentKey } from "../_auth";

export const dynamic = "force-dynamic";

const HEARTBEAT_MS = 20_000;

const encoder = new TextEncoder();

/**
 * GET /api/agent/events — notifikasi realtime (SSE) untuk assistant eksternal.
 * Dipakai server-to-server: client membuka koneksi dan menahannya tetap
 * terbuka. Bukan untuk browser. Guard x-api-key sama seperti endpoint agent lain.
 */
export async function GET(request: Request): Promise<Response> {
  const denied = requireAgentKey(request);
  if (denied) return denied;

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      addAgentClient(controller);

      // Sinkronisasi awal: daftar id job pending saat ini supaya client
      // yang baru tersambung tidak kehilangan job. Hanya id, tanpa detail.
      try {
        const pending = await prisma.job.findMany({
          where: { status: "pending" },
          select: { id: true },
          orderBy: { createdAt: "asc" },
          take: 100,
        });
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ type: "sync", jobIds: pending.map((j) => j.id), at: new Date().toISOString() })}\n\n`,
          ),
        );
      } catch {
        removeAgentClient(controller);
        try {
          controller.close();
        } catch {
          // Sudah tertutup — abaikan.
        }
        return;
      }

      const timer = setInterval(heartbeatAgentClients, HEARTBEAT_MS);
      const cleanup = (): void => {
        clearInterval(timer);
        removeAgentClient(controller);
      };

      request.signal.addEventListener("abort", cleanup, { once: true });

      // Simpan cleanup agar cancel() bisa memakainya.
      (controller as unknown as { __sseCleanup?: () => void }).__sseCleanup = cleanup;
    },
    cancel(controller) {
      const cleanup = (controller as unknown as { __sseCleanup?: () => void }).__sseCleanup;
      if (cleanup) cleanup();
      else removeAgentClient(controller);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
