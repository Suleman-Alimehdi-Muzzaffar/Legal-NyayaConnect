import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon,
  Clock,
  Video,
  Building,
  Plus
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { mockAppointments } from '@/data/dashboardData';

const CalendarPage = () => {
  const [currentDate, setCurrentDate] = useState(new Date("2026-07-15T00:00:00Z"));
  const [selectedDate, setSelectedDate] = useState(new Date("2026-07-18T00:00:00Z"));

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  
  // Adjust for Monday start (0 = Mon, 6 = Sun)
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

  const today = new Date("2026-07-15T00:00:00Z");

  const getEventsForDate = (date: Date) => {
    const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    return mockAppointments.filter(apt => apt.date === dateStr);
  };

  const selectedEvents = getEventsForDate(selectedDate);

  const renderCalendarCells = () => {
    const cells = [];
    
    // Empty cells before start
    for (let i = 0; i < startOffset; i++) {
      cells.push(<div key={`empty-${i}`} className="p-2 border border-transparent opacity-30" />);
    }

    // Days
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const isToday = isSameDay(date, today);
      const isSelected = isSameDay(date, selectedDate);
      const isPast = date < today && !isToday;
      const events = getEventsForDate(date);
      const hasEvents = events.length > 0;

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
            hasEvents && !isSelected ? "bg-[#D4AF37]/10" : ""
          )}
        >
          <span className={cn(
            "text-sm sm:text-base font-semibold",
            isSelected ? "text-[#102542]" : "text-white"
          )}>
            {day}
          </span>
          
          {hasEvents && (
            <div className="mt-auto flex gap-1 items-center justify-center">
              {events.slice(0, 3).map((ev, idx) => (
                <div 
                  key={idx} 
                  className={cn(
                    "w-1.5 h-1.5 rounded-full",
                    isSelected ? "bg-[#102542]" : 
                      ev.status === 'upcoming' ? "bg-blue-400" :
                      ev.status === 'completed' ? "bg-green-400" :
                      ev.status === 'cancelled' ? "bg-red-400" : "bg-[#D4AF37]"
                  )} 
                />
              ))}
              {events.length > 3 && <span className="text-[8px] font-bold">+</span>}
            </div>
          )}
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
          
          {/* Calendar Header */}
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

          {/* Calendar Grid */}
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

          {/* Legend */}
          <div className="mt-8 pt-6 border-t border-white/10 flex flex-wrap items-center justify-center gap-6">
            <div className="flex items-center gap-2 text-xs text-gray-400 font-medium">
              <span className="w-2 h-2 rounded-full bg-blue-400" /> Upcoming
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-400 font-medium">
              <span className="w-2 h-2 rounded-full bg-green-400" /> Completed
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-400 font-medium">
              <span className="w-2 h-2 rounded-full bg-red-400" /> Cancelled
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-400 font-medium">
              <span className="w-2 h-2 rounded-full bg-yellow-400" /> Pending
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
            {selectedEvents.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center py-12">
                <CalendarIcon className="w-16 h-16 text-white/10 mb-4" />
                <h4 className="font-serif text-xl font-bold text-white mb-2">No Appointments</h4>
                <p className="text-sm text-gray-400 max-w-[200px] mb-6">You have a clear schedule for this day.</p>
                <Link to="/find-lawyers" className="bg-white/5 hover:bg-white/10 border border-white/10 text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition-colors flex items-center gap-2">
                  <Plus className="w-4 h-4" /> Book Consultation
                </Link>
              </div>
            ) : (
              selectedEvents.map(ev => (
                <div key={ev.id} className="bg-white/5 rounded-2xl p-4 border border-white/10 hover:border-[#D4AF37]/50 transition-colors flex flex-col gap-3 group relative overflow-hidden">
                  <div className={cn("absolute left-0 top-0 bottom-0 w-1", 
                    ev.status === 'upcoming' ? "bg-blue-500" :
                    ev.status === 'completed' ? "bg-green-500" :
                    ev.status === 'cancelled' ? "bg-red-500" : "bg-[#D4AF37]"
                  )} />
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[#D4AF37] font-bold text-sm bg-[#D4AF37]/10 px-3 py-1 rounded-lg border border-[#D4AF37]/20">
                      <Clock className="w-4 h-4" /> {ev.time}
                    </div>
                    <div className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                      {ev.status}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-serif font-bold text-lg text-white group-hover:text-[#D4AF37] transition-colors">{ev.lawyerName}</h4>
                    <p className="text-xs text-gray-400">{ev.specialization} • {ev.caseType}</p>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-white/10 mt-1">
                    <div className="flex items-center gap-1.5 text-xs font-medium text-gray-300">
                      {ev.mode === 'online' ? <Video className="w-3.5 h-3.5" /> : <Building className="w-3.5 h-3.5" />}
                      {ev.mode === 'online' ? 'Online Call' : 'Office Visit'}
                    </div>
                    <Link to="/dashboard/appointments" className="text-xs font-bold text-white hover:text-[#D4AF37] transition-colors flex items-center gap-1">
                      View Details <ChevronRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
          
          {selectedEvents.length > 0 && (
            <div className="mt-6 pt-6 border-t border-white/10">
              <Link to="/find-lawyers" className="w-full bg-transparent hover:bg-white/5 border border-white/20 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors">
                <Plus className="w-4 h-4" /> Add Appointment
              </Link>
            </div>
          )}

        </div>
      </div>

    </div>
  );
};

export default CalendarPage;