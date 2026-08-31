import * as db from "@workspace/db";
import bcrypt from "bcryptjs";
import {
  CreateAppointmentBody,
  CreateDocumentBody,
  CreateLawyerAppointmentBody,
  CreateLawyerClientBody,
  UpdateAppointmentBody,
  UpdateDocumentBody,
  UpdateLawyerAppointmentBody,
} from "@workspace/api-zod";

export function isHashed(pw: string): boolean {
  return pw.startsWith("$2a$") || pw.startsWith("$2b$") || pw.startsWith("$2y$");
}
export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 10);
}
export async function verifyPassword(plain: string, hashed: string): Promise<boolean> {
  if (!isHashed(hashed)) return plain === hashed;
  return bcrypt.compare(plain, hashed);
}
import type {
  Activity,
  Appointment,
  Client,
  DataExport,
  DataExportStatus,
  Document,
  Hearing,
  Lawyer,
  LawyerAnalytics,
  LawyerAppointment,
  LawyerNotification,
  LawyerProfileSummary,
  Notification,
  Service,
  UserRole,
  VerificationStatus,
} from "@workspace/api-zod";

const CLIENT_GRADIENTS = [
  "from-blue-500 to-indigo-700",
  "from-pink-500 to-rose-700",
  "from-green-500 to-emerald-700",
  "from-purple-500 to-fuchsia-700",
  "from-orange-500 to-red-700",
  "from-teal-500 to-cyan-700",
  "from-yellow-500 to-amber-700",
  "from-sky-500 to-blue-700",
];

type CreateAppointmentInput = typeof CreateAppointmentBody["_output"];
type UpdateAppointmentInput = typeof UpdateAppointmentBody["_output"];
type CreateDocumentInput = typeof CreateDocumentBody["_output"];
type UpdateDocumentInput = typeof UpdateDocumentBody["_output"];
type CreateLawyerAppointmentInput = typeof CreateLawyerAppointmentBody["_output"];
type UpdateLawyerAppointmentInput = typeof UpdateLawyerAppointmentBody["_output"];
type CreateClientInput = typeof CreateLawyerClientBody["_output"];

export interface StoredUser {
  id: string;
  name: string;
  email: string;
  password: string;
  phone?: string;
  role: UserRole;
  city?: string;
  state?: string;
  avatar?: string | null;
  dob?: string;
  gender?: string;
  street?: string;
  pincode?: string;
  language?: string;
  communication?: string;
  bci?: string;
  experience?: string;
  address?: string;
  fee?: string;
  bio?: string;
  practiceAreas?: string[];
  languages?: string[];
  notificationPreferences?: Map<string, boolean>;
}

function doc<T>(value: unknown): T {
  return value as T;
}

// ----- Services -----

export async function getServices(): Promise<Service[]> {
  return doc(await db.Service.find().lean());
}

export async function getServiceBySlug(slug: string): Promise<Service | undefined> {
  const found = await db.Service.findOne({ slug }).lean();
  return doc(found) ?? undefined;
}

// ----- Lawyers -----

export async function getLawyers(): Promise<Lawyer[]> {
  const lawyers = doc(await db.Lawyer.find().lean()) as Lawyer[];
  // Normalize legacy "online" → "both" so offline mode is always available to clients
  for (const l of lawyers as unknown as Array<{ availability?: string }>) {
    if (l.availability === "online") l.availability = "both";
  }
  return lawyers;
}

export async function backfillLawyerAvailability(): Promise<number> {
  const res = await db.Lawyer.updateMany(
    { availability: "online" } as unknown as Record<string, unknown>,
    { $set: { availability: "both" } } as unknown as Record<string, unknown>,
  );
  return (res as unknown as { modifiedCount: number }).modifiedCount ?? 0;
}

function slugifyName(name: string): string {
  return (
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "lawyer"
  );
}

const SLOT_DURATION_MIN = 45;
const BOOKING_WINDOW_DAYS = 30;

const pad2 = (n: number) => n.toString().padStart(2, "0");

function localDateStr(d: Date): string {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

export function generateAvailableSlotsFromWeeklyHours(
  weeklyHours: Array<{ day: string; active: boolean; start: string; end: string }>,
): Array<{ date: string; slots: string[] }> {
  const slots: Array<{ date: string; slots: string[] }> = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < BOOKING_WINDOW_DAYS; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    const dayName = date.toLocaleDateString("en-US", { weekday: "long" });
    const cfg = weeklyHours.find((h) => h.day === dayName && h.active);
    if (!cfg) continue;

    const [sh, sm] = cfg.start.split(":").map(Number);
    const [eh, em] = cfg.end.split(":").map(Number);
    const startM = (sh ?? 0) * 60 + (sm ?? 0);
    const endM = (eh ?? 0) * 60 + (em ?? 0);

    const daySlots: string[] = [];
    for (let t = startM; t + SLOT_DURATION_MIN <= endM; t += SLOT_DURATION_MIN) {
      daySlots.push(`${pad2(Math.floor(t / 60))}:${pad2(t % 60)}`);
    }
    if (daySlots.length === 0) continue;
    slots.push({ date: localDateStr(date), slots: daySlots });
  }

  return slots;
}

export async function regenerateLawyerAvailableSlots(
  lawyerId: string,
  weeklyHours: Array<{ day: string; active: boolean; start: string; end: string }>
): Promise<void> {
  const slots = generateAvailableSlotsFromWeeklyHours(weeklyHours);
  await db.Lawyer.updateOne({ id: lawyerId }, { $set: { availableSlots: slots } });
}

