/** Format tanggal Indonesia, mis. 11 Okt 2026, 13.05. */
export function formatTanggalID(date: Date): string {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}
