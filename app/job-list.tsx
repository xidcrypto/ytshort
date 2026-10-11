import Link from "next/link";
import { Inbox, Plus } from "lucide-react";
import type { Job } from "@prisma/client";

import { JobCard } from "@/components/job-card";
import { listJobs, serverNow } from "@/lib/jobs";

export async function JobList({
  status,
  page,
  pageSize,
}: {
  status: string | undefined;
  page: number;
  pageSize: number;
}): Promise<React.ReactElement> {
  const [{ jobs, total }] = await Promise.all([
    listJobs({ status, take: pageSize, skip: (page - 1) * pageSize }),
  ]);
  void total;
  const now = await serverNow();

  if (jobs.length === 0) {
    return (
      <div className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center sm:p-12">
        <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-indigo-600 text-white">
          <Inbox className="h-8 w-8" aria-hidden />
        </span>
        <h2 className="mt-4 text-lg font-extrabold">Belum ada video di sini</h2>
        <p className="mx-auto mt-1 max-w-sm text-sm text-gray-500">
          Klik “Buat Video Baru” untuk menambah topik pertama — agent akan mengambilnya otomatis.
        </p>
        <Link
          href="/jobs/new"
          className="btn-press mt-4 inline-flex min-h-[44px] items-center gap-2 rounded-2xl bg-gray-900 px-5 text-sm font-bold text-white"
        >
          <Plus className="h-4 w-4 transition-transform duration-300 " aria-hidden />
          Buat Video Pertama
        </Link>
      </div>
    );
  }

  return (
    <ul className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
      {jobs.map((job: Job) => (
        <JobCard key={job.id} job={job} now={now} />
      ))}
    </ul>
  );
}
