/**
 * Latar statis profesional: solid + satu aksen radial halus di atas.
 * Tanpa blur besar, tanpa animasi — hemat GPU/baterai HP.
 */
export function AuroraBackground(): React.ReactElement {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-[#f4f6fb]" />
      <div
        className="absolute inset-x-0 top-0 h-72"
        style={{
          background:
            "radial-gradient(60% 100% at 50% 0%, rgb(79 70 229 / 0.08) 0%, transparent 70%)",
        }}
      />
    </div>
  );
}
