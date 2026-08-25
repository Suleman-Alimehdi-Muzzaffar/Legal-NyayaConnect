import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ChatDialog from '../components/ChatDialog';
import { motion, AnimatePresence } from 'framer-motion';
import { useGetLawyerBySlug, useCreateAppointment, ApiError } from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import { 
  Star, MapPin, Languages, Shield, Clock, Phone, Mail, Building, 
  Share2, Award, Scale, Briefcase, GraduationCap, CalendarDays, CheckCircle2,
  MessageSquare, Loader2, Video
} from 'lucide-react';
import { cn } from '../lib/utils';
import { avatarUrl } from '../lib/avatar';
import { toast } from 'sonner';
import { useAuth } from '@/lib/auth-context';

type BookingDay = { date: string; slots: string[] };
type WeeklyHour = { day: string; active: boolean; start: string; end: string };

const DEFAULT_WEEKLY_HOURS: WeeklyHour[] = [
  { day: "Monday", active: true, start: "09:00", end: "17:00" },
  { day: "Tuesday", active: true, start: "09:00", end: "17:00" },
  { day: "Wednesday", active: true, start: "09:00", end: "17:00" },
  { day: "Thursday", active: true, start: "09:00", end: "17:00" },
  { day: "Friday", active: true, start: "09:00", end: "17:00" },
  { day: "Saturday", active: true, start: "10:00", end: "14:00" },
  { day: "Sunday", active: false, start: "10:00", end: "14:00" },
];

const SLOT_DURATION_MIN = 45;
const BOOKING_WINDOW_DAYS = 30;

const pad = (n: number) => n.toString().padStart(2, '0');

function buildSlotsFromWeeklyHours(weeklyHours: WeeklyHour[]): BookingDay[] {
  const days: BookingDay[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < BOOKING_WINDOW_DAYS; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
    const cfg = weeklyHours.find(h => h.day === dayName && h.active);
    if (!cfg) continue;

    const [startH, startM] = cfg.start.split(':').map(Number);
    const [endH, endM] = cfg.end.split(':').map(Number);
    const startMinutes = startH * 60 + (startM || 0);
    const endMinutes = endH * 60 + (endM || 0);

    const slots: string[] = [];
    for (let t = startMinutes; t + SLOT_DURATION_MIN <= endMinutes; t += SLOT_DURATION_MIN) {
      slots.push(`${pad(Math.floor(t / 60))}:${pad(t % 60)}`);
    }

    // For today, hide slots that are already in the past (IST) so card count matches live availability
    let filteredSlots = slots;
    if (i === 0) {
      const now = new Date();
      const nowM = now.getHours() * 60 + now.getMinutes();
      filteredSlots = slots.filter((s) => {
        const [h, m] = s.split(":").map(Number);
        return h * 60 + m > nowM + 15;
      });
      if (filteredSlots.length === 0) continue;
    }

    if (filteredSlots.length > 0) {
      // Local date string (avoids UTC off-by-one from toISOString)
      days.push({ date: `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`, slots: filteredSlots });
    }
  }
  return days;
}