export async function ensurePublicLawyerEntry(user: StoredUser): Promise<void> {
  const existing = await db.Lawyer.findOne({ id: user.id }).lean() as unknown as { availability?: string } | null;
  if (existing) {
    if (existing.availability === "online") {
      await db.Lawyer.updateOne({ id: user.id }, { $set: { availability: "both" } });
    }
    return;
  }
  const name = user.name.trim();
  const baseSlug = slugifyName(name);
  let slug = baseSlug;
  let n = 2;
  while (await db.Lawyer.findOne({ slug }).lean()) {
    slug = `${baseSlug}-${n++}`;
  }
  const count = await db.Lawyer.countDocuments();
  const defaultWeeklyHours = [
    { day: "Monday", active: true, start: "09:00", end: "17:00" },
    { day: "Tuesday", active: true, start: "09:00", end: "17:00" },
    { day: "Wednesday", active: true, start: "09:00", end: "17:00" },
    { day: "Thursday", active: true, start: "09:00", end: "17:00" },
    { day: "Friday", active: true, start: "09:00", end: "17:00" },
    { day: "Saturday", active: true, start: "10:00", end: "14:00" },
    { day: "Sunday", active: false, start: "10:00", end: "14:00" },
  ];
  await db.Lawyer.create({
    id: user.id,
    name,
    slug,
    avatar: user.avatar ?? "",
    avatarGradient: CLIENT_GRADIENTS[count % CLIENT_GRADIENTS.length],
    specializations: [],
    primarySpecialization: "",
    experience: 0,
    rating: 0,
    reviewCount: 0,
    city: user.city ?? "",
    state: user.state ?? "",
    languages: [],
    consultationFee: 0,
    availability: "both",
    isVerified: false,
    isPremium: false,
    casesWon: 0,
    totalCases: 0,
    bio: "",
    education: [],
    courtRegistrations: [],
    officeAddress: "",
    phone: user.phone ?? "",
    email: user.email,
    awards: [],
    reviewsList: [],
    availableSlots: generateAvailableSlotsFromWeeklyHours(defaultWeeklyHours),
    weeklyHours: defaultWeeklyHours,
  });
}

export async function getLawyerBySlug(slug: string): Promise<Lawyer | undefined> {
  const found = await db.Lawyer.findOne({ slug }).lean();
  const lawyer = doc(found) as Lawyer | undefined;
  if (lawyer && (lawyer as unknown as { availability?: string }).availability === "online") {
    (lawyer as unknown as { availability: string }).availability = "both";
  }
  return lawyer ?? undefined;
}

export async function getLawyerReviews(): Promise<Lawyer["reviewsList"]> {
  const found = await db.Review.find({ status: "approved" }).sort({ createdAt: -1 }).lean() as unknown as Array<{ author?: string; rating?: number; date?: string; comment?: string; caseType?: string; createdAt?: string }>;
  const reviews = found.map((r) => ({
    id: r.author ?? "",
    author: r.author ?? "",
    rating: r.rating ?? 0,
    date: r.date ?? r.createdAt ?? "",
    comment: r.comment ?? "",
    caseType: r.caseType ?? "",
  }));
  return reviews;
}

export interface ReviewStats {
  totalReviews: number;
  averageRating: number;
  starDistribution: Array<{ stars: number; count: number; percentage: number }>;
  caseTypeHighlights: Array<{ name: string; count: number }>;
}

