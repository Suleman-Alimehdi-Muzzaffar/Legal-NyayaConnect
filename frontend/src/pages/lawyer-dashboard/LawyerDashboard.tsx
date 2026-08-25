import React, { useEffect } from 'react';
import { motion, Variants, useMotionValue, useSpring } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  CalendarCheck, 
  Scale, 
  IndianRupee, 
  Star,
  Gavel,
  ChevronRight,
  User,
  ArrowUpRight,
  MessageSquare
} from 'lucide-react';
import { cn, openMeetLink } from '@/lib/utils';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useGetLawyerDashboard, useListLawyerAppointments, useListLawyerHearings, useGetLawyerAnalytics, useListActivities, useListLawyerReviews, useUpdateLawyerAppointment, useCreateAppointmentMeet, getListLawyerAppointmentsQueryKey, type LawyerAppointment } from '@workspace/api-client-react';
import { useAuth } from '@/lib/auth-context';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell
} from 'recharts';

const Counter = ({ value }: { value: number }) => {
  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, { stiffness: 100, damping: 30 });
  const [display, setDisplay] = React.useState(0);

  useEffect(() => {
    motionValue.set(value);
  }, [value, motionValue]);

  useEffect(() => {
    return springValue.onChange((v) => {
      setDisplay(Math.floor(v));
    });
  }, [springValue]);

  return <motion.span>{display}</motion.span>;
};

