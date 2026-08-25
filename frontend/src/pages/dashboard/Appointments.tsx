import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useSearchParams } from 'react-router-dom';
import { 
  CalendarCheck, 
  MapPin, 
  Video, 
  Building, 
  FileText,
  MessageSquare,
  CalendarSync,
  Clock,
  Loader2,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { avatarUrl } from '@/lib/avatar';
import { useListAppointments, useUpdateAppointment, useCreateAppointment, useListLawyers, useListLawyerAppointments, getListAppointmentsQueryKey, type AppointmentStatus } from '@workspace/api-client-react';
import { useAuth } from '@/lib/auth-context';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import DirectionsDialog from '@/components/DirectionsDialog';

const Appointments = () => {
  const [activeTab, setActiveTab] = useState<"all" | AppointmentStatus>("all");
  const [searchParams, setSearchParams] = useSearchParams();
  const viewId = searchParams.get('view');
  const { data: appointments } = useListAppointments({ query: { refetchInterval: 10000 } } as unknown as never);
  const { data: lawyerAppointmentsRaw } = useListLawyerAppointments({ query: { refetchInterval: 10000 } } as unknown as never);
  // Merge lawyer-side meetLinks (created via POST /appointments/:id/meet on LawyerAppointment) into client appointments
  // by matching date|time — backend also syncs, but this covers already-created meetings and
  // ensures client sees Join Meeting immediately even before backend sync or when collections diverged.
  const appointmentsList = (() => {
    const base = appointments ?? [];
    const lawyerApts = (lawyerAppointmentsRaw as unknown as Array<{ date: string; time: string; meetLink?: string }> | undefined) ?? [];
    const meetBySlot = new Map<string, string>();
    for (const la of lawyerApts) {
      if (la.meetLink && la.date && la.time) meetBySlot.set(`${la.date}|${la.time}`, la.meetLink);
    }
    if (meetBySlot.size === 0) return base;
    return base.map((apt) => {
      if ((apt as unknown as { meetLink?: string }).meetLink) return apt;
      const key = `${(apt as unknown as { date: string }).date}|${(apt as unknown as { time: string }).time}`;
      const ml = meetBySlot.get(key);
      return ml ? ({ ...apt, meetLink: ml } as typeof apt) : apt;
    });
  })();
  const { data: lawyers } = useListLawyers();
  const [directionsTarget, setDirectionsTarget] = useState<{ lawyerName: string; officeAddress?: string } | null>(null);
  const [summaryApt, setSummaryApt] = useState<(typeof appointmentsList)[number] | null>(null);
  const queryClient = useQueryClient();
  const { token } = useAuth();
  const [rescheduleTarget, setRescheduleTarget] = useState<(typeof appointmentsList)[number] | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [rescheduleTime, setRescheduleTime] = useState("");
  const [rescheduleReason, setRescheduleReason] = useState("");
  const [rescheduleSubmitting, setRescheduleSubmitting] = useState(false);
  const [availableSlots, setAvailableSlots] = useState<string[] | null>(null);

  // Fetch lawyer availability for chosen reschedule date
  React.useEffect(() => {
    if (!rescheduleTarget || !rescheduleDate) { setAvailableSlots(null); return; }
    const lawyer = lawyers?.find((l) => l.name === (rescheduleTarget as unknown as { lawyerName: string }).lawyerName);
    if (!lawyer) { setAvailableSlots(null); return; }
    setAvailableSlots(null);
    fetch(`/api/lawyers/${lawyer.slug}/availability?date=${rescheduleDate}`)
      .then((r) => r.json())
      .then((d) => {
        if (Array.isArray((d as { slots?: unknown }).slots)) setAvailableSlots((d as { slots: string[] }).slots);
        else setAvailableSlots([]);
      })
      .catch(() => setAvailableSlots([]));
  }, [rescheduleTarget, rescheduleDate, lawyers]);

  const openReschedule = (apt: (typeof appointmentsList)[number]) => {
    setRescheduleTarget(apt);
    const nxt = new Date();
    nxt.setDate(nxt.getDate() + 1);
    setRescheduleDate(nxt.toISOString().slice(0, 10));
    setRescheduleTime("");
    setRescheduleReason("");
    setAvailableSlots(null);
  };

  const handleRequestReschedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rescheduleTarget || !rescheduleDate || !rescheduleTime) {
      toast.error("Pick a date and time");
      return;
    }
    setRescheduleSubmitting(true);
    try {
      const res = await fetch(`/api/appointments/${rescheduleTarget.id}/request-reschedule`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ requestedDate: rescheduleDate, requestedTime: rescheduleTime, reason: rescheduleReason }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.message ?? `Request failed (HTTP ${res.status})`);
      }
      toast.success("Reschedule request sent — awaiting lawyer approval");
      setRescheduleTarget(null);
      queryClient.invalidateQueries({ queryKey: getListAppointmentsQueryKey() });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to send request");
    } finally {
      setRescheduleSubmitting(false);
    }
  };

  const updateAppointmentMutation = useUpdateAppointment({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListAppointmentsQueryKey() });
      },
    },
  });
  const createAppointmentMutation = useCreateAppointment({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListAppointmentsQueryKey() });
      },
    },
  });

  const tabs = [
    { id: "all", label: "All Appointments" },
    { id: "upcoming", label: "Upcoming" },
    { id: "pending", label: "Pending" },
    { id: "completed", label: "Completed" },
    { id: "cancelled", label: "Cancelled" },
  ];

  const filteredAppointments = appointmentsList.filter(apt =>
    viewId ? apt.id === viewId : (activeTab === "all" ? true : apt.status === activeTab)
  );

  const getStatusColor = (status: AppointmentStatus) => {
    switch(status) {
      case 'upcoming': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'completed': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'cancelled': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'pending': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'rescheduled': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getStatusLabel = (status: AppointmentStatus) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  return (
    <div className="flex flex-col gap-6 md:gap-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="font-serif text-3xl font-bold">My Appointments</h2>
          {viewId && (
            <button
              onClick={() => setSearchParams({})}
              className="text-sm text-[#D4AF37] hover:underline font-medium inline-flex items-center gap-1 w-fit"
            >
              <span aria-hidden="true">←</span> Back to all appointments
            </button>
          )}
        </div>
        <Link 
          to="/find-lawyers"
          className="bg-[#D4AF37] hover:bg-[#c4a133] text-[#102542] font-bold px-6 py-3 rounded-xl transition-all hover:-translate-y-0.5 shadow-[0_4px_15px_rgba(212,175,55,0.3)] inline-flex items-center justify-center gap-2 w-full md:w-auto"
        >
          <CalendarCheck className="w-5 h-5" />
          Book New Appointment
        </Link>
      </div>

      {/* Filter Tabs */}
      {!viewId && (
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            const count = tab.id === 'all' 
              ? appointmentsList.length 
              : appointmentsList.filter(a => a.status === tab.id).length;
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  "whitespace-nowrap px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 flex items-center gap-2 border",
                  isActive 
                    ? "bg-[#D4AF37] text-[#102542] border-[#D4AF37]" 
                    : "bg-white/5 text-gray-300 border-white/10 hover:border-[#D4AF37]/50"
                )}
              >
                {tab.label}
                <span className={cn(
                  "px-2 py-0.5 rounded-full text-xs",
                  isActive ? "bg-[#102542]/20 text-[#102542]" : "bg-white/10 text-gray-400"
                )}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Appointments List */}
      <AnimatePresence mode="wait">
        <motion.div 
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col gap-4"
        >
          {filteredAppointments.length === 0 ? (
            <div className="glass-card rounded-2xl py-20 flex flex-col items-center justify-center text-center border-white/10 border border-dashed">
              <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-4 text-gray-500">
                <CalendarCheck className="w-10 h-10" />
              </div>
              <h3 className="font-serif text-2xl font-bold mb-2">No Appointments Found</h3>
              <p className="text-gray-400 max-w-sm mb-6">You don't have any {activeTab !== 'all' ? activeTab : ''} appointments at the moment.</p>
              <Link 
                to="/find-lawyers"
                className="bg-transparent border border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37]/10 font-semibold px-6 py-2.5 rounded-xl transition-all"
              >
                Find a Lawyer
              </Link>
            </div>
          ) : (
            filteredAppointments.map((apt, index) => (
              <motion.div 
                key={apt.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="glass-card rounded-2xl p-5 md:p-6 border border-white/10 hover:border-[#D4AF37]/30 transition-all group"
              >
                <div className="flex flex-col xl:flex-row gap-6">
                  
                  {/* Left: Lawyer Info */}
                  <div className="flex items-start gap-4 xl:w-[30%] shrink-0">
                    <div className={cn("w-14 h-14 rounded-full flex items-center justify-center overflow-hidden font-serif text-xl font-bold text-white shadow-inner bg-gradient-to-br shrink-0", apt.lawyerGradient)}>
                      {apt.lawyerAvatar ? (
                        <img src={avatarUrl(apt.lawyerAvatar)} alt={apt.lawyerName} className="w-full h-full object-cover" />
                      ) : (
                        (apt.lawyerName ?? '').split(/\s+/).map((part) => part[0]).filter(Boolean).slice(0, 2).join('').toUpperCase() || 'L'
                      )}
                    </div>
                    <div>
                      <h4 className="font-serif text-xl font-bold">{apt.lawyerName}</h4>
                      <div className="text-[#D4AF37] text-xs font-semibold uppercase tracking-wider mt-1">{apt.specialization}</div>
                      <div className="inline-block mt-2 px-3 py-1 rounded-md border border-[#D4AF37]/30 bg-[#D4AF37]/5 text-xs text-[#D4AF37] font-medium">
                        {apt.caseType}
                      </div>
                    </div>
                  </div>

                  {/* Center: Time & Mode */}
                  <div className="flex-1 flex flex-col justify-center gap-3 xl:border-l xl:border-white/10 xl:pl-6">
                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                      <div className="text-lg font-bold text-white whitespace-nowrap">
                        {new Date(apt.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                      </div>
                      <div className="text-[#D4AF37] font-semibold text-lg whitespace-nowrap">
                        {apt.time}
                      </div>
                      <div className="text-xs text-gray-400 bg-white/5 px-2 py-1 rounded border border-white/10 whitespace-nowrap">
                        {apt.duration} mins
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-gray-300">
                      {apt.mode === 'online' ? (
                        <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-500/10 text-green-400 border border-green-500/20 font-medium text-xs">
                          <Video className="w-3.5 h-3.5" /> Online Consultation
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-gray-300 border border-white/20 font-medium text-xs">
                          <Building className="w-3.5 h-3.5" /> Office Visit
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Right: Status & Actions */}
                  <div className="xl:w-[25%] shrink-0 flex flex-col xl:items-end justify-between gap-4 xl:border-l xl:border-white/10 xl:pl-6">
                    <div className="flex items-center justify-between w-full xl:justify-end xl:gap-4">
                      <div className="font-bold text-xl text-[#D4AF37]">₹{apt.fee}</div>
                      <div className={cn("px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider border", getStatusColor(apt.status))}>
                        {getStatusLabel(apt.status)}
                      </div>
                    </div>

                    <div className="flex flex-wrap xl:flex-nowrap gap-2 w-full xl:justify-end">
                      {(apt.status === 'upcoming' || apt.status === 'pending') && apt.mode === 'online' && (
                        (apt as unknown as { meetLink?: string }).meetLink ? (
                          <a href={(apt as unknown as { meetLink: string }).meetLink} target="_blank" rel="noreferrer" className="flex-1 xl:flex-none text-center bg-[#D4AF37] text-[#102542] hover:bg-[#c4a133] px-4 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap">
                            Join Meeting
                          </a>
                        ) : (
                          <button disabled title="The meeting link will appear once your lawyer starts the meeting" className="flex-1 xl:flex-none text-center bg-[#D4AF37]/40 text-[#102542]/60 px-4 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap cursor-not-allowed">
                            Join Meeting
                          </button>
                        )
                      )}
                      {apt.status === 'upcoming' && apt.mode === 'offline' && (
                        <button
                          onClick={() => {
                            const lawyer = lawyers?.find((l) => l.name === apt.lawyerName);
                            setDirectionsTarget({ lawyerName: apt.lawyerName, officeAddress: lawyer?.officeAddress });
                          }}
                          className="flex-1 xl:flex-none text-center bg-transparent border border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37]/10 px-4 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap"
                        >
                          Get Directions
                        </button>
                      )}
                      
                      {(apt.status === 'upcoming' || apt.status === 'pending') && !(apt as unknown as { rescheduleRequested?: boolean }).rescheduleRequested && (
                        <button onClick={() => openReschedule(apt)} className="flex-1 xl:flex-none text-center bg-transparent border border-[#D4AF37]/50 text-[#D4AF37] hover:bg-[#D4AF37]/10 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all whitespace-nowrap inline-flex items-center justify-center gap-1.5">
                          <CalendarSync className="w-3.5 h-3.5" /> Request Reschedule
                        </button>
                      )}
                      {(apt as unknown as { rescheduleRequested?: boolean }).rescheduleRequested && (
                        <span className="flex-1 xl:flex-none text-center bg-amber-500/10 border border-amber-500/30 text-amber-300 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap inline-flex items-center justify-center gap-1.5">
                          <Clock className="w-3.5 h-3.5" /> Requested {(apt as unknown as { requestedDate?: string }).requestedDate} {(apt as unknown as { requestedTime?: string }).requestedTime}
                        </span>
                      )}
                      {(apt as unknown as { status?: string }).status === 'rescheduled' && !(apt as unknown as { rescheduleRequested?: boolean }).rescheduleRequested && (
                        <span className="flex-1 xl:flex-none text-center bg-purple-500/10 border border-purple-500/30 text-purple-300 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap">
                          Rescheduled
                        </span>
                      )}
                      
                      {(apt.status === 'completed' || apt.status === 'cancelled') && (
                        <button onClick={() => createAppointmentMutation.mutate({ data: { lawyerName: apt.lawyerName, lawyerAvatar: apt.lawyerAvatar, lawyerGradient: apt.lawyerGradient, specialization: apt.specialization, date: apt.date, time: apt.time, duration: apt.duration, mode: apt.mode, caseType: apt.caseType, notes: apt.notes, fee: apt.fee } })} className="flex-1 xl:flex-none text-center bg-[#D4AF37] text-[#102542] hover:bg-[#c4a133] px-4 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap">
                          Book Again
                        </button>
                      )}
                      
                      {apt.status === 'completed' && (
                        <button onClick={() => setSummaryApt(apt)} className="flex-1 xl:flex-none text-center bg-transparent border border-white/20 text-white hover:bg-white/10 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all whitespace-nowrap">
                          View Summary
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {(apt as unknown as { rescheduleRequested?: boolean }).rescheduleRequested && (
                  <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl flex flex-col gap-1.5">
                    <span className="text-xs font-semibold text-amber-300 flex items-center gap-1.5"><Clock className="w-3 h-3" /> Reschedule requested — awaiting lawyer approval</span>
                    <span className="text-xs text-gray-300">Requested: {(apt as unknown as { requestedDate?: string }).requestedDate} {(apt as unknown as { requestedTime?: string }).requestedTime} • Original: {apt.date} {apt.time}</span>
                    {(apt as unknown as { rescheduleReason?: string }).rescheduleReason && <span className="text-xs text-gray-400 italic">Reason: {(apt as unknown as { rescheduleReason: string }).rescheduleReason}</span>}
                  </div>
                )}
                {apt.notes && (
                  <div className="mt-4 pt-4 border-t border-white/5 flex gap-3">
                    <MessageSquare className="w-5 h-5 text-gray-500 shrink-0" />
                    <p className="text-sm text-gray-400 italic">"{apt.notes}"</p>
                  </div>
                )}
              </motion.div>
            ))
          )}
        </motion.div>
      </AnimatePresence>

      <DirectionsDialog
        open={directionsTarget !== null}
        onOpenChange={(open) => { if (!open) setDirectionsTarget(null); }}
        lawyerName={directionsTarget?.lawyerName ?? ''}
        officeAddress={directionsTarget?.officeAddress}
      />
      {/* Request Reschedule — client picks new slot, stores as rescheduleRequested, lawyer approves */}
      <AnimatePresence>
        {rescheduleTarget && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setRescheduleTarget(null)} />
            <motion.div initial={{ scale: 0.95, y: 10 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 10 }} className="relative bg-[#102542] border border-white/10 rounded-2xl p-6 max-w-lg w-full shadow-2xl">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-serif text-lg font-bold flex items-center gap-2"><CalendarSync className="w-5 h-5 text-[#D4AF37]" /> Request Reschedule</h3>
                  <p className="text-xs text-gray-400 mt-1">Current: {(rescheduleTarget as unknown as { date: string; time: string }).date} {(rescheduleTarget as unknown as { time: string }).time} • {rescheduleTarget.lawyerName}</p>
                </div>
                <button onClick={() => setRescheduleTarget(null)} className="text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
              </div>
              <form onSubmit={handleRequestReschedule} className="flex flex-col gap-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <label className="flex flex-col gap-1.5">
                    <span className="text-xs font-semibold text-gray-300">New Date</span>
                    <input type="date" required value={rescheduleDate} onChange={(e) => setRescheduleDate(e.target.value)} min={new Date().toISOString().slice(0,10)} className="bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:border-[#D4AF37]/50 outline-none" />
                  </label>
                  <label className="flex flex-col gap-1.5">
                    <span className="text-xs font-semibold text-gray-300">New Time (IST)</span>
                    {availableSlots === null ? (
                      <input type="time" required value={rescheduleTime} onChange={(e) => setRescheduleTime(e.target.value)} className="bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:border-[#D4AF37]/50 outline-none" />
                    ) : availableSlots.length === 0 ? (
                      <span className="text-xs text-amber-300 bg-amber-500/10 border border-amber-500/20 rounded-xl px-3 py-2.5">No slots — pick another date</span>
                    ) : (
                      <select required value={rescheduleTime} onChange={(e) => setRescheduleTime(e.target.value)} className="bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:border-[#D4AF37]/50 outline-none">
                        <option value="" className="bg-[#102542]">Select time</option>
                        {availableSlots.map((s) => <option key={s} value={s} className="bg-[#102542]">{s}</option>)}
                      </select>
                    )}
                  </label>
                </div>
                {availableSlots && availableSlots.length > 0 && <p className="text-[11px] text-gray-500">{availableSlots.length} slots available on {rescheduleDate} — times in IST, validated against lawyer hours.</p>}
                <label className="flex flex-col gap-1.5">
                  <span className="text-xs font-semibold text-gray-300">Reason (optional)</span>
                  <textarea value={rescheduleReason} onChange={(e) => setRescheduleReason(e.target.value)} placeholder="e.g. Need to shift due to travel, prefer morning slot…" rows={3} maxLength={500} className="bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white placeholder-gray-500 focus:border-[#D4AF37]/50 outline-none resize-none" />
                </label>
                <p className="text-[11px] text-gray-500">Your request will set status to <span className="text-purple-300">Rescheduled</span> and notify the lawyer. The lawyer must approve — your original slot is kept until approved.</p>
                <div className="flex gap-3">
                  <button type="submit" disabled={rescheduleSubmitting || !rescheduleDate || !rescheduleTime} className="flex-1 bg-[#D4AF37] hover:bg-[#c4a133] text-[#102542] font-bold py-2.5 rounded-xl transition-colors inline-flex items-center justify-center gap-2 disabled:opacity-50">
                    {rescheduleSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CalendarSync className="w-4 h-4" />} Send Request
                  </button>
                  <button type="button" onClick={() => setRescheduleTarget(null)} className="flex-1 bg-transparent border border-white/20 hover:bg-white/10 text-white font-semibold py-2.5 rounded-xl transition-colors">Cancel</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {summaryApt && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSummaryApt(null)} />
            <motion.div initial={{ scale: 0.95, y: 10 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 10 }} className="relative bg-[#0a1929] border border-white/10 rounded-2xl p-6 max-w-lg w-full shadow-2xl">
              <h3 className="font-serif text-xl font-bold mb-4">Appointment Summary</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between"><span className="text-gray-400">Lawyer</span><span className="font-semibold">{summaryApt.lawyerName}</span></div>
                <div className="flex justify-between"><span className="text-gray-400">Date</span><span>{new Date(summaryApt.date).toLocaleDateString()} • {summaryApt.time}</span></div>
                <div className="flex justify-between"><span className="text-gray-400">Mode</span><span className="capitalize">{summaryApt.mode}</span></div>
                <div className="flex justify-between"><span className="text-gray-400">Fee</span><span className="text-[#D4AF37] font-bold">₹{summaryApt.fee}</span></div>
                <div className="flex justify-between"><span className="text-gray-400">Case</span><span>{summaryApt.caseType}</span></div>
                {summaryApt.notes && <div className="pt-3 border-t border-white/10"><p className="text-gray-400 text-xs mb-1">Notes</p><p className="text-gray-200 italic">"{summaryApt.notes}"</p></div>}
              </div>
              <button onClick={() => setSummaryApt(null)} className="mt-6 w-full bg-[#D4AF37] text-[#102542] font-bold py-2.5 rounded-xl hover:bg-[#c4a133]">Close</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Appointments;