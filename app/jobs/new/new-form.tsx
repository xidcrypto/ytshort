"use client";

import { useActionState } from "react";
import { FileText, Globe2, Heading, Loader2, Send, Tags } from "lucide-react";

import { createJobAction } from "./new-action";

const initialState = { errors: {} as Record<string, string[]> };

export function NewJobForm(): React.ReactElement {
  const [state, action, pending] = useActionState(createJobAction, initialState);

  const fieldError = (name: string): React.ReactElement | null => {
    const msgs = state.errors?.[name];
    if (!msgs || msgs.length === 0) return null;
    return (
      <p role="alert" className="animate-pop-in flex items-center gap-1 text-sm font-medium text-rose-700">
        {msgs.join(" ")}
      </p>
    );
  };

  const inputCls =
    "min-h-[44px] w-full rounded-2xl border border-gray-200 bg-white/90 px-4 text-base shadow-sm outline-none backdrop-blur transition focus:border-rose-400 focus:ring-4 focus:ring-rose-500/15";

  return (
    <form action={action} className="animate-pop-in mt-5 flex flex-col gap-4 rounded-3xl border border-white/60 bg-white/85 p-4 shadow-xl shadow-rose-500/5 backdrop-blur sm:p-6">
      <label className="flex flex-col gap-1.5 text-sm font-bold">
        <span className="flex items-center gap-1.5">
          <Tags className="h-4 w-4 text-rose-500" aria-hidden />
          Topik video <span className="text-rose-500">*</span>
        </span>
        <textarea
          name="topic"
          required
          rows={4}
          placeholder="Contoh: 5 fakta unik kucing yang jarang diketahui…"
          className={`${inputCls} py-3`}
        />
        {fieldError("topic")}
      </label>

      <label className="flex flex-col gap-1.5 text-sm font-bold">
        <span className="flex items-center gap-1.5">
          <Heading className="h-4 w-4 text-indigo-500" aria-hidden />
          Judul YouTube
          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500">opsional</span>
        </span>
        <input name="title" maxLength={100} placeholder="Otomatis dari topik bila kosong (maks. 100)" className={inputCls} />
        {fieldError("title")}
      </label>

      <label className="flex flex-col gap-1.5 text-sm font-bold">
        <span className="flex items-center gap-1.5">
          <FileText className="h-4 w-4 text-emerald-500" aria-hidden />
          Deskripsi
          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500">opsional</span>
        </span>
        <textarea name="description" rows={3} placeholder="Deskripsi video…" className={`${inputCls} py-3`} />
        {fieldError("description")}
      </label>

      <fieldset className="flex flex-col gap-2">
        <legend className="flex items-center gap-1.5 text-sm font-bold">
          <Globe2 className="h-4 w-4 text-sky-500" aria-hidden />
          Privasi
        </legend>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          {(
            [
              ["public", "Publik", "Semua orang bisa nonton"],
              ["unlisted", "Unlisted", "Hanya yang punya link"],
              ["private", "Pribadi", "Hanya kamu"],
            ] as const
          ).map(([value, label, desc]) => (
            <label
              key={value}
              className="btn-press flex min-h-[44px] cursor-pointer items-center gap-2.5 rounded-2xl border border-gray-200 bg-white/80 px-3 py-2.5 text-sm has-[:checked]:border-rose-400 has-[:checked]:bg-rose-50 has-[:checked]:shadow-md has-[:checked]:shadow-rose-500/10"
            >
              <input type="radio" name="privacy" value={value} defaultChecked={value === "public"} className="h-5 w-5 accent-rose-600" />
              <span>
                <span className="block font-bold">{label}</span>
                <span className="block text-xs font-normal text-gray-500">{desc}</span>
              </span>
            </label>
          ))}
        </div>
        {fieldError("privacy")}
      </fieldset>

      <button
        type="submit"
        disabled={pending}
        className="btn-press inline-flex min-h-[48px] items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-rose-600 via-fuchsia-600 to-indigo-600 px-4 text-base font-extrabold text-white shadow-xl shadow-fuchsia-500/30 disabled:opacity-60"
      >
        {pending ? <Loader2 className="h-5 w-5 animate-spin" aria-hidden /> : <Send className="h-5 w-5" aria-hidden />}
        {pending ? "Menyimpan…" : "Simpan Video"}
      </button>
    </form>
  );
}
