/**
 * Memformat timestamp (ms atau detik epoch) ke format HH:mm:ss lokal Indonesia.
 */
export function formatTimeOnly(input) {
  if (!input) return '--:--:--';
  const date = normalizeDate(input);
  if (!date) return '--:--:--';
  return date.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
}

/**
 * Memformat timestamp lengkap tanggal + waktu.
 */
export function formatDateTime(input) {
  if (!input) return 'Belum ada data';
  const date = normalizeDate(input);
  if (!date) return 'Belum ada data';
  return date.toLocaleString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
}

function normalizeDate(input) {
  if (input instanceof Date) return input;
  const num = Number(input);
  if (Number.isNaN(num) || num <= 0) return null;
  // Jika timestamp dalam detik (10 digit), konversi ke milidetik
  const ms = num < 100000000000 ? num * 1000 : num;
  const d = new Date(ms);
  return Number.isNaN(d.getTime()) ? null : d;
}
