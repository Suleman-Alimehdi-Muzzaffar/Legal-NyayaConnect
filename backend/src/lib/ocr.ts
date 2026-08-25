import { readFile } from "node:fs/promises";
import { extname } from "node:path";

export async function extractText(filePath: string): Promise<string> {
  const ext = extname(filePath).toLowerCase();
  try {
    if (ext === ".pdf") {
      const data = await readFile(filePath);
      const mod = (await import("pdf-parse")) as unknown as { default?: (buf: Buffer) => Promise<{ text: string }>; (buf: Buffer): Promise<{ text: string }> };
      const pdfParse = (mod.default ?? mod) as (buf: Buffer) => Promise<{ text: string }>;
      const res = await pdfParse(data);
      return res.text.slice(0, 4000);
    }
    if (ext === ".jpg" || ext === ".jpeg" || ext === ".png") {
      // Lightweight: for images we return placeholder; full OCR would use tesseract.js
      // To keep bundle small, we just return filename hint and let admin verify visually.
      return `[Image ${ext} — OCR skipped, verify visually. File: ${filePath.split("/").pop()}]`;
    }
  } catch {}
  return "";
}

export function findBci(text: string): string | null {
  const m = text.match(/BCI[\s-]*([A-Z0-9\/-]{5,20})/i) ?? text.match(/\b\d{4,6}\b/);
  return m ? m[1] ?? m[0] : null;
}
