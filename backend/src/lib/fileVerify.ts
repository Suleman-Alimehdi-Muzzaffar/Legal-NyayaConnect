import { readFile } from "node:fs/promises";
import { fileTypeFromBuffer } from "file-type";

const ALLOWED_BY_MIME: Record<string, string[]> = {
  "application/pdf": ["pdf"],
  "image/jpeg": ["jpg", "jpeg"],
  "image/png": ["png"],
  "image/webp": ["webp"],
  "image/gif": ["gif"],
};

export async function isAllowedFile(filePath: string, declaredMime: string): Promise<boolean> {
  try {
    const buffer = await readFile(filePath);
    const type = await fileTypeFromBuffer(buffer);
    if (!type) return false;
    const allowedExts = ALLOWED_BY_MIME[declaredMime];
    if (allowedExts && allowedExts.includes(type.ext)) return true;
    // also allow if detected mime matches declared mime
    return type.mime === declaredMime;
  } catch {
    return false;
  }
}
