/**
 * Latar aurora super-animasi: blob gradien melayang + conic berputar +
 * partikel bintang + grid halus. Murni dekoratif (aria-hidden).
 */
const STARS: Array<{ left: string; top: string; delay: string; size: number }> = [
  { left: "8%", top: "18%", delay: "0s", size: 3 },
  { left: "15%", top: "65%", delay: "0.6s", size: 2 },
  { left: "24%", top: "32%", delay: "1.2s", size: 2 },
  { left: "38%", top: "12%", delay: "0.3s", size: 3 },
  { left: "52%", top: "55%", delay: "1.6s", size: 2 },
  { left: "63%", top: "22%", delay: "0.9s", size: 3 },
  { left: "71%", top: "70%", delay: "0.2s", size: 2 },
  { left: "82%", top: "38%", delay: "1.1s", size: 3 },
  { left: "90%", top: "15%", delay: "1.9s", size: 2 },
  { left: "45%", top: "80%", delay: "0.5s", size: 2 },
  { left: "5%", top: "45%", delay: "1.4s", size: 2 },
  { left: "95%", top: "60%", delay: "0.8s", size: 3 },
];

export function AuroraBackground(): React.ReactElement {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-[#f6f7fb]" />
      {/* blob utama melayang */}
      <div className="animate-float-slow absolute -top-32 -left-24 h-96 w-96 rounded-full bg-fuchsia-400/40 blur-3xl" />
      <div className="animate-float-slower absolute top-1/4 -right-28 h-[28rem] w-[28rem] rounded-full bg-indigo-400/40 blur-3xl" />
      <div className="animate-float-slow absolute bottom-[-10rem] left-1/4 h-96 w-96 rounded-full bg-rose-300/50 blur-3xl" />
      {/* conic berputar pelan */}
      <div
        className="animate-spin-slower absolute top-[-20%] left-1/2 h-[60vmax] w-[60vmax] -translate-x-1/2 rounded-full opacity-25 blur-3xl"
        style={{ background: "conic-gradient(from 0deg, #f0abfc, #a5b4fc, #fecdd3, #fde68a, #f0abfc)" }}
      />
      {/* pita melayang horizontal */}
      <div className="animate-drift-x absolute top-1/3 -left-1/4 h-40 w-[150%] rounded-full bg-gradient-to-r from-transparent via-rose-200/40 to-transparent blur-2xl" />
      {/* bintang berkelip */}
      {STARS.map((s, i) => (
        <span
          key={i}
          className="animate-ticker absolute rounded-full bg-indigo-400/70"
          style={{ left: s.left, top: s.top, width: s.size, height: s.size, animationDelay: s.delay }}
        />
      ))}
      {/* grid halus */}
      <div
        className="absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgb(20 19 26 / 0.05) 1px, transparent 1px), linear-gradient(to bottom, rgb(20 19 26 / 0.05) 1px, transparent 1px)",
          backgroundSize: "36px 36px",
          maskImage: "radial-gradient(ellipse 90% 70% at 50% 0%, black 40%, transparent 100%)",
          WebkitMaskImage: "radial-gradient(ellipse 90% 70% at 50% 0%, black 40%, transparent 100%)",
        }}
      />
    </div>
  );
}
