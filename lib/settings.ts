import "server-only";

import { prisma } from "./db";
import { getEnv } from "./env";

/**
 * Pengaturan efektif: baca tabel `settings` dulu, fallback ke env.
 * Membuat perubahan via UI (/settings) langsung berlaku tanpa restart.
 */

export const SETTING_AGENT_API_KEY = "agent_api_key";
export const SETTING_ADMIN_PASSWORD_HASH = "admin_password_hash";

async function getSettingValue(key: string): Promise<string | null> {
  try {
    const row = await prisma.setting.findUnique({ where: { key }, select: { value: true } });
    return row?.value ?? null;
  } catch {
    // Tabel belum termigrasi (mis. saat build) — fallback ke env.
    return null;
  }
}

/** API key agent efektif: override DB dulu, fallback AGENT_API_KEY env. */
export async function getEffectiveAgentKey(): Promise<string> {
  const override = await getSettingValue(SETTING_AGENT_API_KEY);
  if (override && override.length >= 16) return override;
  return getEnv().AGENT_API_KEY;
}

/** Hash password admin efektif: override DB dulu, fallback ADMIN_PASSWORD_HASH env. */
export async function getEffectiveAdminPasswordHash(): Promise<string> {
  const override = await getSettingValue(SETTING_ADMIN_PASSWORD_HASH);
  if (override) return override;
  return getEnv().ADMIN_PASSWORD_HASH;
}

/** 4 karakter terakhir key untuk tampilan tersamar (tanpa membocorkan key). */
export function maskAgentKey(key: string): string {
  if (key.length <= 4) return "••••";
  return `••••••••••••${key.slice(-4)}`;
}

export async function setSettingValue(key: string, value: string): Promise<void> {
  await prisma.setting.upsert({
    where: { key },
    create: { key, value },
    update: { value },
  });
}
