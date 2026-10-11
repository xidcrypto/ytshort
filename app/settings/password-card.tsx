"use client";

import { useActionState } from "react";
import { CheckCircle2, KeyRound, Loader2, Save } from "lucide-react";

import { changePasswordAction } from "./actions";

const initialState = { errors: {} as Record<string, string[]> };

export function PasswordCard(): React.ReactElement {
  const [state, action, pending] = useActionState(changePasswordAction, initialState);

  const fieldError = (name: string): React.ReactElement | null => {
    const msgs = state.errors?.[name];
    if (!msgs || msgs.length === 0) return null;
    return (
      <p role="alert" className="text-sm font-medium text-rose-700">
        {msgs.join(" ")}
      </p>
    );
  };

  const inputCls =
    "min-h-[48px] w-full rounded-2xl border border-gray-200 bg-white px-4 text-base shadow-sm outline-none transition focus:border-rose-400 focus:ring-4 focus:ring-rose-500/15";

  return (
    <section aria-label="Ubah Kata Sandi Admin" className="reveal rounded-3xl border border-[#e5e9f2] bg-white p-4 shadow-sm sm:p-5">
      <h2 className="flex items-center gap-2 text-base font-extrabold">
        <KeyRound className="h-5 w-5 text-indigo-500" aria-hidden />
        Ubah Kata Sandi Admin
      </h2>
      <p className="mt-1 text-sm text-gray-500">Berlaku langsung tanpa restart. Minimal 8 karakter.</p>

      {state.ok ? (
        <p role="status" className="mt-3 flex items-start gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 p-3 text-sm font-medium text-emerald-800">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          {state.ok}
        </p>
      ) : null}

      <form action={action} className="mt-3 flex flex-col gap-3">
        <label className="flex flex-col gap-1.5 text-sm font-bold">
          Kata sandi saat ini
          <input type="password" name="current" required autoComplete="current-password" className={inputCls} />
          {fieldError("current")}
        </label>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className="flex flex-col gap-1.5 text-sm font-bold">
            Kata sandi baru
            <input type="password" name="next" required minLength={8} autoComplete="new-password" className={inputCls} />
            {fieldError("next")}
          </label>
          <label className="flex flex-col gap-1.5 text-sm font-bold">
            Konfirmasi baru
            <input type="password" name="confirm" required autoComplete="new-password" className={inputCls} />
            {fieldError("confirm")}
          </label>
        </div>
        <button
          type="submit"
          disabled={pending}
          className="btn-press inline-flex min-h-[48px] items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-indigo-700 px-4 text-base font-extrabold text-white disabled:opacity-60"
        >
          {pending ? <Loader2 className="h-5 w-5 animate-spin" aria-hidden /> : <Save className="h-5 w-5" aria-hidden />}
          {pending ? "Menyimpan…" : "Simpan Kata Sandi"}
        </button>
      </form>
    </section>
  );
}
