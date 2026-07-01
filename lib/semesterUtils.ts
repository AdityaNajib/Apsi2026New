/**
 * Menentukan semester aktif berdasarkan bulan berjalan:
 * - Februari (2) s.d. Juli (7)  → Genap
 * - Agustus (8) s.d. Januari (1) → Ganjil
 */
export function getActiveSemester(): 'Genap' | 'Ganjil' {
  const month = new Date().getMonth() + 1; // 1-12
  return month >= 2 && month <= 7 ? 'Genap' : 'Ganjil';
}
