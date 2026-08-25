import { Router, type IRouter } from "express";
import { GetLawyerBySlugResponse, ListLawyersQueryParams, ListLawyersResponse } from "@workspace/api-zod";
import { getLawyerBySlug, getLawyers } from "../data/store";
import { paramString } from "../lib/params";
import * as db from "@workspace/db";

const router: IRouter = Router();

router.get("/lawyers", async (req, res): Promise<void> => {
  const parsed = ListLawyersQueryParams.safeParse(req.query);
  const { search, city, state, specialization, availability, minRating, maxFee, sortBy } = parsed.success ? parsed.data : {};

  const searchLower = search?.toLowerCase();
  let lawyers: Awaited<ReturnType<typeof getLawyers>>;
  if (searchLower && search && search.trim().length >= 2) {
    try {
      // Prefer Mongo text index (name/specializations/city) when available
      const textDocs = await (db.Lawyer.find(
        { $text: { $search: search }, visibility: { $ne: "private" } } as unknown as Record<string, unknown>,
        { score: { $meta: "textScore" } } as unknown as Record<string, unknown>,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ) as any).sort({ score: { $meta: "textScore" } }).lean() as unknown as typeof lawyers;
      if (textDocs.length > 0) lawyers = textDocs as unknown as typeof lawyers;
      else lawyers = await getLawyers();
    } catch {
      lawyers = await getLawyers();
    }
  } else {
    lawyers = await getLawyers();
  }

  let result = lawyers.filter((lawyer) => {
    if ((lawyer as unknown as { visibility?: string }).visibility === "private") return false;
    if (searchLower) {
      const matchesName = lawyer.name.toLowerCase().includes(searchLower);
      const matchesSpec = lawyer.specializations.some((s) => s.toLowerCase().includes(searchLower));
      const matchesCity = lawyer.city.toLowerCase().includes(searchLower);
      if (!matchesName && !matchesSpec && !matchesCity) return false;
    }
    if (city && !lawyer.city.toLowerCase().includes(city.toLowerCase())) return false;
    if (state && lawyer.state !== state) return false;
    if (specialization) {
      const specLower = specialization.toLowerCase();
      if (!lawyer.specializations.some((s) => s.toLowerCase().includes(specLower))) return false;
    }
    if (availability && availability !== "both") {
      if (lawyer.availability !== "both" && lawyer.availability !== availability) return false;
    }
    if (minRating != null && lawyer.rating < minRating) return false;
    if (maxFee != null && lawyer.consultationFee > maxFee) return false;
    return true;
  });

  if (sortBy === "rating_desc") result = [...result].sort((a, b) => b.rating - a.rating);
  if (sortBy === "exp_desc") result = [...result].sort((a, b) => b.experience - a.experience);
  if (sortBy === "fee_asc") result = [...result].sort((a, b) => a.consultationFee - b.consultationFee);
  if (sortBy === "fee_desc") result = [...result].sort((a, b) => b.consultationFee - a.consultationFee);

  // Optional server-side pagination (?page=1&limit=20) — client currently paginates in-memory, but this prevents O(N) for large datasets
  const rawPage = req.query.page as string | undefined;
  const rawLimit = req.query.limit as string | undefined;
  if (rawPage !== undefined || rawLimit !== undefined) {
    const page = Math.max(1, Number(rawPage) || 1);
    const limit = Math.min(50, Math.max(1, Number(rawLimit) || 20));
    result = result.slice((page - 1) * limit, page * limit);
  }

  const data = ListLawyersResponse.parse(result);
  res.json(data);
});

router.get("/lawyers/:slug", async (req, res): Promise<void> => {
  const slug = paramString(req.params.slug);
  const lawyer = await getLawyerBySlug(slug);
  if (!lawyer) {
    res.status(404).json({ error: "not_found", message: "Lawyer not found" });
    return;
  }
  const data = GetLawyerBySlugResponse.parse(lawyer);
  res.json(data);
});

const DEFAULT_WEEKLY_HOURS: Array<{ day: string; active: boolean; start: string; end: string }> = [
  { day: "Monday", active: true, start: "09:00", end: "17:00" },
  { day: "Tuesday", active: true, start: "09:00", end: "17:00" },
  { day: "Wednesday", active: true, start: "09:00", end: "17:00" },
  { day: "Thursday", active: true, start: "09:00", end: "17:00" },
  { day: "Friday", active: true, start: "09:00", end: "17:00" },
  { day: "Saturday", active: true, start: "10:00", end: "14:00" },
  { day: "Sunday", active: false, start: "10:00", end: "14:00" },
];

const SLOT_MIN = 45;
const pad2 = (n: number) => n.toString().padStart(2, "0");

function dayNameIST(dateStr: string): string {
  // Parse as IST noon to avoid DST/edge shift, then get weekday in IST
  const d = new Date(`${dateStr}T12:00:00+05:30`);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", { weekday: "long", timeZone: "Asia/Kolkata" });
}

function todayIST(): string {
  const fmt = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata", year: "numeric", month: "2-digit", day: "2-digit" });
  return fmt.format(new Date()); // en-CA gives YYYY-MM-DD
}

function nowMinutesIST(): number {
  const fmt = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Kolkata", hour: "2-digit", minute: "2-digit", hour12: false });
  const parts = fmt.formatToParts(new Date());
  const h = Number(parts.find((p) => p.type === "hour")?.value ?? "0");
  const m = Number(parts.find((p) => p.type === "minute")?.value ?? "0");
  return h * 60 + m;
}

