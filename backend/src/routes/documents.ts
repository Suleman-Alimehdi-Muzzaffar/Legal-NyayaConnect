import { Router, type IRouter, type Request, type Response, type NextFunction } from "express";
import multer from "multer";
import path from "node:path";
import { mkdirSync, existsSync, createReadStream, unlinkSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { randomUUID } from "node:crypto";
import {
  CreateDocumentBody,
  ListDocumentsResponse,
  UpdateDocumentBody,
  UpdateDocumentResponse,
} from "@workspace/api-zod";
import { verifyToken } from "../lib/token";
import {
  addDocumentComment,
  attachDocumentFile,
  createDocument,
  findUserById,
  getDocumentComments,
  deleteDocument,
  getDocumentById,
  getDocuments,
  updateDocument,
} from "../data/store";
import { paramString } from "../lib/params";
import { bearerUserOptional } from "../lib/admin";

const MAX_FILE_SIZE = 25 * 1024 * 1024;
const ALLOWED_FILE_TYPES = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/octet-stream",
]);

const uploadDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../data/document-uploads");
mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (_req, file, cb) => {
    const ext = file.originalname.includes(".") ? path.extname(file.originalname).toLowerCase() : "";
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

router.get("/documents", async (req, res): Promise<void> => {
  const user = await bearerUserOptional(req);
  if (!user) {
    res.status(401).json({ error: "unauthorized", message: "Login required." });
    return;
  }
  const data = ListDocumentsResponse.parse(await getDocuments());
  res.json(data);
});

router.post("/documents", async (req, res): Promise<void> => {
  const result = CreateDocumentBody.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ error: "validation_error", message: "Invalid document payload" });
    return;
  }
  // Capture uploader from Bearer token if present (client portal profile uploads)
  let uploadedBy: { id: string; name: string } | undefined;
  const auth = req.get("authorization");
  const tok = auth?.startsWith("Bearer ") ? auth.slice(7).trim() : "";
  const uid = tok ? verifyToken(tok) : undefined;
  if (uid) {
    const u = await findUserById(uid);
    if (u) uploadedBy = { id: u.id, name: u.name };
  }
  const document = await createDocument(result.data, uploadedBy);
  res.status(201).json(document);
});

router.post(
  "/documents/:id/file",
  upload.single("file"),
  async (req, res): Promise<void> => {
    const id = paramString(req.params.id);
    const document = id ? await getDocumentById(id) : undefined;
    if (!document) {
      if (req.file) {
        try {
          unlinkSync(req.file.path);
        } catch {
          // already gone
        }
      }
      res.status(404).json({ error: "not_found", message: "Document not found" });
      return;
    }
    if (!req.file) {
      res.status(400).json({ error: "validation_error", message: "A file is required." });
      return;
    }
    const updated = await attachDocumentFile(id, req.file.filename);
    req.log.info({ documentId: id, fileName: req.file.filename }, "document file uploaded");
    res.status(200).json(updated);
  },
);

router.get("/documents/:id/file", async (req, res): Promise<void> => {
  const id = paramString(req.params.id);
  const doc = id ? await getDocumentById(id) : undefined;
  if (!doc || typeof (doc as unknown as { fileName?: string }).fileName !== "string") {
    res.status(404).json({ error: "not_found", message: "Document file not found" });
    return;
  }
  // Expiring share check: if document has shareExpiresAt and token required, enforce
  const shareToken = typeof req.query.token === "string" ? (req.query.token as string) : undefined;
  const storedToken = (doc as unknown as { shareToken?: string }).shareToken;
  const expiresAt = (doc as unknown as { shareExpiresAt?: string }).shareExpiresAt;
  if (storedToken) {
    if (expiresAt && new Date(expiresAt).getTime() < Date.now()) {
      res.status(410).json({ error: "expired", message: "Share link has expired." });
      return;
    }
    if (!shareToken || shareToken !== storedToken) {
      res.status(403).json({ error: "forbidden", message: "Valid share token required." });
      return;
    }
  }
  const filePath = path.resolve(uploadDir, path.basename((doc as unknown as { fileName: string }).fileName));
  if (!filePath.startsWith(uploadDir) || !existsSync(filePath)) {
    res.status(404).json({ error: "not_found", message: "Document file not found" });
    return;
  }
  const ext = path.extname(filePath).toLowerCase();
  const contentType =
    ext === ".pdf"
      ? "application/pdf"
      : ext === ".png"
        ? "image/png"
        : ext === ".jpg" || ext === ".jpeg"
          ? "image/jpeg"
          : "application/octet-stream";
  res.setHeader("Content-Type", contentType);
  res.setHeader("Content-Disposition", "inline");
  createReadStream(filePath).pipe(res);
});

