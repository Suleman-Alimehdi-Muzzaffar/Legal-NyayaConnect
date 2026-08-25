import { Router, type IRouter, type Request, type Response, type NextFunction } from "express";
import multer from "multer";
import path from "node:path";
import { mkdirSync, existsSync, createReadStream, unlinkSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { randomUUID } from "node:crypto";
import { GetVerificationStatusResponse, ReviewVerificationBody } from "@workspace/api-zod";
import * as db from "@workspace/db";
import {
  createVerification,
  deleteVerification,
  getVerificationByEmail,
  getVerificationById,
  getVerifications,
  updateVerificationStatus,
} from "../data/store";
import { paramString } from "../lib/params";
import { logAudit } from "../lib/audit";
import { isAllowedFile } from "../lib/fileVerify";
import { requireAdmin, bearerUserOptional } from "../lib/admin";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const MAX_DOCUMENTS = 3;
const ALLOWED_FILE_TYPES = new Set(["application/pdf", "image/jpeg", "image/png"]);

const uploadDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../data/verification-uploads");
mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (_req, file, cb) => {
    const ext = file.originalname.includes(".") ? path.extname(file.originalname) : "";
    cb(null, `${Date.now()}-${randomUUID()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_FILE_TYPES.has(file.mimetype)) {
      cb(new Error("unsupported_file_type"));
      return;
    }
    cb(null, true);
  },
});

const router: IRouter = Router();

function toVerificationFile(file: Express.Multer.File) {
  return {
    name: file.originalname,
    fileName: file.filename,
    size: file.size,
    type: file.mimetype,
  };
}

router.post(
  "/verification",
  upload.fields([
    { name: "selfie", maxCount: 1 },
    { name: "documents", maxCount: MAX_DOCUMENTS },
  ]),
  async (req, res): Promise<void> => {
    const name = typeof req.body.name === "string" ? req.body.name.trim() : "";
    const email = typeof req.body.email === "string" ? req.body.email.trim() : "";
    const bciNumber = typeof req.body.bciNumber === "string" ? req.body.bciNumber.trim() : "";
    if (!name || !email || !bciNumber) {
      res.status(400).json({ error: "validation_error", message: "name, email and bciNumber are required." });
      return;
    }

    const uploaded = req.files as { selfie?: Express.Multer.File[]; documents?: Express.Multer.File[] } | undefined;
    const selfie = uploaded?.selfie?.[0];
    const documents = uploaded?.documents ?? [];
    if (!selfie || documents.length === 0) {
      for (const f of [selfie, ...documents].filter(Boolean) as Express.Multer.File[]) try { unlinkSync(f.path); } catch {}
      res.status(400).json({ error: "validation_error", message: "A selfie and at least one document are required." });
      return;
    }
    // magic-byte verification
    for (const f of [selfie, ...documents]) {
      if (!(await isAllowedFile(f.path, f.mimetype))) {
        for (const x of [selfie, ...documents]) try { unlinkSync(x.path); } catch {}
        res.status(400).json({ error: "invalid_attachment", message: `File ${f.originalname} content does not match its type.` });
        return;
      }
    }

    const existing = await getVerificationByEmail(email);
    if (existing && existing.status !== "rejected") {
      res.status(409).json({
        error: "already_submitted",
        message: "A verification request is already pending or approved for this email.",
      });
      return;
    }
    if (existing) {
      for (const file of [existing.selfie, ...existing.documents]) {
        if (file == null || typeof file.fileName !== "string") continue;
        const oldPath = path.resolve(uploadDir, path.basename(file.fileName));
        try {
          unlinkSync(oldPath);
        } catch {
          // already gone
        }
      }
      await deleteVerification(existing.id);
    }

    let verificationId = "";
    try {
      const created = await createVerification({
        email,
        name,
        bciNumber,
        selfie: toVerificationFile(selfie),
        documents: documents.map(toVerificationFile),
      });
      verificationId = (created as unknown as { id?: string }).id ?? "";
      // Auto-OCR: extract text from PDFs/images for admin helper (non-blocking)
      try {
        const { extractText, findBci } = await import("../lib/ocr");
        const texts = await Promise.all([selfie, ...documents].map((f) => extractText(f.path)));
        const combined = texts.join("\n");
        const bciFound = findBci(combined);
        const ocrHint = bciFound ? `BCI hint: ${bciFound}` : "No BCI pattern found";
        if (verificationId) {
          await db.Verification.updateOne(
            { id: verificationId },
            { $set: { ocrText: combined.slice(0, 2000), ocrBciHint: ocrHint } }
          );
        }
        req.log.info({ verificationId, ocrHint }, "verification OCR done");
      } catch {}
    } catch (err) {
      for (const file of [selfie, ...documents]) {
        try {
          unlinkSync(file.path);
        } catch {
          // already gone
        }
      }
      throw err;
    }

    req.log.info({ email, documentCount: documents.length, verificationId }, "lawyer verification submitted");

    const status = await getVerificationByEmail(email);
    res.status(201).json(GetVerificationStatusResponse.parse(status));
  },
);

router.get("/verification/status", async (req, res): Promise<void> => {
  const email = typeof req.query.email === "string" ? req.query.email.trim() : "";
  if (!email) {
    res.status(400).json({ error: "validation_error", message: "email query parameter is required." });
    return;
  }
  const found = await getVerificationByEmail(email);
  if (!found) {
    res.status(404).json({ error: "not_found", message: "No verification request found for this email." });
    return;
  }
  res.json(GetVerificationStatusResponse.parse(found));
});

router.get("/verification/files/:fileName", async (req, res) => {
  const user = await bearerUserOptional(req);
  if (!user) {
    res.status(401).json({ error: "unauthorized", message: "Login required." });
    return;
  }
  const fileName = paramString(req.params.fileName);
  const filePath = path.resolve(uploadDir, path.basename(fileName));
  if (!fileName || !filePath.startsWith(uploadDir) || !existsSync(filePath)) {
    res.status(404).json({ error: "not_found", message: "File not found." });
    return;
  }
  const ext = path.extname(filePath).toLowerCase();
  const contentType = ext === ".pdf" ? "application/pdf" : ext === ".png" ? "image/png" : "image/jpeg";
  res.setHeader("Content-Type", contentType);
  res.setHeader("Content-Disposition", "inline");
  createReadStream(filePath).pipe(res);
});

router.get("/admin/verifications", async (req, res): Promise<void> => {
  if (!requireAdmin(req, res)) return;
  const all = await getVerifications();
  res.json(all.map((v) => GetVerificationStatusResponse.parse(v)));
});

router.post("/admin/verifications/:id/review", async (req, res): Promise<void> => {
  if (!requireAdmin(req, res)) return;
  const id = paramString(req.params.id);
  if (!id) {
    res.status(400).json({ error: "validation_error", message: "Verification id is required." });
    return;
  }
  const result = ReviewVerificationBody.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ error: "validation_error", message: "Invalid review payload" });
    return;
  }
  const found = await getVerificationById(id);
  if (!found) {
    res.status(404).json({ error: "not_found", message: "Verification request not found." });
    return;
  }
  const updated = await updateVerificationStatus(id, {
    status: result.data.status,
    reason: result.data.note,
  });
  req.log.info({ verificationId: id, status: result.data.status }, "verification reviewed");
  await logAudit({ actor: "admin", actorRole: "admin", action: `verification:${result.data.status}`, targetId: id, details: { note: result.data.note }, ip: req.ip });
  res.json(GetVerificationStatusResponse.parse(updated));
});

router.use((err: Error, _req: Request, res: Response, next: NextFunction): void => {
  if (err instanceof multer.MulterError) {
    const message =
      err.code === "LIMIT_FILE_SIZE"
        ? "Each file must be 5MB or smaller."
        : err.code === "LIMIT_FILE_COUNT"
          ? `You can upload up to ${MAX_DOCUMENTS} documents.`
          : "File upload failed. Please try again.";
    res.status(400).json({ error: "invalid_attachment", message });
    return;
  }
  if (err.message === "unsupported_file_type") {
    res.status(400).json({ error: "invalid_attachment", message: "Only PDF, JPG and PNG files are allowed." });
    return;
  }
  next(err);
});

export default router;