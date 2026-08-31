import { Router, type IRouter } from "express";
import {
  CreateAppointmentBody,
  CreateAppointmentMeetBody,
  CreateAppointmentMeetResponse,
  ListAppointmentsResponse,
  UpdateAppointmentBody,
  UpdateAppointmentResponse,
} from "@workspace/api-zod";
import {
  createAppointment,
  createLawyerAppointment,
  findUserById,
  getAppointmentById,
  getAppointments,
  getLawyerAppointmentById,
  updateAppointment,
  updateLawyerAppointment,
} from "../data/store";
import { verifyToken } from "../lib/token";
import {
  addMinutesOffset,
  createMeetLink,
  hasGoogleTokens,
  isGoogleConfigured,
  toDateTimeOffset,
} from "../lib/google-meet";
import { paramString } from "../lib/params";
import * as db from "@workspace/db";
import { bearerUserOptional } from "../lib/admin";

const router: IRouter = Router();

router.get("/appointments", async (req, res): Promise<void> => {
  const user = await bearerUserOptional(req);
  if (!user) {
    res.status(401).json({ error: "unauthorized", message: "Login required." });
    return;
  }
  const data = ListAppointmentsResponse.parse(await getAppointments());
  res.json(data);
});

router.post("/appointments", async (req, res): Promise<void> => {
  const user = await bearerUserOptional(req);
  if (!user) {
    res.status(401).json({ error: "unauthorized", message: "Login required." });
    return;
  }
  const result = CreateAppointmentBody.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ error: "validation_error", message: "Invalid appointment payload" });
    return;
  }
  const { lawyerName, date, time, mode: reqMode } = result.data as unknown as { lawyerName?: string; date?: string; time?: string; mode?: string };
  if (lawyerName && date && time) {
    // Validate against lawyer's weekly availability (IST) if lawyer exists
    try {
      const lawyer = await db.Lawyer.findOne({ name: lawyerName }).lean() as unknown as { name: string; availability?: string; weeklyHours?: Array<{ day: string; active: boolean; start: string; end: string }> } | null;
      if (lawyer) {
        const DEFAULT_WEEKLY = [
          { day: "Monday", active: true, start: "09:00", end: "17:00" },
          { day: "Tuesday", active: true, start: "09:00", end: "17:00" },
          { day: "Wednesday", active: true, start: "09:00", end: "17:00" },
          { day: "Thursday", active: true, start: "09:00", end: "17:00" },
          { day: "Friday", active: true, start: "09:00", end: "17:00" },
          { day: "Saturday", active: true, start: "10:00", end: "14:00" },
          { day: "Sunday", active: false, start: "10:00", end: "14:00" },
        ];
        const wh = lawyer.weeklyHours && lawyer.weeklyHours.length > 0 ? lawyer.weeklyHours : DEFAULT_WEEKLY;
        const dayName = (() => {
          const d = new Date(`${date}T12:00:00+05:30`);
          return Number.isNaN(d.getTime()) ? "" : d.toLocaleDateString("en-US", { weekday: "long", timeZone: "Asia/Kolkata" });
        })();
        const cfg = wh.find((h) => h.day === dayName);
        if (!cfg || !cfg.active) {
          res.status(400).json({ error: "unavailable", message: "Lawyer is not available on this date." });
          return;
        }
        const pad2 = (n: number) => n.toString().padStart(2, "0");
        const [sh, sm] = cfg.start.split(":").map(Number);
        const [eh, em] = cfg.end.split(":").map(Number);
        const startM = (Number.isFinite(sh) ? sh : 0) * 60 + (Number.isFinite(sm) ? sm : 0);
        const endM = (Number.isFinite(eh) ? eh : 0) * 60 + (Number.isFinite(em) ? em : 0);
        const valid: string[] = [];
        for (let t = startM; t + 45 <= endM; t += 45) valid.push(`${pad2(Math.floor(t / 60))}:${pad2(t % 60)}`);
        if (!valid.includes(time)) {
          res.status(400).json({ error: "unavailable", message: "Selected time is outside lawyer's working hours." });
          return;
        }
        const todayStr = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
        if (date === todayStr) {
          const fmt = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Kolkata", hour: "2-digit", minute: "2-digit", hour12: false });
          const parts = fmt.formatToParts(new Date());
          const nowM = Number(parts.find((p) => p.type === "hour")?.value ?? "0") * 60 + Number(parts.find((p) => p.type === "minute")?.value ?? "0");
          const [h, m] = time.split(":").map(Number);
          if (h * 60 + m <= nowM + 15) {
            res.status(400).json({ error: "unavailable", message: "Selected slot is in the past." });
            return;
          }
        }
        // Mode vs lawyer consultation-mode guard
        const avail = (lawyer as unknown as { availability?: string }).availability;
        if (avail && avail !== "both" && reqMode && avail !== reqMode) {
          res.status(400).json({ error: "mode_unavailable", message: `Lawyer only offers ${avail} consultations.` });
          return;
        }
      }
    } catch {
      // ignore validation errors — fall through to duplicate check
    }
    // Physical slot is single — dedup irrespective of mode (online vs offline blocks same time)
    const existing = await db.Appointment.findOne({ lawyerName, date, time, status: { $ne: "cancelled" } }).lean();
    if (existing) {
      res.status(409).json({ error: "slot_taken", message: "This slot is already booked. Please choose another time." });
      return;
    }
  }
  const appointment = await createAppointment(result.data);
  // Mirror to lawyer's calendar so lawyer sees client booking and can create meet link (use same date/time)
  void (async () => {
    try {
      let clientName = "Client";
      let clientInitials = "C";
      let clientGradient = "from-blue-500 to-indigo-700";
      const authH = req.get("authorization");
      const tkn = authH?.startsWith("Bearer ") ? authH.slice(7).trim() : "";
      const uid2 = tkn ? verifyToken(tkn) : undefined;
      if (uid2) {
        const u2 = await findUserById(uid2);
        if (u2?.name) {
          clientName = u2.name;
          clientInitials = u2.name.split(/\s+/).map((p: string) => p[0]).filter(Boolean).slice(0, 2).join("").toUpperCase() || "C";
          const cnt = await db.LawyerAppointment.countDocuments();
          const grads = ["from-blue-500 to-indigo-700","from-pink-500 to-rose-700","from-green-500 to-emerald-700","from-purple-500 to-fuchsia-700","from-orange-500 to-red-700","from-teal-500 to-cyan-700"];
          clientGradient = grads[cnt % grads.length];
        }
      }
      const d = result.data as unknown as { date: string; time: string; duration: number; mode: string; caseType: string; notes: string; fee: number };
      const already = await db.LawyerAppointment.findOne({ date: d.date, time: d.time, clientName } as unknown as Record<string, unknown>).lean();
      if (!already) {
        await createLawyerAppointment({
          clientName,
          clientInitials,
          clientGradient,
          caseType: d.caseType ?? "General Consultation",
          date: d.date,
          time: d.time,
          duration: d.duration ?? 45,
          mode: (d.mode as "online" | "offline") ?? "online",
          status: "pending",
          fee: d.fee ?? 0,
          isPaid: false,
          notes: d.notes ?? "",
        } as unknown as never);
      }
    } catch (e) {
      req.log.error({ err: e }, "failed to mirror client appointment to lawyer calendar");
    }
  })();
  // notify lawyer about new booking (fire-and-forget, respects prefs)
  void (async () => {
    try {
      const lawyer = await db.Lawyer.findOne({ name: (result.data as unknown as { lawyerName: string }).lawyerName }).lean() as { id?: string } | null;
      if (lawyer?.id) {
        const lawyerUser = await (await import("../data/store")).findUserById(lawyer.id);
        if (lawyerUser) {
          const { sendEmailIfEnabled } = await import("../lib/email");
          const { sendSmsIfEnabled } = await import("../lib/sms");
          const { sendPushIfEnabled } = await import("../lib/push");
          const { date, time } = result.data as unknown as { date: string; time: string };
          await Promise.all([
            sendEmailIfEnabled(lawyer.id, lawyerUser.email, "appointment", "New appointment booked", `<p>New consultation on ${date} at ${time} booked.</p>`),
            lawyerUser.phone ? sendSmsIfEnabled(lawyer.id, lawyerUser.phone, "appointment", `NyayaConnect: New appointment ${date} ${time}`) : Promise.resolve(false),
            sendPushIfEnabled(lawyer.id, "appointment", { title: "New appointment", body: `${date} ${time} — check your calendar`, url: "/lawyer/appointments" }),
          ]);
        }
      }
    } catch {}
  })();
  res.status(201).json(appointment);
});