export default function LawyerProfile() {
  const { slug } = useParams<{ slug: string }>();
  const { isAuthenticated } = useAuth();
  const showChrome = !isAuthenticated;
  const { data: lawyer, isLoading } = useGetLawyerBySlug(slug ?? '');
  const [activeTab, setActiveTab] = useState<"overview" | "experience" | "reviews" | "availability">("overview");
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [modeStepOpen, setModeStepOpen] = useState(false);
  const [liveSlots, setLiveSlots] = useState<string[] | null>(null);
  const [booking, setBooking] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const createAppointmentMutation = useCreateAppointment();

  // Bookable days: derive from weeklyHours (authoritative) so date cards always match
  // lawyer's real availability. Falls back to stored availableSlots only for legacy docs
  // without weeklyHours, otherwise generates next 30 days.
  const bookingSlots = useMemo<BookingDay[]>(() => {
    if (!lawyer) return [];
    const weeklyHours = (lawyer as unknown as { weeklyHours?: WeeklyHour[] }).weeklyHours;
    if (weeklyHours && weeklyHours.length > 0) {
      return buildSlotsFromWeeklyHours(weeklyHours);
    }
    if (lawyer.availableSlots.length > 0) return lawyer.availableSlots as BookingDay[];
    return buildSlotsFromWeeklyHours(DEFAULT_WEEKLY_HOURS);
  }, [lawyer]);

  // Bulk free-slot counts for date cards ("X slots available") — keeps counts in sync
  // with live availability (weeklyHours + already booked appointments + past filtering).
  const [slotsSummary, setSlotsSummary] = useState<Record<string, { free: number; total: number; slots?: string[] }> | null>(null);

  useEffect(() => {
    if (!lawyer) { setSlotsSummary(null); return; }
    let cancelled = false;
    fetch(`/api/lawyers/${lawyer.slug}/availability-summary`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (cancelled || !d || !Array.isArray((d as { slotsByDate?: unknown }).slotsByDate)) return;
        const arr = (d as { slotsByDate: Array<{ date: string; freeCount: number; totalCount: number; slots: string[] }> }).slotsByDate;
        const map: Record<string, { free: number; total: number; slots: string[] }> = {};
        for (const e of arr) map[e.date] = { free: e.freeCount, total: e.totalCount, slots: e.slots };
        if (!cancelled) setSlotsSummary(map);
      })
      .catch(() => { if (!cancelled) setSlotsSummary(null); });
    return () => { cancelled = true; };
  }, [lawyer?.slug]);

  // Keep selected date on a day that actually has free slots; if current selection is fully booked, jump to next free day
  useEffect(() => {
    if (bookingSlots.length === 0) return;
    if (!selectedDate) {
      // pick first day with free slots if summary ready, else first bookingSlots
      if (slotsSummary) {
        const firstFree = bookingSlots.find((day) => (slotsSummary[day.date]?.free ?? day.slots.length) > 0);
        setSelectedDate(firstFree ? firstFree.date : bookingSlots[0].date);
      } else {
        setSelectedDate(bookingSlots[0].date);
      }
      return;
    }
    if (slotsSummary && selectedDate) {
      const free = slotsSummary[selectedDate]?.free;
      if (free === 0) {
        const idx = bookingSlots.findIndex((d) => d.date === selectedDate);
        const nextFree = bookingSlots.slice(idx + 1).find((day) => (slotsSummary[day.date]?.free ?? day.slots.length) > 0);
        if (nextFree) setSelectedDate(nextFree.date);
      }
    }
  }, [bookingSlots, selectedDate, slotsSummary]);

  useEffect(() => {
    if (lawyer && window.location.hash === "#book") {
      setActiveTab("availability");
      requestAnimationFrame(() => {
        document.getElementById("book")?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }
  }, [lawyer]);

  useEffect(() => {
    if (!lawyer || !selectedDate) { setLiveSlots(null); return; }
    // If bulk summary already has fresh free slots for this date, use it directly (avoids extra fetch and keeps counts consistent)
    const summarySlots = slotsSummary?.[selectedDate]?.slots;
    if (summarySlots !== undefined) {
      setLiveSlots(summarySlots);
      return;
    }
    setLiveSlots(null);
    fetch(`/api/lawyers/${lawyer.slug}/availability?date=${selectedDate}`)
      .then((r) => r.json())
      .then((d) => { if (Array.isArray((d as { slots?: unknown }).slots)) setLiveSlots((d as { slots: string[] }).slots); })
      .catch(() => setLiveSlots(null));
  }, [lawyer, selectedDate, slotsSummary]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#102542] text-white flex flex-col">
        {showChrome && <Navbar />}
        <div className="flex-1 flex flex-col items-center justify-center">
          <Loader2 className="w-12 h-12 text-[#D4AF37] animate-spin mb-4" />
          <p className="text-gray-400">Loading profile...</p>
        </div>
        {showChrome && <Footer />}
      </div>
    );
  }

  if (!lawyer) {
    return (
      <div className="min-h-screen bg-[#102542] text-white flex flex-col">
        {showChrome && <Navbar />}
        <div className="flex-1 flex flex-col items-center justify-center">
          <h1 className="text-3xl font-serif font-bold text-[#D4AF37]">Lawyer Not Found</h1>
          <p className="mt-4 text-gray-400">The profile you're looking for doesn't exist.</p>
          <Link to="/find-lawyers" className="mt-8 bg-[#D4AF37] text-[#102542] px-6 py-2 rounded-xl font-bold">Back to Search</Link>
        </div>
        {showChrome && <Footer />}
      </div>
    );
  }

  const handleBook = async (mode: "online" | "offline") => {
    if (!selectedDate || !selectedSlot) { toast.error("Please select a date and slot"); return; }
    if (liveSlots && !liveSlots.includes(selectedSlot)) { toast.error("This slot was just booked. Please choose another."); setSelectedSlot(null); setModeStepOpen(false); return; }
    setBooking(true);
    try {
      await createAppointmentMutation.mutateAsync({
        data: {
          lawyerName: lawyer.name,
          lawyerAvatar: lawyer.avatar,
          lawyerGradient: lawyer.avatarGradient,
          specialization: lawyer.primarySpecialization,
          date: selectedDate,
          time: selectedSlot,
          duration: 45,
          mode,
          caseType: "General Consultation",
          notes: "",
          fee: lawyer.consultationFee,
        },
      });
      await queryClient.invalidateQueries({ queryKey: ['/api/appointments'] });
      toast.success(`Booking confirmed — ${mode === 'online' ? 'Online consultation' : 'Office visit'} on ${selectedDate} at ${selectedSlot}. Find it under My Appointments.`);
      const bookedDate = selectedDate;
      const bookedSlot = selectedSlot;
      setSelectedSlot(null);
      setModeStepOpen(false);
      setLiveSlots((prev) => (prev ? prev.filter((s) => s !== bookedSlot!) : prev));
      setSlotsSummary((prev) => {
        if (!prev || !bookedDate || !prev[bookedDate]) return prev;
        const cur = prev[bookedDate];
        const nextSlots = cur.slots ? cur.slots.filter((s) => s !== bookedSlot) : undefined;
        return { ...prev, [bookedDate]: { ...cur, free: Math.max(0, cur.free - 1), slots: nextSlots ?? cur.slots } };
      });
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        toast.error("This slot was just taken. Please choose another.");
        setSelectedSlot(null);
        setModeStepOpen(false);
        if (selectedDate) {
          fetch(`/api/lawyers/${lawyer.slug}/availability?date=${selectedDate}`)
            .then((r) => r.json())
            .then((d) => { if (Array.isArray((d as { slots?: unknown }).slots)) {
              const fresh = (d as { slots: string[] }).slots;
              setLiveSlots(fresh);
              setSlotsSummary((prev) => prev && selectedDate ? { ...prev, [selectedDate]: { ...(prev[selectedDate] ?? { free: fresh.length, total: fresh.length }), free: fresh.length, slots: fresh, total: prev[selectedDate]?.total ?? fresh.length } } : prev);
            }})
            .catch(() => {});
          // also refresh bulk summary
          fetch(`/api/lawyers/${lawyer.slug}/availability-summary`)
            .then((r) => r.ok ? r.json() : null)
            .then((d) => {
              if (!d || !Array.isArray((d as { slotsByDate?: unknown }).slotsByDate)) return;
              const arr = (d as { slotsByDate: Array<{ date: string; freeCount: number; totalCount: number; slots: string[] }> }).slotsByDate;
              setSlotsSummary((prev) => {
                if (!prev) return prev;
                const next = { ...prev };
                for (const e of arr) next[e.date] = { free: e.freeCount, total: e.totalCount, slots: e.slots };
                return next;
              });
            }).catch(() => {});
        }
      } else if (err instanceof ApiError && err.status === 401) {
        toast.error("Please sign in to book a consultation.");
        navigate('/login');
      } else {
        toast.error(err instanceof Error ? err.message : "Unable to book. Please try again.");
      }
    } finally {
      setBooking(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#102542] text-white flex flex-col font-sans selection:bg-[#D4AF37] selection:text-[#102542]">
      {showChrome && <Navbar />}
      
      <main className={cn("flex-grow", showChrome ? "pt-24" : "pt-8")}>
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-[#0a1a2e] to-[#102542] border-b border-white/5 py-12 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#D4AF37]/5 blur-[120px] rounded-full pointer-events-none" />
          
          <div className="container mx-auto px-6 md:px-12 flex flex-col lg:flex-row gap-8 lg:items-center">
            
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex-1 flex flex-col md:flex-row gap-6 items-start"
            >
              <div className="relative shrink-0">
                <div className={cn("w-24 h-24 md:w-32 md:h-32 rounded-full bg-gradient-to-br flex items-center justify-center font-serif text-3xl md:text-5xl font-bold text-white shadow-xl", lawyer.avatarGradient, lawyer.isPremium ? "ring-4 ring-[#D4AF37] ring-offset-4 ring-offset-[#102542]" : "")}>
                  {lawyer.avatar ? (
                    <img src={avatarUrl(lawyer.avatar)} alt={lawyer.name} className="w-full h-full rounded-full object-cover" />
                  ) : (
                    (lawyer.name ?? '').split(/\s+/).map((part) => part[0]).filter(Boolean).slice(0, 2).join('').toUpperCase() || 'L'
                  )}
                </div>
                {lawyer.isVerified && (
                  <div className="absolute -bottom-2 right-2 bg-[#102542] rounded-full p-1 border-2 border-[#D4AF37]">
                    <Shield className="w-5 h-5 text-[#D4AF37]" fill="#D4AF37" />
                  </div>
                )}
              </div>

              <div className="flex-1">
                <div className="flex flex-wrap gap-2 mb-3">
                  {lawyer.isVerified && <span className="bg-green-500/10 text-green-400 border border-green-500/20 text-xs px-2 py-0.5 rounded-full font-semibold flex items-center gap-1"><CheckCircle2 className="w-3 h-3"/> Verified</span>}
                  {lawyer.isPremium && <span className="bg-[#D4AF37]/20 text-[#D4AF37] text-xs px-2 py-0.5 rounded-full font-bold">Premium Profile</span>}
                  <span className={cn("text-xs px-2 py-0.5 rounded-full font-semibold flex items-center gap-1 border", 
                    lawyer.availability === "offline" ? "bg-gray-500/10 border-gray-500/20 text-gray-400" : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                  )}>
                    {lawyer.availability === "offline" ? <Building className="w-3 h-3"/> : <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"/>}
                    {lawyer.availability === "offline" ? "Offline Only" : "Available Online"}
                  </span>
                </div>
                
                <h1 className="font-serif text-3xl md:text-5xl font-bold text-white mb-2">{lawyer.name}</h1>
                <h2 className="text-[#D4AF37] text-lg font-medium mb-4">{lawyer.primarySpecialization}</h2>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {lawyer.specializations.filter(s => s !== lawyer.primarySpecialization).map(spec => (
                    <span key={spec} className="text-xs bg-white/5 border border-white/10 px-3 py-1 rounded-full text-gray-300">
                      {spec}
                    </span>
                  ))}
                </div>

                <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-300">
                  <div className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-gray-500"/> {lawyer.city}, {lawyer.state}</div>
                  <div className="flex items-center gap-1.5"><Languages className="w-4 h-4 text-gray-500"/> {lawyer.languages.join(", ")}</div>
                  <div className="flex items-center gap-1.5"><Star className="w-4 h-4 text-[#D4AF37]" fill="#D4AF37"/> <span className="text-white font-bold">{lawyer.rating}</span> ({lawyer.reviewCount} reviews)</div>
                </div>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:w-80 shrink-0"
            >
              <div className="glass-card rounded-2xl p-6 border border-white/10 shadow-[0_0_30px_rgba(0,0,0,0.5)]">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="text-sm text-gray-400 mb-1">Consultation Fee</div>
                    <div className="text-3xl font-bold text-[#D4AF37]">₹{lawyer.consultationFee}</div>
                    <div className="text-xs text-gray-500 mt-1">Per ~45 min session</div>
                  </div>
                  <button onClick={async () => {
                    const url = window.location.href;
                    try {
                      if (navigator.share) await navigator.share({ title: lawyer.name, url });
                      else { await navigator.clipboard.writeText(url); toast.success('Profile link copied'); }
                    } catch {
                      await navigator.clipboard.writeText(url); toast.success('Profile link copied');
                    }
                  }} className="p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors border border-white/10">
                    <Share2 className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
                
                {lawyer.isPremium && (
                  <div className="bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs px-3 py-2 rounded-lg mb-6 flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                    Verified premium advocate.
                  </div>
                )}

                <div className="flex flex-col gap-3">
                  <button onClick={() => { setActiveTab("availability"); window.scrollTo({ top: 500, behavior: 'smooth' }); }} className="w-full bg-[#D4AF37] hover:bg-[#c4a133] text-[#102542] font-bold py-3.5 rounded-xl transition-all hover:shadow-[0_0_15px_rgba(212,175,55,0.4)]">
                    Book Consultation
                  </button>
                  <button
                    onClick={() => {
                      if (!isAuthenticated) {
                        navigate('/login');
                        return;
                      }
                      setChatOpen(true);
                    }}
                    className="w-full bg-transparent border border-white/20 hover:border-white/50 text-white font-semibold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2"
                  >
                    <MessageSquare className="w-4 h-4" /> Send Message
                  </button>
                </div>

                <div className="mt-6 pt-4 border-t border-white/10 grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-xl font-serif font-bold text-white">{lawyer.casesWon}+</div>
                    <div className="text-[10px] text-gray-400 uppercase tracking-wide">Cases Won</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-serif font-bold text-white">{lawyer.experience}</div>
                    <div className="text-[10px] text-gray-400 uppercase tracking-wide">Years Exp.</div>
                  </div>
                </div>
              </div>
            </motion.div>

          </div>
        </section>

        {/* Tab Navigation */}
        <div className="sticky top-20 z-40 bg-[#102542]/90 backdrop-blur-md border-b border-white/10">
          <div className="container mx-auto px-6 md:px-12 flex overflow-x-auto scrollbar-hide">
            {[
              { id: "overview", label: "Overview" },
              { id: "experience", label: "Education & Experience" },
              { id: "reviews", label: "Client Reviews" },
              { id: "availability", label: "Availability & Booking" },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  "px-6 py-4 text-sm font-semibold whitespace-nowrap transition-colors relative",
                  activeTab === tab.id ? "text-[#D4AF37]" : "text-gray-400 hover:text-white"
                )}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#D4AF37]" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content Area */}
        <div className="container mx-auto px-6 md:px-12 py-12 min-h-[50vh]">
          <AnimatePresence mode="wait">
            
            {/* OVERVIEW TAB */}
            {activeTab === "overview" && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="max-w-4xl grid grid-cols-1 md:grid-cols-3 gap-12"
              >
                <div className="md:col-span-2 flex flex-col gap-10">
                  <section>
                    <h3 className="font-serif text-2xl font-bold mb-4 flex items-center gap-3">
                      <div className="w-1.5 h-6 bg-[#D4AF37] rounded-full" /> About Advocate
                    </h3>
                    <div className="prose prose-invert max-w-none text-gray-300 font-sans leading-relaxed">
                      <p>{lawyer.bio}</p>
                    </div>
                  </section>

                  <section>
                    <h3 className="font-serif text-2xl font-bold mb-4 flex items-center gap-3">
                      <div className="w-1.5 h-6 bg-[#D4AF37] rounded-full" /> Practice Areas
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {lawyer.specializations.map(spec => (
                        <div key={spec} className="bg-white/5 border border-white/10 rounded-xl p-3 flex items-center gap-3">
                          <Scale className="w-4 h-4 text-[#D4AF37] shrink-0" />
                          <span className="text-sm text-gray-200">{spec}</span>
                        </div>
                      ))}
                    </div>
                  </section>

                  {lawyer.awards.length > 0 && (
                    <section>
                      <h3 className="font-serif text-2xl font-bold mb-4 flex items-center gap-3">
                        <div className="w-1.5 h-6 bg-[#D4AF37] rounded-full" /> Awards & Recognitions
                      </h3>
                      <ul className="space-y-3">
                        {lawyer.awards.map((award, i) => (
                          <li key={i} className="flex items-start gap-3 text-gray-300 bg-white/5 p-4 rounded-xl border border-white/5">
                            <Award className="w-5 h-5 text-[#D4AF37] shrink-0 mt-0.5" />
                            <span>{award}</span>
                          </li>
                        ))}
                      </ul>
                    </section>
                  )}
                </div>

                <div className="flex flex-col gap-6">
                  <div className="glass-card p-6 rounded-2xl border border-white/10">
                    <h4 className="font-serif text-lg font-bold mb-4">Contact Info</h4>
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <Building className="w-5 h-5 text-[#D4AF37] shrink-0 mt-0.5" />
                        <div>
                          <div className="text-xs text-gray-400 mb-1">Office Address</div>
                          <div className="text-sm text-gray-200 leading-snug">{lawyer.officeAddress}</div>
                        </div>
                      </div>
                      <div className="w-full h-px bg-white/5" />
                      <div className="flex items-center gap-3">
                        <Phone className="w-5 h-5 text-[#D4AF37] shrink-0" />
                        <div>
                          <div className="text-xs text-gray-400 mb-0.5">Phone</div>
                          <a href={`tel:${lawyer.phone}`} className="text-sm text-[#D4AF37] hover:underline font-medium">{lawyer.phone}</a>
                        </div>
                      </div>
                      <div className="w-full h-px bg-white/5" />
                      <div className="flex items-center gap-3">
                        <Mail className="w-5 h-5 text-[#D4AF37] shrink-0" />
                        <div>
                          <div className="text-xs text-gray-400 mb-0.5">Email</div>
                          <a href={`mailto:${lawyer.email}`} className="text-sm text-[#D4AF37] hover:underline font-medium break-all">{lawyer.email}</a>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="glass-card p-6 rounded-2xl border border-white/10">
                    <h4 className="font-serif text-lg font-bold mb-4">Quick Stats</h4>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-400">Win Rate</span>
                          <span className="text-white font-bold">{Math.round((lawyer.casesWon / lawyer.totalCases) * 100)}%</span>
                        </div>
                        <div className="w-full bg-white/10 rounded-full h-1.5">
                          <div className="bg-[#D4AF37] h-1.5 rounded-full" style={{ width: `${(lawyer.casesWon / lawyer.totalCases) * 100}%` }}></div>
                        </div>
                      </div>
                      <div className="flex justify-between text-sm py-2 border-b border-white/5">
                        <span className="text-gray-400">Total Cases</span>
                        <span className="text-white font-bold">{lawyer.totalCases}</span>
                      </div>
                      <div className="flex justify-between text-sm py-2">
                        <span className="text-gray-400">Avg. Response Time</span>
                        <span className="text-white font-bold">&lt; 2 hours</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* EXPERIENCE TAB */}
            {activeTab === "experience" && (
              <motion.div
                key="experience"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="max-w-3xl flex flex-col gap-12"
              >
                <section>
                  <h3 className="font-serif text-2xl font-bold mb-8 flex items-center gap-3">
                    <GraduationCap className="w-6 h-6 text-[#D4AF37]" /> Education
                  </h3>
                  <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-[#D4AF37] before:to-transparent">
                    {lawyer.education.map((edu, i) => (
                      <div key={i} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-[#102542] bg-[#D4AF37] text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 ml-0 mr-4 md:mx-auto">
                          <div className="w-3 h-3 bg-[#102542] rounded-full"></div>
                        </div>
                        <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] glass-card p-5 rounded-xl border border-white/10 group-hover:border-[#D4AF37]/50 transition-colors">
                          <span className="text-[#D4AF37] font-bold text-sm mb-1 block">{edu.year}</span>
                          <h4 className="text-lg font-bold text-white">{edu.degree}</h4>
                          <p className="text-gray-400 text-sm mt-1">{edu.institution}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                <section>
                  <h3 className="font-serif text-2xl font-bold mb-6 flex items-center gap-3">
                    <Briefcase className="w-6 h-6 text-[#D4AF37]" /> Court Registrations
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {lawyer.courtRegistrations.map((court, i) => (
                      <div key={i} className="glass-card p-4 rounded-xl border border-white/10 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-[#D4AF37]/10 flex items-center justify-center shrink-0">
                          <Scale className="w-5 h-5 text-[#D4AF37]" />
                        </div>
                        <span className="font-medium text-gray-200">{court}</span>
                      </div>
                    ))}
                  </div>
                </section>
              </motion.div>
            )}

            {/* REVIEWS TAB */}
            {activeTab === "reviews" && (
              <motion.div
                key="reviews"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="max-w-4xl flex flex-col gap-10"
              >
                <div className="glass-card p-8 rounded-2xl border border-[#D4AF37]/30 flex flex-col md:flex-row items-center gap-10">
                  <div className="text-center md:text-left shrink-0">
                    <div className="text-6xl font-serif font-bold text-[#D4AF37] leading-none mb-2">{lawyer.rating}</div>
                    <div className="flex gap-1 justify-center md:justify-start mb-2">
                      {Array.from({length: 5}).map((_, i) => (
                        <Star key={i} className={cn("w-5 h-5", i < Math.floor(lawyer.rating) ? "text-[#D4AF37]" : "text-gray-600")} fill={i < Math.floor(lawyer.rating) ? "#D4AF37" : "none"} />
                      ))}
                    </div>
                    <div className="text-sm text-gray-400">Based on {lawyer.reviewCount} reviews</div>
                  </div>
                  
                  <div className="flex-1 w-full flex flex-col gap-2">
                    {[5,4,3,2,1].map(r => {
                      const pct = r === 5 ? 85 : r === 4 ? 12 : r === 3 ? 3 : 0;
                      return (
                        <div key={r} className="flex items-center gap-3 text-sm">
                          <span className="w-10 text-gray-400 text-right">{r} Stars</span>
                          <div className="flex-1 h-2.5 bg-white/10 rounded-full overflow-hidden">
                            <div className="h-full bg-[#D4AF37] rounded-full" style={{ width: `${pct}%` }}></div>
                          </div>
                          <span className="w-10 text-gray-400 text-right">{pct}%</span>
                        </div>
                      )
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {lawyer.reviewsList.map((review, i) => (
                    <motion.div 
                      key={review.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="glass-card p-6 rounded-2xl border border-white/10 flex flex-col"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-600 to-gray-800 flex items-center justify-center font-bold text-sm">
                            {review.author.charAt(0)}
                          </div>
                          <div>
                            <div className="font-bold text-white">{review.author}</div>
                            <div className="text-xs text-gray-400">{new Date(review.date).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}</div>
                          </div>
                        </div>
                        <div className="flex gap-0.5">
                          {Array.from({length: 5}).map((_, i) => (
                            <Star key={i} className="w-3.5 h-3.5 text-[#D4AF37]" fill={i < review.rating ? "#D4AF37" : "none"} />
                          ))}
                        </div>
                      </div>
                      
                      <div className="mb-4">
                        <span className="inline-block border border-[#D4AF37]/30 text-[#D4AF37] text-[10px] px-2 py-0.5 rounded-full mb-3 uppercase tracking-wider">
                          Case: {review.caseType}
                        </span>
                        <p className="text-gray-300 text-sm leading-relaxed italic">"{review.comment}"</p>
                      </div>
                      
                      <div className="mt-auto pt-4 border-t border-white/5 flex items-center gap-2 text-xs text-green-400">
                        <Shield className="w-3.5 h-3.5" /> Verified Client
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* AVAILABILITY TAB */}
            {activeTab === "availability" && (
              <motion.div
                key="availability"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="max-w-3xl mx-auto"
                id="book"
              >
                <div className="glass-card border border-[#D4AF37]/30 rounded-3xl p-8 shadow-[0_0_40px_rgba(212,175,55,0.1)]">
                  <div className="text-center mb-8">
                    <h3 className="font-serif text-2xl font-bold mb-2">Book a Consultation</h3>
                    <p className="text-gray-400 text-sm">Select an available date and time slot. All times in IST.</p>
                  </div>

                  {bookingSlots.length > 0 ? (
                    <div className="flex flex-col md:flex-row gap-8">
                      {/* Left: Date Selection */}
                      <div className="flex-1">
                        <h4 className="font-semibold text-white mb-4 flex items-center gap-2">
                          <CalendarDays className="w-5 h-5 text-[#D4AF37]" /> Select Date
                        </h4>
                        <div className="grid grid-cols-1 gap-2 max-h-96 overflow-y-auto custom-scrollbar pr-1">
                          {bookingSlots.map(day => {
                            const summary = slotsSummary?.[day.date];
                            const free = summary ? summary.free : day.slots.length;
                            const total = summary ? summary.total : day.slots.length;
                            const isFullyBooked = summary ? free === 0 : false;
                            return (
                            <button
                              key={day.date}
                              onClick={() => { setSelectedDate(day.date); setSelectedSlot(null); }}
                              disabled={isFullyBooked}
                              className={cn(
                                "p-4 rounded-xl border text-left flex justify-between items-center transition-all",
                                isFullyBooked && "opacity-50 cursor-not-allowed",
                                selectedDate === day.date
                                  ? "bg-[#D4AF37]/20 border-[#D4AF37] shadow-[0_0_15px_rgba(212,175,55,0.2)]"
                                  : "bg-white/5 border-white/10 hover:border-[#D4AF37]/50"
                              )}
                            >
                              <div>
                                <div className={cn("font-bold", selectedDate === day.date ? "text-[#D4AF37]" : "text-white", isFullyBooked && "text-gray-500")}>
                                  {new Date(day.date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
                                </div>
                                <div className={cn("text-xs mt-1", isFullyBooked ? "text-amber-400" : "text-gray-400")}>
                                  {isFullyBooked ? "Fully booked" : `${free} slot${free !== 1 ? "s" : ""} available`}
                                  {summary && !isFullyBooked && free !== total ? ` · ${total} total` : ""}
                                </div>
                              </div>
                              <div className={cn("w-4 h-4 rounded-full border-2", selectedDate === day.date ? "border-[#D4AF37] bg-[#D4AF37]" : "border-gray-500", isFullyBooked && "border-amber-500/50")} />
                            </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Right: Slot Selection */}
                      <div className="flex-1">
                        <h4 className="font-semibold text-white mb-4 flex items-center gap-2">
                          <Clock className="w-5 h-5 text-[#D4AF37]" /> Select Time
                        </h4>
                        {!selectedDate ? (
                          <div className="h-full flex items-center justify-center text-gray-500 text-sm italic bg-white/5 rounded-xl border border-white/5 p-6 text-center">
                            Please select a date first to view available time slots.
                          </div>
                        ) : liveSlots !== null && liveSlots.length === 0 ? (
                          <div className="text-center py-6 text-sm text-amber-300 bg-white/5 rounded-xl border border-white/10">
                            All slots for this date are booked — please pick another date.
                          </div>
                        ) : (
                          <div className="grid grid-cols-2 gap-3 max-h-80 overflow-y-auto custom-scrollbar pr-1">
                            {(liveSlots ?? bookingSlots.find((d) => d.date === selectedDate)?.slots ?? []).map((slot) => (
                              <button
                                key={slot}
                                onClick={() => { setSelectedSlot(slot); setModeStepOpen(false); }}
                                className={cn(
                                  "py-3 rounded-xl border text-sm font-semibold transition-all",
                                  selectedSlot === slot
                                    ? "bg-[#D4AF37] border-[#D4AF37] text-[#102542] scale-105 shadow-[0_0_15px_rgba(212,175,55,0.4)]"
                                    : "bg-white/5 border-white/20 text-gray-200 hover:border-[#D4AF37] hover:text-[#D4AF37]"
                                )}
                              >
                                {slot}
                              </button>
                            ))}
                          </div>
                        )}

                        {selectedDate && selectedSlot && !modeStepOpen && (
                          <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="mt-8 p-4 bg-[#102542] rounded-xl border border-[#D4AF37]/30"
                          >
                            <div className="flex justify-between items-center mb-4">
                              <span className="text-gray-300">Consultation Fee</span>
                              <span className="text-xl font-bold text-[#D4AF37]">₹{lawyer.consultationFee}</span>
                            </div>
                            <button 
                              onClick={() => setModeStepOpen(true)}
                              disabled={booking}
                              className="w-full bg-[#D4AF37] text-[#102542] font-bold py-3 rounded-lg hover:bg-[#c4a133] disabled:opacity-60 transition-colors inline-flex items-center justify-center gap-2"
                            >
                              {booking && <Loader2 className="w-4 h-4 animate-spin" />}
                              Confirm Booking
                            </button>
                            <p className="text-[10px] text-gray-500 text-center mt-3">
                              Cancellation allowed up to 24hrs before scheduled time for full refund.
                            </p>
                          </motion.div>
                        )}

                        {selectedDate && selectedSlot && modeStepOpen && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-8 p-4 bg-[#102542] rounded-xl border border-[#D4AF37]/30"
                          >
                            <p className="font-semibold text-white text-center mb-1">Choose consultation mode</p>
                            <p className="text-xs text-gray-400 text-center mb-4">{selectedDate} at {selectedSlot} • ₹{lawyer.consultationFee}</p>
                            <div className={cn("grid gap-3", lawyer.availability !== "offline" && lawyer.availability !== "online" ? "grid-cols-2" : "grid-cols-1")}>
                              {lawyer.availability !== "offline" && (
                                <button
                                  onClick={() => handleBook("online")}
                                  disabled={booking}
                                  className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 disabled:opacity-50 transition-colors flex flex-col items-center gap-2 group"
                                >
                                  <Video className="w-6 h-6 text-emerald-400" />
                                  <span className="font-bold text-sm text-emerald-300">Online Consultation</span>
                                  <span className="text-[10px] text-gray-400 text-center leading-snug">Secure Google Meet — link appears in My Appointments once your lawyer creates it</span>
                                </button>
                              )}
                              {lawyer.availability !== "online" && (
                                <button
                                  onClick={() => handleBook("offline")}
                                  disabled={booking}
                                  className="p-4 rounded-xl border border-[#D4AF37]/30 bg-[#D4AF37]/10 hover:bg-[#D4AF37]/20 disabled:opacity-50 transition-colors flex flex-col items-center gap-2 group"
                                >
                                  <MapPin className="w-6 h-6 text-[#D4AF37]" />
                                  <span className="font-bold text-sm text-[#D4AF37]">Office Visit</span>
                                  <span className="text-[10px] text-gray-400 text-center leading-snug">Visit at advocate's office — Get Directions available in My Appointments</span>
                                </button>
                              )}
                            </div>
                            <button onClick={() => setModeStepOpen(false)} disabled={booking} className="mt-3 w-full text-xs text-gray-400 hover:text-white transition-colors">
                              ← Change slot
                            </button>
                          </motion.div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-10 bg-white/5 rounded-xl border border-white/10">
                      <CalendarDays className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                      <p className="text-gray-400">No availability configured for this lawyer.</p>
                    </div>
                  )}

                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </main>
      
      {showChrome && <Footer />}

      <ChatDialog
        open={chatOpen}
        onOpenChange={setChatOpen}
        lawyerId={lawyer.id}
        lawyerName={lawyer.name}
        lawyerAvatar={lawyer.avatar}
      />
    </div>
  );
}
