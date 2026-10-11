import { CheckCircle2, Clock3, Loader2, XCircle } from "lucide-react";

import type { JobStatus } from "@/lib/constants";

const META: Record<JobStatus, { label: string; cls: string; Icon: typeof Clock3 }> = {
  pending: {
    label: "Menunggu",
    cls: "border-amber-200 bg-amber-50 text-amber-800",
    Icon: Clock3,
  },
  processing: {
    label: "Diproses",
    cls: "border-sky-200 bg-sky-50 text-sky-800",
    Icon: Loader2,
  },
  done: {
    label: "Selesai",
    cls: "border-emerald-200 bg-emerald-50 text-emerald-800",
    Icon: CheckCircle2,
  },
  failed: {
    label: "Gagal",
    cls: "border-rose-200 bg-rose-50 text-rose-800",
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
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-bold whitespace-nowrap ${cls}`}
    >
      <Icon className={`h-3.5 w-3.5 ${s === "processing" ? "animate-spin" : ""}`} aria-hidden />
      {s === "processing" ? (
        <span className="animate-soft-pulse h-1.5 w-1.5 rounded-full bg-sky-600" aria-hidden />
      ) : null}
      {label}
    </span>
  );
}
