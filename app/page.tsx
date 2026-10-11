import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Activity,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clapperboard,
  Clock3,
  Flame,
  Inbox,
  Loader2,
  Plus,
  RefreshCw,
  Sparkles,
  XCircle,
} from "lucide-react";

import { AuroraBackground } from "@/components/aurora-background";
import { JobCard } from "@/components/job-card";
import { AutoRefresh, LiveClock, RevealManager, TiltManager } from "@/components/live-bits";
import { SiteHeader } from "@/components/site-header";
import { ProgressRing, StatCard } from "@/components/stat-card";
import { isAdminLoggedIn } from "@/lib/auth-guard";
import { JOB_STATUSES, type JobStatus } from "@/lib/constants";
import { prisma } from "@/lib/db";
import { formatTanggalID } from "@/lib/format";
import { listJobs, serverNow } from "@/lib/jobs";

const PAGE_SIZE = 20;

const FILTERS: Array<{ value: JobStatus | undefined; label: string }> = [
  { value: undefined, label: "Semua" },
  { value: "pending", label: "Menunggu" },
  { value: "processing", label: "Diproses" },
  { value: "done", label: "Selesai" },
  { value: "failed", label: "Gagal" },
];

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; page?: string }>;
}): Promise<React.ReactElement> {
  if (!(await isAdminLoggedIn())) redirect("/login");
  const params = await searchParams;
  const status: JobStatus | undefined = JOB_STATUSES.includes(params.status as JobStatus)
    ? (params.status as JobStatus)
    : undefined;
  const page = Math.max(1, Number.parseInt(params.page ?? "1", 10) || 1);
  const [{ jobs, total }, now, counts, latest] = await Promise.all([
    listJobs({ status, take: PAGE_SIZE, skip: (page - 1) * PAGE_SIZE }),
    serverNow(),
    prisma.job.groupBy({ by: ["status"], _count: { status: true } }),
    prisma.job.findMany({ orderBy: { createdAt: "desc" }, take: 8, select: { id: true, title: true, topic: true, status: true } }),
  ]);
  const countOf = (s: string): number => counts.find((c) => c.status === s)?._count.status ?? 0;
  const doneCount = countOf("done");
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const pageLink = (p: number): string => {
    const q = new URLSearchParams();
    if (status) q.set("status", status);
    if (p > 1) q.set("page", String(p));
    const s = q.toString();
    return s ? `/?${s}` : "/";
  };

  return (
    <>
      <AuroraBackground />
      <RevealManager />
      <TiltManager />
      <SiteHeader />
      <main className="mx-auto w-full max-w-5xl px-3 pb-16 sm:px-4">
        {/* Ticker aktivitas terbaru */}
        <div className="marquee reveal mt-3 flex items-center gap-2 rounded-full border border-white/60 bg-white/70 py-1.5 pr-4 pl-1.5 backdrop-blur sm:mt-4" aria-label="Aktivitas terbaru">
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-gray-900 px-2.5 py-1 text-[11px] font-extrabold text-white">
            <Activity className="animate-ticker h-3 w-3" aria-hidden />
            LIVE
          </span>
          <div className="marquee-track gap-8 text-xs font-medium text-gray-600">
            {[...latest, ...latest].map((j, i) => (
              <span key={`${j.id}-${i}`} className="flex items-center gap-1.5 whitespace-nowrap">
                <Flame className="h-3 w-3 text-orange-500" aria-hidden />
                <span className="max-w-56 truncate">{j.title || j.topic}</span>
                <span className="rounded-full bg-gray-100 px-1.5 font-bold text-gray-500">{j.status}</span>
              </span>
            ))}
            {latest.length === 0 ? <span>Belum ada aktivitas — buat video pertamamu.</span> : null}
          </div>
        </div>

        {/* Hero */}
        <section className="animate-pop-in tilt relative mt-3 overflow-hidden rounded-3xl bg-gradient-to-br from-gray-950 via-rose-950 to-indigo-950 p-5 text-white shadow-2xl shadow-rose-950/30 sm:mt-4 sm:p-8">
          <div aria-hidden className="animate-float-slow absolute -top-20 -right-20 h-64 w-64 rounded-full bg-fuchsia-500/30 blur-3xl" />
          <div aria-hidden className="animate-float-slower absolute -bottom-24 -left-16 h-64 w-64 rounded-full bg-orange-400/20 blur-3xl" />
          <div aria-hidden className="animate-spin-slower absolute top-6 right-8 hidden text-white/20 sm:block">
            <Clapperboard className="h-16 w-16" />
          </div>
          <div className="relative flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <p className="inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-white/10 px-3 py-1 text-xs font-semibold backdrop-blur">
                <Sparkles className="h-3.5 w-3.5 animate-ticker" aria-hidden />
                Antrean produksi Shorts
              </p>
              <h1 className="mt-3 text-2xl leading-tight font-extrabold tracking-tight sm:text-4xl">
                Kelola video <span className="shimmer-text">YouTube Shorts</span>-mu
              </h1>
              <p className="mt-2 max-w-xl text-sm text-white/75 sm:text-base">
                Tulis topik, agent mengambil otomatis, pantau sampai tayang. Total{" "}
                <strong className="text-white tabular-nums">{total}</strong> video dalam antrean.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link
                  href="/jobs/new"
                  className="btn-press group inline-flex min-h-[44px] items-center gap-2 overflow-hidden rounded-2xl bg-white px-5 text-sm font-extrabold text-gray-900 shadow-xl"
                >
                  <Plus className="h-4 w-4 transition-transform duration-300 group-hover:rotate-90" aria-hidden />
                  Buat Video Baru
                </Link>
                <Link
                  href="/?status=pending"
                  className="btn-press inline-flex min-h-[44px] items-center gap-2 rounded-2xl border border-white/30 bg-white/10 px-5 text-sm font-bold text-white backdrop-blur"
                >
                  <Clock3 className="h-4 w-4" aria-hidden />
                  Lihat Antrean
                </Link>
              </div>
              <p className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-white/60">
                <span className="inline-flex items-center gap-1">
                  <RefreshCw className="h-3 w-3" aria-hidden />
                  Refresh otomatis <AutoRefresh /> · <LiveClock />
                </span>
              </p>
            </div>
            <div className="hidden shrink-0 sm:block">
              <ProgressRing done={doneCount} total={total} />
            </div>
          </div>
        </section>

        {/* Statistik */}
        <section aria-label="Ringkasan status" className="mt-4 grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-4">
          <StatCard label="Menunggu" value={countOf("pending")} Icon={Clock3} gradient="bg-gradient-to-br from-amber-500 to-orange-500 shadow-amber-500/30" delay="0ms" />
          <StatCard label="Diproses" value={countOf("processing")} Icon={Loader2} gradient="bg-gradient-to-br from-sky-500 to-indigo-500 shadow-sky-500/30" delay="80ms" />
          <StatCard label="Selesai" value={countOf("done")} Icon={CheckCircle2} gradient="bg-gradient-to-br from-emerald-500 to-teal-500 shadow-emerald-500/30" delay="160ms" />
          <StatCard label="Gagal" value={countOf("failed")} Icon={XCircle} gradient="bg-gradient-to-br from-rose-500 to-red-500 shadow-rose-500/30" delay="240ms" />
        </section>

        {/* Filter */}
        <div className="reveal mt-5 flex gap-2 overflow-x-auto pb-1" role="group" aria-label="Filter status">
          {FILTERS.map((f) => {
            const active = status === f.value;
            const href = f.value ? `/?status=${f.value}` : "/";
            return (
              <Link
                key={f.label}
                href={href}
                aria-current={active ? "true" : undefined}
                className={`btn-press inline-flex min-h-[44px] shrink-0 items-center rounded-full px-4 text-sm font-bold whitespace-nowrap transition-all ${
                  active
                    ? "scale-[1.03] bg-gray-900 text-white shadow-lg shadow-gray-900/25"
                    : "border border-white/60 bg-white/80 text-gray-700 backdrop-blur"
                }`}
              >
                {f.label}
                {f.value ? <span className="ml-1.5 rounded-full bg-black/10 px-1.5 text-xs tabular-nums">{countOf(f.value)}</span> : null}
              </Link>
            );
          })}
        </div>

        {/* Daftar */}
        {jobs.length === 0 ? (
          <div className="animate-pop-in mt-4 rounded-3xl border border-dashed border-gray-300 bg-white/70 p-8 text-center backdrop-blur sm:p-12">
            <span className="animate-float-slow mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-white shadow-xl">
              <Inbox className="h-8 w-8" aria-hidden />
            </span>
            <h2 className="mt-4 text-lg font-extrabold">Belum ada video di sini</h2>
            <p className="mx-auto mt-1 max-w-sm text-sm text-gray-500">
              Klik “Buat Video Baru” untuk menambah topik pertama — agent akan mengambilnya otomatis.
            </p>
            <Link
              href="/jobs/new"
              className="btn-press group mt-4 inline-flex min-h-[44px] items-center gap-2 rounded-2xl bg-gray-900 px-5 text-sm font-bold text-white"
            >
              <Plus className="h-4 w-4 transition-transform duration-300 group-hover:rotate-90" aria-hidden />
              Buat Video Pertama
            </Link>
          </div>
        ) : (
          <ul className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
            {jobs.map((job) => (
              <JobCard key={job.id} job={job} now={now} />
            ))}
          </ul>
        )}

        {/* Pagination */}
        {totalPages > 1 ? (
          <nav className="mt-6 flex items-center justify-between gap-2" aria-label="Pagination">
            {page > 1 ? (
              <Link
                href={pageLink(page - 1)}
                className="btn-press inline-flex min-h-[44px] items-center gap-1 rounded-2xl border border-white/60 bg-white/85 px-4 text-sm font-bold backdrop-blur"
              >
                <ChevronLeft className="h-4 w-4" aria-hidden />
                Sebelumnya
              </Link>
            ) : (
              <span />
            )}
            <span className="rounded-full bg-white/80 px-3 py-1 text-sm font-semibold text-gray-600 tabular-nums backdrop-blur">
              {page} / {totalPages}
            </span>
            {page < totalPages ? (
              <Link
                href={pageLink(page + 1)}
                className="btn-press inline-flex min-h-[44px] items-center gap-1 rounded-2xl border border-white/60 bg-white/85 px-4 text-sm font-bold backdrop-blur"
              >
                Berikutnya
                <ChevronRight className="h-4 w-4" aria-hidden />
              </Link>
            ) : (
              <span />
            )}
          </nav>
        ) : null}

        <p className="mt-6 text-center text-[11px] text-gray-400 tabular-nums">
          Diperbarui {formatTanggalID(new Date(now))} · refresh otomatis tiap 60 detik
        </p>
      </main>
    </>
  );
}
