import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CalendarCheck, 
  Video, 
  Building, 
  MessageSquare,
  Plus,
  X,
  StickyNote,
  CalendarSync,
  CheckCircle2,
  Loader2,
  Clock,
  AlertCircle
} from 'lucide-react';
import { cn, openMeetLink } from '@/lib/utils';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  useListLawyerAppointments,
  useUpdateLawyerAppointment,
  useCreateLawyerAppointment,
  useCreateAppointmentMeet,
  useListLawyerClients,
  getListLawyerAppointmentsQueryKey,
  type LawyerAppointment,
  type LawyerAppointmentStatus,
} from '@workspace/api-client-react';
import { useAuth } from '@/lib/auth-context';
import FormSelect from '@/components/forms/FormSelect';
import FormInput from '@/components/forms/FormInput';
import FormTextarea from '@/components/forms/FormTextarea';

const todayDate = new Date().toISOString().slice(0, 10);

const EMPTY_ADD_FORM = {
  clientId: '',
  date: todayDate,
  time: '10:00',
  duration: '45',
  mode: 'online',
  fee: '1500',
  isPaid: false,
  notes: '',
};

const to12Hour = (value: string) => {
  const [h, m] = value.split(':').map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return value;
  const period = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 === 0 ? 12 : h % 12;
  return `${hour}:${String(m).padStart(2, '0')} ${period}`;
};

