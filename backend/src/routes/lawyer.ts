import { Router, type IRouter } from "express";
import {
  CreateLawyerAppointmentBody,
  CreateLawyerClientBody,
  GetLawyerAnalyticsResponse,
  GetLawyerDashboardResponse,
  ListLawyerAppointmentsResponse,
  ListLawyerClientsResponse,
  ListLawyerHearingsResponse,
  ListLawyerNotificationsResponse,
  ListLawyerReviewsResponse,
  UpdateLawyerAppointmentBody,
  UpdateLawyerAppointmentResponse,
} from "@workspace/api-zod";
import {
  createAppointment,
  createClient,
  createLawyerAppointment,
  findUserById,
  getAppointmentById,
  getClients,
  getHearings,
  getLawyerAnalytics,
  getLawyerAppointmentById,
  getLawyerAppointments,
  getLawyerNotifications,
  getLawyerProfile,
  getLawyerReviews,
  getReviewStats,
  getAnalyticsInsights,
  updateAppointment,
  updateLawyerAppointment,
} from "../data/store";
import { paramString } from "../lib/params";
import * as db from "@workspace/db";
import { verifyToken } from "../lib/token";
import { isChannelEnabled } from "../lib/notify";

const router: IRouter = Router();

async function bearerLawyerId(req: { get(name: string): string | undefined }): Promise<string | undefined> {
  const auth = req.get("authorization");
  const token = auth != null && auth.startsWith("Bearer ") ? auth.slice(7).trim() : "";
  const userId = token ? verifyToken(token) : undefined;
  if (!userId) return undefined;
  const user = await findUserById(userId);
  return user?.id;
}

function parsePricing(body: unknown): { fee: number; policy: string; lateFee: number } | undefined {
  if (typeof body !== "object" || body == null) return undefined;
  const { fee, policy, lateFee } = body as Record<string, unknown>;
  const feeNum = Number(fee);
  const lateFeeNum = Number(lateFee);
  if (!Number.isFinite(feeNum) || feeNum < 0) return undefined;
  if (!Number.isFinite(lateFeeNum) || lateFeeNum < 0) return undefined;
  if (typeof policy !== "string" || policy === "") return undefined;
  return { fee: feeNum, policy, lateFee: lateFeeNum };
}

router.get("/lawyer/pricing", async (req, res): Promise<void> => {
  const lawyerId = await bearerLawyerId(req);
  if (!lawyerId) {
    res.status(401).json({ error: "unauthorized", message: "Missing or invalid session token." });
    return;
  }
  const lawyer = await db.Lawyer.findOne({ id: lawyerId }).lean() as Record<string, any> | null;
  res.json({
    fee: typeof lawyer?.consultationFee === "number" ? String(lawyer.consultationFee) : "",
    policy: typeof lawyer?.cancellationPolicy === "string" ? lawyer.cancellationPolicy : "Moderate",
    lateFee: typeof lawyer?.lateCancellationFee === "number" ? String(lawyer.lateCancellationFee) : "",
  });
});

router.patch("/lawyer/pricing", async (req, res): Promise<void> => {
  const lawyerId = await bearerLawyerId(req);
  if (!lawyerId) {
    res.status(401).json({ error: "unauthorized", message: "Missing or invalid session token." });
    return;
  }
  const pricing = parsePricing(req.body);
  if (!pricing) {
    res.status(400).json({ error: "validation_error", message: "Invalid pricing payload" });
    return;
  }
  const updated = await db.Lawyer.findOneAndUpdate(
    { id: lawyerId },
    {
      $set: {
        consultationFee: pricing.fee,
        cancellationPolicy: pricing.policy,
        lateCancellationFee: pricing.lateFee,
      },
    },
    { new: true },
  ).lean() as Record<string, any> | null;
  if (!updated) {
    res.status(404).json({ error: "not_found", message: "Lawyer profile not found" });
    return;
  }
  req.log.info({ lawyerId }, "lawyer pricing updated");
  res.json({
    fee: String(pricing.fee),
    policy: pricing.policy,
    lateFee: String(pricing.lateFee),
  });
});