export async function getReviewStats(): Promise<ReviewStats> {
  const reviews = await db.Review.find({ status: "approved" }).lean() as unknown as Array<{ rating?: number; caseType?: string }>;
  const totalReviews = reviews.length;
  const totalRating = reviews.reduce((sum, r) => sum + (r.rating ?? 0), 0);
  const averageRating = totalReviews > 0 ? Math.round((totalRating / totalReviews) * 10) / 10 : 0;

  const starCounts = [0, 0, 0, 0, 0];
  for (const r of reviews) {
    const rating = r.rating ?? 0;
    if (rating >= 1 && rating <= 5) starCounts[rating - 1]++;
  }
  const starDistribution = [5, 4, 3, 2, 1].map((stars) => ({
    stars,
    count: starCounts[stars - 1],
    percentage: totalReviews > 0 ? Math.round((starCounts[stars - 1] / totalReviews) * 100) : 0,
  }));

  const caseTypeMap = new Map<string, number>();
  for (const r of reviews) {
    const ct = r.caseType ?? "General";
    caseTypeMap.set(ct, (caseTypeMap.get(ct) ?? 0) + 1);
  }
  const caseTypeHighlights = [...caseTypeMap.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return { totalReviews, averageRating, starDistribution, caseTypeHighlights };
}

export interface AnalyticsInsights {
  bestDay: { day: string; percentage: number };
  mostCommonCase: { name: string; percentage: number };
  peakHours: { range: string; percentage: number };
}

export async function getAnalyticsInsights(): Promise<AnalyticsInsights> {
  const appointments = await db.LawyerAppointment.find({ status: { $ne: "cancelled" } }).lean() as unknown as Array<{ date?: string; time?: string; caseType?: string }>;
  const allAppts = await db.Appointment.find({ status: { $ne: "cancelled" } }).lean() as unknown as Array<{ date?: string; time?: string; caseType?: string }>;
  const combined = [...appointments, ...allAppts];

  // Best day of week
  const dayCounts = new Map<string, number>();
  for (const a of combined) {
    if (!a.date) continue;
    const d = new Date(`${a.date}T12:00:00+05:30`);
    if (Number.isNaN(d.getTime())) continue;
    const dayName = d.toLocaleDateString("en-US", { weekday: "long", timeZone: "Asia/Kolkata" });
    dayCounts.set(dayName, (dayCounts.get(dayName) ?? 0) + 1);
  }
  let bestDay = { day: "No data", percentage: 0 };
  if (dayCounts.size > 0) {
    const sorted = [...dayCounts.entries()].sort((a, b) => b[1] - a[1]);
    const total = sorted.reduce((s, [, c]) => s + c, 0);
    bestDay = { day: sorted[0][0], percentage: Math.round((sorted[0][1] / total) * 100) };
  }

  // Most common case type
  const caseCounts = new Map<string, number>();
  for (const a of combined) {
    const ct = a.caseType ?? "General";
    caseCounts.set(ct, (caseCounts.get(ct) ?? 0) + 1);
  }
  let mostCommonCase = { name: "No data", percentage: 0 };
  if (caseCounts.size > 0) {
    const sorted = [...caseCounts.entries()].sort((a, b) => b[1] - a[1]);
    const total = sorted.reduce((s, [, c]) => s + c, 0);
    mostCommonCase = { name: sorted[0][0], percentage: Math.round((sorted[0][1] / total) * 100) };
  }

  // Peak hours
  const hourCounts = new Map<string, number>();
  for (const a of combined) {
    if (!a.time) continue;
    const hour = parseInt(a.time.split(":")[0], 10);
    if (Number.isNaN(hour)) continue;
    let slot = "Morning (6AM-12PM)";
    if (hour >= 12 && hour < 17) slot = "Afternoon (12PM-5PM)";
    else if (hour >= 17 && hour < 21) slot = "Evening (5PM-9PM)";
    else if (hour >= 21 || hour < 6) slot = "Night (9PM-6AM)";
    hourCounts.set(slot, (hourCounts.get(slot) ?? 0) + 1);
  }
  let peakHours = { range: "No data", percentage: 0 };
  if (hourCounts.size > 0) {
    const sorted = [...hourCounts.entries()].sort((a, b) => b[1] - a[1]);
    const total = sorted.reduce((s, [, c]) => s + c, 0);
    peakHours = { range: sorted[0][0], percentage: Math.round((sorted[0][1] / total) * 100) };
  }

  return { bestDay, mostCommonCase, peakHours };
}

const BAD_WORDS = ["spam", "fake", "abuse", "hate", "idiot", "stupid"];
export function containsBadWords(text: string): boolean {
  const low = text.toLowerCase();
  return BAD_WORDS.some((w) => low.includes(w));
}

export async function createReview(data: { lawyerSlug?: string; lawyerId?: string; author: string; authorId?: string; rating: number; comment: string; caseType: string }): Promise<Record<string, unknown>> {
  const review = {
    id: `r${Date.now()}${Math.random().toString(36).slice(2, 6)}`,
    lawyerSlug: data.lawyerSlug ?? "",
    lawyerId: data.lawyerId ?? "",
    author: data.author,
    authorId: data.authorId ?? "",
    rating: data.rating,
    comment: data.comment,
    caseType: data.caseType,
    status: containsBadWords(data.comment) ? "flagged" : "pending",
    createdAt: new Date().toISOString(),
  };
  await db.Review.create(review);
  return review;
}

export async function getApprovedReviews(lawyerSlug?: string): Promise<Record<string, unknown>[]> {
  const q: Record<string, unknown> = { status: "approved" };
  if (lawyerSlug) q.lawyerSlug = lawyerSlug;
  return db.Review.find(q).sort({ createdAt: -1 }).lean() as unknown as Record<string, unknown>[];
}

export async function getPendingReviews(): Promise<Record<string, unknown>[]> {
  return db.Review.find({ status: { $in: ["pending", "flagged"] } }).sort({ createdAt: -1 }).lean() as unknown as Record<string, unknown>[];
}

export async function reviewReview(id: string, status: "approved" | "rejected", note?: string): Promise<Record<string, unknown> | undefined> {
  const updated = await db.Review.findOneAndUpdate({ id }, { $set: { status, reviewNote: note ?? "", reviewedAt: new Date().toISOString() } }, { new: true }).lean();
  return updated as unknown as Record<string, unknown> | undefined;
}

// ----- Appointments -----

export async function getAppointments(): Promise<Appointment[]> {
  const appts = doc<Appointment[]>(await db.Appointment.find().lean());
  // Enrich client appointments with meetLink created on lawyer side (LawyerAppointment) for same slot
  try {
    const lawyerApts = await db.LawyerAppointment.find({ meetLink: { $exists: true, $ne: "" } } as unknown as Record<string, unknown>).lean() as unknown as Array<{ date: string; time: string; meetLink: string }>;
    const meetBySlot = new Map<string, string>();
    for (const la of lawyerApts) if (la.date && la.time && la.meetLink) meetBySlot.set(`${la.date}|${la.time}`, la.meetLink);
    if (meetBySlot.size > 0) {
      for (const a of appts as unknown as Array<{ date?: string; time?: string; meetLink?: string }>) {
        if (!a.meetLink && a.date && a.time) {
          const ml = meetBySlot.get(`${a.date}|${a.time}`);
          if (ml) (a as unknown as { meetLink: string }).meetLink = ml;
        }
      }
    }
  } catch {}
  return appts;
}

export async function createAppointment(data: CreateAppointmentInput): Promise<Appointment> {
  const appointment = { id: `a${Date.now()}${Math.random().toString(36).slice(2, 6)}`, status: "pending" as const, ...data };
  await db.Appointment.create(appointment);
  return appointment;
}

export async function getAppointmentById(id: string): Promise<Appointment | undefined> {
  const found = await db.Appointment.findOne({ id }).lean();
  return doc(found) ?? undefined;
}

export async function updateAppointment(
  id: string,
  patch: UpdateAppointmentInput,
): Promise<Appointment | undefined> {
  const updated = await db.Appointment.findOneAndUpdate({ id }, { $set: patch }, { new: true }).lean();
  return doc(updated) ?? undefined;
}

// ----- Documents -----

export async function getDocuments(): Promise<Document[]> {
  return doc(await db.Document.find().lean());
}

export async function getDocumentById(id: string): Promise<Document | undefined> {
  const found = await db.Document.findOne({ id }).lean();
  return doc(found) ?? undefined;
}

export async function attachDocumentFile(id: string, fileName: string): Promise<Document | undefined> {
  const existing = await db.Document.findOne({ id }).lean() as unknown as { fileName?: string; versions?: Array<{ fileName: string; replacedAt: string }> } | null;
  const versions = (existing?.versions as Array<{ fileName: string; replacedAt: string }>) ?? [];
  if (existing?.fileName) versions.push({ fileName: existing.fileName, replacedAt: new Date().toISOString() });
  const updated = await db.Document.findOneAndUpdate({ id }, { $set: { fileName, versions } }, { new: true }).lean();
  return doc(updated) ?? undefined;
}

export async function addDocumentComment(id: string, comment: { id: string; text: string; author: string; authorRole: string; createdAt: string }): Promise<Document | undefined> {
  const updated = await db.Document.findOneAndUpdate({ id }, { $push: { comments: comment } }, { new: true }).lean();
  return doc(updated) ?? undefined;
}

export async function getDocumentComments(id: string): Promise<Array<{ id: string; text: string; author: string; authorRole: string; createdAt: string }>> {
  const docFound = await db.Document.findOne({ id }).lean() as unknown as { comments?: Array<{ id: string; text: string; author: string; authorRole: string; createdAt: string }> } | null;
  return (docFound?.comments as Array<{ id: string; text: string; author: string; authorRole: string; createdAt: string }>) ?? [];
}

export async function createDocument(
  data: CreateDocumentInput,
  uploadedBy?: { id: string; name: string },
): Promise<Document> {
  const document = {
    id: `d${Date.now()}${Math.random().toString(36).slice(2, 6)}`,
    uploadedAt: new Date().toISOString(),
    status: "pending_review" as const,
    ...data,
    ...(uploadedBy ? { uploadedBy: uploadedBy.id, uploadedByName: uploadedBy.name } : {}),
  };
  await db.Document.create(document as unknown as Record<string, unknown>);
  return document as unknown as Document;
}

export async function updateDocument(
  id: string,
  patch: UpdateDocumentInput,
): Promise<Document | undefined> {
  const updated = await db.Document.findOneAndUpdate({ id }, { $set: patch }, { new: true }).lean();
  return doc(updated) ?? undefined;
}

export async function deleteDocument(id: string): Promise<boolean> {
  const result = await db.Document.deleteOne({ id });
  return result.deletedCount > 0;
}

// ----- Contact submissions -----

export interface StoredContactAttachment {
  name: string;
  size: number;
  type: string;
  storedPath: string;
}

export async function createContactSubmission(data: {
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
  attachments: StoredContactAttachment[];
}): Promise<{ id: string; createdAt: string }> {
  const submission = {
    id: `c${Date.now()}${Math.random().toString(36).slice(2, 6)}`,
    createdAt: new Date().toISOString(),
    ...data,
  };
  await db.ContactSubmission.create(submission);
  return { id: submission.id, createdAt: submission.createdAt };
}

// ----- Notifications (client) -----

export async function getNotifications(): Promise<Notification[]> {
  return doc(await db.Notification.find().lean());
}

export async function markNotificationRead(id: string): Promise<Notification | undefined> {
  const updated = await db.Notification.findOneAndUpdate(
    { id },
    { $set: { isRead: true } },
    { new: true },
  ).lean();
  return doc(updated) ?? undefined;
}

// ----- Activities -----

export async function getActivities(): Promise<Activity[]> {
  return doc(await db.Activity.find().lean());
}

// ----- Lawyer portal -----

const EMPTY_LAWYER_PROFILE: LawyerProfileSummary = {
  name: "",
  initials: "",
  gradient: "",
  specialization: "",
  city: "",
  rating: 0,
  reviewCount: 0,
  isVerified: false,
  isPremium: false,
  email: "",
  phone: "",
  experience: 0,
  casesWon: 0,
  totalCases: 0,
  consultationFee: 0,
};

export async function getLawyerProfile(): Promise<LawyerProfileSummary> {
  const found = await db.LawyerProfile.findOne({}).lean();
  return doc(found) ?? EMPTY_LAWYER_PROFILE;
}

export async function ensureLawyerProfileForUser(
  user: Pick<StoredUser, "name" | "email" | "phone" | "city">,
): Promise<LawyerProfileSummary> {
  const existing = await db.LawyerProfile.findOne({}).lean();
  if (existing) return doc(existing);
  return createLawyerProfileForUser(user);
}

export async function createLawyerProfileForUser(
  user: Pick<StoredUser, "name" | "email" | "phone" | "city">,
): Promise<LawyerProfileSummary> {
  const name = user.name.trim();
  const initials =
    name
      .split(/\s+/)
      .map((part) => part[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase() || "L";
  const count = await db.LawyerProfile.countDocuments();
  const profile: LawyerProfileSummary = {
    ...EMPTY_LAWYER_PROFILE,
    name,
    initials,
    gradient: CLIENT_GRADIENTS[count % CLIENT_GRADIENTS.length],
    email: user.email,
    phone: user.phone ?? "",
    city: user.city ?? "",
  };
  await db.LawyerProfile.create(profile);
  return profile;
}

export async function getClients(): Promise<Client[]> {
  return doc(await db.Client.find({ visibility: { $ne: "private" } }).lean());
}

export type ClientVisibility = "public" | "lawyers_only" | "private";

export async function getAccountVisibility(userId: string): Promise<ClientVisibility> {
  const user = await findUserById(userId);
  if (!user) return "lawyers_only";
  const row = await db.Client.findOne({ email: user.email }).lean();
  const saved = doc<{ visibility?: string }>(row)?.visibility;
  return saved === "public" || saved === "lawyers_only" || saved === "private" ? saved : "lawyers_only";
}

export async function updateAccountVisibility(
  userId: string,
  visibility: ClientVisibility,
): Promise<ClientVisibility> {
  const user = await findUserById(userId);
  if (!user) return "lawyers_only";
  const existing = await db.Client.findOne({ email: user.email }).lean();
  if (existing) {
    await db.Client.updateOne(
      { email: user.email },
      {
        $set: {
          visibility,
          phone: doc<{ phone?: string }>(existing).phone ?? user.phone ?? "",
          city: doc<{ city?: string }>(existing).city ?? user.city ?? "",
          caseType: doc<{ caseType?: string }>(existing).caseType ?? "General",
          notes: doc<{ notes?: string }>(existing).notes ?? "",
        },
      },
    );
    return visibility;
  }
  const name = user.name.trim();
  const initials =
    name
      .split(/\s+/)
      .map((part) => part[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase() || "C";
  const count = await db.Client.countDocuments();
  await db.Client.create({
    id: `c${Date.now()}${Math.random().toString(36).slice(2, 6)}`,
    name,
    initials,
    gradient: CLIENT_GRADIENTS[count % CLIENT_GRADIENTS.length],
    email: user.email,
    phone: user.phone ?? "",
    city: user.city ?? "",
    caseType: "General",
    status: "active",
    visibility,
    totalSessions: 0,
    amountPaid: 0,
    notes: "",
    lastContact: new Date().toISOString().slice(0, 10),
  });
  return visibility;
}

export async function createClient(data: CreateClientInput): Promise<Client> {
  const name = data.name.trim();
  const initials =
    name
      .split(/\s+/)
      .map((part) => part[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase() || "C";
  const count = await db.Client.countDocuments();
  const client = {
    id: `c${Date.now()}${Math.random().toString(36).slice(2, 6)}`,
    initials,
    gradient: CLIENT_GRADIENTS[count % CLIENT_GRADIENTS.length],
    totalSessions: 0,
    amountPaid: 0,
    lastContact: data.lastContact || new Date().toISOString().slice(0, 10),
    ...data,
  };
  await db.Client.create(client);
  return client;
}

export async function getLawyerAppointments(): Promise<LawyerAppointment[]> {
  const lawApts = doc<LawyerAppointment[]>(await db.LawyerAppointment.find().lean());
  // Enrich lawyer appointments with meetLink created on client side (Appointment) for same slot
  try {
    const clientApts = await db.Appointment.find({ meetLink: { $exists: true, $ne: "" } } as unknown as Record<string, unknown>).lean() as unknown as Array<{ date: string; time: string; meetLink: string }>;
    const meetBySlot = new Map<string, string>();
    for (const ca of clientApts) if (ca.date && ca.time && ca.meetLink) meetBySlot.set(`${ca.date}|${ca.time}`, ca.meetLink);
    if (meetBySlot.size > 0) {
      for (const la of lawApts as unknown as Array<{ date?: string; time?: string; meetLink?: string }>) {
        if (!la.meetLink && la.date && la.time) {
          const ml = meetBySlot.get(`${la.date}|${la.time}`);
          if (ml) (la as unknown as { meetLink: string }).meetLink = ml;
        }
      }
    }
  } catch {}
  return lawApts;
}

export async function createLawyerAppointment(
  data: CreateLawyerAppointmentInput,
): Promise<LawyerAppointment> {
  const appointment = { id: `la${Date.now()}${Math.random().toString(36).slice(2, 6)}`, ...data };
  await db.LawyerAppointment.create(appointment);
  return appointment;
}

export async function getLawyerAppointmentById(id: string): Promise<LawyerAppointment | undefined> {
  const found = await db.LawyerAppointment.findOne({ id }).lean();
  return doc(found) ?? undefined;
}

export async function updateLawyerAppointment(
  id: string,
  patch: UpdateLawyerAppointmentInput,
): Promise<LawyerAppointment | undefined> {
  const updated = await db.LawyerAppointment.findOneAndUpdate(
    { id },
    { $set: patch },
    { new: true },
  ).lean();
  return doc(updated) ?? undefined;
}

export async function getHearings(): Promise<Hearing[]> {
  return doc(await db.Hearing.find().lean());
}

export async function getLawyerAnalytics(): Promise<LawyerAnalytics | null> {
  const found = await db.LawyerAnalytics.findOne({}).lean();
  return doc(found) ?? null;
}

export async function getLawyerNotifications(): Promise<LawyerNotification[]> {
  return doc(await db.LawyerNotification.find().lean());
}

// ----- Lawyer verification -----

export interface StoredVerificationFile {
  name: string;
  fileName: string;
  size: number;
  type: string;
}

export async function getVerificationByEmail(email: string): Promise<VerificationStatus | undefined> {
  const found = await db.Verification.findOne({ email }).lean();
  return doc(found) ?? undefined;
}

export async function getVerificationById(id: string): Promise<VerificationStatus | undefined> {
  const found = await db.Verification.findOne({ id }).lean();
  return doc(found) ?? undefined;
}

export async function getVerifications(): Promise<VerificationStatus[]> {
  return doc(await db.Verification.find().sort({ submittedAt: -1 }).lean());
}

export async function createVerification(data: {
  email: string;
  name: string;
  bciNumber: string;
  selfie: StoredVerificationFile;
  documents: StoredVerificationFile[];
}): Promise<VerificationStatus> {
  const verification = {
    id: `v${Date.now()}${Math.random().toString(36).slice(2, 6)}`,
    status: "pending" as const,
    submittedAt: new Date().toISOString(),
    ...data,
  };
  await db.Verification.create(verification);
  return verification;
}

export async function updateVerificationStatus(
  id: string,
  patch: { status: "approved" | "rejected"; reason?: string },
): Promise<VerificationStatus | undefined> {
  const updated = await db.Verification.findOneAndUpdate(
    { id },
    { $set: { ...patch, reviewedAt: new Date().toISOString() } },
    { new: true },
  ).lean();
  return doc(updated) ?? undefined;
}

export async function deleteVerification(id: string): Promise<boolean> {
  const result = await db.Verification.deleteOne({ id });
  return result.deletedCount > 0;
}

// ----- Data exports -----

export async function listDataExports(): Promise<DataExport[]> {
  return doc(await db.DataExport.find().sort({ requestedAt: -1 }).lean());
}

export async function getDataExportsByEmail(email: string): Promise<DataExport[]> {
  return doc(await db.DataExport.find({ email }).sort({ requestedAt: -1 }).lean());
}

export async function getPendingDataExport(email: string): Promise<DataExport | undefined> {
  const found = await db.DataExport.findOne({ email, status: "pending" }).lean();
  return doc(found) ?? undefined;
}

export async function createDataExportRequest(
  user: Pick<StoredUser, "id" | "name" | "email">,
  kind: string = "personal_data",
): Promise<DataExport> {
  const dataExport: DataExport = {
    id: `de${Date.now()}${Math.random().toString(36).slice(2, 6)}`,
    email: user.email,
    userName: user.name,
    status: "pending",
    requestedAt: new Date().toISOString(),
    kind,
  } as DataExport;
  await db.DataExport.create(dataExport);
  return dataExport;
}

export async function reviewDataExport(
  id: string,
  status: DataExportStatus,
  reason: string,
): Promise<DataExport | undefined> {
  const found = await db.DataExport.findOne({ id }).lean();
  if (!found) return undefined;
  await db.DataExport.updateOne({ id }, { $set: { status, reason, decidedAt: new Date().toISOString() } });
  return { ...doc<DataExport>(found), status, reason, decidedAt: new Date().toISOString() };
}

// ----- Auth -----

export interface ChatMessage {
  id: string;
  conversationId: string;
  clientId: string;
  lawyerId: string;
  senderId: string;
  senderRole: "client" | "lawyer";
  senderName: string;
  body: string;
  createdAt: string;
  read: boolean;
}

export interface LawyerConversation {
  clientId: string;
  clientName: string;
  clientAvatar: string;
  clientEmail: string;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
  messages: ChatMessage[];
}

export interface ClientConversation {
  lawyerId: string;
  lawyerName: string;
  lawyerAvatar: string;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
  messages: ChatMessage[];
}

function toChatMessage(value: unknown): ChatMessage {
  return doc(value);
}

export async function getMessagesBetween(
  clientId: string,
  lawyerId: string,
): Promise<ChatMessage[]> {
  const found = await db.Message.find({ clientId, lawyerId }).sort({ createdAt: 1 }).lean();
  return doc<ChatMessage[]>(found).map(toChatMessage);
}

export async function markConversationRead(
  conversationId: string,
  readerId: string,
): Promise<void> {
  await db.Message.updateMany(
    { conversationId, senderId: { $ne: readerId }, read: false },
    { $set: { read: true } },
  );
}

export async function createMessage(input: {
  clientId: string;
  lawyerId: string;
  senderId: string;
  senderRole: "client" | "lawyer";
  senderName: string;
  body: string;
}): Promise<ChatMessage> {
  const message: ChatMessage = {
    id: `m${Date.now()}${Math.random().toString(36).slice(2, 8)}`,
    conversationId: `${input.clientId}:${input.lawyerId}`,
    clientId: input.clientId,
    lawyerId: input.lawyerId,
    senderId: input.senderId,
    senderRole: input.senderRole,
    senderName: input.senderName,
    body: input.body,
    createdAt: new Date().toISOString(),
    read: false,
  };
  await db.Message.create(message);
  return message;
}

export async function getLawyerConversations(lawyerId: string): Promise<LawyerConversation[]> {
  const found = await db.Message.find({ lawyerId }).sort({ createdAt: 1 }).lean();
  const messages = doc<ChatMessage[]>(found).map(toChatMessage);
  const byClient = new Map<string, ChatMessage[]>();
  for (const message of messages) {
    const list = byClient.get(message.clientId) ?? [];
    list.push(message);
    byClient.set(message.clientId, list);
  }
  const conversations: LawyerConversation[] = [];
  for (const [clientId, list] of byClient) {
    const client = await findUserById(clientId);
    const last = list[list.length - 1];
    conversations.push({
      clientId,
      clientName: client?.name ?? last.senderName,
      clientAvatar: client?.avatar ?? "",
      clientEmail: client?.email ?? "",
      lastMessage: last.body,
      lastMessageAt: last.createdAt,
      unreadCount: list.filter((m) => !m.read && m.senderRole === "client").length,
      messages: list,
    });
  }
  return conversations.sort((a, b) => (a.lastMessageAt < b.lastMessageAt ? 1 : -1));
}

export async function getClientConversations(clientId: string): Promise<ClientConversation[]> {
  const found = await db.Message.find({ clientId }).sort({ createdAt: 1 }).lean();
  const messages = doc<ChatMessage[]>(found).map(toChatMessage);
  const byLawyer = new Map<string, ChatMessage[]>();
  for (const message of messages) {
    const list = byLawyer.get(message.lawyerId) ?? [];
    list.push(message);
    byLawyer.set(message.lawyerId, list);
  }
  const conversations: ClientConversation[] = [];
  for (const [lawyerId, list] of byLawyer) {
    const lawyer = (await db.Lawyer.findOne({ id: lawyerId }).lean()) as
      | { id: string; name?: string; avatar?: string | null }
      | null;
    const last = list[list.length - 1];
    conversations.push({
      lawyerId,
      lawyerName: lawyer?.name ?? last.senderName,
      lawyerAvatar: lawyer?.avatar ?? "",
      lastMessage: last.body,
      lastMessageAt: last.createdAt,
      unreadCount: list.filter((m) => !m.read && m.senderRole === "lawyer").length,
      messages: list,
    });
  }
  return conversations.sort((a, b) => (a.lastMessageAt < b.lastMessageAt ? 1 : -1));
}

export async function findUserByEmail(email: string): Promise<StoredUser | undefined> {
  const found = await db.User.findOne({ email }).lean();
  return doc(found) ?? undefined;
}

export async function findUserById(id: string): Promise<StoredUser | undefined> {
  const found = await db.User.findOne({ id }).lean();
  return doc(found) ?? undefined;
}

export async function updateUserPassword(id: string, password: string): Promise<boolean> {
  const hashed = isHashed(password) ? password : await hashPassword(password);
  const updated = await db.User.updateOne({ id }, { $set: { password: hashed } });
  return updated.modifiedCount > 0;
}

export async function updateUserAvatar(id: string, fileName: string): Promise<boolean> {
  const updated = await db.User.updateOne({ id }, { $set: { avatar: fileName } });
  return updated.modifiedCount > 0;
}

export async function clearUserAvatar(id: string): Promise<boolean> {
  const updated = await db.User.updateOne({ id }, { $set: { avatar: null } });
  return updated.modifiedCount > 0;
}

export interface ProfileUpdate {
  name?: string;
  email?: string;
  phone?: string;
  dob?: string;
  gender?: string;
  street?: string;
  city?: string;
  state?: string;
  pincode?: string;
  language?: string;
  communication?: string;
  avatar?: string | null;
  bci?: string;
  experience?: string;
  address?: string;
  fee?: string;
  bio?: string;
  practiceAreas?: string[];
  languages?: string[];
}

const PROFILE_FIELDS: (keyof ProfileUpdate)[] = [
  "name",
  "email",
  "phone",
  "dob",
  "gender",
  "street",
  "city",
  "state",
  "pincode",
  "language",
  "communication",
  "avatar",
  "bci",
  "experience",
  "address",
  "fee",
  "bio",
  "practiceAreas",
  "languages",
];

function profileInitials(name: string): string {
  return (
    name
      .split(/\s+/)
      .map((part) => part[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase() || "L"
  );
}

export async function syncLawyerDirectoryAvatar(id: string, avatar: string | null): Promise<void> {
  const user = await findUserById(id);
  if (!user || user.role !== "lawyer") return;
  await db.Lawyer.updateOne({ id }, { $set: { avatar: avatar ?? "" } });
}

export async function updateUserProfile(
  userId: string,
  input: Record<string, unknown>,
): Promise<StoredUser | undefined> {
  const existing = await findUserById(userId);
  if (!existing) return undefined;
  // alias fullName from client Profile form
  if (input["fullName"] !== undefined && input["name"] === undefined) {
    input["name"] = input["fullName"];
  }
  const patch: Record<string, unknown> = {};
  for (const key of PROFILE_FIELDS) {
    if (input[key] === undefined) continue;
    patch[key] = input[key] ?? "";
  }
  if (Object.keys(patch).length === 0) return existing;
  await db.User.updateOne({ id: userId }, { $set: patch });
  if (existing.role === "lawyer") {
    const name = input["name"] !== undefined ? String(input["name"] ?? "") : undefined;
    const email = input["email"] !== undefined ? String(input["email"] ?? "") : undefined;
    const phone = input["phone"] !== undefined ? String(input["phone"] ?? "") : undefined;
    const city = input["city"] !== undefined ? String(input["city"] ?? "") : undefined;
    const state = input["state"] !== undefined ? String(input["state"] ?? "") : undefined;
    const avatar = input["avatar"] !== undefined ? String(input["avatar"] ?? "") : undefined;
    const languages = Array.isArray(input["languages"]) ? input["languages"].filter((l): l is string => typeof l === "string") : undefined;
    const practiceAreas = Array.isArray(input["practiceAreas"]) ? input["practiceAreas"].filter((p): p is string => typeof p === "string") : undefined;
    const experience = input["experience"] !== undefined ? Number(input["experience"]) : undefined;
    const fee = input["fee"] !== undefined ? Number(input["fee"]) : undefined;
    const address = input["address"] !== undefined ? String(input["address"] ?? "") : undefined;
    const bio = input["bio"] !== undefined ? String(input["bio"] ?? "") : undefined;
    const validNumber = (n: number | undefined): number | undefined =>
      n !== undefined && Number.isFinite(n) ? n : undefined;

    const profilePatch: Record<string, unknown> = {};
    if (name !== undefined) {
      profilePatch["name"] = name;
      profilePatch["initials"] = profileInitials(name);
    }
    if (email !== undefined) profilePatch["email"] = email;
    if (phone !== undefined) profilePatch["phone"] = phone;
    if (city !== undefined) profilePatch["city"] = city;
    if (experience !== undefined) profilePatch["experience"] = validNumber(experience);
    if (fee !== undefined) profilePatch["consultationFee"] = validNumber(fee);
    if (practiceAreas !== undefined) profilePatch["specialization"] = practiceAreas[0] ?? "";
    if (Object.keys(profilePatch).length > 0) {
      const profile = await db.LawyerProfile.findOne({}).lean();
      if (profile) await db.LawyerProfile.updateOne({}, { $set: profilePatch });
      else await db.LawyerProfile.create({ ...EMPTY_LAWYER_PROFILE, ...profilePatch });
    }

    const directoryPatch: Record<string, unknown> = {};
    if (name !== undefined) directoryPatch["name"] = name;
    if (avatar !== undefined) directoryPatch["avatar"] = avatar;
    if (email !== undefined) directoryPatch["email"] = email;
    if (phone !== undefined) directoryPatch["phone"] = phone;
    if (city !== undefined) directoryPatch["city"] = city;
    if (state !== undefined) directoryPatch["state"] = state;
    if (languages !== undefined) directoryPatch["languages"] = languages;
    if (practiceAreas !== undefined) {
      directoryPatch["specializations"] = practiceAreas;
      directoryPatch["primarySpecialization"] = practiceAreas[0] ?? "";
    }
    if (experience !== undefined) directoryPatch["experience"] = validNumber(experience);
    if (fee !== undefined) directoryPatch["consultationFee"] = validNumber(fee);
    if (address !== undefined) directoryPatch["officeAddress"] = address;
    if (bio !== undefined) directoryPatch["bio"] = bio;
    if (Object.keys(directoryPatch).length > 0) {
      await db.Lawyer.updateOne({ id: userId }, { $set: directoryPatch });
    }
  }
  // Update notification preferences if provided - store compound keys like appointments_email, payments_sms, etc.
  if (input["notificationPreferences"] !== undefined) {
    const existingMap = existing.notificationPreferences as Map<string, boolean> | undefined;
    const np = new Map<string, boolean>(existingMap ?? []);
    const prefs = input["notificationPreferences"] as Record<string, unknown>;
    for (const [key, value] of Object.entries(prefs)) {
      if (typeof value !== 'boolean') continue;
      if (!key.endsWith('_email') && !key.endsWith('_sms')) continue;
      np.set(key, value);
    }
    await db.User.updateOne({ id: userId }, { $set: { notificationPreferences: np } });
  }
  const updated = await findUserById(userId);
  return updated;
}

export async function deleteAccountData(
  email: string,
  role: UserRole,
  userId?: string,
): Promise<{ verificationFiles: string[] }> {
  const verifications = await db.Verification.find({ email }).lean();
  await Promise.all([
    db.User.deleteMany({ email }),
    db.Client.deleteMany({ email }),
    db.Lawyer.deleteMany({ email }),
    db.LawyerProfile.deleteMany({ email }),
    db.Verification.deleteMany({ email }),
    db.ContactSubmission.deleteMany({ email }),
    db.DataExport.deleteMany({ email }),
  ]);
  if (userId) {
    await Promise.all([
      db.Message.deleteMany({ clientId: userId }),
      db.Message.deleteMany({ lawyerId: userId }),
    ]);
  }
  // Data correctness: don't wipe entire shared collections when one account is deleted.
  // Collections like appointments/documents/hearings/lawyer* are single-tenant per role in current schema
  // (no email/userId linkage), so deleting all on single account delete is destructive.
  // Now we only delete per-email/userId data; shared collections are left intact.
  // To make these per-user, add email/userId to those schemas and filter here.
  const verificationFiles: string[] = [];
  for (const verification of verifications) {
    if (verification.selfie != null && typeof verification.selfie.fileName === "string") {
      verificationFiles.push(verification.selfie.fileName);
    }
    if (Array.isArray(verification.documents)) {
      for (const file of verification.documents) {
        if (file != null && typeof file.fileName === "string") {
          verificationFiles.push(file.fileName);
        }
      }
    }
  }
  return { verificationFiles };
}

export async function createUser(data: Omit<StoredUser, "id">): Promise<StoredUser> {
  const hashed = isHashed(data.password) ? data.password : await hashPassword(data.password);
  const user: StoredUser = { id: `u${Date.now()}${Math.random().toString(36).slice(2, 6)}`, ...data, password: hashed };
  await db.User.create(user);
  return user;
}
