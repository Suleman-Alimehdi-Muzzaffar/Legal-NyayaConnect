import xss from "xss";
import type { Request, Response, NextFunction } from "express";

function cleanValue(val: unknown): unknown {
  if (typeof val === "string") {
    // xss lib escapes <script> etc., also trim
    return xss(val);
  }
  if (Array.isArray(val)) return val.map(cleanValue);
  if (val && typeof val === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(val as Record<string, unknown>)) {
      // also clean keys that could be __proto__
      const cleanKey = k.replace(/__proto__|constructor|prototype/g, "");
      out[cleanKey] = cleanValue(v);
    }
    return out;
  }
  return val;
}

export function sanitizeMiddleware(req: Request, _res: Response, next: NextFunction): void {
  if (req.body && typeof req.body === "object") {
    req.body = cleanValue(req.body) as typeof req.body;
  }
  if (req.query && typeof req.query === "object") {
    // query is read-only in Express 5? Mutate values in place
    for (const [k, v] of Object.entries(req.query as Record<string, unknown>)) {
      if (typeof v === "string") (req.query as Record<string, unknown>)[k] = xss(v);
    }
  }
  next();
}
