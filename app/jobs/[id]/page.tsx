import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  Download,
  ExternalLink,
  FileText,
  Fingerprint,
  Globe2,
  Heading,
  History,
  Play,
  Tags,
} from "lucide-react";

import { AuroraBackground } from "@/components/aurora-background";
import { EventTimeline } from "@/components/event-timeline";
import { SiteHeader } from "@/components/site-header";
import { StatusBadge } from "@/components/status-badge";
import { isAdminLoggedIn } from "@/lib/auth-guard";
import { formatTanggalID } from "@/lib/format";
import { getJobDetail } from "@/lib/jobs";

export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<React.ReactElement> {
  if (!(await isAdminLoggedIn())) redirect("/login");
  const { id } = await params;
  const job = await getJobDetail(id);
  if (!job) notFound();

  const fields: Array<{ Icon: typeof Tags; label: string; value: string; link?: boolean }> = [
    { Icon: Tags, label: "Topik", value: job.topic },
    { Icon: Heading, label: "Judul", value: job.title ?? "—" },
    { Icon: FileText, label: "Deskripsi", value: job.description ?? "—" },
    { Icon: Globe2, label: "Privasi", value: job.privacy },
    { Icon: Play, label: "URL YouTube", value: job.youtubeUrl ?? "—", link: !!job.youtubeUrl },
    { Icon: Fingerprint, label: "ID Video", value: job.youtubeVideoId ?? "—" },
    { Icon: CalendarDays, label: "Dibuat", value: formatTanggalID(job.createdAt) },
    { Icon: History, label: "Diperbarui", value: formatTanggalID(job.updatedAt) },
  ];

  return (
    <>
      <AuroraBackground />
      <SiteHeader />
      <main className="mx-auto w-full max-w-2xl px-3 py-5 sm:px-4">
        <Link
          href="/"
          className="btn-press group inline-flex min-h-[44px] items-center gap-1.5 rounded-xl bg-white px-3 text-sm font-bold text-gray-700"
        >
          <ArrowLeft className="h-4 w-4 transition-transform duration-200 " aria-hidden />
          Kembali ke daftar
        </Link>

        <div className="mt-3 rounded-2xl bg-slate-900 p-5 text-white sm:p-6">
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <StatusBadge status={job.status} />
            {job.videoFile ? (
              <span className="inline-flex items-center gap-1 rounded-full border border-white/25 bg-white/10 px-2.5 py-1 text-xs font-bold">
                <Download className="h-3.5 w-3.5" aria-hidden />
                MP4 tersedia
              </span>
            ) : null}
          </div>
          <h1 className="mt-2 line-clamp-3 text-xl leading-snug font-extrabold break-words sm:text-2xl">{job.title || job.topic}</h1>
          <div className="mt-4 flex flex-wrap gap-2">
            {job.status === "done" && job.youtubeUrl ? (
              <a
                href={job.youtubeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-press inline-flex min-h-[44px] items-center gap-1.5 rounded-xl bg-white px-4 text-sm font-extrabold text-slate-900"
              >
                <ExternalLink className="h-4 w-4" aria-hidden />
                Tonton di YouTube
              </a>
            ) : null}
            {job.videoFile ? (
              <a
                href={`/api/jobs/${job.id}/video`}
                className="btn-press inline-flex min-h-[44px] items-center gap-1.5 rounded-xl border border-white/25 bg-white/10 px-4 text-sm font-bold text-white"
              >
                <Download className="h-4 w-4" aria-hidden />
                Unduh MP4
              </a>
            ) : null}
          </div>
        </div>

        <section aria-label="Rincian video" className="reveal mt-4 rounded-3xl border border-[#e5e9f2] bg-white p-4 shadow-sm sm:p-5">
          <dl className="flex flex-col gap-1">
            {fields.map(({ Icon, label, value, link }) => (
              <div key={label} className="group flex items-start gap-3 border-b border-gray-100 py-2.5 last:border-0">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gray-100 text-gray-600 transition-all duration-300  group-hover:bg-gradient-to-br group-hover:from-rose-500 group-hover:to-indigo-500 group-hover:text-white">
                  <Icon className="h-4 w-4" aria-hidden />
                </span>
                <div className="min-w-0 flex-1">
                  <dt className="text-xs font-bold tracking-wide text-gray-400 uppercase">{label}</dt>
                  <dd className="mt-0.5 text-sm break-words">
                    {link ? (
                      <a href={value} target="_blank" rel="noopener noreferrer" className="font-semibold text-rose-700 underline break-all">
                        {value}
                      </a>
                    ) : (
                      value
                    )}
                  </dd>
                </div>
              </div>
            ))}
          </dl>
          {job.status === "failed" && job.error ? (
            <p className="mt-2 rounded-2xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">{job.error}</p>
          ) : null}
        </section>

        <section aria-label="Riwayat status" className="reveal mt-4 rounded-3xl border border-[#e5e9f2] bg-white p-4 shadow-sm sm:p-5">
          <h2 className="flex items-center gap-2 text-base font-extrabold">
            <History className="h-5 w-5 text-indigo-500" aria-hidden />
            Riwayat Status
          </h2>
          <EventTimeline events={job.events} />
        </section>
      </main>
    </>
  );
}
