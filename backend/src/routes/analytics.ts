import { Router, type IRouter } from "express";
import * as db from "@workspace/db";
import { requireAdmin } from "../lib/admin";

const router: IRouter = Router();

router.get("/admin/analytics", async (req, res): Promise<void> => {
  if (!requireAdmin(req, res)) return;
  const [users, lawyers, pendingVerifications, pendingExports, appointments, lawyerAppointments, documents, verifications, dataExports, todayAppts, revenueAgg, caseAgg] = await Promise.all([
    db.User.countDocuments().catch(() => 0),
    db.Lawyer.countDocuments().catch(() => 0),
    db.Verification.countDocuments({ status: "pending" }).catch(() => 0),
    db.DataExport.countDocuments({ status: "pending" }).catch(() => 0),
    db.Appointment.countDocuments().catch(() => 0),
    db.LawyerAppointment.countDocuments().catch(() => 0),
    db.Document.countDocuments().catch(() => 0),
    db.Verification.countDocuments().catch(() => 0),
    db.DataExport.countDocuments().catch(() => 0),
    db.Appointment.countDocuments({ date: new Date().toISOString().slice(0, 10) }).catch(() => 0),
    db.Appointment.aggregate([{ $group: { _id: null, total: { $sum: "$fee" } } }]).catch(() => []) as Promise<Array<{ total: number }>>,
    db.Appointment.aggregate([{ $group: { _id: "$caseType", count: { $sum: 1 } } }, { $sort: { count: -1 } }, { $limit: 5 }]).catch(() => []) as Promise<Array<{ _id: string; count: number }>>,
  ]);
  const revenueEstimate = (revenueAgg[0]?.total ?? 0) + 0;
  const caseMix = caseAgg.map((c) => ({ name: c._id ?? "General", value: c.count }));
  res.json({
    users,
    lawyers,
    pendingVerifications,
    pendingExports,
    appointments: appointments + lawyerAppointments,
    documents,
    totalVerifications: verifications,
    totalDataExports: dataExports,
    appointmentsToday: todayAppts,
    revenueEstimate,
    caseMix,
    generatedAt: new Date().toISOString(),
  });
});

export default router;