router.post("/documents/:id/share", async (req, res): Promise<void> => {
  const id = paramString(req.params.id);
  const doc = id ? await getDocumentById(id) : undefined;
  if (!doc) {
    res.status(404).json({ error: "not_found", message: "Document not found" });
    return;
  }
  const expiresInHours = typeof req.body?.expiresInHours === "number" ? Math.max(1, Math.min(720, req.body.expiresInHours)) : 24;
  const token = randomUUID();
  const expiresAt = new Date(Date.now() + expiresInHours * 3600 * 1000).toISOString();
  const updated = await updateDocument(id, { shareToken: token, shareExpiresAt: expiresAt } as unknown as never);
  res.json({ shareUrl: `/api/documents/${id}/file?token=${token}`, shareToken: token, shareExpiresAt: expiresAt, document: updated });
});

router.post("/documents/:id/sign", async (req, res): Promise<void> => {
  const id = paramString(req.params.id);
  const doc = id ? await getDocumentById(id) : undefined;
  if (!doc) {
    res.status(404).json({ error: "not_found", message: "Document not found" });
    return;
  }
  const signature = typeof req.body?.signature === "string" ? req.body.signature.slice(0, 200000) : "";
  if (!signature.startsWith("data:image/")) {
    res.status(400).json({ error: "validation_error", message: "signature must be a data:image/* base64 string" });
    return;
  }
  const updated = await updateDocument(id, { signed: true, signature, signedAt: new Date().toISOString() } as unknown as never);
  res.json({ message: "Document signed", document: updated });
});

router.post("/documents/:id/comment", async (req, res): Promise<void> => {
  const auth = req.get("authorization");
  const token = auth?.startsWith("Bearer ") ? auth.slice(7).trim() : "";
  const userId = token ? verifyToken(token) : undefined;
  if (!userId) {
    res.status(401).json({ error: "unauthorized", message: "Missing or invalid session token." });
    return;
  }
  const user = await findUserById(userId);
  if (!user) {
    res.status(401).json({ error: "unauthorized" });
    return;
  }
  const id = paramString(req.params.id);
  const text = typeof req.body?.text === "string" ? req.body.text.trim() : "";
  if (!text || text.length > 1000) {
    res.status(400).json({ error: "validation_error", message: "Comment text 1-1000 chars required" });
    return;
  }
  const comment = { id: `c${Date.now()}`, text, author: user.name, authorRole: user.role, createdAt: new Date().toISOString() };
  await addDocumentComment(id, comment);
  res.status(201).json(comment);
});

router.get("/documents/:id/comments", async (req, res): Promise<void> => {
  const id = paramString(req.params.id);
  const comments = await getDocumentComments(id);
  res.json(comments);
});

router.get("/documents/:id/versions", async (req, res): Promise<void> => {
  const id = paramString(req.params.id);
  const doc = (await getDocumentById(id)) as unknown as { versions?: Array<{ fileName: string; replacedAt: string }> } | undefined;
  res.json((doc?.versions as unknown[]) ?? []);
});

router.post("/documents/:id/summarize", async (req, res): Promise<void> => {
  const id = paramString(req.params.id);
  const doc = (await getDocumentById(id)) as unknown as { fileName?: string } | undefined;
  if (!doc?.fileName) {
    res.status(404).json({ error: "not_found", message: "Document file not found" });
    return;
  }
  const filePath = path.resolve(uploadDir, path.basename(doc.fileName));
  if (!filePath.startsWith(uploadDir) || !existsSync(filePath)) {
    res.status(404).json({ error: "not_found", message: "File missing on disk" });
    return;
  }
  try {
    const { extractText } = await import("../lib/ocr");
    const text = await extractText(filePath);
    if (!text || text.trim().length < 20) {
      res.json({ summary: "Not enough text to summarize. Try uploading a text-based PDF.", fallback: true });
      return;
    }
    const apiKey = process.env.GEMINI_API_KEY?.replace(/^"(.*)"$/, "$1").trim();
    if (!apiKey) {
      // keyword fallback summary — first 500 chars
      const preview = text.slice(0, 600);
      const bullets = preview.split(/\n|。|\./).filter(Boolean).slice(0, 4).map((s) => `• ${s.trim().slice(0, 120)}`);
      res.json({ summary: `Key excerpts:\n${bullets.join("\n")}\n\n(Full ${text.length} chars, enable GEMINI_API_KEY for AI summary)`, fallback: true, length: text.length });
      return;
    }
    const model = (process.env.GEMINI_MODEL ?? "gemini-3.6-flash").replace(/^"(.*)"$/, "$1").trim();
    const prompt = `Summarize this legal document in 5 bullet points and one sentence risk note. Keep under 180 words:\n\n${text.slice(0, 3500)}`;
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;
    const r = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ contents: [{ role: "user", parts: [{ text: prompt }] }], generationConfig: { temperature: 0.3, maxOutputTokens: 800 } }) });
    const data = (await r.json()) as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> };
    const summary = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    if (!summary) {
      res.status(502).json({ error: "provider_error", message: "AI summary failed" });
      return;
    }
    // cache summary on doc
    await updateDocument(id, { aiSummary: summary, aiSummaryAt: new Date().toISOString() } as unknown as never);
    res.json({ summary, fallback: false, length: text.length });
  } catch (err) {
    req.log.error({ err, id }, "document summarize failed");
    res.status(500).json({ error: "internal", message: "Failed to summarize" });
  }
});

