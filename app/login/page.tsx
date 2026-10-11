import { redirect } from "next/navigation";
import { Activity, Clapperboard, KeyRound, LogIn, ShieldCheck, TriangleAlert } from "lucide-react";

import { AuroraBackground } from "@/components/aurora-background";
import { isAdminLoggedIn } from "@/lib/auth-guard";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}): Promise<React.ReactElement> {
  if (await isAdminLoggedIn()) redirect("/");
  const { error } = await searchParams;

  return (
    <>
      <AuroraBackground />
      <main className="relative mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-4 py-10">
        {/* cincin orbit dekoratif */}
        <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute top-1/2 left-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-fuchsia-300/50" />
          <div className="absolute top-16 left-8 grid h-12 w-12 place-items-center rounded-2xl bg-white text-amber-500">
            <KeyRound className="h-5 w-5" aria-hidden />
          </div>
          <div className="absolute right-8 bottom-24 grid h-12 w-12 place-items-center rounded-2xl bg-white text-emerald-500">
            <ShieldCheck className="h-5 w-5" aria-hidden />
          </div>
        </div>

        <div className="relative rounded-3xl border border-[#e5e9f2] bg-white p-6 sm:p-8">
          <div aria-hidden className="pointer-events-none absolute inset-x-8 top-0 h-1 rounded-full bg-gradient-to-r from-transparent via-fuchsia-400 to-transparent" />
          <span className="mx-auto grid h-16 w-16 place-items-center rounded-3xl bg-gradient-to-br from-indigo-600 to-indigo-600 text-white">
            <Clapperboard className="h-8 w-8" aria-hidden />
          </span>
          <h1 className="mt-4 text-center text-2xl font-extrabold tracking-tight">Shorts Studio</h1>
          <p className="mt-1 flex items-center justify-center gap-1.5 text-center text-sm text-gray-500">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-500" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            <Activity className="h-3.5 w-3.5 text-emerald-500" aria-hidden />
            Area admin — masuk untuk mengelola antrean.
          </p>

          {error ? (
            <p role="alert" className="mt-4 flex items-start gap-2 rounded-2xl border border-rose-200 bg-rose-50 p-3 text-sm font-medium text-rose-800">
              <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
              {error}
            </p>
          ) : null}

          <form method="post" action="/api/auth/login" className="group mt-5 flex flex-col gap-3">
            <label className="flex flex-col gap-1.5 text-sm font-bold">
              <span className="flex items-center gap-1.5">
                <KeyRound className="h-4 w-4 text-amber-500" aria-hidden />
                Kata sandi admin
              </span>
              <input
                id="login-password"
                type="password"
                name="password"
                required
                autoComplete="current-password"
                placeholder="••••••••"
                className="min-h-[48px] w-full rounded-2xl border border-gray-200 bg-white px-4 text-base shadow-sm transition outline-none  focus:border-rose-400 focus:ring-4 focus:ring-rose-500/15"
              />
            </label>
            <button
              type="submit"
              className="btn-press relative inline-flex min-h-[48px] items-center justify-center gap-2 overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 to-indigo-700 px-4 text-base font-extrabold text-white"
            >
              <LogIn className="h-5 w-5 transition-transform duration-200 " aria-hidden />
              Masuk Dashboard
            </button>
          </form>

          <p className="mt-4 text-center text-xs text-gray-400">
            Dilindungi rate-limit: 5x salah dalam 15 menit = diblokir sementara.
          </p>
        </div>
      </main>
    </>
  );
}