function slotsForConfig(cfg: { start: string; end: string }): string[] {
  const [sh, sm] = cfg.start.split(":").map(Number);
  const [eh, em] = cfg.end.split(":").map(Number);
  const startM = (Number.isFinite(sh) ? sh : 0) * 60 + (Number.isFinite(sm) ? sm : 0);
  const endM = (Number.isFinite(eh) ? eh : 0) * 60 + (Number.isFinite(em) ? em : 0);
  const out: string[] = [];
  for (let t = startM; t + SLOT_MIN <= endM; t += SLOT_MIN) {
    out.push(`${pad2(Math.floor(t / 60))}:${pad2(t % 60)}`);
  }
  return out;
}

async function freeSlotsForDate(
  lawyer: { name: string; weeklyHours?: Array<{ day: string; active: boolean; start: string; end: string }> },
  dateStr: string,
): Promise<string[]> {
  const weeklyHours =
    (lawyer as unknown as { weeklyHours?: Array<{ day: string; active: boolean; start: string; end: string }> }).weeklyHours ??
    DEFAULT_WEEKLY_HOURS;
  const effective = weeklyHours.length > 0 ? weeklyHours : DEFAULT_WEEKLY_HOURS;
  const dayName = dayNameIST(dateStr);
  if (!dayName) return [];
  const cfg = effective.find((h) => h.day === dayName);
  if (!cfg || !cfg.active) return [];

  let allSlots = slotsForConfig(cfg);

  // Filter past slots for today (IST)
  const todayStr = todayIST();
  if (dateStr === todayStr) {
    const nowM = nowMinutesIST();
    // keep slots at least 30 min in future to allow booking
    allSlots = allSlots.filter((s) => {
      const [h, m] = s.split(":").map(Number);
      return h * 60 + m > nowM + 15;
    });
    if (allSlots.length === 0) return [];
  }

  const booked = new Set<string>();
  const appts = await db.Appointment.find({
    lawyerName: lawyer.name,
    date: dateStr,
    status: { $ne: "cancelled" },
  } as unknown as Record<string, unknown>).lean();
  for (const a of appts as Array<{ time?: string }>) if (a.time) booked.add(a.time);

  // Only client appointments block slots; LawyerAppointment is a separate manual store without lawyer linkage
  return allSlots.filter((s) => !booked.has(s));
}

// Bulk summary — used by frontend date cards to show correct "X slots available"
router.get("/lawyers/:slug/availability-summary", async (req, res): Promise<void> => {
  const slug = paramString(req.params.slug);
  const lawyer = await getLawyerBySlug(slug);
  if (!lawyer) {
    res.status(404).json({ error: "not_found", message: "Lawyer not found" });
    return;
  }
  const weekly = (lawyer as unknown as { weeklyHours?: Array<{ day: string; active: boolean; start: string; end: string }> }).weeklyHours;
  const effective = weekly && weekly.length > 0 ? weekly : DEFAULT_WEEKLY_HOURS;
  const startStr = todayIST();
  const dateStrs: string[] = [];
  for (let i = 0; i < 30; i++) {
    const base = new Date(`${startStr}T12:00:00+05:30`);
    base.setDate(base.getDate() + i);
    const ds = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata", year: "numeric", month: "2-digit", day: "2-digit" }).format(base);
    dateStrs.push(ds);
  }

  // Single query for all booked slots in window
  const appts = await db.Appointment.find({
    lawyerName: lawyer.name,
    date: { $in: dateStrs },
    status: { $ne: "cancelled" },
  } as unknown as Record<string, unknown>).lean();
  const bookedByDate = new Map<string, Set<string>>();
  for (const a of appts as Array<{ date?: string; time?: string }>) {
    if (!a.date || !a.time) continue;
    const s = bookedByDate.get(a.date) ?? new Set<string>();
    s.add(a.time);
    bookedByDate.set(a.date, s);
  }

  const todayStr = todayIST();
  const nowM = nowMinutesIST();
  const summary: Array<{ date: string; slots: string[]; freeCount: number; totalCount: number }> = [];

  for (const dateStr of dateStrs) {
    const dayName = dayNameIST(dateStr);
    const cfg = effective.find((h) => h.day === dayName);
    if (!cfg || !cfg.active) {
      summary.push({ date: dateStr, slots: [], freeCount: 0, totalCount: 0 });
      continue;
    }
    let allSlots = slotsForConfig(cfg);
    const total = allSlots.length;
    if (dateStr === todayStr) {
      allSlots = allSlots.filter((s) => {
        const [h, m] = s.split(":").map(Number);
        return h * 60 + m > nowM + 15;
      });
      if (allSlots.length === 0) {
        summary.push({ date: dateStr, slots: [], freeCount: 0, totalCount: total });
        continue;
      }
    }
    const booked = bookedByDate.get(dateStr) ?? new Set<string>();
    const free = allSlots.filter((s) => !booked.has(s));
    summary.push({ date: dateStr, slots: free, freeCount: free.length, totalCount: total });
  }
  res.json({ slotsByDate: summary });
});

router.get("/lawyers/:slug/availability", async (req, res): Promise<void> => {
  const slug = paramString(req.params.slug);
  const dateStr = typeof req.query.date === "string" ? req.query.date.trim() : "";
  if (!dateStr || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    res.status(400).json({ error: "validation_error", message: "date query YYYY-MM-DD required" });
    return;
  }
  const lawyer = await getLawyerBySlug(slug);
  if (!lawyer) {
    res.status(404).json({ error: "not_found", message: "Lawyer not found" });
    return;
  }
  const free = await freeSlotsForDate(lawyer as unknown as { name: string; weeklyHours?: Array<{ day: string; active: boolean; start: string; end: string }> }, dateStr);
  res.json({ date: dateStr, slots: free });
});

export default router;
