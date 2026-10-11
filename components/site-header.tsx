import Link from "next/link";
import { Clapperboard, LogOut, Plus, Radio } from "lucide-react";

import { LiveClock } from "@/components/live-bits";

export function SiteHeader(): React.ReactElement {
  return (
    <header className="sticky top-0 z-40 border-b border-white/40 bg-white/70 backdrop-blur-xl">
      <nav className="mx-auto flex w-full max-w-5xl items-center justify-between gap-2 px-3 py-2 sm:px-4">
        <Link
          href="/"
          className="btn-press group flex min-h-[44px] items-center gap-2 rounded-xl px-2 text-base font-extrabold tracking-tight sm:text-lg"
        >
          <span className="animate-breathe grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-fuchsia-600 via-rose-500 to-orange-400 text-white shadow-lg shadow-rose-500/30 transition-transform duration-300 group-hover:rotate-6">
            <Clapperboard className="h-5 w-5" aria-hidden />
          </span>
          <span className="bg-gradient-to-r from-gray-900 via-rose-600 to-indigo-600 bg-clip-text text-transparent">
            Shorts Studio
          </span>
        </Link>
        <div className="flex items-center gap-1.5 sm:gap-2">
          <span className="mr-1 hidden items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700 lg:inline-flex">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping-soft absolute inline-flex h-full w-full rounded-full bg-emerald-500" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            <Radio className="h-3 w-3" aria-hidden />
            LIVE&nbsp;·&nbsp;<LiveClock />
          </span>
          <Link
            href="/jobs/new"
            className="btn-press group flex min-h-[44px] items-center gap-1.5 overflow-hidden rounded-xl bg-gray-900 px-3 text-sm font-semibold text-white shadow-lg shadow-gray-900/20 sm:px-4"
          >
            <Plus className="h-4 w-4 transition-transform duration-300 group-hover:rotate-90" aria-hidden />
            <span className="hidden min-[420px]:inline">Buat Video</span>
            <span className="min-[420px]:hidden">Buat</span>
          </Link>
          <form method="post" action="/api/auth/logout">
            <button
              type="submit"
              title="Keluar"
              className="btn-press flex min-h-[44px] min-w-[44px] items-center justify-center gap-1.5 rounded-xl border border-gray-200 bg-white/80 px-3 text-sm font-medium text-gray-700"
            >
              <LogOut className="h-4 w-4" aria-hidden />
              <span className="hidden md:inline">Keluar</span>
            </button>
          </form>
        </div>
      </nav>
      {/* garis loading gradien jalan */}
      <div aria-hidden className="relative h-0.5 overflow-hidden bg-transparent">
        <div
          className="absolute inset-y-0 w-2/5 rounded-full bg-gradient-to-r from-transparent via-fuchsia-500 to-transparent"
          style={{ animation: "shimmerBar 3.2s ease-in-out infinite" }}
        />
      </div>
    </header>
  );
}