router.post("/documents/:id/verify", async (req, res): Promise<void> => {
  const auth = req.get("authorization");
  const token = auth?.startsWith("Bearer ") ? auth.slice(7).trim() : "";
  const userId = token ? verifyToken(token) : undefined;
  if (!userId) {
    res.status(401).json({ error: "unauthorized", message: "Missing or invalid session token." });
    return;
  }
  const user = await findUserById(userId);
  if (!user) {
    res.status(401).json({ error: "unauthorized", message: "User not found." });
    return;
  }
  if (user.role !== "lawyer") {
    res.status(403).json({ error: "forbidden", message: "Only lawyers can verify documents." });
    return;
  }

  const id = paramString(req.params.id);
  const body = req.body as { status?: string; note?: string; reviewNote?: string };
  const rawStatus = typeof body.status === "string" ? body.status.trim() : "";
  const allowed = new Set(["reviewed", "approved", "rejected", "pending_review"]);
  if (!allowed.has(rawStatus)) {
    res.status(400).json({ error: "validation_error", message: "status must be one of: reviewed, approved, rejected, pending_review" });
    return;
  }
  let doc = await getDocumentById(id);
  // Robust fallback: some older docs may be queried by _id or id mismatch — try direct DB lookup
  if (!doc) {
    try {
      const alt = await (await import("@workspace/db")).Document.findOne({ $or: [{ id }, { _id: id as unknown as never }] } as unknown as Record<string, unknown>).lean();
      if (alt) doc = alt as unknown as typeof doc;
    } catch {}
  }
  if (!doc) {
    res.status(404).json({ error: "not_found", message: `Document not found (id: ${id})` });
    return;
  }

  const note = typeof body.note === "string" ? body.note.trim().slice(0, 1000) : typeof body.reviewNote === "string" ? body.reviewNote.trim().slice(0, 1000) : "";
  const patch: Record<string, unknown> = {
    status: rawStatus,
    verifiedBy: user.id,
    verifiedByName: user.name,
    verifiedAt: new Date().toISOString(),
    reviewNote: note,
    lawyerName: user.name,
  };
  // keep strict:false fields; also update via generic updateDocument for zod compatibility
  const updated = await updateDocument(id, patch as unknown as never);
  // Ensure audit fields are persisted even if zod filtered them
  try {
    await (await import("@workspace/db")).Document.updateOne({ id }, { $set: patch });
  } catch {
    // ignore
  }

  // Notify uploader (client) if we know who uploaded
  try {
    const uploadedById = (doc as unknown as { uploadedBy?: string }).uploadedBy;
    const uploadedByName = (doc as unknown as { uploadedByName?: string }).uploadedByName;
    if (uploadedById) {
      const titleByStatus: Record<string, string> = {
        reviewed: "Document reviewed",
        approved: "Document approved",
        rejected: "Document needs changes",
        pending_review: "Document pending review",
      };
      const messageByStatus: Record<string, string> = {
        reviewed: `${user.name} reviewed your document “${doc.name}”.`,
        approved: `${user.name} approved your document “${doc.name}” — ready for filing.`,
        rejected: `${user.name} requested changes for “${doc.name}”${note ? `: ${note}` : "."}`,
        pending_review: `${user.name} marked “${doc.name}” as pending review.`,
      };
      const notif = {
        id: `n${Date.now()}${Math.random().toString(36).slice(2, 6)}`,
        type: "document" as const,
        title: titleByStatus[rawStatus] ?? "Document update",
        message: messageByStatus[rawStatus] ?? `Your document “${doc.name}” was updated to ${rawStatus}.`,
        timestamp: new Date().toISOString(),
        isRead: false,
        actionLabel: "View document",
        actionLink: "/dashboard/documents",
      };
      // Store notification generically; client notification list is global but filtered client-side by isRead etc.
      // We also store uploadedBy for future per-user filtering (strict:false)
      await (await import("@workspace/db")).Notification.create({ ...notif, userId: uploadedById, recipientId: uploadedById } as unknown as Record<string, unknown>);
      // Also try push/email if enabled (best effort)
      try {
        const uploader = await findUserById(uploadedById);
        if (uploader) {
          const { sendEmailIfEnabled } = await import("../lib/email");
          const { sendPushIfEnabled } = await import("../lib/push");
          await Promise.all([
            sendEmailIfEnabled(uploader.id, uploader.email, "document", notif.title, `<p>${notif.message}</p>${note ? `<p>Note: ${note}</p>` : ""}`),
            sendPushIfEnabled(uploader.id, "document", { title: notif.title, body: notif.message, url: "/dashboard/documents" }),
          ]);
        }
      } catch {}
      req.log.info({ documentId: id, uploadedBy: uploadedById, status: rawStatus }, "client notified of document verification");
    } else if (uploadedByName) {
      req.log.info({ documentId: id, uploadedByName, status: rawStatus }, "document verified but no uploadedBy id to notify");
    }
  } catch (e) {
    req.log.error({ err: e, documentId: id }, "failed to notify client of document verification");
  }

  req.log.info({ documentId: id, verifiedBy: user.id, status: rawStatus }, "document verified by lawyer");
  // return fresh doc
  const fresh = await getDocumentById(id);
  res.json(fresh ?? updated);
});

