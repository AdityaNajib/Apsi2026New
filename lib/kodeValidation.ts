/**
 * Validasi format kode kurikulum.
 *
 * Format yang diizinkan:
 *   CPL  : CPL-{angka}          contoh: CPL-1, CPL-12
 *   PI   : I-{angka}            contoh: I-1, I-12
 *   CPMK : CPMK-{angka}         contoh: CPMK-1, CPMK-12
 */

export const KODE_PATTERNS = {
  cpl:  /^CPL-\d+$/i,
  pi:   /^I-\d+$/i,
  cpmk: /^CPMK-\d+$/i,
} as const;

export const KODE_EXAMPLES = {
  cpl:  "CPL-1",
  pi:   "I-1",
  cpmk: "CPMK-1",
} as const;

export const KODE_LABELS = {
  cpl:  "CPL",
  pi:   "PI",
  cpmk: "CPMK",
} as const;

export type KodeType = keyof typeof KODE_PATTERNS;

/**
 * Validasi kode. Return null jika valid, atau string pesan error jika tidak valid.
 */
export function validateKode(type: KodeType, kode: string): string | null {
  const trimmed = kode.trim();
  if (!trimmed) return `Kode ${KODE_LABELS[type]} tidak boleh kosong`;

  if (!KODE_PATTERNS[type].test(trimmed)) {
    return `Format kode ${KODE_LABELS[type]} tidak valid. Gunakan format: ${KODE_EXAMPLES[type]} (contoh: ${KODE_EXAMPLES[type]}, ${KODE_EXAMPLES[type].replace("1", "2")})`;
  }
  return null;
}

/**
 * Natural sort comparator untuk kode kurikulum.
 * Mengurutkan berdasarkan angka di akhir kode.
 * Contoh: CPL-1, CPL-2, ..., CPL-10 (bukan CPL-1, CPL-10, CPL-2)
 */
export function sortByKode<T extends { kode: string }>(items: T[]): T[] {
  return [...items].sort((a, b) => {
    const numA = extractTrailingNumber(a.kode);
    const numB = extractTrailingNumber(b.kode);
    if (numA !== null && numB !== null) return numA - numB;
    return a.kode.localeCompare(b.kode);
  });
}

function extractTrailingNumber(kode: string): number | null {
  const match = kode.match(/(\d+)$/);
  return match ? parseInt(match[1], 10) : null;
}