const LawyerAppointments = () => {
  const [activeTab, setActiveTab] = useState<string>("all");
  const { data: appointmentsData } = useListLawyerAppointments();
  const { data: clientsData } = useListLawyerClients();
  const lawyerAppointments = appointmentsData ?? [];
  const lawyerClients = clientsData ?? [];
  const weeklyAppointments = lawyerAppointments.filter(a => {
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - 7);
    return new Date(a.date) >= weekStart;
  });
  const queryClient = useQueryClient();
  const { user, token } = useAuth() as unknown as { user: { id: string }; token: string };

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [addForm, setAddForm] = useState(EMPTY_ADD_FORM);
  const [rescheduleApt, setRescheduleApt] = useState<LawyerAppointment | null>(null);
  const [rescheduleForm, setRescheduleForm] = useState({ date: todayDate, time: '10:00' });
  const [notesApt, setNotesApt] = useState<LawyerAppointment | null>(null);
  const [notesText, setNotesText] = useState('');
  const [resolvingId, setResolvingId] = useState<string | null>(null);

  const updateAppointmentMutation = useUpdateLawyerAppointment({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListLawyerAppointmentsQueryKey() });
      },
    },
  });

  const createAppointmentMutation = useCreateLawyerAppointment({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListLawyerAppointmentsQueryKey() });
      },
    },
  });

  const handleStatusChange = async (id: string, status: LawyerAppointmentStatus, label: string) => {
    try {
      await updateAppointmentMutation.mutateAsync({ id, data: { status } });
      toast.success(`Appointment ${label.toLowerCase()}`);
    } catch {
      toast.error(`Failed to ${label.toLowerCase()} appointment`);
    }
  };

  const handleReschedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rescheduleApt) return;
    try {
      await updateAppointmentMutation.mutateAsync({
        id: rescheduleApt.id,
        data: { date: rescheduleForm.date, time: to12Hour(rescheduleForm.time) },
      });
      toast.success('Appointment rescheduled');
      setRescheduleApt(null);
    } catch {
      toast.error('Failed to reschedule appointment');
    }
  };

  const handleSaveNotes = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!notesApt) return;
    try {
      await updateAppointmentMutation.mutateAsync({
        id: notesApt.id,
        data: { notes: notesText.trim() },
      });
      toast.success('Notes saved');
      setNotesApt(null);
    } catch {
      toast.error('Failed to save notes');
    }
  };

  const handleResolveReschedule = async (apt: LawyerAppointment, action: 'approve' | 'reject') => {
    setResolvingId(apt.id);
    try {
      const tryResolve = async (url: string) => {
        const r = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
          body: JSON.stringify({ action }),
        });
        if (!r.ok) {
          const j = await r.json().catch(() => null);
          throw new Error(j?.message ?? `Failed (${r.status})`);
        }
        return r;
      };
      try {
        await tryResolve(`/api/lawyer/appointments/${apt.id}/resolve-reschedule`);
      } catch (e) {
        // Fallback: appointment may be a client Appointment mirrored, try the other collection's endpoint
        const msg = e instanceof Error ? e.message : '';
        if (msg.toLowerCase().includes('not found') || msg.includes('404')) {
          await tryResolve(`/api/appointments/${apt.id}/resolve-reschedule`);
        } else {
          throw e;
        }
      }
      toast.success(action === 'approve' ? 'Reschedule approved — client notified and slot updated' : 'Reschedule rejected — client notified');
      queryClient.invalidateQueries({ queryKey: getListLawyerAppointmentsQueryKey() });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to resolve');
    } finally {
      setResolvingId(null);
    }
  };

  const meetMutation = useCreateAppointmentMeet({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListLawyerAppointmentsQueryKey() });
      },
    },
  });

  const handleStartMeeting = async (apt: LawyerAppointment) => {
    if (apt.meetLink) {
      openMeetLink(apt.meetLink);
      return;
    }
    if (!user?.id) {
      toast.error('Please sign in to start a meeting');
      return;
    }
    try {
      const res = await meetMutation.mutateAsync({ id: apt.id, data: { userId: user.id } });
      toast.success('Starting meeting...');
      openMeetLink(res.meetLink);
    } catch (err) {
      const apiError = err as { status?: number; data?: { message?: string } };
      if (apiError.status === 401) {
        toast.error('Connect your Google Calendar in Settings first');
      } else {
        toast.error(apiError.data?.message ?? 'Failed to create meeting link');
      }
    }
  };

  const handleAddAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    const client = lawyerClients.find(c => c.id === addForm.clientId);
    if (!client) {
      toast.error('Please select a client');
      return;
    }
    try {
      await createAppointmentMutation.mutateAsync({
        data: {
          clientName: client.name,
          clientInitials: client.initials,
          clientGradient: client.gradient,
          caseType: client.caseType,
          date: addForm.date,
          time: to12Hour(addForm.time),
          duration: Number(addForm.duration),
          mode: addForm.mode as 'online' | 'offline',
          status: 'upcoming',
          fee: Number(addForm.fee),
          isPaid: addForm.isPaid,
          notes: addForm.notes.trim(),
        },
      });
      toast.success('Appointment added successfully');
      setAddForm(EMPTY_ADD_FORM);
      setIsAddOpen(false);
    } catch {
      toast.error('Failed to add appointment');
    }
  };

  const openReschedule = (apt: LawyerAppointment) => {
    setRescheduleApt(apt);
    setRescheduleForm({ date: apt.date, time: apt.time });
  };

  const openNotes = (apt: LawyerAppointment) => {
    setNotesApt(apt);
    setNotesText(apt.notes || '');
  };

  const tabs = [
    { id: "all", label: "All Appointments" },
    { id: "today", label: "Today" },
    { id: "upcoming", label: "Upcoming" },
    { id: "pending", label: "Pending" },
    { id: "completed", label: "Completed" },
    { id: "cancelled", label: "Cancelled" },
  ];

  const filteredAppointments = lawyerAppointments.filter(apt => {
    if (activeTab === "all") return true;
    if (activeTab === "today") return apt.date === todayDate;
    if (activeTab === "upcoming") return apt.status === "upcoming" && apt.date !== todayDate;
    return apt.status === activeTab;
  }).sort((a, b) => new Date(`${a.date} ${a.time}`).getTime() - new Date(`${b.date} ${b.time}`).getTime());

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'upcoming': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'completed': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'cancelled': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'pending': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getStatusLabel = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  return (
    <div className="flex flex-col gap-6 md:gap-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="font-serif text-3xl font-bold">My Appointments</h2>
        <button onClick={() => setIsAddOpen(true)} className="bg-[#D4AF37] hover:bg-[#c4a133] text-[#102542] font-bold px-6 py-3 rounded-xl transition-all hover:-translate-y-0.5 shadow-[0_4px_15px_rgba(212,175,55,0.3)] inline-flex items-center justify-center gap-2 w-full md:w-auto">
          <Plus className="w-5 h-5" />
          Add Appointment
        </button>
      </div>

      {/* Weekly Summary Bar */}
      <div className="glass-card rounded-2xl border border-white/10 p-4 flex flex-wrap gap-4 md:gap-8">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#D4AF37]" />
          <span className="text-sm text-gray-300">Total This Week: <strong className="text-white">{weeklyAppointments.length}</strong></span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500" />
          <span className="text-sm text-gray-300">Online: <strong className="text-white">{weeklyAppointments.filter(a => a.mode === 'online').length}</strong></span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-gray-400" />
          <span className="text-sm text-gray-300">Offline: <strong className="text-white">{weeklyAppointments.filter(a => a.mode !== 'online').length}</strong></span>
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <span className="text-sm text-gray-300">Expected Revenue: <strong className="text-[#D4AF37] text-lg font-bold">₹{weeklyAppointments.reduce((sum, a) => sum + (a.fee || 0), 0).toLocaleString('en-IN')}</strong></span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          let count = 0;
          if (tab.id === 'all') count = lawyerAppointments.length;
          else if (tab.id === 'today') count = lawyerAppointments.filter(a => a.date === todayDate).length;
          else if (tab.id === 'upcoming') count = lawyerAppointments.filter(a => a.status === 'upcoming' && a.date !== todayDate).length;
          else count = lawyerAppointments.filter(a => a.status === tab.id).length;
          
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
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
              <h3 className="font-serif text-2xl font-bold mb-2">No Appointments</h3>
              <p className="text-gray-400 max-w-sm mb-6">No {activeTab !== 'all' ? activeTab : ''} appointments found for this filter.</p>
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
                {(apt as unknown as { rescheduleRequested?: boolean }).rescheduleRequested && (
                  <div className="mb-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-amber-300 font-semibold text-sm"><CalendarSync className="w-4 h-4" /> Reschedule requested</div>
                    <div className="text-xs text-gray-300">Requested: {(apt as unknown as { requestedDate: string }).requestedDate} {(apt as unknown as { requestedTime: string }).requestedTime} • Original: {apt.date} {apt.time}</div>
                    {(apt as unknown as { rescheduleReason?: string }).rescheduleReason && <div className="text-xs text-gray-400 italic">Reason: {(apt as unknown as { rescheduleReason: string }).rescheduleReason}</div>}
                    <div className="text-[11px] text-gray-500">Client: {apt.clientName} • Status: {apt.status}</div>
                    <div className="flex gap-2 mt-1">
                      <button onClick={() => handleResolveReschedule(apt, 'approve')} disabled={resolvingId === apt.id} className="flex-1 bg-green-500/20 hover:bg-green-500/30 text-green-400 border border-green-500/30 font-semibold py-2 rounded-lg text-xs flex items-center justify-center gap-1.5 disabled:opacity-50">
                        {resolvingId === apt.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />} Approve & Move
                      </button>
                      <button onClick={() => handleResolveReschedule(apt, 'reject')} disabled={resolvingId === apt.id} className="flex-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 font-semibold py-2 rounded-lg text-xs flex items-center justify-center gap-1.5 disabled:opacity-50">
                        <X className="w-3.5 h-3.5" /> Reject
                      </button>
                    </div>
                  </div>
                )}
                <div className="flex flex-col xl:flex-row gap-6">
                  
                  {/* Left: Client Info */}
                  <div className="flex items-start gap-4 xl:w-[30%] shrink-0">
                    <div className={cn("w-14 h-14 rounded-full flex items-center justify-center font-serif text-xl font-bold text-white shadow-inner bg-gradient-to-br shrink-0", apt.clientGradient)}>
                      {apt.clientInitials}
                    </div>
                    <div>
                      <h4 className="font-serif text-xl font-bold">{apt.clientName}</h4>
                      <div className="inline-block mt-2 px-3 py-1 rounded-md border border-[#D4AF37]/30 bg-[#D4AF37]/5 text-xs text-[#D4AF37] font-medium uppercase tracking-wider">
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
                  <div className="xl:w-[35%] shrink-0 flex flex-col xl:items-end justify-between gap-4 xl:border-l xl:border-white/10 xl:pl-6">
                    <div className="flex items-center justify-between w-full xl:justify-end xl:gap-4">
                      <div className="flex items-center gap-2">
                        <div className="font-bold text-xl text-[#D4AF37]">₹{apt.fee}</div>
                        {apt.isPaid ? (
                          <span className="bg-green-500/20 text-green-400 px-2 py-0.5 rounded text-[10px] font-bold border border-green-500/30 uppercase">Paid</span>
                        ) : (
                          <span className="bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded text-[10px] font-bold border border-yellow-500/30 uppercase">Pending</span>
                        )}
                      </div>
                      <div className={cn("px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider border", getStatusColor(apt.status))}>
                        {getStatusLabel(apt.status)}
                      </div>
                    </div>

                    <div className="flex flex-wrap xl:flex-nowrap gap-2 w-full xl:justify-end">
                      {apt.status === 'upcoming' && apt.mode === 'online' && (
                        <button onClick={() => handleStartMeeting(apt)} className="flex-1 xl:flex-none text-center bg-[#D4AF37] text-[#102542] hover:bg-[#c4a133] px-4 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap">
                          Start Meeting
                        </button>
                      )}
                      
                      {(apt.status === 'upcoming' || apt.status === 'pending') && (
                        <button onClick={() => openReschedule(apt)} className="flex-1 xl:flex-none text-center bg-transparent border border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37]/10 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all whitespace-nowrap">
                          Reschedule
                        </button>
                      )}

                      {apt.status === 'upcoming' && (
                        <button onClick={() => handleStatusChange(apt.id, 'completed', 'Marked complete')} className="flex-1 xl:flex-none text-center bg-green-500/10 border border-green-500/30 text-green-400 hover:bg-green-500/20 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all whitespace-nowrap">
                          Mark Complete
                        </button>
                      )}
                      
                      {(apt.status === 'upcoming' || apt.status === 'pending') && (
                        <button onClick={() => handleStatusChange(apt.id, 'cancelled', 'Cancelled')} className="flex-1 xl:flex-none text-center bg-transparent text-red-400 hover:text-red-300 hover:bg-red-400/10 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all whitespace-nowrap">
                          Cancel
                        </button>
                      )}

                      {apt.status === 'completed' && (
                        <button onClick={() => openNotes(apt)} className="flex-1 xl:flex-none text-center bg-transparent border border-white/20 text-white hover:bg-white/10 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all whitespace-nowrap">
                          Add Notes
                        </button>
                      )}
                    </div>
                  </div>
                </div>

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

      {/* Add Appointment Modal */}
      <AnimatePresence>
        {isAddOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsAddOpen(false)}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
          >
            <motion.div
              initial={{ scale: 0.95, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 10 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-card bg-[#102542] border border-white/10 rounded-3xl w-full max-w-lg p-6 shadow-[0_0_60px_rgba(212,175,55,0.15)]"
            >
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="font-serif text-xl font-bold text-white">Add Appointment</h3>
                  <div className="text-xs text-gray-400 mt-0.5">Schedule a new session with a client</div>
                </div>
                <button onClick={() => setIsAddOpen(false)} className="text-gray-400 hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddAppointment} className="flex flex-col gap-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormSelect
                    label="Client" name="client" required
                    value={addForm.clientId} onChange={e => setAddForm({ ...addForm, clientId: e.target.value })}
                    placeholder="Select a client"
                    options={lawyerClients.map(c => ({ label: `${c.name} · ${c.caseType}`, value: c.id }))}
                    className="sm:col-span-2"
                  />
                  <FormInput label="Date" name="date" type="date" required value={addForm.date} onChange={e => setAddForm({ ...addForm, date: e.target.value })} />
                  <FormInput label="Time" name="time" type="time" required value={addForm.time} onChange={e => setAddForm({ ...addForm, time: e.target.value })} />
                  <FormSelect
                    label="Duration" name="duration" required
                    value={addForm.duration} onChange={e => setAddForm({ ...addForm, duration: e.target.value })}
                    options={[
                      { label: "30 minutes", value: "30" },
                      { label: "45 minutes", value: "45" },
                      { label: "60 minutes", value: "60" },
                    ]}
                  />
                  <FormSelect
                    label="Mode" name="mode" required
                    value={addForm.mode} onChange={e => setAddForm({ ...addForm, mode: e.target.value })}
                    options={[
                      { label: "Online", value: "online" },
                      { label: "Offline", value: "offline" },
                    ]}
                  />
                  <FormInput label="Consultation Fee (₹)" name="fee" type="number" required value={addForm.fee} onChange={e => setAddForm({ ...addForm, fee: e.target.value })} />
                  <div className="flex items-end pb-1">
                    <label className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-4 py-3 cursor-pointer w-full">
                      <input
                        type="checkbox"
                        checked={addForm.isPaid}
                        onChange={e => setAddForm({ ...addForm, isPaid: e.target.checked })}
                        className="w-4 h-4 accent-[#D4AF37]"
                      />
                      <span className="text-sm text-gray-300 font-sans">Payment received</span>
                    </label>
                  </div>
                  <FormTextarea
                    label="Notes" name="notes" rows={2}
                    value={addForm.notes} onChange={e => setAddForm({ ...addForm, notes: e.target.value })}
                    placeholder="Optional notes for this session..."
                    className="sm:col-span-2"
                  />
                </div>

                <div className="flex gap-3 mt-2">
                  <button
                    type="submit"
                    disabled={createAppointmentMutation.isPending}
                    className="flex-1 bg-[#D4AF37] hover:bg-[#c4a133] text-[#102542] font-bold py-2.5 rounded-xl transition-colors inline-flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    <Plus className="w-4 h-4" /> {createAppointmentMutation.isPending ? 'Adding...' : 'Add Appointment'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsAddOpen(false)}
                    className="flex-1 bg-transparent border border-white/20 hover:bg-white/10 text-white font-semibold py-2.5 rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reschedule Modal */}
      <AnimatePresence>
        {rescheduleApt && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setRescheduleApt(null)}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 10 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-card bg-[#102542] border border-white/10 rounded-3xl w-full max-w-md p-6 shadow-[0_0_60px_rgba(212,175,55,0.15)]"
            >
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37]">
                    <CalendarSync className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-serif text-xl font-bold text-white">Reschedule</h3>
                    <div className="text-xs text-gray-400 mt-0.5">{rescheduleApt.clientName} · {rescheduleApt.time}</div>
                  </div>
                </div>
                <button onClick={() => setRescheduleApt(null)} className="text-gray-400 hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleReschedule} className="flex flex-col gap-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormInput label="Date" name="rdate" type="date" required value={rescheduleForm.date} onChange={e => setRescheduleForm({ ...rescheduleForm, date: e.target.value })} />
                  <FormInput label="Time" name="rtime" type="time" required value={rescheduleForm.time} onChange={e => setRescheduleForm({ ...rescheduleForm, time: e.target.value })} />
                </div>

                <div className="flex gap-3 mt-2">
                  <button
                    type="submit"
                    disabled={updateAppointmentMutation.isPending}
                    className="flex-1 bg-[#D4AF37] hover:bg-[#c4a133] text-[#102542] font-bold py-2.5 rounded-xl transition-colors disabled:opacity-60"
                  >
                    {updateAppointmentMutation.isPending ? 'Rescheduling...' : 'Confirm Reschedule'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setRescheduleApt(null)}
                    className="flex-1 bg-transparent border border-white/20 hover:bg-white/10 text-white font-semibold py-2.5 rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Notes Modal */}
      <AnimatePresence>
        {notesApt && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setNotesApt(null)}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 10 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-card bg-[#102542] border border-white/10 rounded-3xl w-full max-w-md p-6 shadow-[0_0_60px_rgba(212,175,55,0.15)]"
            >
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37]">
                    <StickyNote className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-serif text-xl font-bold text-white">Add Notes</h3>
                    <div className="text-xs text-gray-400 mt-0.5">{notesApt.clientName} · {notesApt.caseType}</div>
                  </div>
                </div>
                <button onClick={() => setNotesApt(null)} className="text-gray-400 hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveNotes} className="flex flex-col gap-4">
                <FormTextarea
                  label="Session Notes" name="notes" rows={5}
                  required
                  value={notesText} onChange={e => setNotesText(e.target.value)}
                  placeholder="Record notes about this session..."
                />

                <div className="flex gap-3 mt-2">
                  <button
                    type="submit"
                    disabled={updateAppointmentMutation.isPending}
                    className="flex-1 bg-[#D4AF37] hover:bg-[#c4a133] text-[#102542] font-bold py-2.5 rounded-xl transition-colors disabled:opacity-60"
                  >
                    {updateAppointmentMutation.isPending ? 'Saving...' : 'Save Notes'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setNotesApt(null)}
                    className="flex-1 bg-transparent border border-white/20 hover:bg-white/10 text-white font-semibold py-2.5 rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LawyerAppointments;