router.get("/lawyer/visibility", async (req, res): Promise<void> => {
  const lawyerId = await bearerLawyerId(req);
  if (!lawyerId) {
    res.status(401).json({ error: "unauthorized", message: "Missing or invalid session token." });
    return;
  }
  const lawyer = await db.Lawyer.findOne({ id: lawyerId }).lean() as Record<string, any> | null;
  const visibility = lawyer?.visibility === "private" ? "private" : "public";
  res.json({ visibility });
});

router.patch("/lawyer/visibility", async (req, res): Promise<void> => {
  const lawyerId = await bearerLawyerId(req);
  if (!lawyerId) {
    res.status(401).json({ error: "unauthorized", message: "Missing or invalid session token." });
    return;
  }
  const { visibility } = req.body as Record<string, unknown>;
  if (visibility !== "public" && visibility !== "private") {
    res.status(400).json({ error: "validation_error", message: "Visibility must be public or private." });
    return;
  }
  const updated = await db.Lawyer.findOneAndUpdate(
    { id: lawyerId },
    { $set: { visibility } },
    { new: true },
  ).lean() as Record<string, any> | null;
  if (!updated) {
    res.status(404).json({ error: "not_found", message: "Lawyer profile not found" });
    return;
  }
  req.log.info({ lawyerId, visibility }, "lawyer visibility updated");
  res.json({ visibility });
});

router.get("/lawyer/dashboard", async (_req, res): Promise<void> => {
  const data = GetLawyerDashboardResponse.parse(await getLawyerProfile());
  res.json(data);
});

router.get("/lawyer/clients", async (_req, res): Promise<void> => {
  const data = ListLawyerClientsResponse.parse(await getClients());
  res.json(data);
});

router.post("/lawyer/clients", async (req, res): Promise<void> => {
  const result = CreateLawyerClientBody.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ error: "validation_error", message: "Invalid client payload" });
    return;
  }
  const client = await createClient(result.data);
  res.status(201).json(client);
});

router.get("/lawyer/appointments", async (_req, res): Promise<void> => {
  const data = ListLawyerAppointmentsResponse.parse(await getLawyerAppointments());
  res.json(data);
});

