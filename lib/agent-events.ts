import "server-only";

/**
 * Broadcaster SSE in-memory untuk AI assistant eksternal.
 *
 * Aplikasi jalan sebagai satu proses Node di satu VPS, jadi cukup simpan
 * daftar client dalam sebuah Set di level modul. Tidak pernah membocorkan
 * AGENT_API_KEY lewat event — payload hanya sinyal bangun (type + jobId);
 * detail job tetap diambil lewat GET /api/agent/jobs?status=pending.
 */

type DataClient = ReadableStreamDefaultController<Uint8Array>;

const clients = new Set<DataClient>();

const encoder = new TextEncoder();

/** Payload event yang dikirim ke agent. Hanya sinyal — tanpa data sensitif. */
export type AgentEventPayload = {
  type: "sync" | "job_created" | "ping";
  jobIds?: string[];
  jobId?: string;
  at?: string;
};

function encodeData(payload: AgentEventPayload): Uint8Array {
  return encoder.encode(`data: ${JSON.stringify(payload)}\n\n`);
}

/** Daftarkan controller stream client baru. */
export function addAgentClient(client: DataClient): void {
  clients.add(client);
}

/** Hapus controller dari daftar (dipanggil saat client putus). */
export function removeAgentClient(client: DataClient): void {
  clients.delete(client);
}

/** Jumlah client yang sedang tersambung (untuk observasi, bukan untuk di-log). */
export function agentClientCount(): number {
  return clients.size;
}

/**
 * Tulis satu baris data JSON ke semua client.
 * Client yang gagal ditulis otomatis dihapus dari daftar.
 */
export function broadcastAgentEvent(payload: AgentEventPayload): void {
  const bytes = encodeData(payload);
  for (const client of Array.from(clients)) {
    try {
      client.enqueue(bytes);
    } catch {
      clients.delete(client);
    }
  }
}

/** Tulis baris komentar ping ke semua client (heartbeat agar koneksi hidup). */
export function heartbeatAgentClients(): void {
  const bytes = encoder.encode(": ping\n\n");
  for (const client of Array.from(clients)) {
    try {
      client.enqueue(bytes);
    } catch {
      clients.delete(client);
    }
  }
}
