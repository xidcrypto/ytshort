"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { AlertTriangle, Check, Copy, Eye, EyeOff, KeyRound, RefreshCw } from "lucide-react";

import { regenerateKeyAction, revealKeyAction } from "./actions";

const REVEAL_SECONDS = 30;

export function ApiKeyCard({ initialMasked }: { initialMasked: string }): React.ReactElement {
  const [masked, setMasked] = useState(initialMasked);
  const [revealed, setRevealed] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(0);
  const [copied, setCopied] = useState(false);
  const [regenResult, setRegenResult] = useState<{ newKey: string } | null>(null);
  const [regenError, setRegenError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [pending, startTransition] = useTransition();
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopReveal = (): void => {
    if (timer.current) clearInterval(timer.current);
    timer.current = null;
    setRevealed(null);
    setCountdown(0);
  };

  useEffect(() => stopReveal, []);

  const onReveal = (): void => {
    if (revealed) {
      stopReveal();
      return;
    }
    startTransition(async () => {
      const res = await revealKeyAction();
      if (res.key) {
        setRevealed(res.key);
        setCountdown(REVEAL_SECONDS);
        if (timer.current) clearInterval(timer.current);
        timer.current = setInterval(() => {
          setCountdown((c) => {
            if (c <= 1) {
              stopReveal();
              return 0;
            }
            return c - 1;
          });
        }, 1000);
      }
    });
  };

  const onCopy = async (text: string): Promise<void> => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const onRegenerate = (): void => {
    if (!confirming) {
      setConfirming(true);
      return;
    }
    setConfirming(false);
    setRegenError(null);
    startTransition(async () => {
      const res = await regenerateKeyAction();
      if (res.error) {
        setRegenError(res.error);
        return;
      }
      if (res.newKey) {
        stopReveal();
        setRegenResult({ newKey: res.newKey });
        setMasked(res.masked ?? "••••");
      }
    });
  };

  return (
    <section aria-label="API Key Agent" className="reveal rounded-3xl border border-[#e5e9f2] bg-white p-4 shadow-sm sm:p-5">
      <h2 className="flex items-center gap-2 text-base font-extrabold">
        <KeyRound className="h-5 w-5 text-amber-500" aria-hidden />
        API Key Agent
      </h2>
      <p className="mt-1 text-sm text-gray-500">
        Key untuk header <code className="rounded bg-gray-100 px-1 font-mono text-xs">x-api-key</code>. Berlaku langsung tanpa restart.
      </p>

      <div className="mt-3 flex flex-col gap-2 rounded-2xl border border-gray-200 bg-gray-50 p-3">
        <p className="font-mono text-sm break-all tabular-nums" aria-live="polite">
          {revealed ?? regenResult?.newKey ?? masked}
        </p>
        {revealed ? (
          <p className="text-xs font-bold text-amber-700 tabular-nums">Disembunyikan otomatis dalam {countdown} detik.</p>
        ) : null}
        {regenResult ? (
          <p role="alert" className="rounded-xl border border-amber-300 bg-amber-50 p-2 text-xs font-bold text-amber-800">
            Ini satu-satunya tampilan key baru — salin sekarang! Semua agent yang terhubung harus memperbarui key-nya,
            key lama langsung tidak berlaku.
          </p>
        ) : null}
      </div>

      {regenError ? (
        <p role="alert" className="mt-2 rounded-xl border border-rose-200 bg-rose-50 p-2 text-sm text-rose-800">
          {regenError}
        </p>
      ) : null}

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onReveal}
          disabled={pending}
          className="btn-press inline-flex min-h-[44px] items-center gap-1.5 rounded-2xl border border-gray-300 bg-white px-4 text-sm font-bold disabled:opacity-60"
        >
          {revealed ? <EyeOff className="h-4 w-4" aria-hidden /> : <Eye className="h-4 w-4" aria-hidden />}
          {revealed ? "Sembunyikan" : "Tampilkan"}
        </button>
        <button
          type="button"
          onClick={() => void onCopy(revealed ?? regenResult?.newKey ?? "")}
          disabled={pending || (!revealed && !regenResult)}
          className="btn-press inline-flex min-h-[44px] items-center gap-1.5 rounded-2xl border border-gray-300 bg-white px-4 text-sm font-bold disabled:opacity-50"
        >
          {copied ? <Check className="h-4 w-4 text-emerald-600" aria-hidden /> : <Copy className="h-4 w-4" aria-hidden />}
          {copied ? "Tersalin!" : "Salin"}
        </button>
        <span className="flex-1" />
        {!confirming ? (
          <button
            type="button"
            onClick={onRegenerate}
            disabled={pending}
            className="btn-press inline-flex min-h-[44px] items-center gap-1.5 rounded-2xl bg-gray-900 px-4 text-sm font-bold text-white disabled:opacity-60"
          >
            <RefreshCw className="h-4 w-4" aria-hidden />
            Regenerate
          </button>
        ) : (
          <span className="flex flex-wrap items-center gap-2 rounded-2xl border border-rose-300 bg-rose-50 p-2">
            <span className="flex items-center gap-1 px-1 text-xs font-bold text-rose-800">
              <AlertTriangle className="h-4 w-4" aria-hidden />
              Key lama langsung mati. Yakin?
            </span>
            <button
              type="button"
              onClick={onRegenerate}
              disabled={pending}
              className="btn-press inline-flex min-h-[44px] items-center rounded-xl bg-rose-600 px-4 text-sm font-extrabold text-white disabled:opacity-60"
            >
              Ya, regenerate
            </button>
            <button
              type="button"
              onClick={() => setConfirming(false)}
              className="btn-press inline-flex min-h-[44px] items-center rounded-xl border border-gray-300 bg-white px-4 text-sm font-bold"
            >
              Batal
            </button>
          </span>
        )}
      </div>
    </section>
  );
}
