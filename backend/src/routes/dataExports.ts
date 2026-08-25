import { Router, type IRouter, type Request, type Response } from "express";
import { ReviewDataExportBody } from "@workspace/api-zod";
import { paramString } from "../lib/params";
import { buildZip } from "../lib/zip";
import { logAudit } from "../lib/audit";
import * as db from "@workspace/db";
import {
  createDataExportRequest,
  getDataExportsByEmail,
  getPendingDataExport,
  listDataExports,
  reviewDataExport,
} from "../data/store";
import { requireAdmin, bearerUser } from "../lib/admin";

const router: IRouter = Router();

router.post("/data-exports", async (req, res): Promise<void> => {
  const user = await bearerUser(req, res);
  if (!user) {
    res.status(401).json({ error: "unauthorized", message: "Missing or invalid session token." });
    return;
  }
  const existing = await getPendingDataExport(user.email);
  if (existing) {
    res.status(409).json({
      error: "already_pending",
      message: "A data export request is already pending for your account.",
    });
    return;
  }
  const kind = user.role === "lawyer" ? "lawyer_zip" : "personal_data";
  const dataExport = await createDataExportRequest(user, kind);
  req.log.info({ userId: user.id, dataExportId: dataExport.id, kind }, "data export requested");
  res.json(dataExport);
});

router.get("/data-exports/me", async (req, res): Promise<void> => {
  const user = await bearerUser(req, res);
  if (!user) return;
  res.json(await getDataExportsByEmail(user.email));
});

router.get("/data-exports/me/download", async (req, res): Promise<void> => {
  const user = await bearerUser(req, res);
  if (!user) return;
  const exports = await getDataExportsByEmail(user.email);
  const granted = exports.find((e) => (e as unknown as { status: string }).status === "granted");
  if (!granted) {
    res.status(403).json({ error: "not_granted", message: "No approved data export request found. Please request and wait for admin approval." });
    return;
  }

  const safeUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    phone: user.phone ?? "",
    city: user.city ?? "",
    state: user.state ?? "",
  };

  const lawyerDoc = (await db.Lawyer.findOne({ id: user.id }).lean()) as Record<string, unknown> | null;
  const appointments = (await db.LawyerAppointment.find().lean()) as Array<Record<string, unknown>>;
  const pricing = lawyerDoc
    ? {
        consultationFee: (lawyerDoc as Record<string, unknown>).consultationFee ?? "",
        cancellationPolicy: (lawyerDoc as Record<string, unknown>).cancellationPolicy ?? "Moderate",
        lateCancellationFee: (lawyerDoc as Record<string, unknown>).lateCancellationFee ?? "",
      }
    : { consultationFee: "", cancellationPolicy: "Moderate", lateCancellationFee: "" };
  const weeklyHours = (lawyerDoc as Record<string, unknown> | null)?.weeklyHours ?? [];

  const appointmentsCsv = [
    "id,client,type,date,status",
    ...appointments.map((a) =>
      [String(a.id ?? ""), String((a as Record<string, unknown>).clientName ?? ""), String((a as Record<string, unknown>).caseType ?? ""), String((a as Record<string, unknown>).date ?? ""), String((a as Record<string, unknown>).status ?? "")].join(","),
    ),
  ].join("\n");

  const revenueCsv = [
    "date,amount,status",
    ...appointments
      .filter((a) => (a as Record<string, unknown>).isPaid)
      .map((a) => [String((a as Record<string, unknown>).date ?? ""), String((a as Record<string, unknown>).fee ?? ""), "Paid"].join(",")),
  ].join("\n");

  const zip = buildZip([
    { name: "profile.json", content: JSON.stringify(safeUser, null, 2) },
    { name: "lawyer.json", content: JSON.stringify(lawyerDoc ?? {}, null, 2) },
    { name: "availability.json", content: JSON.stringify(weeklyHours, null, 2) },
    { name: "pricing.json", content: JSON.stringify(pricing, null, 2) },
    { name: "appointments.csv", content: appointmentsCsv },
    { name: "revenue.csv", content: revenueCsv },
  ]);

  res.setHeader("Content-Type", "application/zip");
  res.setHeader("Content-Disposition", 'attachment; filename="nyayaconnect-lawyer-export.zip"');
  res.setHeader("Content-Length", String(zip.length));
  res.send(zip);
});

router.get("/admin/data-exports", async (req, res): Promise<void> => {
  if (!requireAdmin(req, res)) return;
  res.json(await listDataExports());
});

router.post("/admin/data-exports/:id/review", async (req, res): Promise<void> => {
  if (!requireAdmin(req, res)) return;
  const id = paramString(req.params.id);
  const result = ReviewDataExportBody.safeParse(req.body);
  if (!result.success || (result.data.status !== "granted" && result.data.status !== "denied")) {
    res.status(400).json({ error: "invalid_payload", message: "Status must be granted or denied." });
    return;
  }
  const updated = await reviewDataExport(id, result.data.status, result.data.reason ?? "");
  if (!updated) {
    res.status(404).json({ error: "not_found", message: "Data export request not found." });
    return;
  }
  req.log.info({ dataExportId: id, status: updated.status }, "data export reviewed");
  await logAudit({ actor: "admin", actorRole: "admin", action: `dataExport:${updated.status}`, targetId: id, details: { reason: result.data.reason }, ip: req.ip });
  res.json(updated);
});

export default router;