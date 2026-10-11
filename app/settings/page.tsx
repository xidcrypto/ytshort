import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, Settings2 } from "lucide-react";

import { AuroraBackground } from "@/components/aurora-background";
import { SiteHeader } from "@/components/site-header";
import { isAdminLoggedIn } from "@/lib/auth-guard";

import { getSettingsInfo } from "./actions";
import { ApiKeyCard } from "./api-key-card";
import { PasswordCard } from "./password-card";

export default async function SettingsPage(): Promise<React.ReactElement> {
  if (!(await isAdminLoggedIn())) redirect("/login");
  const info = await getSettingsInfo();

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
        <div className="mt-3 flex items-center gap-3">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-indigo-600 to-fuchsia-500 text-white">
            <Settings2 className="h-6 w-6" aria-hidden />
          </span>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight sm:text-2xl">Pengaturan</h1>
            <p className="text-sm text-gray-500">Perubahan berlaku langsung, tanpa restart.</p>
          </div>
        </div>
        <div className="mt-4 flex flex-col gap-3">
          <ApiKeyCard initialMasked={info.masked} />
          <PasswordCard />
        </div>
      </main>
    </>
  );
}