router.post("/appointments/:id/request-reschedule", async (req, res): Promise<void> => {
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
  const id = paramString(req.params.id);
  const body = req.body as { requestedDate?: string; requestedTime?: string; reason?: string };
  const requestedDate = typeof body.requestedDate === "string" ? body.requestedDate.trim() : "";
  const requestedTime = typeof body.requestedTime === "string" ? body.requestedTime.trim() : "";
  const reason = typeof body.reason === "string" ? body.reason.trim().slice(0, 500) : "";
  if (!requestedDate || !/^\d{4}-\d{2}-\d{2}$/.test(requestedDate)) {
    res.status(400).json({ error: "validation_error", message: "requestedDate YYYY-MM-DD required" });
    return;
  }
  if (!requestedTime || !/^\d{2}:\d{2}$/.test(requestedTime)) {
    res.status(400).json({ error: "validation_error", message: "requestedTime HH:MM required" });
    return;
  }
  // Find original appointment (client side)
  let appt = await getAppointmentById(id);
  let isLawyerApt = false;
  if (!appt) {
    const la = await getLawyerAppointmentById(id);
    if (la) {
      appt = la as unknown as typeof appt;
      isLawyerApt = true;
    }
  }
  if (!appt) {
    res.status(404).json({ error: "not_found", message: "Appointment not found" });
    return;
  }
  // Only client who booked or any authenticated user can request (for demo, allow any)
  // Validate requested slot not in past and within lawyer availability
  const todayStr = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
  if (requestedDate < todayStr) {
    res.status(400).json({ error: "validation_error", message: "Requested date cannot be in the past." });
    return;
  }
  if (requestedDate === appt.date && requestedTime === appt.time) {
    res.status(400).json({ error: "validation_error", message: "Requested slot is same as current." });
    return;
  }
  // Check lawyer availability for requested slot
  try {
    const lawyerName = (appt as unknown as { lawyerName?: string }).lawyerName;
    if (lawyerName) {
      const lawyer = await db.Lawyer.findOne({ name: lawyerName }).lean() as unknown as { weeklyHours?: Array<{ day: string; active: boolean; start: string; end: string }> } | null;
      if (lawyer?.weeklyHours) {
        const dayName = (() => {
          const d = new Date(`${requestedDate}T12:00:00+05:30`);
          return Number.isNaN(d.getTime()) ? "" : d.toLocaleDateString("en-US", { weekday: "long", timeZone: "Asia/Kolkata" });
        })();
        const wh = lawyer.weeklyHours;
        const cfg = wh.find((h) => h.day === dayName);
        if (!cfg || !cfg.active) {
          res.status(400).json({ error: "unavailable", message: "Lawyer is not available on requested date." });
          return;
        }
        const pad2 = (n: number) => n.toString().padStart(2, "0");
        const [sh, sm] = cfg.start.split(":").map(Number);
        const [eh, em] = cfg.end.split(":").map(Number);
        const startM = (Number.isFinite(sh) ? sh : 0) * 60 + (Number.isFinite(sm) ? sm : 0);
        const endM = (Number.isFinite(eh) ? eh : 0) * 60 + (Number.isFinite(em) ? em : 0);
        const valid: string[] = [];
        for (let t = startM; t + 45 <= endM; t += 45) valid.push(`${pad2(Math.floor(t / 60))}:${pad2(t % 60)}`);
        if (!valid.includes(requestedTime)) {
          res.status(400).json({ error: "unavailable", message: "Requested time is outside lawyer's working hours." });
          return;
        }
        if (requestedDate === todayStr) {
          const fmt = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Kolkata", hour: "2-digit", minute: "2-digit", hour12: false });
          const parts = fmt.formatToParts(new Date());
          const nowM = Number(parts.find((p) => p.type === "hour")?.value ?? "0") * 60 + Number(parts.find((p) => p.type === "minute")?.value ?? "0");
          const [h, m] = requestedTime.split(":").map(Number);
          if (h * 60 + m <= nowM + 15) {
            res.status(400).json({ error: "unavailable", message: "Requested slot is in the past." });
            return;
          }
        }
        // Check if requested slot already taken
        const exists = await db.Appointment.findOne({ lawyerName, date: requestedDate, time: requestedTime, status: { $ne: "cancelled" } } as unknown as Record<string, unknown>).lean();
        if (exists) {
          res.status(409).json({ error: "slot_taken", message: "Requested slot is already booked. Please choose another." });
          return;
        }
        const exists2 = await db.LawyerAppointment.findOne({ date: requestedDate, time: requestedTime, status: { $ne: "cancelled" } } as unknown as Record<string, unknown>).lean();
        if (exists2) {
          // If same date/time already has a lawyer appointment, consider taken (conservative)
          // Check if it's the same appointment (original)
          if ((exists2 as unknown as { id: string }).id !== id) {
            res.status(409).json({ error: "slot_taken", message: "Requested slot is already booked." });
            return;
          }
        }
      }
    }
  } catch {
    // ignore availability check errors and allow request
  }

  const patch: Record<string, unknown> = {
    rescheduleRequested: true,
    rescheduleRequestedAt: new Date().toISOString(),
    rescheduleReason: reason,
    requestedDate,
    requestedTime,
    requestedBy: user.id,
    requestedByName: user.name,
    originalDate: appt.date,
    originalTime: appt.time,
    status: "rescheduled",
  };

  let updated: unknown = null;
  if (isLawyerApt) {
    updated = await updateLawyerAppointment(id, patch as unknown as never);
    // also mirror to client Appointment(s) with same original slot
    try {
      const cands = await db.Appointment.find({ date: appt.date, time: appt.time } as unknown as Record<string, unknown>).lean();
      for (const cand of cands as unknown as Array<{ id: string }>) {
        await db.Appointment.updateOne({ id: cand.id }, { $set: patch });
      }
      // ensure direct Appointment by id if exists
      await db.Appointment.updateOne({ id }, { $set: patch });
    } catch {}
  } else {
    updated = await updateAppointment(id, patch as unknown as never);
    try {
      await db.Appointment.updateOne({ id }, { $set: patch });
    } catch {}
    // mirror to lawyer side
    try {
      const cands = await db.LawyerAppointment.find({ date: appt.date, time: appt.time } as unknown as Record<string, unknown>).lean();
      for (const cand of cands as unknown as Array<{ id: string }>) {
        await db.LawyerAppointment.updateOne({ id: cand.id }, { $set: patch });
      }
      if (cands.length === 0) {
        // No existing lawyer apt for this slot — create one so lawyer sees the request
        const laPatch = { ...patch, clientName: user.name, clientInitials: user.name.split(/\s+/).map((p: string) => p[0]).filter(Boolean).slice(0, 2).join("").toUpperCase() || "C", clientGradient: "from-blue-500 to-indigo-700", caseType: (appt as unknown as { caseType?: string }).caseType ?? "General Consultation", duration: (appt as unknown as { duration?: number }).duration ?? 45, mode: (appt as unknown as { mode?: string }).mode ?? "online", fee: (appt as unknown as { fee?: number }).fee ?? 0, isPaid: false, notes: (appt as unknown as { notes?: string }).notes ?? "" } as unknown as Record<string, unknown>;
        // Find or create a placeholder lawyer appointment with original slot
        await db.LawyerAppointment.updateOne({ id }, { $set: laPatch }, { upsert: false });
      }
    } catch {}
  }

  // Notify lawyer
  void (async () => {
    try {
      const lawyerName = (appt as unknown as { lawyerName?: string }).lawyerName;
      if (!lawyerName) return;
      const lawyer = await db.Lawyer.findOne({ name: lawyerName }).lean() as unknown as { id?: string } | null;
      if (!lawyer?.id) return;
      const lawyerUser = await findUserById(lawyer.id);
      if (!lawyerUser) return;
      const { sendEmailIfEnabled } = await import("../lib/email");
      const { sendPushIfEnabled } = await import("../lib/push");
      await Promise.all([
        sendEmailIfEnabled(lawyerUser.id, lawyerUser.email, "appointment", "Reschedule requested", `<p>${user.name} requested to reschedule appointment on ${appt.date} at ${appt.time} to ${requestedDate} at ${requestedTime}.${reason ? `<br/>Reason: ${reason}` : ""}</p>`),
        sendPushIfEnabled(lawyerUser.id, "appointment", { title: "Reschedule requested", body: `${user.name}: ${appt.date} ${appt.time} → ${requestedDate} ${requestedTime}`, url: "/lawyer/appointments" }),
      ]);
      // also create notification record
      await db.Notification.create({
        id: `n${Date.now()}${Math.random().toString(36).slice(2, 6)}`,
        type: "appointment",
        title: "Reschedule requested",
        message: `${user.name} wants to move ${appt.date} ${appt.time} → ${requestedDate} ${requestedTime}${reason ? ` — ${reason}` : ""}`,
        timestamp: new Date().toISOString(),
        isRead: false,
        actionLabel: "View appointments",
        actionLink: "/lawyer/appointments",
        userId: lawyerUser.id,
        recipientId: lawyerUser.id,
      } as unknown as Record<string, unknown>);
    } catch {}
  })();

  res.json(updated ?? { ...appt, ...patch });
});

