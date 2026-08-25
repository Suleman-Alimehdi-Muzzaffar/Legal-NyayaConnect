import React from 'react';
import { motion, Variants } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  CalendarCheck, 
  Scale, 
  FileText, 
  CheckCircle, 
  CalendarPlus, 
  Upload, 
  BookOpen, 
  User,
  Bell,
  MoreHorizontal
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { avatarUrl } from '@/lib/avatar';
import { useListAppointments, useListDocuments, useListNotifications, useListActivities, useMarkNotificationRead, useListLawyerAppointments, getListNotificationsQueryKey } from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/lib/auth-context';

const Dashboard = () => {
  const { data: appointments } = useListAppointments({ query: { refetchInterval: 15000 } } as unknown as never);
  const { data: lawyerApts } = useListLawyerAppointments({ query: { refetchInterval: 15000 } } as unknown as never);
  const { data: documents } = useListDocuments();
  const { data: notifications } = useListNotifications();
  const { data: activities } = useListActivities();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const markNotificationReadMutation = useMarkNotificationRead({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListNotificationsQueryKey() });
      },
    },
  });

  const today = new Date();
  const options: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  const formattedDate = today.toLocaleDateString('en-US', options);

  const upcomingAppointments = (() => {
    const base = appointments ?? [];
    const lawyerMeet = new Map<string, string>();
    for (const la of (lawyerApts as unknown as Array<{ date: string; time: string; meetLink?: string }> ?? [])) {
      if (la.meetLink && la.date && la.time) lawyerMeet.set(`${la.date}|${la.time}`, la.meetLink);
    }
    const enriched = lawyerMeet.size === 0 ? base : base.map((a) => {
      if ((a as unknown as { meetLink?: string }).meetLink) return a;
      const ml = lawyerMeet.get(`${(a as unknown as { date: string }).date}|${(a as unknown as { time: string }).time}`);
      return ml ? ({ ...a, meetLink: ml } as typeof a) : a;
    });
    return enriched.filter(a => a.status === 'upcoming').slice(0, 3);
  })();
  const pendingDocs = (documents ?? []).filter(d => d.status === 'pending_review').slice(0, 3);
  const recentActivities = (activities ?? []).slice(0, 6);
  const unreadNotifs = (notifications ?? []).filter(n => !n.isRead).slice(0, 3);

  const markAllRead = () => {
    (notifications ?? []).filter(n => !n.isRead).forEach(n => markNotificationReadMutation.mutate({ id: n.id }));
  };

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.08 }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="flex flex-col gap-6 md:gap-8"
    >
      {/* A. Welcome Banner */}
      <motion.div variants={itemVariants} className="glass-card rounded-3xl p-6 md:p-8 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6 border-[#D4AF37]/20 shadow-lg">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#D4AF37]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        
        <div className="relative z-10 flex flex-col items-start gap-2 w-full">
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-white">
            Good Morning, <span className="text-[#D4AF37]">{user?.name ?? 'there'}</span>
          </h2>
          <p className="text-gray-300 font-sans text-sm md:text-base">{formattedDate}</p>
          <div className="mt-4 bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#D4AF37] px-4 py-2 rounded-full text-sm font-medium inline-flex items-center gap-2">
            <CalendarCheck className="w-4 h-4" />
            You have {upcomingAppointments.length} upcoming appointments this week
          </div>
        </div>

        <div className="relative z-10 hidden md:flex items-center justify-center shrink-0 pr-8">
          <div className="w-24 h-24 rounded-full border-4 border-[#D4AF37]/20 flex items-center justify-center relative">
            <div className="absolute inset-0 border-t-4 border-[#D4AF37] rounded-full animate-[spin_10s_linear_infinite]" />
            <Scale className="w-10 h-10 text-[#D4AF37]" />
          </div>
        </div>
      </motion.div>

      {/* B. Stats Row */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {[
          { label: "Upcoming Appointments", val: upcomingAppointments.length, sub: upcomingAppointments[0] ? `Next: ${upcomingAppointments[0].date}` : "None scheduled", icon: CalendarCheck },
          { label: "Pending Documents", val: pendingDocs.length, sub: "Awaiting review", icon: FileText },
          { label: "Total Appointments", val: (appointments ?? []).length, sub: "All time", icon: CheckCircle },
          { label: "Unread Notifications", val: (notifications ?? []).filter(n => !n.isRead).length, sub: "Need attention", icon: Bell }
        ].map((stat, i) => (
          <div key={i} className="glass-card p-5 rounded-2xl border border-white/10 hover:border-[#D4AF37]/30 transition-colors flex flex-col gap-3 group">
            <div className="w-10 h-10 rounded-full bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37] group-hover:scale-110 transition-transform">
              <stat.icon className="w-5 h-5" />
            </div>
            <div>
              <div className="text-3xl font-serif font-bold text-white mb-1">{stat.val}</div>
              <div className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-1">{stat.label}</div>
              <div className="text-xs text-gray-500">{stat.sub}</div>
            </div>
          </div>
        ))}
      </motion.div>

      {/* C. Two Column Layout */}
      <div className="flex flex-col lg:flex-row gap-6 md:gap-8">
        
        {/* LEFT COLUMN */}
        <div className="flex-1 flex flex-col gap-6 md:gap-8">
          
          {/* Upcoming Appointments */}
          <motion.div variants={itemVariants} className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-xl font-bold flex items-center gap-2">
                <span className="w-2 h-6 bg-[#D4AF37] rounded-full inline-block" />
                Upcoming Appointments
              </h3>
              <Link to="/dashboard/appointments" className="text-sm text-[#D4AF37] hover:underline font-medium">View All</Link>
            </div>
            
            <div className="flex flex-col gap-3">
              {upcomingAppointments.map((apt) => (
                <div key={apt.id} className="glass-card p-4 rounded-2xl border border-white/10 flex flex-col sm:flex-row sm:items-center gap-4 hover:bg-white/[0.07] transition-colors">
                  <div className="flex items-center gap-4 flex-1">
                    <div className={cn("w-12 h-12 rounded-full flex items-center justify-center overflow-hidden font-serif text-lg font-bold text-white shadow-inner bg-gradient-to-br", apt.lawyerGradient)}>
                      {apt.lawyerAvatar ? (
                        <img src={avatarUrl(apt.lawyerAvatar)} alt={apt.lawyerName} className="w-full h-full object-cover" />
                      ) : (
                        (apt.lawyerName ?? '').split(/\s+/).map((part) => part[0]).filter(Boolean).slice(0, 2).join('').toUpperCase() || 'L'
                      )}
                    </div>
                    <div>
                      <h4 className="font-serif font-bold text-lg">{apt.lawyerName}</h4>
                      <div className="text-[#D4AF37] text-xs font-semibold uppercase tracking-wider">{apt.specialization}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 sm:gap-6 flex-wrap sm:flex-nowrap w-full sm:w-auto">
                    <div className="bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg text-sm text-gray-300 shrink-0">
                      {apt.date} • {apt.time}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-full bg-white/5 border border-white/10 shrink-0">
                      <span className={cn("w-2 h-2 rounded-full", apt.mode === 'online' ? "bg-green-500" : "bg-gray-400")} />
                      {apt.mode === 'online' ? "Online" : "Offline"}
                    </div>

                    <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                      {apt.mode === 'online' && (
                        apt.meetLink ? (
                          <a
                            href={apt.meetLink}
                            target="_blank"
                            rel="noreferrer"
                            className="bg-[#D4AF37] hover:bg-[#c4a133] text-[#102542] px-4 py-2 rounded-xl text-sm font-bold transition-all hover:-translate-y-0.5 whitespace-nowrap"
                          >
                            Join Call
                          </a>
                        ) : (
                          <button
                            disabled
                            className="bg-[#D4AF37]/40 text-[#102542]/60 px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap cursor-not-allowed"
                          >
                            Join Call
                          </button>
                        )
                      )}
                      <Link
                        to={`/dashboard/appointments?view=${apt.id}`}
                        className="bg-transparent border border-white/20 hover:bg-white/10 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all whitespace-nowrap"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Recent Activity */}
          <motion.div variants={itemVariants} className="flex flex-col gap-4">
            <h3 className="font-serif text-xl font-bold flex items-center gap-2">
              <span className="w-2 h-6 bg-[#D4AF37] rounded-full inline-block" />
              Recent Activity
            </h3>
            
            <div className="glass-card rounded-2xl border border-white/10 p-6 relative">
              {/* Vertical Timeline Line */}
              <div className="absolute top-8 bottom-8 left-[39px] w-px bg-[#D4AF37]/30" />
              
              <div className="flex flex-col gap-6 relative z-10">
                {recentActivities.map((act, i) => {
                  let DotColor = "bg-[#D4AF37]";
                  let IconColor = "text-[#102542]";
                  if (act.type.includes('document')) { DotColor = "bg-purple-500"; IconColor = "text-white"; }
                  if (act.type.includes('completed')) { DotColor = "bg-green-500"; IconColor = "text-white"; }
                  if (act.type.includes('message')) { DotColor = "bg-blue-500"; IconColor = "text-white"; }

                  return (
                    <div key={act.id} className="flex gap-4 items-start group">
                      <div className={cn("w-4 h-4 rounded-full border-4 border-[#102542] shrink-0 mt-1 shadow-[0_0_0_2px_rgba(255,255,255,0.1)] relative z-10 group-hover:scale-125 transition-transform", DotColor)} />
                      <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <p className="text-sm text-gray-200">{act.description}</p>
                        <span className="text-xs text-gray-500 shrink-0 whitespace-nowrap">
                          {new Date(act.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit' })}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>

        </div>

        {/* RIGHT COLUMN */}
        <div className="lg:w-80 shrink-0 flex flex-col gap-6 md:gap-8">
          
          {/* Quick Actions */}
          <motion.div variants={itemVariants} className="flex flex-col gap-4">
            <h3 className="font-serif text-xl font-bold flex items-center gap-2">
              <span className="w-2 h-6 bg-[#D4AF37] rounded-full inline-block" />
              Quick Actions
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Book Consultation", icon: CalendarPlus, link: "/find-lawyers" },
                { label: "Upload Document", icon: Upload, link: "/dashboard/documents" },
                { label: "Legal Guidance", icon: BookOpen, link: "/legal-resources" },
                { label: "My Profile", icon: User, link: "/dashboard/profile" }
              ].map((action, i) => (
                <Link key={i} to={action.link} className="glass-card p-4 rounded-xl border border-white/10 flex flex-col items-center justify-center gap-3 text-center hover:border-[#D4AF37]/50 hover:bg-white/10 transition-all group">
                  <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-[#D4AF37] group-hover:scale-110 transition-transform">
                    <action.icon className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-semibold text-gray-300 group-hover:text-white leading-tight">{action.label}</span>
                </Link>
              ))}
            </div>
          </motion.div>

          {/* Pending Documents */}
          <motion.div variants={itemVariants} className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-xl font-bold flex items-center gap-2">
                <span className="w-2 h-6 bg-[#D4AF37] rounded-full inline-block" />
                Pending Docs
              </h3>
              <Link to="/dashboard/documents" className="text-sm text-[#D4AF37] hover:underline font-medium">All</Link>
            </div>
            
            <div className="glass-card rounded-2xl border border-white/10 p-2 flex flex-col gap-1">
              {pendingDocs.map(doc => (
                <div key={doc.id} className="p-3 rounded-xl hover:bg-white/5 transition-colors flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-red-500/20 text-red-400 flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold truncate">{doc.name}</div>
                    <div className="text-xs text-gray-400 mt-0.5">{doc.category} • {doc.size}</div>
                  </div>
                  <button onClick={() => toast('Document options coming soon')} className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg">
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <Link to="/dashboard/documents" className="mt-2 py-3 text-center border border-[#D4AF37]/30 rounded-xl text-sm font-semibold text-[#D4AF37] hover:bg-[#D4AF37]/10 transition-colors">
                Upload New
              </Link>
            </div>
          </motion.div>

          {/* Notifications */}
          <motion.div variants={itemVariants} className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-xl font-bold flex items-center gap-2">
                <span className="w-2 h-6 bg-[#D4AF37] rounded-full inline-block" />
                Notifications
              </h3>
              <Link to="/dashboard/notifications" className="text-sm text-[#D4AF37] hover:underline font-medium">View All</Link>
            </div>
            
            <div className="glass-card rounded-2xl border border-white/10 flex flex-col divide-y divide-white/10">
              {unreadNotifs.map(notif => (
                <div key={notif.id} className="p-4 flex gap-3 hover:bg-white/5 transition-colors">
                  <div className="w-2 h-2 rounded-full bg-[#D4AF37] mt-1.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold text-white mb-0.5">{notif.title}</div>
                    <div className="text-xs text-gray-400 line-clamp-2 leading-relaxed">{notif.message}</div>
                    <div className="text-[10px] text-gray-500 mt-2">
                      {new Date(notif.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              ))}
              <button onClick={markAllRead} className="py-3 text-center text-xs text-gray-400 hover:text-white transition-colors">
                Mark all as read
              </button>
            </div>
          </motion.div>

        </div>
      </div>
    </motion.div>
  );
};

export default Dashboard;
