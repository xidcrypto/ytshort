import Link from "next/link";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clapperboard,
  Clock3,
  Inbox,
  Loader2,
  Plus,
  XCircle,
} from "lucide-react";

import { AuroraBackground } from "@/components/aurora-background";
import { AutoRefresh } from "@/components/live-bits";
import { SiteHeader } from "@/components/site-header";
import { DashboardSkeleton } from "@/components/skeletons";
import { ProgressRing, StatCard } from "@/components/stat-card";
import { isAdminLoggedIn } from "@/lib/auth-guard";
import { JOB_STATUSES, type JobStatus } from "@/lib/constants";
import { prisma } from "@/lib/db";
import { formatTanggalID } from "@/lib/format";
import { listJobs, serverNow } from "@/lib/jobs";

import { JobList } from "./job-list";

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
  const [{ total }, now, counts, latest] = await Promise.all([
    listJobs({ status, take: 1, skip: 0 }),
    serverNow(),
    prisma.job.groupBy({ by: ["status"], _count: { status: true } }),
    prisma.job.findMany({ orderBy: { createdAt: "desc" }, take: 3, select: { id: true, title: true, topic: true, status: true } }),
  ]);
  const countOf = (s: string): number => counts.find((c) => c.status === s)?._count.status ?? 0;
  const doneCount = countOf("done");
  const grandTotal = counts.reduce((a, c) => a + c._count.status, 0);
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
      <AutoRefresh />
      <SiteHeader />
      <main className="mx-auto w-full max-w-5xl px-3 pb-16 sm:px-4">
        {/* Ringkasan + aksi */}
        <section className="animate-pop-in mt-4 rounded-2xl bg-slate-900 p-5 text-white sm:mt-6 sm:p-7">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0 flex-1 basis-64">
              <p className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold">
                <Clapperboard className="h-3.5 w-3.5" aria-hidden />
                Antrean produksi Shorts
              </p>
              <h1 className="mt-3 text-2xl leading-tight font-extrabold tracking-tight break-words sm:text-3xl">
                Kelola video YouTube Shorts-mu
              </h1>
              <p className="mt-2 max-w-xl text-sm text-white/70">
                Tulis topik, agent mengambil otomatis, pantau sampai tayang. Total{" "}
                <strong className="text-white tabular-nums">{grandTotal}</strong> video dalam antrean.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link
                  href="/jobs/new"
                  className="btn-press inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-white px-5 text-sm font-extrabold text-slate-900"
                >
                  <Plus className="h-4 w-4" aria-hidden />
                  Buat Video Baru
                </Link>
                <Link
                  href="/?status=pending"
                  className="btn-press inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-white/25 bg-white/10 px-5 text-sm font-bold text-white"
                >
                  <Clock3 className="h-4 w-4" aria-hidden />
                  Lihat Antrean
                </Link>
              </div>
            </div>
            <div className="hidden shrink-0 sm:block">
              <ProgressRing done={doneCount} total={grandTotal} />
            </div>
          </div>
        </section>

        {/* Status terakhir */}
        {latest.length > 0 ? (
          <section aria-label="Terbaru" className="stagger mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
            {latest.map((j) => (
              <Link
                key={j.id}
                href={`/jobs/${j.id}`}
                className="card-hover flex min-h-[44px] items-center gap-2.5 rounded-2xl border border-[#e5e9f2] bg-white px-3 py-2.5"
              >
                <Inbox className="h-4 w-4 shrink-0 text-indigo-500" aria-hidden />
                <span className="min-w-0 flex-1 truncate text-sm font-medium">{j.title || j.topic}</span>
                <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-500">
                  {j.status}
                </span>
              </Link>
            ))}
          </section>
        ) : null}

        {/* Statistik */}
        <section aria-label="Ringkasan status" className="stagger mt-4 grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-4">
          <StatCard label="Menunggu" value={countOf("pending")} Icon={Clock3} accent="bg-amber-500" delay="0ms" />
          <StatCard label="Diproses" value={countOf("processing")} Icon={Loader2} accent="bg-sky-600" delay="80ms" />
          <StatCard label="Selesai" value={countOf("done")} Icon={CheckCircle2} accent="bg-emerald-600" delay="160ms" />
          <StatCard label="Gagal" value={countOf("failed")} Icon={XCircle} accent="bg-rose-600" delay="240ms" />
        </section>

        {/* Filter */}
        <div className="mt-5 flex gap-2 overflow-x-auto pb-2" role="group" aria-label="Filter status">
          {FILTERS.map((f) => {
            const active = status === f.value;
            const href = f.value ? `/?status=${f.value}` : "/";
            return (
              <Link
                key={f.label}
                href={href}
                aria-current={active ? "true" : undefined}
                className={`btn-press inline-flex min-h-[44px] shrink-0 items-center rounded-full px-4 text-sm font-bold whitespace-nowrap ${
                  active
                    ? "bg-slate-900 text-white"
                    : "border border-[#e5e9f2] bg-white text-slate-600"
                }`}
              >
                {f.label}
                {f.value ? <span className="ml-1.5 rounded-full bg-black/10 px-1.5 text-xs tabular-nums">{countOf(f.value)}</span> : null}
              </Link>
            );
          })}
        </div>

        {/* Daftar + skeleton saat ganti filter */}
        <Suspense key={`${status ?? "all"}-${page}`} fallback={<DashboardSkeleton />}>
          <JobList status={status} page={page} pageSize={PAGE_SIZE} />
        </Suspense>

        {/* Pagination */}
        {totalPages > 1 ? (
          <nav className="mt-6 flex items-center justify-between gap-2" aria-label="Pagination">
            {page > 1 ? (
              <Link
                href={pageLink(page - 1)}
                className="btn-press inline-flex min-h-[44px] shrink-0 items-center gap-1 rounded-xl border border-[#e5e9f2] bg-white px-4 text-sm font-bold"
              >
                <ChevronLeft className="h-4 w-4" aria-hidden />
                <span className="hidden min-[400px]:inline">Sebelumnya</span>
              </Link>
            ) : (
              <span />
            )}
            <span className="rounded-full bg-white px-3 py-1 text-sm font-semibold text-slate-500 tabular-nums">
              {page} / {totalPages}
            </span>
            {page < totalPages ? (
              <Link
                href={pageLink(page + 1)}
                className="btn-press inline-flex min-h-[44px] shrink-0 items-center gap-1 rounded-xl border border-[#e5e9f2] bg-white px-4 text-sm font-bold"
              >
                <span className="hidden min-[400px]:inline">Berikutnya</span>
                <ChevronRight className="h-4 w-4" aria-hidden />
              </Link>
            ) : (
              <span />
            )}
          </nav>
        ) : null}

        <p className="mt-6 px-2 text-center text-[11px] text-slate-400 tabular-nums">
          Diperbarui {formatTanggalID(new Date(now))} · refresh otomatis tiap 90 detik
        </p>
      </main>
    </>
  );
}
