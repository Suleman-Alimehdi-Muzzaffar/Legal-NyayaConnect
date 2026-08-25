import { Router, type IRouter } from "express";
import { createReview, getApprovedReviews, getPendingReviews, reviewReview } from "../data/store";
import { logAudit } from "../lib/audit";
import { paramString } from "../lib/params";
import { requireAdmin, bearerUser } from "../lib/admin";
import * as db from "@workspace/db";

const router: IRouter = Router();

// Client creates review → pending/flagged
router.post("/reviews", async (req, res): Promise<void> => {
  const user = await bearerUser(req, res);
  if (!user) return;
  const { lawyerSlug, lawyerId, rating, comment, caseType } = req.body as Record<string, unknown>;
  if (typeof rating !== "number" || rating < 1 || rating > 5 || typeof comment !== "string" || comment.trim().length < 5 || comment.trim().length > 1000) {
    res.status(400).json({ error: "validation_error", message: "rating 1-5 and comment 5-1000 chars required" });
    return;
  }
  const review = await createReview({
    lawyerSlug: typeof lawyerSlug === "string" ? lawyerSlug : undefined,
    lawyerId: typeof lawyerId === "string" ? lawyerId : undefined,
    author: user.name,
    authorId: user.id,
    rating,
    comment: comment.trim(),
    caseType: typeof caseType === "string" ? caseType : "General",
  });
  res.status(201).json(review);
});

// Public approved reviews (optionally ?lawyerSlug=)
router.get("/reviews", async (req, res): Promise<void> => {
  const slug = typeof req.query.lawyerSlug === "string" ? req.query.lawyerSlug : undefined;
  const reviews = await getApprovedReviews(slug);
  res.json(reviews);
});

// Admin queue
router.get("/admin/reviews", async (req, res): Promise<void> => {
  if (!requireAdmin(req, res)) return;
  const pending = await getPendingReviews();
  // also include recent approved for context
  const approved = await db.Review.find({ status: "approved" }).sort({ createdAt: -1 }).limit(20).lean();
  res.json({ pending, approved });
});

router.post("/admin/reviews/:id/review", async (req, res): Promise<void> => {
  if (!requireAdmin(req, res)) return;
  const id = paramString(req.params.id);
  const { status, note } = req.body as { status?: string; note?: string };
  if (status !== "approved" && status !== "rejected") {
    res.status(400).json({ error: "invalid_payload" });
    return;
  }
  const updated = await reviewReview(id, status, note);
  if (!updated) {
    res.status(404).json({ error: "not_found" });
    return;
  }
  await logAudit({ actor: "admin", actorRole: "admin", action: `review:${status}`, targetId: id, details: { note }, ip: req.ip });
  // If approved, also push into Lawyer.reviewsList for backward compat display
  if (status === "approved") {
    const r = updated as unknown as { lawyerSlug?: string; author: string; rating: number; comment: string; caseType: string };
    if (r.lawyerSlug) {
      const lawyer = await db.Lawyer.findOne({ slug: r.lawyerSlug }).lean() as unknown as { id: string } | null;
      if (lawyer) {
        await db.Lawyer.updateOne({ slug: r.lawyerSlug }, { $push: { reviewsList: { id, author: r.author, rating: r.rating, date: new Date().toISOString(), comment: r.comment, caseType: r.caseType } } });
      }
    }
  }
  res.json(updated);
});

export default router;
