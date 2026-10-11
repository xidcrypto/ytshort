"use client";

import { useEffect, useRef, useState } from "react";

/** Angka count-up animasi saat pertama tampil. */
export function CountUp({ value }: { value: number }): React.ReactElement {
  const reduceMotion =
    typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const [shown, setShown] = useState<number>(() => (reduceMotion ? value : 0));
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    if (reduceMotion) return undefined;
    let raf = 0;
    let started = false;
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting || started) return;
        started = true;
        const end = value;
        const t0 = performance.now();
        const dur = 900;
        const tick = (t: number): void => {
          const p = Math.min(1, (t - t0) / dur);
          const eased = 1 - Math.pow(1 - p, 3);
          setShown(Math.round(end * eased));
          if (p < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
        io.disconnect();
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [value, reduceMotion]);

  return (
    <span ref={ref} className="tabular-nums">
      {shown}
    </span>
  );
}

/** Jam live (id-ID) update tiap detik — nuansa realtime dashboard. */
export function LiveClock(): React.ReactElement {
  const [now, setNow] = useState<string>("—");
  useEffect(() => {
    const fmt = new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    const update = (): void => setNow(fmt.format(new Date()));
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);
  return <span className="tabular-nums">{now}</span>;
}

/**
 * Auto-refresh halaman tiap `intervalMs` (default 60 dtk) agar status job
 * terasa live. Hanya refresh bila tab terlihat + user tidak sedang mengetik.
 */
export function AutoRefresh({ intervalMs = 60_000 }: { intervalMs?: number }): React.ReactElement {
  const [countdown, setCountdown] = useState(Math.round(intervalMs / 1000));
  useEffect(() => {
    const id = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          const typing =
            document.activeElement instanceof HTMLInputElement ||
            document.activeElement instanceof HTMLTextAreaElement;
          if (!document.hidden && !typing) window.location.reload();
          return Math.round(intervalMs / 1000);
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [intervalMs]);
  return <span className="tabular-nums">{countdown}d</span>;
}

/** Pasang .is-visible pada semua .reveal saat masuk viewport (scroll). */
export function RevealManager(): React.ReactElement | null {
  useEffect(() => {
    const els = Array.from(document.querySelectorAll(".reveal"));
    if (els.length === 0) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      els.forEach((el) => el.classList.add("is-visible"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add("is-visible");
            io.unobserve(e.target);
          }
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
  return null;
}

/**
 * Tilt 3D halus mengikuti pointer untuk elemen .tilt.
 * Nonaktif di layar sentuh / reduced-motion.
 */
export function TiltManager(): React.ReactElement | null {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (window.matchMedia("(hover: none)").matches) return;
    const onMove = (e: PointerEvent): void => {
      const el = (e.target as HTMLElement | null)?.closest?.(".tilt") as HTMLElement | null;
      document.querySelectorAll(".tilt").forEach((node) => {
        if (node !== el) {
          (node as HTMLElement).style.setProperty("--rx", "0deg");
          (node as HTMLElement).style.setProperty("--ry", "0deg");
        }
      });
      if (!el) return;
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      el.style.setProperty("--ry", `${(px * 7).toFixed(2)}deg`);
      el.style.setProperty("--rx", `${(-py * 7).toFixed(2)}deg`);
    };
    const onLeave = (): void => {
      document.querySelectorAll(".tilt").forEach((node) => {
        (node as HTMLElement).style.setProperty("--rx", "0deg");
        (node as HTMLElement).style.setProperty("--ry", "0deg");
      });
    };
    document.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    return () => {
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
    };
  }, []);
  return null;
}
