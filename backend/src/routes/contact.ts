import { Router, type IRouter, type Request, type Response, type NextFunction } from "express";
import multer from "multer";
import path from "node:path";
import { mkdirSync, unlinkSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { randomUUID } from "node:crypto";
import { SubmitContactBody, SubmitContactResponse } from "@workspace/api-zod";
import { createContactSubmission } from "../data/store";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const MAX_FILES = 5;
const ALLOWED_MIME_TYPES = new Set(["application/pdf", "image/jpeg"]);

const uploadDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../data/uploads");
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
  limits: { fileSize: MAX_FILE_SIZE, files: MAX_FILES },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
      cb(new Error("unsupported_file_type"));
      return;
    }
    cb(null, true);
  },
});

const router: IRouter = Router();

router.post("/contact", upload.array("files", MAX_FILES), async (req, res): Promise<void> => {
  const result = SubmitContactBody.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ error: "validation_error", message: "Invalid contact payload" });
    return;
  }

  const files = (req.files ?? []) as Express.Multer.File[];

  try {
    await createContactSubmission({
      name: result.data.name,
      email: result.data.email,
      phone: result.data.phone,
      subject: result.data.subject,
      message: result.data.message,
      attachments: files.map((file) => ({
        name: file.originalname,
        size: file.size,
        type: file.mimetype,
        storedPath: file.path,
      })),
    });
  } catch (err) {
    for (const file of files) {
      unlinkSync(file.path);
    }
    throw err;
  }

  req.log.info(
    { email: result.data.email, attachmentCount: files.length },
    "contact form submitted",
  );

  const data = SubmitContactResponse.parse({
    message: "Your message has been received. Our team will get back to you shortly.",
  });
  res.status(201).json(data);
});

router.use((err: Error, _req: Request, res: Response, next: NextFunction): void => {
  if (err instanceof multer.MulterError) {
    const message =
      err.code === "LIMIT_FILE_SIZE"
        ? "Each file must be 5MB or smaller."
        : err.code === "LIMIT_FILE_COUNT"
          ? `You can attach up to ${MAX_FILES} files.`
          : "File upload failed. Please try again.";
    res.status(400).json({ error: "invalid_attachment", message });
    return;
  }
  if (err.message === "unsupported_file_type") {
    res.status(400).json({ error: "invalid_attachment", message: "Only PDF and JPG files are allowed." });
    return;
  }
  next(err);
});

export default router;
