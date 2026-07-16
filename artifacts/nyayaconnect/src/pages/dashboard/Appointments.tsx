import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  CalendarCheck, 
  MapPin, 
  Video, 
  Building, 
  FileText,
  MessageSquare
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { mockAppointments, AppointmentStatus } from '@/data/dashboardData';

const Appointments = () => {
  const [activeTab, setActiveTab] = useState<"all" | AppointmentStatus>("all");

  const tabs = [
    { id: "all", label: "All Appointments" },
    { id: "upcoming", label: "Upcoming" },
    { id: "pending", label: "Pending" },
    { id: "completed", label: "Completed" },
    { id: "cancelled", label: "Cancelled" },
  ];

  const filteredAppointments = mockAppointments.filter(apt => 
    activeTab === "all" ? true : apt.status === activeTab
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
        <h2 className="font-serif text-3xl font-bold">My Appointments</h2>
        <Link 
          to="/find-lawyers"
          className="bg-[#D4AF37] hover:bg-[#c4a133] text-[#102542] font-bold px-6 py-3 rounded-xl transition-all hover:-translate-y-0.5 shadow-[0_4px_15px_rgba(212,175,55,0.3)] inline-flex items-center justify-center gap-2 w-full md:w-auto"
        >
          <CalendarCheck className="w-5 h-5" />
          Book New Appointment
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const count = tab.id === 'all' 
            ? mockAppointments.length 
            : mockAppointments.filter(a => a.status === tab.id).length;
          
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
                    <div className={cn("w-14 h-14 rounded-full flex items-center justify-center font-serif text-xl font-bold text-white shadow-inner bg-gradient-to-br shrink-0", apt.lawyerGradient)}>
                      {apt.lawyerAvatar}
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
                      {apt.status === 'upcoming' && apt.mode === 'online' && (
                        <a href={apt.meetLink} target="_blank" rel="noreferrer" className="flex-1 xl:flex-none text-center bg-[#D4AF37] text-[#102542] hover:bg-[#c4a133] px-4 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap">
                          Join Meeting
                        </a>
                      )}
                      {apt.status === 'upcoming' && apt.mode === 'offline' && (
                        <button className="flex-1 xl:flex-none text-center bg-transparent border border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37]/10 px-4 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap">
                          Get Directions
                        </button>
                      )}
                      
                      {(apt.status === 'upcoming' || apt.status === 'pending') && (
                        <button className="flex-1 xl:flex-none text-center bg-transparent border border-white/20 text-white hover:bg-white/10 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all whitespace-nowrap">
                          Reschedule
                        </button>
                      )}
                      
                      {(apt.status === 'completed' || apt.status === 'cancelled') && (
                        <button className="flex-1 xl:flex-none text-center bg-[#D4AF37] text-[#102542] hover:bg-[#c4a133] px-4 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap">
                          Book Again
                        </button>
                      )}
                      
                      {apt.status === 'completed' && (
                        <button className="flex-1 xl:flex-none text-center bg-transparent border border-white/20 text-white hover:bg-white/10 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all whitespace-nowrap">
                          View Summary
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
    </div>
  );
};

export default Appointments;