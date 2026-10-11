"use server";

import { redirect } from "next/navigation";

import { isAdminLoggedIn } from "@/lib/auth-guard";
import { createJob } from "@/lib/jobs";
import { createJobSchema } from "@/lib/schemas";

export type NewJobState = { errors?: Record<string, string[]> };

/** Server Action buat job: validasi zod di server, tulis event null→pending. */
export async function createJobAction(_prev: NewJobState, formData: FormData): Promise<NewJobState> {
  if (!(await isAdminLoggedIn())) redirect("/login");
  const parsed = createJobSchema.safeParse({
    topic: String(formData.get("topic") ?? ""),
    title: String(formData.get("title") ?? ""),
    description: String(formData.get("description") ?? ""),
    privacy: String(formData.get("privacy") ?? "public"),
  });
  if (!parsed.success) {
    const errors: Record<string, string[]> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "topic");
      (errors[key] ??= []).push(issue.message);
    }
    return { errors };
  }
  const job = await createJob(parsed.data);
  redirect(`/jobs/${job.id}`);
}
