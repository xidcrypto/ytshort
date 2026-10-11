import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, Clapperboard, Sparkles, Wand2 } from "lucide-react";

import { AuroraBackground } from "@/components/aurora-background";
import { RevealManager, TiltManager } from "@/components/live-bits";
import { isAdminLoggedIn } from "@/lib/auth-guard";

import { NewJobForm } from "./new-form";

const IDEAS = ["5 fakta unik kucing", "Tips hemat ala anak kos", "Sejarah singkat rendang", "Trik fokus 25 menit"];

export default async function NewJobPage(): Promise<React.ReactElement> {
  if (!(await isAdminLoggedIn())) redirect("/login");
  return (
    <>
      <AuroraBackground />
      <RevealManager />
      <TiltManager />
      <main className="mx-auto w-full max-w-2xl px-3 py-6 sm:px-4">
        <Link
          href="/"
          className="btn-press group inline-flex min-h-[44px] items-center gap-1.5 rounded-xl bg-white/80 px-3 text-sm font-bold text-gray-700 backdrop-blur"
        >
          <ArrowLeft className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-1" aria-hidden />
          Kembali ke daftar
        </Link>
        <div className="animate-pop-in mt-3 flex items-center gap-3">
          <span className="animate-float-slow grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-fuchsia-600 to-orange-400 text-white shadow-xl shadow-fuchsia-500/30">
            <Clapperboard className="h-6 w-6" aria-hidden />
          </span>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight sm:text-2xl">Buat Video Baru</h1>
            <p className="flex items-center gap-1 text-sm text-gray-500">
              <Sparkles className="animate-ticker h-3.5 w-3.5 text-amber-500" aria-hidden />
              Isi topik, agent mengambilnya otomatis.
            </p>
          </div>
        </div>

        {/* Inspirasi topik: marquee */}
        <div className="marquee reveal mt-4 rounded-2xl border border-white/60 bg-white/70 py-2 backdrop-blur" aria-label="Inspirasi topik">
          <div className="marquee-track gap-3 px-3">
            {[...IDEAS, ...IDEAS].map((idea, i) => (
              <span key={i} className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-gradient-to-r from-rose-100 to-indigo-100 px-3 py-1.5 text-xs font-bold whitespace-nowrap text-gray-700">
                <Wand2 className="h-3 w-3 text-fuchsia-600" aria-hidden />
                {idea}
              </span>
            ))}
          </div>
        </div>

        <NewJobForm />
      </main>
    </>
  );
}
