import cron from "node-cron";
import * as db from "@workspace/db";
import { logger } from "./logger";

function istNow(): Date {
  const now = new Date();
  // IST is UTC+5:30
  const ist = new Date(now.getTime() + 5.5 * 60 * 60 * 1000);
  return ist;
}

function toISTDateStr(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function startCron() {
  // Every 15 minutes — appointment reminders (24h + 1h)
  cron.schedule("*/15 * * * *", async () => {
    try {
      const now = istNow();
      const todayStr = toISTDateStr(now);
      const tomorrow = new Date(now);
      tomorrow.setDate(now.getDate() + 1);
      const tomorrowStr = toISTDateStr(tomorrow);

      const appointments = await db.Appointment.find({
        status: { $ne: "cancelled" },
        date: { $in: [todayStr, tomorrowStr] },
      }).lean();

      const lawyerAppts = await db.LawyerAppointment.find({
        status: { $ne: "cancelled" },
        date: { $in: [todayStr, tomorrowStr] },
      }).lean();

      const all = [...appointments as unknown as Array<Record<string, unknown>>, ...lawyerAppts as unknown as Array<Record<string, unknown>>];

      for (const appt of all) {
        const date = appt.date as string | undefined;
        const time = appt.time as string | undefined;
        if (!date || !time) continue;
        const apptDateTime = new Date(`${date}T${time}:00+05:30`);
        const diffMs = apptDateTime.getTime() - now.getTime();
        const hours = diffMs / (1000 * 60 * 60);
        // 23-24h or 0.5-1.5h windows
        const shouldRemind = (hours > 23 && hours < 24) || (hours > 0.5 && hours < 1.5);
        if (!shouldRemind) continue;

        const remindedKey = `reminded:${appt.id}:${Math.floor(hours)}`;
        // naive dedup via global — in prod use DB field
        const globalWithCache = globalThis as unknown as { _reminded?: Set<string> };
        globalWithCache._reminded ??= new Set();
        if (globalWithCache._reminded.has(remindedKey)) continue;
        globalWithCache._reminded.add(remindedKey);

        // try to notify client if appointment has lawyerName
        const lawyerName = appt.lawyerName as string | undefined;
        const clientName = appt.clientName as string | undefined;
        logger.info({ apptId: appt.id, date, time, hours: hours.toFixed(1) }, "cron reminder check");

        // Best effort — send push + email to both parties if we can resolve userIds
        try {
          const { sendPushIfEnabled } = await import("./push");
          const { sendEmailIfEnabled } = await import("./email");
          const { findUserByEmail, findUserById } = await import("../data/store");
          const is24h = hours > 23 && hours < 24;
          const whenLabel = is24h ? "in 24 hours" : "in 1 hour";
          const subject = `Reminder: Appointment ${whenLabel} — ${date} ${time} IST`;
          // client side (LawyerAppointment has clientName)
          if (clientName) {
            const clientDoc = await db.Client.findOne({ name: clientName }).lean() as { email?: string } | null;
            if (clientDoc?.email) {
              const user = await findUserByEmail(clientDoc.email);
              if (user) {
                await sendPushIfEnabled(user.id, "reminder", { title: "Upcoming appointment", body: `${date} ${time} — ${lawyerName ?? clientName}`, url: "/dashboard/appointments" });
                await sendEmailIfEnabled(user.id, user.email, "reminder", subject, `<p>Hi ${user.name},</p><p>This is a reminder — your consultation <strong>${lawyerName ?? "with lawyer"}</strong> is ${whenLabel} on <strong>${date} at ${time} IST</strong>.</p><p><a href="${process.env.FRONTEND_URL ?? "http://localhost:5173"}/dashboard/appointments">View appointment</a></p>`);
              }
            }
          }
          // lawyer side — Appointment has lawyerName
          if (lawyerName) {
            const lawyerDoc = await db.Lawyer.findOne({ name: lawyerName }).lean() as { id?: string } | null;
            if (lawyerDoc?.id) {
              await sendPushIfEnabled(lawyerDoc.id, "reminder", { title: "Upcoming appointment", body: `${date} ${time}`, url: "/lawyer/appointments" });
              const lawyerUser = await findUserById(lawyerDoc.id);
              if (lawyerUser?.email) {
                await sendEmailIfEnabled(lawyerDoc.id, lawyerUser.email, "reminder", subject, `<p>Hi ${lawyerUser.name},</p><p>Reminder — consultation with <strong>${clientName ?? "client"}</strong> is ${whenLabel} on <strong>${date} at ${time} IST</strong>.</p><p><a href="${process.env.FRONTEND_URL ?? "http://localhost:5173"}/lawyer/appointments">View appointment</a></p>`);
              }
            }
          }
          // Also cover plain Appointment where we can resolve lawyer user directly (fallback for client-owned record)
          if (!clientName && lawyerName) {
            // try to notify any client booked against this lawyer/date/time via User lookup is not stored, so skip — push already done for lawyer
          }
        } catch (err) {
          logger.warn({ err }, "cron reminder notify failed");
        }
      }
    } catch (err) {
      logger.error({ err }, "cron appointment reminder failed");
    }
  });

  // Daily 09:00 IST — weekly digest/logs (03:30 UTC)
  cron.schedule("30 3 * * *", async () => {
    logger.info("cron daily digest tick");
    try {
      const pendingVerifications = await db.Verification.countDocuments({ status: "pending" });
      const pendingExports = await db.DataExport.countDocuments({ status: "pending" });
      if (pendingVerifications > 5 || pendingExports > 5) {
        logger.warn({ pendingVerifications, pendingExports }, "admin queue backlog");
      }
    } catch {}
  });

  logger.info("cron jobs scheduled (reminders */15, digest 9am IST)");
}
