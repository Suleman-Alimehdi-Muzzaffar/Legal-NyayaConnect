import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon,
  Clock,
  Video,
  Building,
  Plus,
  Gavel,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useListLawyerAppointments, useListLawyerHearings, useCreateLawyerAppointment, getListLawyerAppointmentsQueryKey } from '@workspace/api-client-react';
import FormInput from '@/components/forms/FormInput';
import FormSelect from '@/components/forms/FormSelect';
import FormTextarea from '@/components/forms/FormTextarea';

const todayDate = new Date().toISOString().slice(0, 10);

const formatDate = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

const to12Hour = (value: string) => {
  const [h, m] = value.split(':').map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return value;
  const period = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 === 0 ? 12 : h % 12;
  return `${hour}:${String(m).padStart(2, '0')} ${period}`;
};

const EMPTY_ADD_FORM = {
  clientName: '',
  caseType: '',
  date: todayDate,
  time: '10:00',
  duration: '45',
  mode: 'online',
  fee: '1500',
  notes: '',
};

const LawyerCalendar = () => {
  const { data: appointmentsData } = useListLawyerAppointments();
  const { data: hearingsData } = useListLawyerHearings();
  const lawyerAppointments = appointmentsData ?? [];
  const lawyerHearings = hearingsData ?? [];
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [addForm, setAddForm] = useState(EMPTY_ADD_FORM);
  const queryClient = useQueryClient();

  const createAppointmentMutation = useCreateLawyerAppointment({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListLawyerAppointmentsQueryKey() });
      },
    },
  });

  const openAddEntry = () => {
    setAddForm(prev => ({ ...prev, date: formatDate(selectedDate) }));
    setIsAddOpen(true);
  };

  const handleAddEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = addForm.clientName.trim();
    if (!name || !addForm.caseType.trim()) {
      toast.error('Please enter the client name and case type');
      return;
    }
    const initials = name.split(/\s+/).map(w => w[0]).join('').toUpperCase().slice(0, 2) || 'NC';
    try {
      await createAppointmentMutation.mutateAsync({
        data: {
          clientName: name,
          clientInitials: initials,
          clientGradient: 'from-purple-500 to-indigo-700',
          caseType: addForm.caseType.trim(),
          date: addForm.date,
          time: to12Hour(addForm.time),
          duration: Number(addForm.duration),
          mode: addForm.mode as 'online' | 'offline',
          status: 'upcoming',
          fee: Number(addForm.fee),
          isPaid: false,
          notes: addForm.notes.trim(),
        },
      });
      toast.success('Entry added to calendar');
      setAddForm(EMPTY_ADD_FORM);
      setIsAddOpen(false);
    } catch {
      toast.error('Failed to add entry');
    }
  };

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  const startOffset = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  const isSameDay = (d1: Date, d2: Date) => {
    return d1.getFullYear() === d2.getFullYear() && 
           d1.getMonth() === d2.getMonth() && 
           d1.getDate() === d2.getDate();
  };

  const today = new Date();

  const getEventsForDate = (date: Date) => {
    const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    const apts = lawyerAppointments.filter(a => a.date === dateStr);
    const hearings = lawyerHearings.filter(h => h.date === dateStr);
    return { apts, hearings };
  };

  const selectedEvents = getEventsForDate(selectedDate);
  const totalSelectedEvents = selectedEvents.apts.length + selectedEvents.hearings.length;

  const renderCalendarCells = () => {
    const cells = [];
    
    for (let i = 0; i < startOffset; i++) {
      cells.push(<div key={`empty-${i}`} className="p-2 border border-transparent opacity-30" />);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const isToday = isSameDay(date, today);
      const isSelected = isSameDay(date, selectedDate);
      const isPast = date < today && !isToday;
      const { apts, hearings } = getEventsForDate(date);
      const isHoliday = date.getDay() === 0; // Sunday
      
      cells.push(
        <motion.button
          key={`day-${day}`}
          onClick={() => setSelectedDate(date)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={cn(
            "relative h-14 sm:h-20 border rounded-xl flex flex-col items-center p-1 sm:p-2 transition-colors overflow-hidden group",
            isSelected ? "bg-[#D4AF37] border-[#D4AF37] text-[#102542]" : "border-white/5 hover:border-white/20 bg-white/[0.02]",
            isToday && !isSelected ? "ring-2 ring-[#D4AF37] ring-inset" : "",
            isPast && !isSelected ? "opacity-50" : "",
            (apts.length > 0 || hearings.length > 0) && !isSelected ? "bg-[#D4AF37]/5" : ""
          )}
        >
          <span className={cn(
            "text-sm sm:text-base font-semibold",
            isSelected ? "text-[#102542]" : isHoliday ? "text-gray-500" : "text-white"
          )}>
            {day}
          </span>
          
          <div className="mt-auto flex gap-1 items-center justify-center">
            {apts.length > 0 && <div className={cn("w-1.5 h-1.5 rounded-full", isSelected ? "bg-[#102542]" : "bg-[#D4AF37]")} />}
            {hearings.length > 0 && <div className={cn("w-1.5 h-1.5 rounded-full", isSelected ? "bg-[#102542]" : "bg-blue-400")} />}
            {isHoliday && !isSelected && <div className="w-1 h-1 rounded-full bg-gray-500" />}
          </div>
        </motion.button>
      );
    }
    return cells;
  };

  return (
    <div className="flex flex-col xl:flex-row gap-6 md:gap-8 h-full">
      {/* Left Column: Calendar */}
      <div className="xl:w-[60%] flex flex-col gap-6 shrink-0">
        <div className="glass-card rounded-3xl p-6 border border-white/10 flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-serif text-2xl font-bold">
              {monthNames[currentDate.getMonth()]} <span className="text-[#D4AF37]">{currentDate.getFullYear()}</span>
            </h2>
            <div className="flex gap-2">
              <button onClick={prevMonth} className="w-10 h-10 rounded-full bg-white/5 hover:bg-[#D4AF37] hover:text-[#102542] border border-white/10 transition-all flex items-center justify-center">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button onClick={nextMonth} className="w-10 h-10 rounded-full bg-white/5 hover:bg-[#D4AF37] hover:text-[#102542] border border-white/10 transition-all flex items-center justify-center">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-2 mb-2">
            {dayNames.map(day => (
              <div key={day} className="text-center text-xs font-semibold text-[#D4AF37] uppercase tracking-wider py-2">
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-2 flex-1">
            {renderCalendarCells()}
          </div>

          <div className="mt-8 pt-6 border-t border-white/10 flex flex-wrap items-center justify-center gap-6">
            <div className="flex items-center gap-2 text-xs text-gray-400 font-medium">
              <span className="w-2 h-2 rounded-full bg-[#D4AF37]" /> Appointment
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-400 font-medium">
              <span className="w-2 h-2 rounded-full bg-blue-400" /> Hearing
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-400 font-medium">
              <span className="w-1 h-1 rounded-full bg-gray-500" /> Holiday
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: Events */}
      <div className="xl:w-[40%] flex flex-col gap-6">
        <div className="glass-card rounded-3xl p-6 border border-white/10 flex-1 flex flex-col">
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-1">Schedule for</h3>
            <h2 className="font-serif text-2xl font-bold text-[#D4AF37]">
              {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
            </h2>
          </div>

          <div className="flex-1 flex flex-col gap-4 overflow-y-auto pr-2 custom-scrollbar">
            {totalSelectedEvents === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center py-12">
                <CalendarIcon className="w-16 h-16 text-white/10 mb-4" />
                <h4 className="font-serif text-xl font-bold text-white mb-2">Free Day</h4>
                <p className="text-sm text-gray-400 max-w-[200px] mb-6">You have no appointments or hearings scheduled for this day.</p>
                <button onClick={openAddEntry} className="bg-white/5 hover:bg-white/10 border border-white/10 text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition-colors flex items-center gap-2">
                  <Plus className="w-4 h-4" /> Add Entry
                </button>
              </div>
            ) : (
              <>
                {/* Hearings List */}
                {selectedEvents.hearings.map(h => (
                  <div key={h.id} className="bg-white/5 rounded-2xl p-4 border border-white/10 hover:border-blue-500/30 transition-colors flex flex-col gap-3 relative overflow-hidden">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500" />
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-blue-400 font-bold text-sm bg-blue-500/10 px-3 py-1 rounded-lg border border-blue-500/20">
                        <Clock className="w-4 h-4" /> {h.time}
                      </div>
                      <div className="text-[10px] font-bold uppercase tracking-wider bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded">
                        Hearing
                      </div>
                    </div>

                    <div>
                      <h4 className="font-serif font-bold text-lg text-white">{h.caseTitle}</h4>
                      <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
                        <Gavel className="w-3.5 h-3.5 text-gray-500" /> {h.court} • {h.room}
                      </div>
                    </div>
                  </div>
                ))}

                {/* Appointments List */}
                {selectedEvents.apts.map(apt => (
                  <div key={apt.id} className="bg-white/5 rounded-2xl p-4 border border-white/10 hover:border-[#D4AF37]/50 transition-colors flex flex-col gap-3 relative overflow-hidden">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#D4AF37]" />
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-[#D4AF37] font-bold text-sm bg-[#D4AF37]/10 px-3 py-1 rounded-lg border border-[#D4AF37]/20">
                        <Clock className="w-4 h-4" /> {apt.time}
                      </div>
                      <div className="text-[10px] font-bold uppercase tracking-wider bg-white/10 text-gray-300 px-2 py-0.5 rounded">
                        Appointment
                      </div>
                    </div>

                    <div>
                      <h4 className="font-serif font-bold text-lg text-white">{apt.clientName}</h4>
                      <p className="text-xs text-gray-400">{apt.caseType}</p>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-white/10 mt-1">
                      <div className="flex items-center gap-1.5 text-xs font-medium text-gray-300">
                        {apt.mode === 'online' ? <Video className="w-3.5 h-3.5" /> : <Building className="w-3.5 h-3.5" />}
                        {apt.mode === 'online' ? 'Online Call' : 'Office Visit'}
                      </div>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
          
          <div className="mt-6 pt-6 border-t border-white/10">
            <button onClick={openAddEntry} className="w-full bg-transparent hover:bg-white/5 border border-white/20 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors">
              <Plus className="w-4 h-4" /> Add Entry
            </button>
          </div>
        </div>
      </div>

      {/* Add Entry Modal */}
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
                  <h3 className="font-serif text-xl font-bold text-white">Add Entry</h3>
                  <div className="text-xs text-gray-400 mt-0.5">Schedule a new appointment on your calendar</div>
                </div>
                <button onClick={() => setIsAddOpen(false)} className="text-gray-400 hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddEntry} className="flex flex-col gap-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormInput
                    label="Client Name" name="clientName" required
                    value={addForm.clientName} onChange={e => setAddForm({ ...addForm, clientName: e.target.value })}
                    placeholder="e.g. Client Name"
                    className="sm:col-span-2"
                  />
                  <FormInput
                    label="Case Type" name="caseType" required
                    value={addForm.caseType} onChange={e => setAddForm({ ...addForm, caseType: e.target.value })}
                    placeholder="e.g. Divorce"
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
                    <Plus className="w-4 h-4" /> {createAppointmentMutation.isPending ? 'Adding...' : 'Add Entry'}
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
    </div>
  );
};

export default LawyerCalendar;
