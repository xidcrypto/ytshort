"use server";

import { redirect } from "next/navigation";

import { isAdminLoggedIn } from "@/lib/auth-guard";
import { STUCK_AFTER_MS } from "@/lib/constants";
import { resetStuckJob, retryJob } from "@/lib/jobs";

async function requireAdmin(): Promise<void> {
  if (!(await isAdminLoggedIn())) redirect("/login");
}

/** Tombol Ulangi: failed → pending. */
export async function retryAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (id) await retryJob(id);
  redirect("/");
}

/** Tombol Reset: processing macet >2 jam → pending. */
export async function resetStuckAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (id) await resetStuckJob(id, new Date(Date.now() - STUCK_AFTER_MS));
  redirect("/");
}
