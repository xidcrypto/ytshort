import { CheckCircle2, Clock3, Loader2, XCircle } from "lucide-react";

import type { JobStatus } from "@/lib/constants";

const META: Record<JobStatus, { label: string; cls: string; Icon: typeof Clock3 }> = {
  pending: {
    label: "Menunggu",
    cls: "border-amber-300 bg-amber-100/90 text-amber-900",
    Icon: Clock3,
  },
  processing: {
    label: "Diproses",
    cls: "border-sky-300 bg-sky-100/90 text-sky-900",
    Icon: Loader2,
  },
  done: {
    label: "Selesai",
    cls: "border-emerald-300 bg-emerald-100/90 text-emerald-900",
    Icon: CheckCircle2,
  },
  failed: {
    label: "Gagal",
    cls: "border-rose-300 bg-rose-100/90 text-rose-900",
    Icon: XCircle,
  },
};

export function StatusBadge({ status }: { status: string }): React.ReactElement {
  const s: JobStatus =
    status === "pending" || status === "processing" || status === "done" || status === "failed"
      ? status
      : "pending";
  const { label, cls, Icon } = META[s];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-bold whitespace-nowrap shadow-sm ${cls}`}
    >
      <span className="relative flex">
        <Icon className={`h-3.5 w-3.5 ${s === "processing" ? "animate-spin" : s === "pending" ? "animate-ticker" : ""}`} aria-hidden />
        {s === "processing" || s === "pending" ? (
          <span className="animate-ping-soft absolute inset-0 rounded-full bg-current opacity-40" aria-hidden />
        ) : null}
      </span>
      {s === "processing" ? (
        <span className="eq" aria-hidden>
          <span />
          <span />
          <span />
          <span />
        </span>
      ) : null}
      {label}
    </span>
  );
}