router.post("/appointments/:id/resolve-reschedule", async (req, res): Promise<void> => {
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
  let appt = await getAppointmentById(id);
  let isLawyerApt = false;
  if (!appt) {
    const la = await getLawyerAppointmentById(id);
    if (la) {
      appt = la as unknown as typeof appt;
      isLawyerApt = true;
    }
  }
  if (!appt) {
    res.status(404).json({ error: "not_found", message: "Appointment not found" });
    return;
  }
  const ext = appt as unknown as { rescheduleRequested?: boolean; requestedDate?: string; requestedTime?: string; originalDate?: string; originalTime?: string; rescheduleReason?: string };
  if (!ext.rescheduleRequested || !ext.requestedDate || !ext.requestedTime) {
    res.status(400).json({ error: "validation_error", message: "No pending reschedule request for this appointment." });
    return;
  }
  const note = typeof body.note === "string" ? body.note.trim().slice(0, 500) : "";
  let patch: Record<string, unknown> = {};
  let notifyClient = true;
  let updated: unknown = null;

  if (action === "approve") {
    // Validate requested slot still available
    const lawyerName = (appt as unknown as { lawyerName?: string }).lawyerName;
    if (lawyerName) {
      const exists = await db.Appointment.findOne({ lawyerName, date: ext.requestedDate, time: ext.requestedTime, status: { $ne: "cancelled" }, id: { $ne: id } } as unknown as Record<string, unknown>).lean();
      if (exists) {
        res.status(409).json({ error: "slot_taken", message: "Requested slot is now taken. Ask client to pick another." });
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
      // keep audit
      lastRescheduleAction: "approved",
      lastRescheduleNote: note,
    };
  } else {
    // reject — keep original date/time, clear request
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

  if (isLawyerApt) {
    updated = await updateLawyerAppointment(id, patch as unknown as never);
    try { await db.LawyerAppointment.updateOne({ id }, { $set: patch }); } catch {}
    // mirror to client side
    try {
      const cands = await db.Appointment.find({ date: ext.originalDate ?? appt.date, time: ext.originalTime ?? appt.time } as unknown as Record<string, unknown>).lean();
      for (const cand of cands as unknown as Array<{ id: string }>) {
        await db.Appointment.updateOne({ id: cand.id }, { $set: patch });
        // if approved, also set the new date/time on client side
        if (action === "approve") {
          await db.Appointment.updateOne({ id: cand.id }, { $set: { date: ext.requestedDate, time: ext.requestedTime, status: "upcoming" } });
        }
      }
      // also directly update by same id if exists
      await db.Appointment.updateOne({ id }, { $set: patch });
      if (action === "approve") await db.Appointment.updateOne({ id }, { $set: { date: ext.requestedDate, time: ext.requestedTime } });
    } catch {}
  } else {
    updated = await updateAppointment(id, patch as unknown as never);
    try { await db.Appointment.updateOne({ id }, { $set: patch }); } catch {}
    if (action === "approve") {
      try { await db.Appointment.updateOne({ id }, { $set: { date: ext.requestedDate, time: ext.requestedTime } }); } catch {}
    }
    // mirror to lawyer side
    try {
      const cands = await db.LawyerAppointment.find({ date: ext.originalDate ?? appt.date, time: ext.originalTime ?? appt.time } as unknown as Record<string, unknown>).lean();
      for (const cand of cands as unknown as Array<{ id: string }>) {
        const p2: Record<string, unknown> = { ...patch };
        // lawyer side also needs date/time update on approve
        if (action === "approve") {
          p2.date = ext.requestedDate;
          p2.time = ext.requestedTime;
        }
        await db.LawyerAppointment.updateOne({ id: cand.id }, { $set: p2 });
      }
      // if no existing lawyer apt found, the original create path already handled mirroring via request
    } catch {}
  }

  // Notify client
  void (async () => {
    try {
      const requestedBy = (appt as unknown as { requestedBy?: string }).requestedBy;
      const clientId = requestedBy;
      if (!clientId) return;
      const clientUser = await findUserById(clientId);
      if (!clientUser) return;
      const { sendEmailIfEnabled } = await import("../lib/email");
      const { sendPushIfEnabled } = await import("../lib/push");
      const title = action === "approve" ? "Reschedule approved" : "Reschedule declined";
      const msg = action === "approve"
        ? `Your request to move ${ext.originalDate} ${ext.originalTime} → ${ext.requestedDate} ${ext.requestedTime} was approved by ${user.name}.${note ? ` Note: ${note}` : ""}`
        : `Your reschedule request for ${ext.originalDate} ${ext.originalTime} was declined by ${user.name}.${note ? ` Note: ${note}` : " Please pick another slot."}`;
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

  res.json(updated ?? { ...appt, ...patch });
});

router.patch("/appointments/:id", async (req, res): Promise<void> => {
  const user = await bearerUserOptional(req);
  if (!user) {
    res.status(401).json({ error: "unauthorized", message: "Login required." });
    return;
  }
  const id = paramString(req.params.id);
  const result = UpdateAppointmentBody.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ error: "validation_error", message: "Invalid appointment payload" });
    return;
  }
  const updated = await updateAppointment(id, result.data);
  if (!updated) {
    res.status(404).json({ error: "not_found", message: "Appointment not found" });
    return;
  }
  const data = UpdateAppointmentResponse.parse(updated);
  res.json(data);
});

router.post("/appointments/:id/meet", async (req, res): Promise<void> => {
  const id = paramString(req.params.id);
  const result = CreateAppointmentMeetBody.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ error: "validation_error", message: "Invalid meet link payload" });
    return;
  }
  const appointment =
    (await getLawyerAppointmentById(id)) ?? (await getAppointmentById(id));
  if (!appointment) {
    res.status(404).json({ error: "not_found", message: "Appointment not found" });
    return;
  }
  if (appointment.mode === "offline") {
    res.status(400).json({ error: "offline_appointment", message: "No meeting link for offline appointments" });
    return;
  }
  if (!isGoogleConfigured()) {
    res.status(503).json({ error: "google_not_configured", message: "Google Calendar is not configured on the server" });
    return;
  }
  const userId = result.data.userId;
  if (!hasGoogleTokens(userId)) {
    res.status(401).json({ error: "google_not_connected", message: "Connect your Google Calendar from Settings first" });
    return;
  }
  const clientName =
    "clientName" in appointment ? appointment.clientName : appointment.lawyerName;
  const startDateTime = toDateTimeOffset(appointment.date, appointment.time);
  try {
    const meetLink = await createMeetLink(userId, {
      summary: `Legal Consultation — ${clientName}`,
      description: `NyayaConnect consultation with ${clientName}`,
      startDateTime,
      endDateTime: addMinutesOffset(startDateTime, appointment.duration ?? 45),
    });
    const shouldPromoteToUpcoming = (appointment as unknown as { status?: string }).status === "pending";
    const patch: Record<string, unknown> = shouldPromoteToUpcoming ? { meetLink, status: "upcoming" } : { meetLink };
    const updated = "clientName" in appointment
      ? await updateLawyerAppointment(id, patch as unknown as never)
      : await updateAppointment(id, patch as unknown as never);
    // Sync meetLink (and status) to counterpart collection so both client and lawyer portals see the same link
    void (async () => {
      try {
        const syncPatch: Record<string, unknown> = { meetLink };
        if (shouldPromoteToUpcoming) syncPatch.status = "upcoming";
        if ("clientName" in appointment) {
          // LawyerAppointment -> mirror to client Appointment(s) with same date/time
          const cands = await db.Appointment.find({ date: (appointment as unknown as { date: string }).date, time: (appointment as unknown as { time: string }).time, mode: "online" } as unknown as Record<string, unknown>).lean();
          for (const cand of cands as unknown as Array<{ id: string; meetLink?: string; status?: string }>) {
            if (!cand.meetLink || (shouldPromoteToUpcoming && cand.status === "pending")) {
              const p: Record<string, unknown> = { meetLink };
              if (shouldPromoteToUpcoming && cand.status === "pending") p.status = "upcoming";
              await db.Appointment.updateOne({ id: cand.id }, { $set: p });
            }
          }
        } else {
          // Client Appointment -> mirror to LawyerAppointment(s) with same date/time
          const cands = await db.LawyerAppointment.find({ date: (appointment as unknown as { date: string }).date, time: (appointment as unknown as { time: string }).time, mode: "online" } as unknown as Record<string, unknown>).lean();
          for (const cand of cands as unknown as Array<{ id: string; meetLink?: string; status?: string }>) {
            if (!cand.meetLink || (shouldPromoteToUpcoming && cand.status === "pending")) {
              const p: Record<string, unknown> = { meetLink };
              if (shouldPromoteToUpcoming && cand.status === "pending") p.status = "upcoming";
              await db.LawyerAppointment.updateOne({ id: cand.id }, { $set: p });
            }
          }
        }
      } catch (e) {
        req.log.error({ err: e, appointmentId: id }, "failed to sync meetLink to counterpart");
      }
    })();
    req.log.info({ appointmentId: id }, "google meet link created");
    const data = CreateAppointmentMeetResponse.parse({ meetLink: updated?.meetLink ?? meetLink });
    res.json(data);
  } catch (err) {
    req.log.error({ err, appointmentId: id }, "failed to create google meet link");
    res.status(502).json({ error: "google_api_error", message: "Failed to create Google Meet link" });
  }
});

export default router;
