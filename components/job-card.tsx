import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  Download,
  ExternalLink,
  RotateCcw,
  TriangleAlert,
  Wrench,
} from "lucide-react";
import type { Job } from "@prisma/client";

import { StatusBadge } from "@/components/status-badge";
import { STUCK_AFTER_MS } from "@/lib/constants";
import { formatTanggalID } from "@/lib/format";
import { resetStuckAction, retryAction } from "@/app/actions";

const CARD_BORDER: Record<string, string> = {
  done: "border-emerald-200",
  failed: "border-rose-200",
  processing: "border-sky-200",
  pending: "border-[#e5e9f2]",
};

export function JobCard({ job, now }: { job: Job; now: number }): React.ReactElement {
  const stuck = job.status === "processing" && now - job.updatedAt.getTime() > STUCK_AFTER_MS;
  const processing = job.status === "processing" && !stuck;

  return (
    <li
      className={`card-hover rounded-2xl border bg-white p-4 sm:p-5 ${CARD_BORDER[job.status] ?? CARD_BORDER["pending"]}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <Link
            href={`/jobs/${job.id}`}
            className="flex min-h-[44px] items-center text-base font-bold break-words hover:text-indigo-700 sm:text-lg"
          >
            <span className="line-clamp-2">{job.title || job.topic}</span>
          </Link>
          <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
            <CalendarDays className="h-3.5 w-3.5 shrink-0" aria-hidden />
            {formatTanggalID(job.createdAt)}
          </p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1">
          <StatusBadge status={job.status} />
          {processing ? (
            <span className="text-[11px] font-bold text-sky-700">AGENT BEKERJA</span>
          ) : null}
        </div>
      </div>

      <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-slate-600">{job.topic}</p>

      {job.status === "done" && job.youtubeUrl ? (
        <a
          href={job.youtubeUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-press mt-3 inline-flex min-h-[44px] items-center gap-1.5 rounded-xl bg-rose-600 px-4 text-sm font-bold text-white"
        >
          <ExternalLink className="h-4 w-4" aria-hidden />
          Tonton di YouTube
        </a>
      ) : null}

      {job.status === "failed" && job.error ? (
        <p className="mt-3 flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">
          <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          <span className="line-clamp-3 break-words">{job.error}</span>
        </p>
      ) : null}

      {stuck ? (
        <p className="mt-3 flex items-center gap-2 rounded-xl border border-sky-200 bg-sky-50 p-3 text-sm text-sky-800">
          <Wrench className="h-4 w-4 shrink-0" aria-hidden />
          Macet lebih dari 2 jam — bisa di-reset agar antre lagi.
        </p>
      ) : null}

      <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3">
        <Link
          href={`/jobs/${job.id}`}
          className="btn-press inline-flex min-h-[44px] items-center gap-1 rounded-xl px-3 text-sm font-semibold text-slate-700 hover:bg-slate-100"
        >
          Detail
          <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
        {job.videoFile ? (
          <a
            href={`/api/jobs/${job.id}/video`}
            className="btn-press inline-flex min-h-[44px] items-center gap-1 rounded-xl px-3 text-sm font-semibold text-indigo-700 hover:bg-indigo-50"
          >
            <Download className="h-4 w-4" aria-hidden />
            MP4
          </a>
        ) : null}
        <span className="flex-1" />
        {job.status === "failed" ? (
          <form action={retryAction}>
            <input type="hidden" name="id" value={job.id} />
            <button
              type="submit"
              className="btn-press inline-flex min-h-[44px] items-center gap-1.5 rounded-xl border border-amber-300 bg-amber-50 px-3 text-sm font-bold text-amber-800"
            >
              <RotateCcw className="h-4 w-4" aria-hidden />
              Ulangi
            </button>
          </form>
        ) : null}
        {stuck ? (
          <form action={resetStuckAction}>
            <input type="hidden" name="id" value={job.id} />
            <button
              type="submit"
              className="btn-press inline-flex min-h-[44px] items-center gap-1.5 rounded-xl border border-sky-300 bg-sky-50 px-3 text-sm font-bold text-sky-800"
            >
              <Wrench className="h-4 w-4" aria-hidden />
              Reset
            </button>
          </form>
        ) : null}
      </div>
    </li>
  );
}
