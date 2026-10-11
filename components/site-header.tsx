import Link from "next/link";
import { Clapperboard, LogOut, Plus, Settings2 } from "lucide-react";

import { LiveClock } from "@/components/live-bits";

export function SiteHeader(): React.ReactElement {
  return (
    <header className="sticky top-0 z-40 border-b border-[#e5e9f2] bg-white/95">
      <nav className="mx-auto flex w-full max-w-5xl items-center justify-between gap-2 px-3 py-2 sm:px-4">
        <Link
          href="/"
          className="btn-press flex min-h-[44px] items-center gap-2 rounded-xl px-2 text-base font-extrabold tracking-tight text-slate-900 sm:text-lg"
        >
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-indigo-600 text-white">
            <Clapperboard className="h-5 w-5" aria-hidden />
          </span>
          <span className="hidden min-[380px]:inline">Shorts Studio</span>
        </Link>
        <div className="flex items-center gap-1.5 sm:gap-2">
          <span className="mr-1 hidden items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700 lg:inline-flex">
            <span className="h-2 w-2 rounded-full bg-emerald-500" aria-hidden />
            <LiveClock />
          </span>
          <Link
            href="/jobs/new"
            className="btn-press flex min-h-[44px] items-center gap-1.5 rounded-xl bg-indigo-600 px-3 text-sm font-semibold text-white sm:px-4"
          >
            <Plus className="h-4 w-4" aria-hidden />
            <span className="hidden min-[420px]:inline">Buat Video</span>
            <span className="min-[420px]:hidden">Buat</span>
          </Link>
          <Link
            href="/settings"
            title="Pengaturan"
            className="btn-press flex min-h-[44px] min-w-[44px] items-center justify-center gap-1.5 rounded-xl border border-[#e5e9f2] bg-white px-3 text-sm font-medium text-slate-600"
          >
            <Settings2 className="h-4 w-4" aria-hidden />
            <span className="hidden md:inline">Pengaturan</span>
          </Link>
          <form method="post" action="/api/auth/logout">
            <button
              type="submit"
              title="Keluar"
              className="btn-press flex min-h-[44px] min-w-[44px] items-center justify-center gap-1.5 rounded-xl border border-[#e5e9f2] bg-white px-3 text-sm font-medium text-slate-600"
            >
              <LogOut className="h-4 w-4" aria-hidden />
              <span className="hidden md:inline">Keluar</span>
            </button>
          </form>
        </div>
      </nav>
    </header>
  );
}
