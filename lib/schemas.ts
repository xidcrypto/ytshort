import { z } from "zod";

import { JOB_PRIVACIES, JOB_STATUSES } from "./constants";

/** Formulir admin buat job (§6). */
export const createJobSchema = z.object({
  topic: z.string().min(1, "Topik wajib diisi").max(5000, "Topik maks. 5000 karakter"),
  title: z.string().max(100, "Judul maks. 100 karakter").optional().or(z.literal("")),
  description: z.string().max(5000, "Deskripsi maks. 5000 karakter").optional().or(z.literal("")),
  privacy: z.enum(JOB_PRIVACIES).default("public"),
});

/** Query GET /api/agent/jobs. */
export const agentJobsQuerySchema = z.object({
  status: z.enum(JOB_STATUSES).optional(),
});

const youtubeUrlSchema = z
  .string()
  .url("youtubeUrl harus URL valid")
  .refine(
    (u) => {
      try {
        const host = new URL(u).hostname.toLowerCase();
        return (
          host === "youtube.com" ||
          host === "www.youtube.com" ||
          host === "m.youtube.com" ||
          host === "youtu.be" ||
          host === "www.youtu.be" ||
          host.endsWith(".youtube.com")
        );
      } catch {
        return false;
      }
    },
    { message: "youtubeUrl harus berdomain YouTube" },
  );

/** Body PATCH /api/agent/jobs/[id] — done wajib youtubeUrl, failed wajib error. */
export const agentPatchSchema = z.discriminatedUnion("status", [
  z.object({
    status: z.literal("done"),
    youtubeUrl: youtubeUrlSchema,
    youtubeVideoId: z.string().max(64).optional(),
  }),
  z.object({
    status: z.literal("failed"),
    error: z.string().min(1, "error wajib diisi").max(2000, "error maks. 2000 karakter"),
    youtubeUrl: z.string().optional(),
    youtubeVideoId: z.string().max(64).optional(),
  }),
]);

export type CreateJobInput = z.infer<typeof createJobSchema>;
export type AgentPatchInput = z.infer<typeof agentPatchSchema>;
