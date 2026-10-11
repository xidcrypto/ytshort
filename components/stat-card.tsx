import type { LucideIcon } from "lucide-react";

import { CountUp } from "@/components/live-bits";

export function StatCard({
  label,
  value,
  Icon,
  gradient,
  delay = "0ms",
}: {
  label: string;
  value: number;
  Icon: LucideIcon;
  gradient: string;
  delay?: string;
}): React.ReactElement {
  return (
    <div
      className="reveal card-lift tilt group flex items-center gap-3 overflow-hidden rounded-2xl border border-white/60 bg-white/80 p-3 shadow-sm backdrop-blur sm:p-4"
      style={{ ["--reveal-delay" as string]: delay }}
    >
      <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl text-white shadow-lg transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6 ${gradient}`}>
        <Icon className="h-5 w-5" aria-hidden />
      </span>
      <span className="min-w-0">
        <span className="block truncate text-xs font-medium text-gray-500">{label}</span>
        <span className="block text-xl font-extrabold sm:text-2xl">
          <CountUp value={value} />
        </span>
      </span>
      <span aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-white/80 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
    </div>
  );
}

/** Cincin progres SVG animasi (selesai / total). */
export function ProgressRing({
  done,
  total,
  size = 120,
}: {
  done: number;
  total: number;
  size?: number;
}): React.ReactElement {
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);
  const r = (size - 14) / 2;
  const c = 2 * Math.PI * r;
  const off = c - (pct / 100) * c;
  return (
    <div className="reveal flex items-center gap-4" role="img" aria-label={`${pct} persen video selesai`}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgb(255 255 255 / 0.15)" strokeWidth="10" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="url(#ringGrad)"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={off}
          style={{ animation: "ringDraw 1.4s cubic-bezier(0.22,1,0.36,1) both", transition: "stroke-dashoffset 1s ease" }}
        />
        <defs>
          <linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#34d399" />
            <stop offset="100%" stopColor="#f472b6" />
          </linearGradient>
        </defs>
      </svg>
      <div>
        <p className="text-3xl font-extrabold tabular-nums">
          <CountUp value={pct} />%
        </p>
        <p className="text-xs text-white/70">
          <span className="tabular-nums">{done}</span> dari <span className="tabular-nums">{total}</span> selesai
        </p>
      </div>
    </div>
  );
}
