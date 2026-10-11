"use server";

import { randomBytes } from "node:crypto";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { z } from "zod";

import { isAdminLoggedIn } from "@/lib/auth-guard";
import {
  SETTING_ADMIN_PASSWORD_HASH,
  SETTING_AGENT_API_KEY,
  getEffectiveAdminPasswordHash,
  getEffectiveAgentKey,
  maskAgentKey,
  setSettingValue,
} from "@/lib/settings";

async function requireAdmin(): Promise<void> {
  if (!(await isAdminLoggedIn())) redirect("/login");
}

function randomKey32(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const bytes = randomBytes(32);
  let s = "";
  for (const b of bytes) s += chars[b % chars.length];
  return s;
}

// ---------- Rate-limit regenerate (in-memory, anti spam) ----------

const REGEN_WINDOW_MS = 5 * 60 * 1000;
const REGEN_MAX = 3;

const globalForRegen = globalThis as unknown as {
  __shortsRegen?: { count: number; resetAt: number };
};

function regenAllowed(): { allowed: boolean; retrySec: number } {
  const now = Date.now();
  const store = globalForRegen.__shortsRegen ?? { count: 0, resetAt: now + REGEN_WINDOW_MS };
  if (store.resetAt <= now) {
    globalForRegen.__shortsRegen = { count: 0, resetAt: now + REGEN_WINDOW_MS };
    return { allowed: true, retrySec: 0 };
  }
  globalForRegen.__shortsRegen = store;
  if (store.count >= REGEN_MAX) {
    return { allowed: false, retrySec: Math.max(1, Math.ceil((store.resetAt - now) / 1000)) };
  }
  return { allowed: true, retrySec: 0 };
}

function regenRecord(): void {
  const now = Date.now();
  const store = globalForRegen.__shortsRegen;
  if (!store || store.resetAt <= now) {
    globalForRegen.__shortsRegen = { count: 1, resetAt: now + REGEN_WINDOW_MS };
    return;
  }
  store.count += 1;
}

// ---------- State ----------

export type RevealState = { key?: string; error?: string };
export type RegenState = { newKey?: string; masked?: string; error?: string };
export type PasswordState = { ok?: string; errors?: Record<string, string[]> };

/** Ambil key penuh — hanya untuk reveal sementara milik admin. Tidak di-log. */
export async function revealKeyAction(): Promise<RevealState> {
  await requireAdmin();
  return { key: await getEffectiveAgentKey() };
}

/** Regenerate key: rate-limit 3x/5 mnt, tampilkan sekali saja. */
export async function regenerateKeyAction(): Promise<RegenState> {
  await requireAdmin();
  const limit = regenAllowed();
  if (!limit.allowed) {
    return { error: `Terlalu sering. Coba lagi dalam ${limit.retrySec} detik.` };
  }
  regenRecord();
  const next = randomKey32();
  await setSettingValue(SETTING_AGENT_API_KEY, next);
  return { newKey: next, masked: maskAgentKey(next) };
}

const changePasswordSchema = z
  .object({
    current: z.string().min(1, "Kata sandi saat ini wajib diisi."),
    next: z.string().min(8, "Kata sandi baru minimal 8 karakter."),
    confirm: z.string().min(1, "Konfirmasi wajib diisi."),
  })
  .refine((v) => v.next === v.confirm, {
    message: "Konfirmasi tidak sama dengan kata sandi baru.",
    path: ["confirm"],
  });

/** Ubah password: verifikasi current ke hash efektif, simpan hash baru (cost 10). */
export async function changePasswordAction(_prev: PasswordState, formData: FormData): Promise<PasswordState> {
  await requireAdmin();
  const parsed = changePasswordSchema.safeParse({
    current: String(formData.get("current") ?? ""),
    next: String(formData.get("next") ?? ""),
    confirm: String(formData.get("confirm") ?? ""),
  });
  if (!parsed.success) {
    const errors: Record<string, string[]> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "next");
      (errors[key] ??= []).push(issue.message);
    }
    return { errors };
  }
  const currentOk = await bcrypt.compare(parsed.data.current, await getEffectiveAdminPasswordHash());
  if (!currentOk) {
    await new Promise((r) => setTimeout(r, 500));
    return { errors: { current: ["Kata sandi saat ini salah."] } };
  }
  const hash = await bcrypt.hash(parsed.data.next, 10);
  await setSettingValue(SETTING_ADMIN_PASSWORD_HASH, hash);
  return { ok: "Kata sandi berhasil diubah. Login berikutnya memakai yang baru." };
}

export type SettingsInfo = { masked: string; hasOverride: boolean };

/** Info aman untuk render awal kartu API key (tanpa key penuh). */
export async function getSettingsInfo(): Promise<SettingsInfo> {
  await requireAdmin();
  const key = await getEffectiveAgentKey();
  return { masked: maskAgentKey(key), hasOverride: true };
}
