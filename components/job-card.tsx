import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  Download,
  ExternalLink,
  RotateCcw,
  TriangleAlert,
  Wrench,
  Zap,
} from "lucide-react";
import type { Job } from "@prisma/client";

import { StatusBadge } from "@/components/status-badge";
import { STUCK_AFTER_MS } from "@/lib/constants";
import { formatTanggalID } from "@/lib/format";
import { resetStuckAction, retryAction } from "@/app/actions";

/** Strip shimmer kilau yang melintas di atas kartu processing. */
function ProcessingSheen(): React.ReactElement {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl">
      <div
        className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-sky-300/30 to-transparent"
        style={{ animation: "shimmerBar 2.6s ease-in-out infinite" }}
      />
    </div>
  );
}

export function JobCard({ job, now }: { job: Job; now: number }): React.ReactElement {
  const stuck = job.status === "processing" && now - job.updatedAt.getTime() > STUCK_AFTER_MS;
  const processing = job.status === "processing" && !stuck;

  return (
    <li
      className={`reveal card-lift tilt group relative rounded-2xl border bg-white/85 p-4 shadow-sm backdrop-blur hover:shadow-xl sm:p-5 ${
        job.status === "done"
          ? "border-emerald-200/70 hover:shadow-emerald-500/15"
          : job.status === "failed"
            ? "border-rose-200/70 hover:shadow-rose-500/15"
            : processing
              ? "border-sky-200/80 hover:shadow-sky-500/20"
              : "border-white/60 hover:shadow-rose-500/10"
      }`}
    >
      {processing ? <ProcessingSheen /> : null}
      {/* kilau hover */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br from-white/0 via-white/40 to-white/0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
      />

      <div className="relative flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <Link
            href={`/jobs/${job.id}`}
            className="flex min-h-[44px] items-center gap-1.5 text-base font-bold leading-snug transition-colors hover:text-rose-700 sm:text-lg"
          >
            <span className="line-clamp-2">{job.title || job.topic}</span>
          </Link>
          <p className="mt-1 flex items-center gap-1.5 text-xs text-gray-500">
            <CalendarDays className="h-3.5 w-3.5 shrink-0" aria-hidden />
            {formatTanggalID(job.createdAt)}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <StatusBadge status={job.status} />
          {processing ? (
            <span className="animate-ticker inline-flex items-center gap-1 text-[11px] font-bold text-sky-600">
              <Zap className="h-3 w-3" aria-hidden />
              AGENT BEKERJA
            </span>
          ) : null}
        </div>
      </div>

      <p className="relative mt-2 line-clamp-2 text-sm leading-relaxed text-gray-600">{job.topic}</p>

      {job.status === "done" && job.youtubeUrl ? (
        <a
          href={job.youtubeUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-press relative mt-3 inline-flex min-h-[44px] items-center gap-1.5 overflow-hidden rounded-xl bg-gradient-to-r from-rose-600 to-orange-500 px-4 text-sm font-bold text-white shadow-lg shadow-rose-500/30"
        >
          <span
            aria-hidden
            className="absolute inset-y-0 w-1/2 bg-gradient-to-r from-transparent via-white/30 to-transparent"
            style={{ animation: "shimmerBar 2.4s ease-in-out infinite" }}
          />
          <ExternalLink className="h-4 w-4" aria-hidden />
          Tonton di YouTube
        </a>
      ) : null}

      {job.status === "failed" && job.error ? (
        <p className="animate-pop-in relative mt-3 flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">
          <TriangleAlert className="animate-breathe mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          <span className="line-clamp-3">{job.error}</span>
        </p>
      ) : null}

      {stuck ? (
        <p className="animate-pop-in relative mt-3 flex items-center gap-2 rounded-xl border border-sky-200 bg-sky-50 p-3 text-sm text-sky-800">
          <Wrench className="h-4 w-4 shrink-0 animate-ticker" aria-hidden />
          Macet lebih dari 2 jam — bisa di-reset agar antre lagi.
        </p>
      ) : null}

      <div className="relative mt-3 flex flex-wrap items-center gap-2 border-t border-gray-100 pt-3">
        <Link
          href={`/jobs/${job.id}`}
          className="btn-press group/link inline-flex min-h-[44px] items-center gap-1 rounded-xl px-3 text-sm font-semibold text-gray-700 hover:bg-gray-100"
        >
          Detail
          <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover/link:translate-x-1" aria-hidden />
        </Link>
        {job.videoFile ? (
          <a
            href={`/api/jobs/${job.id}/video`}
            className="btn-press inline-flex min-h-[44px] items-center gap-1 rounded-xl px-3 text-sm font-semibold text-indigo-700 hover:bg-indigo-50"
          >
            <Download className="h-4 w-4 transition-transform duration-200 hover:translate-y-0.5" aria-hidden />
            MP4
          </a>
        ) : null}
        <span className="flex-1" />
        {job.status === "failed" ? (
          <form action={retryAction}>
            <input type="hidden" name="id" value={job.id} />
            <button
              type="submit"
              className="btn-press inline-flex min-h-[44px] items-center gap-1.5 rounded-xl border border-amber-400 bg-amber-50 px-3 text-sm font-bold text-amber-800"
            >
              <RotateCcw className="h-4 w-4 transition-transform duration-300 hover:-rotate-180" aria-hidden />
              Ulangi
            </button>
          </form>
        ) : null}
        {stuck ? (
          <form action={resetStuckAction}>
            <input type="hidden" name="id" value={job.id} />
            <button
              type="submit"
              className="btn-press inline-flex min-h-[44px] items-center gap-1.5 rounded-xl border border-sky-400 bg-sky-50 px-3 text-sm font-bold text-sky-800"
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
