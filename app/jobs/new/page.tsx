import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, Clapperboard, Sparkles, Wand2 } from "lucide-react";

import { AuroraBackground } from "@/components/aurora-background";
import { isAdminLoggedIn } from "@/lib/auth-guard";

import { NewJobForm } from "./new-form";

const IDEAS = ["5 fakta unik kucing", "Tips hemat ala anak kos", "Sejarah singkat rendang", "Trik fokus 25 menit"];

export default async function NewJobPage(): Promise<React.ReactElement> {
  if (!(await isAdminLoggedIn())) redirect("/login");
  return (
    <>
      <AuroraBackground />
      <main className="mx-auto w-full max-w-2xl px-3 py-6 sm:px-4">
        <Link
          href="/"
          className="btn-press inline-flex min-h-[44px] items-center gap-1.5 rounded-xl bg-white px-3 text-sm font-bold text-slate-700"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Kembali ke daftar
        </Link>
        <div className="mt-3 flex items-center gap-3">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-indigo-600 text-white">
            <Clapperboard className="h-6 w-6" aria-hidden />
          </span>
          <div className="min-w-0">
            <h1 className="text-xl font-extrabold tracking-tight break-words sm:text-2xl">Buat Video Baru</h1>
            <p className="flex items-center gap-1 text-sm text-slate-500">
              <Sparkles className="h-3.5 w-3.5 shrink-0 text-amber-500" aria-hidden />
              Isi topik, agent mengambilnya otomatis.
            </p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2" aria-label="Inspirasi topik">
          {IDEAS.map((idea) => (
            <span key={idea} className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-bold break-words text-slate-700">
              <Wand2 className="h-3 w-3 shrink-0 text-indigo-600" aria-hidden />
              {idea}
            </span>
          ))}
        </div>

        <NewJobForm />
      </main>
    </>
  );
}
