import { Router, type IRouter, type Request, type Response, type NextFunction } from "express";
import multer from "multer";
import path from "node:path";
import { mkdirSync, existsSync, unlinkSync, createReadStream } from "node:fs";
import { fileURLToPath } from "node:url";
import { randomUUID } from "node:crypto";
import { DeleteAccountBody, UpdateAccountVisibilityBody } from "@workspace/api-zod";
import { verifyToken, revokeAllForUser } from "../lib/token";
import {
  deleteAccountData,
  findUserById,
  findUserByEmail,
  getAccountVisibility,
  updateAccountVisibility,
  updateUserAvatar,
  clearUserAvatar,
  syncLawyerDirectoryAvatar,
  updateUserProfile,
  type StoredUser,
} from "../data/store";
import { paramString } from "../lib/params";
import { toUserResponse } from "./auth";

const router: IRouter = Router();

const uploadDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../data/verification-uploads");
const avatarDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../data/avatars");
mkdirSync(avatarDir, { recursive: true });

const IMAGE_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const MAX_AVATAR_SIZE = 5 * 1024 * 1024;

const avatarUpload = multer({
  storage: multer.diskStorage({
    destination: avatarDir,
    filename: (_req, file, cb) => {
      const ext = file.originalname.includes(".") ? path.extname(file.originalname).toLowerCase() : "";
      cb(null, `${Date.now()}-${randomUUID()}${ext}`);
    },
  }),
  limits: { fileSize: MAX_AVATAR_SIZE },
  fileFilter: (_req, file, cb) => {
    if (!IMAGE_MIME_TYPES.has(file.mimetype)) {
      cb(new Error("unsupported_file_type"));
      return;
    }
    cb(null, true);
  },
});

const avatarExtToContentType: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
};

const unlinkAvatarFile = (fileName: string) => {
  const filePath = path.resolve(avatarDir, path.basename(fileName));
  if (!filePath.startsWith(avatarDir) || !existsSync(filePath)) return;
  try {
    unlinkSync(filePath);
  } catch {
    // already gone
  }
};

router.delete("/account", async (req, res): Promise<void> => {
  const auth = req.get("authorization");
  const token = auth != null && auth.startsWith("Bearer ") ? auth.slice(7).trim() : "";
  const userId = token ? verifyToken(token) : undefined;
  if (!userId) {
    res.status(401).json({ error: "unauthorized", message: "Missing or invalid session token." });
    return;
  }
  const user = await findUserById(userId);
  if (!user) {
    res.status(401).json({ error: "unauthorized", message: "Missing or invalid session token." });
    return;
  }
  const result = DeleteAccountBody.safeParse(req.body);
  if (!result.success || result.data.email !== user.email) {
    res.status(403).json({ error: "forbidden", message: "Email does not match the signed-in account." });
    return;
  }

  const { verificationFiles } = await deleteAccountData(user.email, user.role, user.id);
  for (const fileName of verificationFiles) {
    const filePath = path.resolve(uploadDir, path.basename(fileName));
    if (!filePath.startsWith(uploadDir) || !existsSync(filePath)) continue;
    try {
      unlinkSync(filePath);
    } catch {
      // already gone
    }
  }
  if (user.avatar) unlinkAvatarFile(user.avatar);

  revokeAllForUser(userId);

  req.log.info({ userId, role: user.role }, "account deleted");
  res.json({ message: "Your account and all associated data have been deleted." });
});

const bearerUser = async (
  req: Request,
  res: Response,
): Promise<{ user: StoredUser } | undefined> => {
  const auth = req.get("authorization");
  const token = auth != null && auth.startsWith("Bearer ") ? auth.slice(7).trim() : "";
  const userId = token ? verifyToken(token) : undefined;
  if (!userId) return undefined;
  const user = await findUserById(userId);
  if (!user) return undefined;
  return { user };
};

router.get("/account/visibility", async (req, res): Promise<void> => {
  const authed = await bearerUser(req, res);
  if (!authed) {
    res.status(401).json({ error: "unauthorized", message: "Missing or invalid session token." });
    return;
  }
  const visibility = await getAccountVisibility(authed.user.id);
  res.json({ visibility });
});