const LawyerDashboard = () => {
  const { data: lawyerData } = useGetLawyerDashboard();
  const { data: appointmentsData } = useListLawyerAppointments();
  const { data: hearingsData } = useListLawyerHearings();
  const { data: analytics } = useGetLawyerAnalytics();
  const { data: activitiesData } = useListActivities();
  const { data: reviewsData } = useListLawyerReviews();
  const queryClient = useQueryClient();
  const updateAppointmentMutation = useUpdateLawyerAppointment({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListLawyerAppointmentsQueryKey() });
      },
    },
  });
  const meetMutation = useCreateAppointmentMeet({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListLawyerAppointmentsQueryKey() });
      },
    },
  });
  const { user } = useAuth();
  const loggedInLawyer = lawyerData ?? { name: "", initials: "", gradient: "", specialization: "", city: "", rating: 0, reviewCount: 0, isVerified: false, isPremium: false, email: "", phone: "", experience: 0, casesWon: 0, totalCases: 0, consultationFee: 0 };
  const lawyerDisplayName = loggedInLawyer.name || user?.name || 'there';
  const lawyerAppointments = appointmentsData ?? [];
  const lawyerHearings = hearingsData ?? [];
  const revenueData = analytics?.revenueData ?? [];
  const caseTypeData = analytics?.caseTypeData ?? [];

  const todayDate = new Date().toISOString().slice(0, 10);
  const todayAppointments = lawyerAppointments.filter(a => a.date === todayDate);
  const todayHearings = lawyerHearings.filter(h => h.date === todayDate);
  const pendingCases = lawyerAppointments.filter(a => a.status === 'pending').length;
  const monthlyRevenue = revenueData.length > 0 ? revenueData[revenueData.length - 1].revenue : 0;
  const onlineToday = todayAppointments.filter(a => a.mode === 'online').length;
  const offlineToday = todayAppointments.length - onlineToday;

  const handleJoinCall = async (apt: LawyerAppointment) => {
    if (apt.meetLink) {
      openMeetLink(apt.meetLink);
      toast.success('Starting meeting...');
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

  const handleStartSession = async (apt: LawyerAppointment) => {
    try {
      await updateAppointmentMutation.mutateAsync({ id: apt.id, data: { status: 'completed' } });
      toast.success(`Session completed for ${apt.clientName}`);
    } catch {
      toast.error('Failed to start session');
    }
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
            Good Morning, <span className="text-[#D4AF37]">{lawyerDisplayName}</span>
          </h2>
          <p className="text-gray-300 font-sans text-sm md:text-base">
            {new Date(todayDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
          <div className="mt-4 bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#D4AF37] px-4 py-2 rounded-full text-sm font-medium inline-flex items-center gap-2">
            <CalendarCheck className="w-4 h-4" />
            You have {todayAppointments.length} appointments and {todayHearings.length} hearings today.
          </div>
        </div>

        <div className="relative z-10 hidden md:flex items-center justify-center shrink-0 pr-8">
          <div className="w-24 h-24 rounded-full border-4 border-[#D4AF37]/20 flex items-center justify-center relative">
            <div className="absolute inset-0 border-t-4 border-[#D4AF37] rounded-full animate-[spin_10s_linear_infinite]" />
            <Scale className="w-10 h-10 text-[#D4AF37]" />
          </div>
        </div>
      </motion.div>

      {/* B. KPI Stats Row */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-5 gap-4 md:gap-4">
        {[
          { label: "Today's Appointments", val: todayAppointments.length, sub: `${onlineToday} online · ${offlineToday} office`, icon: CalendarCheck, prefix: "" },
          { label: "Upcoming Hearings", val: todayHearings.length, sub: "Scheduled today", icon: Gavel, prefix: "" },
          { label: "Pending Cases", val: pendingCases, sub: "Awaiting action", icon: Scale, prefix: "" },
          { label: "Monthly Revenue", val: monthlyRevenue, sub: revenueData.length > 0 ? revenueData[revenueData.length - 1].month : "No data yet", icon: IndianRupee, prefix: "₹" },
          { label: "Average Rating", val: loggedInLawyer.rating, sub: `${loggedInLawyer.reviewCount} reviews`, icon: Star, prefix: "", isFloat: true },
        ].map((stat, i) => (
          <div key={i} className="glass-card p-4 rounded-2xl border border-white/10 hover:border-[#D4AF37]/30 transition-colors flex flex-col gap-3 group">
            <div className="w-10 h-10 rounded-full bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37] group-hover:scale-110 transition-transform">
              <stat.icon className="w-5 h-5" fill={stat.icon === Star ? "currentColor" : "none"} />
            </div>
            <div>
              <div className="text-2xl font-serif font-bold text-white mb-1 flex items-baseline">
                {stat.prefix}
                {stat.isFloat ? stat.val : <Counter value={stat.val} />}
              </div>
              <div className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-1 line-clamp-1">{stat.label}</div>
              <div className={cn("text-xs", stat.sub.includes("+") ? "text-green-400" : "text-gray-500 line-clamp-1")}>{stat.sub}</div>
            </div>
          </div>
        ))}
      </motion.div>

      {/* C. Main Two-Column Layout */}
      <div className="flex flex-col lg:flex-row gap-6 md:gap-8">
        
        {/* LEFT COLUMN */}
        <div className="lg:w-2/3 flex flex-col gap-6 md:gap-8">
          
          {/* Today's Schedule */}
          <motion.div variants={itemVariants} className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-xl font-bold flex items-center gap-2">
                <span className="w-2 h-6 bg-[#D4AF37] rounded-full inline-block" />
                Today's Schedule
              </h3>
              <Link to="/lawyer-dashboard/appointments" className="text-sm text-[#D4AF37] hover:underline font-medium flex items-center gap-1">
                View All <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            
            <div className="flex flex-col gap-3">
              {todayAppointments.map((apt) => (
                <div key={apt.id} className="glass-card p-4 rounded-2xl border border-white/10 flex flex-col sm:flex-row sm:items-center gap-4 hover:bg-white/[0.07] transition-colors">
                  <div className="bg-[#D4AF37]/10 text-[#D4AF37] font-bold text-sm px-3 py-1.5 rounded-lg border border-[#D4AF37]/20 shrink-0">
                    {apt.time}
                  </div>
                  
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className={cn("w-10 h-10 rounded-full flex items-center justify-center font-serif text-sm font-bold text-white shadow-inner bg-gradient-to-br shrink-0", apt.clientGradient)}>
                      {apt.clientInitials}
                    </div>
                    <div className="truncate">
                      <h4 className="font-serif font-bold text-base truncate">{apt.clientName}</h4>
                      <div className="text-gray-400 text-xs truncate">{apt.caseType}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 sm:gap-4 flex-wrap sm:flex-nowrap w-full sm:w-auto shrink-0">
                    <div className="flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-full bg-white/5 border border-white/10 shrink-0">
                      <span className={cn("w-2 h-2 rounded-full", apt.mode === 'online' ? "bg-green-500" : "bg-gray-400")} />
                      {apt.mode === 'online' ? "Online" : "Offline"}
                    </div>
                    
                    <div className="font-bold text-[#D4AF37] text-sm shrink-0">₹{apt.fee}</div>
                    
                    {apt.mode === 'online' ? (
                      <button onClick={() => handleJoinCall(apt)} className="bg-[#D4AF37] hover:bg-[#c4a133] text-[#102542] px-4 py-2 rounded-xl text-sm font-bold transition-all hover:-translate-y-0.5 whitespace-nowrap">
                        Start Meeting
                      </button>
                    ) : (
                      <button onClick={() => handleStartSession(apt)} className="bg-transparent border border-white/20 hover:bg-white/10 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all whitespace-nowrap">
                        Start Session
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {todayAppointments.length === 0 && (
                <div className="text-center py-6 text-gray-400 text-sm">No appointments scheduled for today.</div>
              )}
            </div>
          </motion.div>

          {/* Revenue Chart */}
          <motion.div variants={itemVariants} className="flex flex-col gap-4">
            <h3 className="font-serif text-xl font-bold flex items-center gap-2">
              <span className="w-2 h-6 bg-[#D4AF37] rounded-full inline-block" />
              Revenue Overview
            </h3>
            
            <div className="glass-card rounded-2xl border border-white/10 p-6">
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#D4AF37" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} tickFormatter={(val) => `₹${val/1000}k`} />
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: '#0a1929', border: '1px solid rgba(212,175,55,0.3)', borderRadius: '12px', color: 'white', fontFamily: 'Poppins' }}
                    itemStyle={{ color: '#D4AF37', fontWeight: 'bold' }}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#D4AF37" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" isAnimationActive={true} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Recent Client Activity */}
          <motion.div variants={itemVariants} className="flex flex-col gap-4">
            <h3 className="font-serif text-xl font-bold flex items-center gap-2">
              <span className="w-2 h-6 bg-[#D4AF37] rounded-full inline-block" />
              Recent Client Activity
            </h3>
            
            <div className="glass-card rounded-2xl border border-white/10 p-6 relative">
              <div className="absolute top-8 bottom-8 left-[39px] w-px bg-[#D4AF37]/30" />
              
              <div className="flex flex-col gap-6 relative z-10">
                {(activitiesData ?? []).slice(0, 5).map((act) => (
                  <div key={act.id} className="flex gap-4 items-start group">
                    <div className={cn("w-4 h-4 rounded-full border-4 border-[#102542] shrink-0 mt-1 shadow-[0_0_0_2px_rgba(255,255,255,0.1)] relative z-10 group-hover:scale-125 transition-transform bg-[#D4AF37]")} />
                    <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <p className="text-sm text-gray-200">{act.description}</p>
                      <span className="text-xs text-gray-500 shrink-0 whitespace-nowrap">
                        {new Date(act.timestamp).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                ))}
                {(activitiesData ?? []).length === 0 && (
                  <div className="text-center py-6 text-gray-400 text-sm">No recent activity yet.</div>
                )}
              </div>
            </div>
          </motion.div>

        </div>

        {/* RIGHT COLUMN */}
        <div className="lg:w-1/3 flex flex-col gap-6 md:gap-8">
          
          {/* Case Type Distribution */}
          <motion.div variants={itemVariants} className="glass-card rounded-2xl border border-white/10 p-5">
            <h3 className="font-serif text-lg font-bold mb-4">Case Breakdown</h3>
            <div className="flex items-center justify-center">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={caseTypeData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={2}
                    dataKey="value"
                    stroke="none"
                  >
                    {caseTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: '#0a1929', border: '1px solid rgba(212,175,55,0.3)', borderRadius: '12px', color: 'white' }}
                    itemStyle={{ color: 'white' }}
                    labelStyle={{ color: 'white' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute font-serif text-2xl font-bold text-[#D4AF37]">
                {loggedInLawyer.totalCases}
              </div>
            </div>
            <div className="flex flex-wrap justify-center gap-3 mt-2">
              {caseTypeData.map((c, i) => (
                <div key={i} className="flex items-center gap-1.5 text-xs text-gray-400">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: c.color }} />
                  {c.name} {c.value}%
                </div>
              ))}
            </div>
          </motion.div>

          {/* Upcoming Hearings */}
          <motion.div variants={itemVariants} className="glass-card rounded-2xl border border-white/10 p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-lg font-bold">Upcoming Hearings</h3>
            </div>
            <div className="flex flex-col gap-3">
              {lawyerHearings.filter(h => h.status === 'upcoming').slice(0, 2).map((h, i) => (
                <div key={i} className="bg-white/5 p-3 rounded-xl border border-white/5 hover:bg-white/10 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                      {h.caseNumber}
                    </span>
                    <Gavel className="w-4 h-4 text-[#D4AF37]" />
                  </div>
                  <div className="font-semibold text-sm text-white mb-1">{h.clientName}</div>
                  <div className="text-xs text-gray-400 mb-2">{h.court}</div>
                  <div className="text-xs font-medium text-[#D4AF37]">{new Date(h.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} • {h.time}</div>
                </div>
              ))}
            </div>
            <Link to="/lawyer-dashboard/calendar" className="text-sm text-center text-[#D4AF37] hover:underline font-medium mt-2">
              View All Hearings
            </Link>
          </motion.div>

          {/* Top Reviews Preview */}
          <motion.div variants={itemVariants} className="flex flex-col gap-3">
            <h3 className="font-serif text-lg font-bold">Recent Reviews</h3>
            {(reviewsData ?? []).slice(0, 2).map((r, i) => (
              <div key={r.id} className="glass-card p-4 rounded-xl border border-white/10 hover:border-[#D4AF37]/30 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold">{r.author.slice(0, 2).toUpperCase()}</div>
                    <div>
                      <div className="text-sm font-semibold">{r.author}</div>
                      <div className="flex items-center gap-0.5 text-[#D4AF37]">
                        {[1,2,3,4,5].map(s => <Star key={s} className="w-3 h-3" fill={s <= r.rating ? 'currentColor' : 'none'} stroke="currentColor" />)}
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500">{new Date(r.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
                </div>
                <p className="text-xs text-gray-400 italic line-clamp-2">"{r.comment}"</p>
              </div>
            ))}
            {(reviewsData ?? []).length === 0 && (
              <div className="glass-card p-4 rounded-xl border border-white/10 text-center text-sm text-gray-500">No reviews yet.</div>
            )}
            <Link to="/lawyer-dashboard/reviews" className="text-sm text-center text-[#D4AF37] hover:underline font-medium mt-2">
              See All Reviews
            </Link>
          </motion.div>

        </div>
      </div>
    </motion.div>
  );
};

export default LawyerDashboard;