router.post("/lawyer/appointments", async (req, res): Promise<void> => {
  const result = CreateLawyerAppointmentBody.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ error: "validation_error", message: "Invalid appointment payload" });
    return;
  }
  const { date, time } = result.data as unknown as { date?: string; time?: string };
  if (date && time) {
    const existing = await db.LawyerAppointment.findOne({ date, time, status: { $ne: "cancelled" } } as unknown as Record<string, unknown>).lean();
    if (existing) {
      res.status(409).json({ error: "slot_taken", message: "This slot is already booked." });
      return;
    }
  }
  const appointment = await createLawyerAppointment(result.data);
  // Mirror to client-facing Appointment collection so client sees the lawyer-scheduled slot and its meetLink
  void (async () => {
    try {
      const d = result.data as unknown as { date: string; time: string; duration: number; mode: string; caseType: string; notes: string; fee: number; clientName: string };
      // Try to resolve lawyer identity from Bearer token to fill lawyerName/avatar
      let lawyerName = "Advocate";
      let lawyerAvatar = "";
      let lawyerGradient = "from-slate-600 to-slate-800";
      let specialization = d.caseType ?? "General Consultation";
      const authL = req.get("authorization");
      const tL = authL?.startsWith("Bearer ") ? authL.slice(7).trim() : "";
      const uidL = tL ? (await import("../lib/token")).verifyToken(tL) : undefined;
      if (uidL) {
        const lu = await findUserById(uidL);
        if (lu) {
          const lDoc = await db.Lawyer.findOne({ id: uidL }).lean() as unknown as { name?: string; avatar?: string; avatarGradient?: string; primarySpecialization?: string } | null;
          if (lDoc?.name) lawyerName = lDoc.name;
          else if (lu.name) lawyerName = lu.name;
          if (lDoc?.avatar) lawyerAvatar = lDoc.avatar;
          if (lDoc?.avatarGradient) lawyerGradient = lDoc.avatarGradient;
          if (lDoc?.primarySpecialization) specialization = lDoc.primarySpecialization;
        }
      } else {
        // fallback: pick first lawyer
        const anyLawyer = await db.Lawyer.findOne({}).lean() as unknown as { name?: string; avatar?: string; avatarGradient?: string; primarySpecialization?: string } | null;
        if (anyLawyer?.name) lawyerName = anyLawyer.name;
        if (anyLawyer?.avatar) lawyerAvatar = anyLawyer.avatar;
        if (anyLawyer?.avatarGradient) lawyerGradient = anyLawyer.avatarGradient;
        if (anyLawyer?.primarySpecialization) specialization = anyLawyer.primarySpecialization;
      }
      const exists = await db.Appointment.findOne({ date: d.date, time: d.time, lawyerName } as unknown as Record<string, unknown>).lean();
      if (!exists) {
        await createAppointment({
          lawyerName,
          lawyerAvatar,
          lawyerGradient,
          specialization,
          date: d.date,
          time: d.time,
          duration: d.duration ?? 45,
          mode: (d.mode as "online" | "offline") ?? "online",
          caseType: d.caseType ?? "General Consultation",
          notes: d.notes ?? "",
          fee: d.fee ?? 0,
        } as unknown as never);
      }
    } catch (e) {
      req.log.error({ err: e }, "failed to mirror lawyer appointment to client");
    }
  })();
  // if client email matches a user, notify them
  void (async () => {
    try {
      const data = result.data as unknown as { clientName?: string };
      // try to find client by name or fall back to recent Client collection
      const client = await db.Client.findOne({ name: data.clientName }).lean() as { email?: string } | null;
      const email = client?.email;
      if (email) {
        const clientUser = await (await import("../data/store")).findUserByEmail(email);
        if (clientUser) {
          const { sendEmailIfEnabled } = await import("../lib/email");
          const { sendPushIfEnabled } = await import("../lib/push");
          await Promise.all([
            sendEmailIfEnabled(clientUser.id, clientUser.email, "appointment", "Appointment scheduled", `<p>Your appointment on ${(result.data as unknown as { date: string }).date} is confirmed.</p>`),
            sendPushIfEnabled(clientUser.id, "appointment", { title: "Appointment scheduled", body: `${(result.data as unknown as { date: string }).date} ${(result.data as unknown as { time: string }).time}`, url: "/dashboard/appointments" }),
          ]);
        }
      }
    } catch {}
  })();
  res.status(201).json(appointment);
});

router.patch("/lawyer/appointments/:id", async (req, res): Promise<void> => {
  const id = paramString(req.params.id);
  const result = UpdateLawyerAppointmentBody.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ error: "validation_error", message: "Invalid appointment payload" });
    return;
  }
  const updated = await updateLawyerAppointment(id, result.data);
  if (!updated) {
    res.status(404).json({ error: "not_found", message: "Appointment not found" });
    return;
  }
  const data = UpdateLawyerAppointmentResponse.parse(updated);
  res.json(data);
});

