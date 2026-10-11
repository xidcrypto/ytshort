import type { LucideIcon } from "lucide-react";

import { CountUp } from "@/components/live-bits";

export function StatCard({
  label,
  value,
  Icon,
  accent,
  delay = "0ms",
}: {
  label: string;
  value: number;
  Icon: LucideIcon;
  accent: string;
  delay?: string;
}): React.ReactElement {
  return (
    <div
      className="card-hover stagger flex items-center gap-3 rounded-2xl border border-[#e5e9f2] bg-white p-3 sm:p-4"
      style={{ animationDelay: delay }}
    >
      <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl text-white ${accent}`}>
        <Icon className="h-5 w-5" aria-hidden />
      </span>
      <span className="min-w-0">
        <span className="block truncate text-xs font-medium text-slate-500">{label}</span>
        <span className="block text-xl font-extrabold sm:text-2xl">
          <CountUp value={value} />
        </span>
      </span>
    </div>
  );
}

/** Cincin progres SVG statis (selesai / total) — tanpa animasi jalan. */
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
    <div className="flex items-center gap-4" role="img" aria-label={`${pct} persen video selesai`}>
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
        />
        <defs>
          <linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#34d399" />
            <stop offset="100%" stopColor="#818cf8" />
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