router.patch("/documents/:id", async (req, res): Promise<void> => {
  const id = paramString(req.params.id);
  const result = UpdateDocumentBody.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ error: "validation_error", message: "Invalid document payload" });
    return;
  }
  // If client tries to change status, require lawyer role
  const patchStatus = (result.data as unknown as { status?: string }).status;
  if (patchStatus) {
    const auth = req.get("authorization");
    const token = auth?.startsWith("Bearer ") ? auth.slice(7).trim() : "";
    const userId = token ? verifyToken(token) : undefined;
    const user = userId ? await findUserById(userId) : undefined;
    if (!user || user.role !== "lawyer") {
      res.status(403).json({ error: "forbidden", message: "Only lawyers can change document status. Use POST /documents/:id/verify." });
      return;
    }
    // add audit fields for PATCH as well (supports fallback from old verify UI)
    (result.data as unknown as Record<string, unknown>).verifiedBy = user.id;
    (result.data as unknown as Record<string, unknown>).verifiedByName = user.name;
    (result.data as unknown as Record<string, unknown>).verifiedAt = new Date().toISOString();
    const rawBody = req.body as { note?: string; reviewNote?: string };
    const note = typeof rawBody.note === "string" ? rawBody.note.trim().slice(0, 1000) : typeof rawBody.reviewNote === "string" ? rawBody.reviewNote.trim().slice(0, 1000) : "";
    if (note) (result.data as unknown as Record<string, unknown>).reviewNote = note;
    // keep lawyerName in sync
    (result.data as unknown as Record<string, unknown>).lawyerName = user.name;
  }
  const updated = await updateDocument(id, result.data);
  // Ensure custom audit fields (reviewNote etc.) are persisted even if zod stripped them
  if (patchStatus) {
    try {
      const rawBody = req.body as { note?: string; reviewNote?: string };
      const note = typeof rawBody.note === "string" ? rawBody.note.trim().slice(0, 1000) : typeof rawBody.reviewNote === "string" ? rawBody.reviewNote.trim().slice(0, 1000) : "";
      if (note) await (await import("@workspace/db")).Document.updateOne({ id }, { $set: { reviewNote: note } });
    } catch {}
  }
  if (!updated) {
    res.status(404).json({ error: "not_found", message: "Document not found" });
    return;
  }
  const data = UpdateDocumentResponse.parse(updated);
  res.json(data);
});

router.delete("/documents/:id", async (req, res): Promise<void> => {
  const id = paramString(req.params.id);
  const document = id ? await getDocumentById(id) : undefined;
  const deleted = await deleteDocument(id);
  if (!deleted) {
    res.status(404).json({ error: "not_found", message: "Document not found" });
    return;
  }
  if (document && typeof document.fileName === "string") {
    const filePath = path.resolve(uploadDir, path.basename(document.fileName));
    if (filePath.startsWith(uploadDir) && existsSync(filePath)) {
      try {
        unlinkSync(filePath);
      } catch {
        // already gone
      }
    }
  }
  res.status(204).end();
});

router.use((err: Error, _req: Request, res: Response, next: NextFunction): void => {
  if (err instanceof multer.MulterError) {
    const message =
      err.code === "LIMIT_FILE_SIZE"
        ? "Each file must be 25MB or smaller."
        : "File upload failed. Please try again.";
    res.status(400).json({ error: "invalid_attachment", message });
    return;
  }
  if (err.message === "unsupported_file_type") {
    res.status(400).json({ error: "invalid_attachment", message: "Only PDF, DOC, DOCX, JPG and PNG files are allowed." });
    return;
  }
  next(err);
});

export default router;