router.post("/lawyer/appointments/:id/resolve-reschedule", async (req, res): Promise<void> => {
  const auth = req.get("authorization");
  const token = auth?.startsWith("Bearer ") ? auth.slice(7).trim() : "";
  const userId = token ? verifyToken(token) : undefined;
  if (!userId) {
    res.status(401).json({ error: "unauthorized", message: "Missing or invalid session token." });
    return;
  }
  const user = await findUserById(userId);
  if (!user || user.role !== "lawyer") {
    res.status(403).json({ error: "forbidden", message: "Only lawyers can resolve reschedule requests." });
    return;
  }
  const id = paramString(req.params.id);
  const body = req.body as { action?: string; note?: string };
  const action = typeof body.action === "string" ? body.action.trim().toLowerCase() : "";
  if (action !== "approve" && action !== "reject") {
    res.status(400).json({ error: "validation_error", message: "action must be 'approve' or 'reject'" });
    return;
  }
  let appt: unknown = await getLawyerAppointmentById(id);
  let isLawyerApt = true;
  if (!appt) {
    const a = await getAppointmentById(id);
    if (a) {
      appt = a;
      isLawyerApt = false;
    }
  }
  if (!appt) {
    res.status(404).json({ error: "not_found", message: "Appointment not found" });
    return;
  }
  const ext = appt as unknown as { rescheduleRequested?: boolean; requestedDate?: string; requestedTime?: string; originalDate?: string; originalTime?: string };
  if (!ext.rescheduleRequested || !ext.requestedDate || !ext.requestedTime) {
    res.status(400).json({ error: "validation_error", message: "No pending reschedule request for this appointment." });
    return;
  }
  const note = typeof body.note === "string" ? body.note.trim().slice(0, 500) : "";
  let patch: Record<string, unknown> = {};
  if (action === "approve") {
    const lawyerName = (appt as unknown as { lawyerName?: string }).lawyerName;
    if (lawyerName) {
      const exists = await db.Appointment.findOne({ lawyerName, date: ext.requestedDate, time: ext.requestedTime, status: { $ne: "cancelled" }, id: { $ne: id } } as unknown as Record<string, unknown>).lean();
      if (exists) {
        res.status(409).json({ error: "slot_taken", message: "Requested slot is now taken." });
        return;
      }
    }
    patch = {
      date: ext.requestedDate,
      time: ext.requestedTime,
      status: "upcoming",
      rescheduleRequested: false,
      rescheduleRequestedAt: "",
      rescheduleReason: "",
      requestedDate: "",
      requestedTime: "",
      requestedBy: "",
      requestedByName: "",
      originalDate: "",
      originalTime: "",
      lastRescheduleAction: "approved",
      lastRescheduleNote: note,
    };
  } else {
    patch = {
      status: "upcoming",
      rescheduleRequested: false,
      rescheduleRequestedAt: "",
      rescheduleReason: "",
      requestedDate: "",
      requestedTime: "",
      requestedBy: "",
      requestedByName: "",
      originalDate: "",
      originalTime: "",
      lastRescheduleAction: "rejected",
      lastRescheduleNote: note,
    };
  }
  let updated: unknown = null;
  if (isLawyerApt) {
    updated = await updateLawyerAppointment(id, patch as unknown as never);
    try { await db.LawyerAppointment.updateOne({ id }, { $set: patch }); } catch {}
    try {
      const cands = await db.Appointment.find({ date: ext.originalDate ?? (appt as unknown as { date: string }).date, time: ext.originalTime ?? (appt as unknown as { time: string }).time } as unknown as Record<string, unknown>).lean();
      for (const cand of cands as unknown as Array<{ id: string }>) {
        const p2: Record<string, unknown> = { ...patch };
        if (action === "approve") { p2.date = ext.requestedDate; p2.time = ext.requestedTime; }
        await db.Appointment.updateOne({ id: cand.id }, { $set: p2 });
      }
    } catch {}
  } else {
    updated = await updateAppointment(id, patch as unknown as never);
    try { await db.Appointment.updateOne({ id }, { $set: patch }); } catch {}
    if (action === "approve") try { await db.Appointment.updateOne({ id }, { $set: { date: ext.requestedDate, time: ext.requestedTime } }); } catch {}
    try {
      const cands = await db.LawyerAppointment.find({ date: ext.originalDate ?? (appt as unknown as { date: string }).date, time: ext.originalTime ?? (appt as unknown as { time: string }).time } as unknown as Record<string, unknown>).lean();
      for (const cand of cands as unknown as Array<{ id: string }>) {
        const p2: Record<string, unknown> = { ...patch };
        if (action === "approve") { p2.date = ext.requestedDate; p2.time = ext.requestedTime; }
        await db.LawyerAppointment.updateOne({ id: cand.id }, { $set: p2 });
      }
    } catch {}
  }
  void (async () => {
    try {
      const requestedBy = (appt as unknown as { requestedBy?: string }).requestedBy;
      if (!requestedBy) return;
      const clientUser = await findUserById(requestedBy);
      if (!clientUser) return;
      const { sendEmailIfEnabled } = await import("../lib/email");
      const { sendPushIfEnabled } = await import("../lib/push");
      const title = action === "approve" ? "Reschedule approved" : "Reschedule declined";
      const msg = action === "approve"
        ? `Your request to move ${ext.originalDate} ${ext.originalTime} → ${ext.requestedDate} ${ext.requestedTime} was approved by ${user.name}.${note ? ` Note: ${note}` : ""}`
        : `Your reschedule request for ${ext.originalDate} ${ext.originalTime} was declined by ${user.name}.${note ? ` Note: ${note}` : ""}`;
      await Promise.all([
        sendEmailIfEnabled(clientUser.id, clientUser.email, "appointment", title, `<p>${msg}</p>`),
        sendPushIfEnabled(clientUser.id, "appointment", { title, body: msg.slice(0, 120), url: "/dashboard/appointments" }),
      ]);
      await db.Notification.create({
        id: `n${Date.now()}${Math.random().toString(36).slice(2, 6)}`,
        type: "appointment",
        title,
        message: msg,
        timestamp: new Date().toISOString(),
        isRead: false,
        actionLabel: "View appointments",
        actionLink: "/dashboard/appointments",
        userId: clientUser.id,
        recipientId: clientUser.id,
      } as unknown as Record<string, unknown>);
    } catch {}
  })();
  res.json(updated ?? { ...(appt as Record<string, unknown>), ...patch });
});

