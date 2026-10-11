/** Konstanta tunggal untuk status & privasi (AGENTS.md §5). */

export const JOB_STATUSES = ["pending", "processing", "done", "failed"] as const;
export type JobStatus = (typeof JOB_STATUSES)[number];

export const AGENT_PATCH_STATUSES = ["done", "failed"] as const;
export type AgentPatchStatus = (typeof AGENT_PATCH_STATUSES)[number];

export const JOB_PRIVACIES = ["public", "unlisted", "private"] as const;
export type JobPrivacy = (typeof JOB_PRIVACIES)[number];

export const SESSION_COOKIE_NAME = "shorts_session";

/** Masa berlaku sesi admin: 7 hari (detik). */
export const SESSION_MAX_AGE_SECONDS = 7 * 24 * 60 * 60;

/** Batas upload MP4 default: 200 MB. */
export const MAX_VIDEO_BYTES = 200 * 1024 * 1024;

/** Stuck threshold: job processing > 2 jam dianggap macet. */
export const STUCK_AFTER_MS = 2 * 60 * 60 * 1000;