router.put("/account/visibility", async (req, res): Promise<void> => {
  const authed = await bearerUser(req, res);
  if (!authed) {
    res.status(401).json({ error: "unauthorized", message: "Missing or invalid session token." });
    return;
  }
  const result = UpdateAccountVisibilityBody.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ error: "invalid_payload", message: "Visibility must be public, lawyers_only, or private." });
    return;
  }
  const visibility = await updateAccountVisibility(authed.user.id, result.data.visibility);
  req.log.info({ userId: authed.user.id, visibility }, "profile visibility updated");
  res.json({ visibility });
});

router.patch("/account/profile", async (req, res): Promise<void> => {
  const authed = await bearerUser(req, res);
  if (!authed) {
    res.status(401).json({ error: "unauthorized", message: "Missing or invalid session token." });
    return;
  }
  if (typeof req.body !== "object" || req.body === null || Array.isArray(req.body)) {
    res.status(400).json({ error: "invalid_payload", message: "Profile update payload must be an object." });
    return;
  }
  const body = req.body as Record<string, unknown>;
  if (typeof body.email === "string" && body.email.trim() !== "" && body.email !== authed.user.email) {
    const taken = await findUserByEmail(body.email);
    if (taken) {
      res.status(409).json({ error: "email_taken", message: "An account with this email already exists." });
      return;
    }
  }
  const updated = await updateUserProfile(authed.user.id, body);
  if (!updated) {
    res.status(401).json({ error: "unauthorized", message: "Missing or invalid session token." });
    return;
  }
  req.log.info({ userId: authed.user.id }, "profile updated");
  res.json({ user: toUserResponse(updated) });
});

router.post("/account/avatar", avatarUpload.single("avatar"), async (req, res): Promise<void> => {
  const authed = await bearerUser(req, res);
  if (!authed) {
    if (req.file) try { unlinkSync(req.file.path); } catch {}
    res.status(401).json({ error: "unauthorized", message: "Missing or invalid session token." });
    return;
  }
  if (!req.file) {
    res.status(400).json({ error: "invalid_attachment", message: "An image file is required (field \"avatar\")." });
    return;
  }
  const { isAllowedFile } = await import("../lib/fileVerify");
  const allowed = await isAllowedFile(req.file.path, req.file.mimetype);
  if (!allowed) {
    try { unlinkSync(req.file.path); } catch {}
    res.status(400).json({ error: "invalid_attachment", message: "File content does not match declared type." });
    return;
  }
  const oldAvatar = authed.user.avatar;
  await updateUserAvatar(authed.user.id, req.file.filename);
  await syncLawyerDirectoryAvatar(authed.user.id, req.file.filename);
  if (oldAvatar) unlinkAvatarFile(oldAvatar);
  req.log.info({ userId: authed.user.id, fileName: req.file.filename }, "avatar uploaded");
  res.json({ avatar: req.file.filename });
});

router.get("/account/avatar/:fileName", (req, res): void => {
  const fileName = paramString(req.params.fileName);
  if (!fileName) {
    res.status(400).json({ error: "invalid_attachment", message: "Missing file name." });
    return;
  }
  const filePath = path.resolve(avatarDir, path.basename(fileName));
  if (!filePath.startsWith(avatarDir) || !existsSync(filePath)) {
    res.status(404).json({ error: "not_found", message: "Avatar not found." });
    return;
  }
  const ext = path.extname(fileName).toLowerCase();
  res.setHeader("Content-Type", avatarExtToContentType[ext] ?? "application/octet-stream");
  createReadStream(filePath).pipe(res);
});

router.delete("/account/avatar", async (req, res): Promise<void> => {
  const authed = await bearerUser(req, res);
  if (!authed) {
    res.status(401).json({ error: "unauthorized", message: "Missing or invalid session token." });
    return;
  }
  const oldAvatar = authed.user.avatar;
  await clearUserAvatar(authed.user.id);
  await syncLawyerDirectoryAvatar(authed.user.id, null);
  if (oldAvatar) unlinkAvatarFile(oldAvatar);
  req.log.info({ userId: authed.user.id }, "avatar removed");
  res.json({ avatar: null });
});

router.use((err: Error, _req: Request, res: Response, next: NextFunction): void => {
  if (err instanceof multer.MulterError && err.code === "LIMIT_FILE_SIZE") {
    res.status(400).json({ error: "invalid_attachment", message: "Avatar must be 5MB or smaller." });
    return;
  }
  if (err.message === "unsupported_file_type") {
    res.status(400).json({ error: "invalid_attachment", message: "Only JPG, PNG, WebP and GIF images are allowed." });
    return;
  }
  next(err);
});

export default router;