router.get("/lawyer/hearings", async (_req, res): Promise<void> => {
  const data = ListLawyerHearingsResponse.parse(await getHearings());
  res.json(data);
});

router.get("/lawyer/analytics", async (_req, res): Promise<void> => {
  const data = GetLawyerAnalyticsResponse.parse(await getLawyerAnalytics());
  res.json(data);
});

router.get("/lawyer/notifications", async (req, res): Promise<void> => {
  const all = await getLawyerNotifications();
  const auth = req.get("authorization");
  const token = auth != null && auth.startsWith("Bearer ") ? auth.slice(7).trim() : "";
  const userId = token ? verifyToken(token) : undefined;
  if (userId) {
    const user = await findUserById(userId);
    if (user) {
      const filtered: typeof all = [];
      for (const n of all) {
        const type = (n as unknown as { type?: string }).type ?? "";
        const emailOn = await isChannelEnabled(userId, type, "email");
        const smsOn = await isChannelEnabled(userId, type, "sms");
        if (!emailOn && !smsOn) continue;
        filtered.push(n);
      }
      const data = ListLawyerNotificationsResponse.parse(filtered);
      res.json(data);
      return;
    }
  }
  const data = ListLawyerNotificationsResponse.parse(all);
  res.json(data);
});

router.get("/lawyer/reviews", async (_req, res): Promise<void> => {
  const data = ListLawyerReviewsResponse.parse(await getLawyerReviews());
  res.json(data);
});

router.get("/lawyer/reviews/stats", async (_req, res): Promise<void> => {
  res.json(await getReviewStats());
});

router.get("/lawyer/analytics/insights", async (_req, res): Promise<void> => {
  res.json(await getAnalyticsInsights());
});

router.patch("/lawyer/availability", async (req, res): Promise<void> => {
  const { weeklyHours } = req.body;
  if (!weeklyHours || !Array.isArray(weeklyHours)) {
    res.status(400).json({ error: "validation_error", message: "Invalid weekly hours payload" });
    return;
  }
  const lawyerId = await bearerLawyerId(req);
  if (!lawyerId) {
    res.status(401).json({ error: "unauthorized", message: "Missing or invalid session token." });
    return;
  }
  const updated = await db.Lawyer.findOneAndUpdate(
    { id: lawyerId },
    { $set: { weeklyHours } },
    { new: true }
  ).lean() as Record<string, any> | null;
  if (!updated) {
    res.status(404).json({ error: "not_found", message: "Lawyer profile not found" });
    return;
  }
  try {
    const { regenerateLawyerAvailableSlots } = await import("../data/store");
    await regenerateLawyerAvailableSlots(lawyerId, weeklyHours);
  } catch {}
  res.json({ weeklyHours: updated.weeklyHours });
});

export default router;
