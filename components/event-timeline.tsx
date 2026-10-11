import { CircleCheck, Flag, XCircle } from "lucide-react";
import type { JobEvent } from "@prisma/client";

import { formatTanggalID } from "@/lib/format";

const DOT: Record<string, string> = {
  pending: "bg-amber-500",
  processing: "bg-sky-500",
  done: "bg-emerald-500",
  failed: "bg-rose-500",
};

export function EventTimeline({ events }: { events: JobEvent[] }): React.ReactElement {
  if (events.length === 0) {
    return <p className="mt-2 text-sm text-gray-500">Belum ada riwayat.</p>;
  }
  const last = events[events.length - 1];
  const lastActive = last?.toStatus === "processing" || last?.toStatus === "pending";
  return (
    <ol className="mt-3 flex flex-col">
      {events.map((ev, i) => {
        const isLast = i === events.length - 1;
        return (
          <li key={ev.id} className="reveal relative pb-5 pl-8 last:pb-0" style={{ ["--reveal-delay" as string]: `${i * 90}ms` }}>
            {i < events.length - 1 ? (
              <span aria-hidden className="absolute top-6 bottom-0 left-[11px] w-0.5 bg-gradient-to-b from-gray-300 to-transparent" />
            ) : null}
            <span aria-hidden className="absolute top-1 left-1">
              <span className={`grid h-5 w-5 place-items-center rounded-full text-white shadow ${DOT[ev.toStatus] ?? "bg-gray-400"}`}>
                {ev.toStatus === "done" ? (
                  <CircleCheck className="h-3.5 w-3.5" />
                ) : ev.toStatus === "failed" ? (
                  <XCircle className="h-3.5 w-3.5" />
                ) : ev.fromStatus === null ? (
                  <Flag className="h-3 w-3" />
                ) : (
                  <span className={`h-1.5 w-1.5 rounded-full bg-white ${isLast && lastActive ? "animate-pulse-dot" : ""}`} />
                )}
              </span>
              {isLast && lastActive ? (
                <span className="animate-ping-soft absolute inset-0 rounded-full bg-sky-400" />
              ) : null}
            </span>
            <p className="text-sm font-bold">
              {ev.fromStatus ?? "baru"} <span className="text-gray-400">→</span> {ev.toStatus}
              {isLast ? (
                <span className="ml-2 rounded-full bg-indigo-100 px-2 py-0.5 text-[11px] font-extrabold text-indigo-700">
                  TERKINI
                </span>
              ) : null}
            </p>
            {ev.note ? <p className="mt-0.5 text-sm text-gray-600">{ev.note}</p> : null}
            <p className="mt-0.5 text-xs text-gray-400 tabular-nums">{formatTanggalID(ev.createdAt)}</p>
          </li>
        );
      })}
    </ol>
  );
}
