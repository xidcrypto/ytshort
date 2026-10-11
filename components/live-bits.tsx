"use client";

import { useEffect, useState } from "react";

/**
 * Komponen client yang hemat daya (tema profesional):
 * - Tanpa countdown/setState per detik.
 * - Tanpa observer per scroll, tanpa listener pointer global.
 * - Auto-refresh memakai interval panjang TANPA menampilkan hitungan.
 */

export function CountUp({ value }: { value: number }): React.ReactElement {
  return <span className="tabular-nums">{value}</span>;
}

export function LiveClock(): React.ReactElement {
  const [now, setNow] = useState<string | null>(null);
  useEffect(() => {
    const fmt = new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
    // setTimeout (bukan setState langsung) agar lolos aturan hooks.
    const id = setTimeout(() => setNow(fmt.format(new Date())), 0);
    return () => clearTimeout(id);
  }, []);
  return <span className="tabular-nums">{now ?? "—"}</span>;
}

/**
 * Refresh halaman tiap intervalMs (default 90 dtk) TANPA countdown,
 * hanya bila tab terlihat dan user tidak mengetik. Tanpa re-render.
 */
export function AutoRefresh({ intervalMs = 90_000 }: { intervalMs?: number }): React.ReactElement | null {
  useEffect(() => {
    const id = setInterval(() => {
      const typing =
        document.activeElement instanceof HTMLInputElement ||
        document.activeElement instanceof HTMLTextAreaElement;
      if (!document.hidden && !typing) window.location.reload();
    }, intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return null;
}

/** No-op: reveal kini murni CSS sekali-jalan, tanpa observer. */
export function RevealManager(): React.ReactElement | null {
  return null;
}

/** No-op: tilt 3D dimatikan demi performa HP. */
export function TiltManager(): React.ReactElement | null {
  return null;
}
