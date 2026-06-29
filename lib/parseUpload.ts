/**
 * parseUpload — parse uploaded File (FormData) into array of row objects.
 * Supports: .csv, .xlsx, .xls
 *
 * Returns an array of objects keyed by the first-row headers (lowercase, trimmed).
 */

import * as XLSX from 'xlsx';

export async function parseUploadedFile(
  file: File
): Promise<Record<string, string>[]> {
  const name = file.name.toLowerCase();

  if (name.endsWith('.csv')) {
    return parseCSV(await file.text());
  }

  if (name.endsWith('.xlsx') || name.endsWith('.xls')) {
    return parseExcel(await file.arrayBuffer());
  }

  throw new Error('Format file tidak didukung. Gunakan .csv, .xlsx, atau .xls');
}

// ── CSV parser ────────────────────────────────────────────────────────────────
function parseCSV(text: string): Record<string, string>[] {
  const lines = text.replace(/\r/g, '').split('\n').filter((l) => l.trim());
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());

  return lines.slice(1).map((line) => {
    const values: string[] = [];
    let cur = '';
    let inQuote = false;
    for (const ch of line) {
      if (ch === '"') { inQuote = !inQuote; continue; }
      if (ch === ',' && !inQuote) { values.push(cur.trim()); cur = ''; continue; }
      cur += ch;
    }
    values.push(cur.trim());

    const obj: Record<string, string> = {};
    headers.forEach((h, i) => { obj[h] = values[i] ?? ''; });
    return obj;
  });
}

// ── Excel parser ──────────────────────────────────────────────────────────────
function parseExcel(buffer: ArrayBuffer): Record<string, string>[] {
  const workbook = XLSX.read(buffer, { type: 'array' });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];

  // Convert to array of arrays
  const raw: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });

  if (raw.length < 2) return [];

  const headers = (raw[0] as any[]).map((h) =>
    String(h ?? '').trim().toLowerCase()
  );

  return raw.slice(1)
    .filter((row) => row.some((cell) => String(cell ?? '').trim() !== ''))
    .map((row) => {
      const obj: Record<string, string> = {};
      headers.forEach((h, i) => {
        obj[h] = String(row[i] ?? '').trim();
      });
      return obj;
    });
}

// ── Excel template builder ────────────────────────────────────────────────────
/**
 * Build an .xlsx file buffer from a CSV-like template string.
 * The first line is headers; subsequent lines are sample data.
 */
export function buildExcelTemplate(csvContent: string): Buffer {
  const lines = csvContent.replace(/\r/g, '').split('\n').filter((l) => l.trim());
  const rows = lines.map((line) => {
    // simple split — no quoted fields in templates
    return line.split(',').map((v) => v.trim());
  });

  const ws = XLSX.utils.aoa_to_sheet(rows);

  // Auto-width columns
  const colWidths = rows[0].map((_, ci) =>
    Math.max(...rows.map((r) => String(r[ci] ?? '').length)) + 4
  );
  ws['!cols'] = colWidths.map((w) => ({ wch: w }));

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Template');

  return Buffer.from(XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' }));
}
