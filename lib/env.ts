import "server-only";

import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1, "DATABASE_URL wajib diisi"),
  AGENT_API_KEY: z.string().min(16, "AGENT_API_KEY wajib diisi (min. 16 karakter)"),
  ADMIN_PASSWORD_HASH: z.string().min(1, "ADMIN_PASSWORD_HASH wajib diisi (lihat npm run hash-password)"),
  SESSION_SECRET: z.string().min(32, "SESSION_SECRET wajib min. 32 karakter"),
  NEXT_PUBLIC_APP_URL: z.string().url("NEXT_PUBLIC_APP_URL harus URL valid").default("https://short.hgitopup.web.id"),
  UPLOAD_DIR: z.string().default("./uploads"),
});

export type Env = z.infer<typeof envSchema>;

let cached: Env | null = null;

/** Validasi env saat startup; gagal dengan pesan jelas (AGENTS.md §4). */
export function getEnv(): Env {
  if (cached) return cached;
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    const details = parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ");
    throw new Error(`Konfigurasi environment tidak valid: ${details}`);
  }
  cached = parsed.data;
  return cached;
}
