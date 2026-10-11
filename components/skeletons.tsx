/**
 * Skeleton loading — statis dengan pulse ringan (satu-satunya animasi
 * berulang yang dipertahankan, murah karena opacity-only).
 */
export function DashboardSkeleton(): React.ReactElement {
  return (
    <div aria-hidden className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="animate-pulse rounded-2xl border border-[#e5e9f2] bg-white p-4 sm:p-5">
          <div className="flex items-start justify-between gap-2">
            <div className="h-5 w-3/4 rounded-lg bg-slate-200" />
            <div className="h-6 w-20 shrink-0 rounded-full bg-slate-200" />
          </div>
          <div className="mt-2 h-4 w-full rounded-lg bg-slate-100" />
          <div className="mt-1 h-4 w-2/3 rounded-lg bg-slate-100" />
          <div className="mt-3 flex gap-2 border-t border-slate-100 pt-3">
            <div className="h-9 w-20 rounded-xl bg-slate-200" />
            <div className="h-9 w-16 rounded-xl bg-slate-100" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function DetailSkeleton(): React.ReactElement {
  return (
    <div aria-hidden className="animate-pulse rounded-2xl border border-[#e5e9f2] bg-white p-4 sm:p-5">
      <div className="h-6 w-1/2 rounded-lg bg-slate-200" />
      <div className="mt-3 h-4 w-full rounded-lg bg-slate-100" />
      <div className="mt-2 h-4 w-5/6 rounded-lg bg-slate-100" />
      <div className="mt-2 h-4 w-2/3 rounded-lg bg-slate-100" />
    </div>
  );
}
