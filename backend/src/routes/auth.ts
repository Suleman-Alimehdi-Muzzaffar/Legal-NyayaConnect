import { Router, type IRouter } from "express";
import {
  ChangePasswordBody,
  ForgotPasswordBody,
  ForgotPasswordResponse,
  LoginBody,
  LoginResponse,
  RegisterBody,
  RegisterResponse,
} from "@workspace/api-zod";
import { createUser, createLawyerProfileForUser, ensureLawyerProfileForUser, ensurePublicLawyerEntry, findUserByEmail, findUserById, updateUserPassword, verifyPassword, type StoredUser } from "../data/store";
import { signToken, verifyToken, revokeAllForUser } from "../lib/token";

const router: IRouter = Router();

export function toUserResponse(user: StoredUser) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    city: user.city,
    state: user.state,
    avatar: user.avatar ?? null,
    dob: user.dob ?? "",
    gender: user.gender ?? "",
    street: user.street ?? "",
    pincode: user.pincode ?? "",
    language: user.language ?? "",
    communication: user.communication ?? "",
    bci: user.bci ?? "",
    experience: user.experience ?? "",
    address: user.address ?? "",
    fee: user.fee ?? "",
    bio: user.bio ?? "",
    practiceAreas: user.practiceAreas ?? [],
    languages: user.languages ?? [],
  };
}

router.post("/auth/register", async (req, res): Promise<void> => {
  const result = RegisterBody.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ error: "validation_error", message: "Invalid registration payload" });
    return;
  }
  const existing = await findUserByEmail(result.data.email);
  if (existing) {
    res.status(409).json({ error: "email_taken", message: "An account with this email already exists" });
    return;
  }
  const user = await createUser(result.data);
  if (user.role === "lawyer") {
    await createLawyerProfileForUser(user);
    await ensurePublicLawyerEntry(user);
  }
  const token = signToken(user.id);
  const data = RegisterResponse.parse({ token, user: toUserResponse(user) });
  req.log.info({ userId: user.id }, "registered user");
  res.status(201).json(data);
});

router.post("/auth/login", async (req, res): Promise<void> => {
  const result = LoginBody.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ error: "validation_error", message: "Invalid login payload" });
    return;
  }
  const user = await findUserByEmail(result.data.email);
  if (!user || !(await verifyPassword(result.data.password, user.password))) {
    res.status(401).json({ error: "invalid_credentials", message: "Invalid email or password." });
    return;
  }
  if (user.role === "lawyer") {
    await ensureLawyerProfileForUser(user);
    await ensurePublicLawyerEntry(user);
  }
  const token = signToken(user.id);
  const data = LoginResponse.parse({ token, user: toUserResponse(user) });
  req.log.info({ userId: user.id }, "logged in");
  res.json(data);
});

router.patch("/auth/password", async (req, res): Promise<void> => {
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
  const result = ChangePasswordBody.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ error: "validation_error", message: "Invalid password payload" });
    return;
  }
  if (!(await verifyPassword(result.data.currentPassword, user.password))) {
    res.status(401).json({ error: "invalid_credentials", message: "Current password is incorrect." });
    return;
  }
  await updateUserPassword(user.id, result.data.newPassword);
  req.log.info({ userId: user.id }, "password updated");
  res.json({ message: "Password updated successfully." });
});

router.post("/auth/forgot-password", (req, res) => {
  const result = ForgotPasswordBody.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ error: "validation_error", message: "Invalid payload" });
    return;
  }
  const data = ForgotPasswordResponse.parse({
    message: "If an account exists for this email, a reset link has been sent.",
  });
  res.json(data);
});

export default router;
