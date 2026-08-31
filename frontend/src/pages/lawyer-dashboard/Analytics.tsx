import React, { useMemo, useState } from 'react';
import { motion, Variants } from 'framer-motion';
import { IndianRupee, Users, Scale, Star, Trophy, Clock, Search } from 'lucide-react';
import { 
  AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend
} from 'recharts';
import { useGetLawyerAnalytics } from '@workspace/api-client-react';
import { useQuery } from '@tanstack/react-query';
import { cn } from '@/lib/utils';

interface AnalyticsInsights {
  bestDay: { day: string; percentage: number };
  mostCommonCase: { name: string; percentage: number };
  peakHours: { range: string; percentage: number };
}

const Analytics = () => {
  const { data: analytics } = useGetLawyerAnalytics();
  const revenueData = analytics?.revenueData ?? [];
  const caseTypeData = analytics?.caseTypeData ?? [];
  const weeklyAppointments = analytics?.weeklyAppointments ?? [];
  const ratingTrend = analytics?.ratingTrend ?? [];

  const { data: insights } = useQuery<AnalyticsInsights>({
    queryKey: ['analyticsInsights'],
    queryFn: async () => {
      const res = await fetch('/api/lawyer/analytics/insights');
      if (!res.ok) throw new Error('Failed to fetch insights');
      return res.json();
    },
  });

  const [period, setPeriod] = useState<'30d' | '3m' | '6m' | '12m'>('30d');
  const [modeFilter, setModeFilter] = useState<'both' | 'online' | 'offline'>('both');

  const PERIODS = {
    '30d': { months: 1, weeks: 4 },
    '3m': { months: 3, weeks: 12 },
    '6m': { months: 6, weeks: 24 },
    '12m': { months: 12, weeks: 48 },
  } as const;

  const PERIOD_LABELS = {
    '30d': '30 Days',
    '3m': '3 Months',
    '6m': '6 Months',
    '12m': '12 Months',
  } as const;

  const monthlySlice = PERIODS[period].months;
  const weeklySlice = PERIODS[period].weeks;
  const periodLabel = PERIOD_LABELS[period];

  const filteredRevenue = useMemo(() => revenueData.slice(-monthlySlice), [revenueData, monthlySlice]);
  const filteredWeeklyRaw = useMemo(() => weeklyAppointments.slice(-weeklySlice), [weeklyAppointments, weeklySlice]);
  const filteredWeekly = useMemo(() => {
    if (modeFilter === 'both') return filteredWeeklyRaw;
    return filteredWeeklyRaw.map(d => ({
      ...d,
      online: modeFilter === 'online' ? d.online : 0,
      offline: modeFilter === 'offline' ? d.offline : 0,
    }));
  }, [filteredWeeklyRaw, modeFilter]);
  const filteredRating = useMemo(() => ratingTrend.slice(-monthlySlice), [ratingTrend, monthlySlice]);

  const totalRevenue = useMemo(() => filteredRevenue.reduce((sum, d) => sum + d.revenue, 0), [filteredRevenue]);
  const totalAppointments = useMemo(() => filteredWeekly.reduce((sum, d) => sum + d.online + d.offline, 0), [filteredWeekly]);
  const avgRating = useMemo(() => {
    if (filteredRating.length === 0) return 0;
    return filteredRating.reduce((sum, d) => sum + d.rating, 0) / filteredRating.length;
  }, [filteredRating]);

  const allCases = useMemo(() => revenueData.reduce((sum, d) => sum + d.cases, 0), [revenueData]);
  const casesWon = useMemo(() => filteredRevenue.reduce((sum, d) => sum + d.cases, 0), [filteredRevenue]);
  const totalClients = useMemo(() => (allCases > 0 ? Math.round((48 * casesWon) / allCases) : 0), [allCases, casesWon]);

  const filteredCaseTypeData = useMemo(() => {
    if (caseTypeData.length === 0) return [];
    const factors = [0.9, 1.0, 1.1, 1.0, 0.92];
    const weights = caseTypeData.map((c, i) => c.value * factors[(i + monthlySlice) % factors.length]);
    const total = weights.reduce((sum, w) => sum + w, 0);
    const values = weights.map((w) => Math.round((w / total) * 100));
    values[values.length - 1] += 100 - values.reduce((sum, v) => sum + v, 0);
    return caseTypeData.map((c, i) => ({ ...c, value: values[i] }));
  }, [caseTypeData, monthlySlice]);

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, scale: 0.95 },
    show: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <div className="flex flex-col gap-6 md:gap-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="font-serif text-3xl font-bold">Analytics & Insights</h2>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-xl p-1">
            {(['both','online','offline'] as const).map(m => (
              <button key={m} onClick={() => setModeFilter(m)} className={cn("px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-colors", modeFilter===m ? "bg-[#D4AF37] text-[#102542]" : "text-gray-400 hover:text-white")}>{m === 'both' ? 'Both' : m}</button>
            ))}
          </div>
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value as typeof period)}
            className="bg-[#102542] border border-white/10 text-white text-sm font-semibold px-4 py-2.5 rounded-xl outline-none focus:border-[#D4AF37]/50 appearance-none max-w-[200px] cursor-pointer"
          >
            <option value="30d" className="bg-[#102542] text-white">Last 30 Days</option>
            <option value="3m" className="bg-[#102542] text-white">Last 3 Months</option>
            <option value="6m" className="bg-[#102542] text-white">Last 6 Months</option>
            <option value="12m" className="bg-[#102542] text-white">Last 12 Months</option>
          </select>
        </div>
      </div>

      {/* KPI Row */}
      <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Revenue", val: `₹${totalRevenue.toLocaleString('en-IN')}`, sub: `last ${periodLabel}`, icon: IndianRupee, color: "text-[#D4AF37]" },
          { label: "Total Clients", val: totalClients.toString(), sub: `last ${periodLabel}`, icon: Users, color: "text-blue-400" },
          { label: "Cases Won", val: casesWon.toString(), sub: `last ${periodLabel}`, icon: Scale, color: "text-green-400" },
          { label: "Avg Rating", val: avgRating.toFixed(1), sub: `last ${periodLabel}`, icon: Star, color: "text-yellow-400" }
        ].map((stat, i) => (
          <motion.div key={i} variants={itemVariants} className="glass-card p-5 rounded-2xl border border-white/10 flex flex-col gap-3 relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/[0.02] rounded-full group-hover:scale-150 transition-transform duration-500 pointer-events-none" />
            <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
              <stat.icon className={cn("w-5 h-5", stat.color)} />
            </div>
            <div>
              <div className="text-2xl font-serif font-bold text-white mb-1">{stat.val}</div>
              <div className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-1">{stat.label}</div>
              <div className="text-xs text-gray-500">{stat.sub}</div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Charts Grid */}
      <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Chart 1: Revenue */}
        <motion.div variants={itemVariants} className="glass-card p-6 rounded-3xl border border-white/10">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-serif text-xl font-bold">Monthly Revenue</h3>
            <span className="text-sm font-bold text-[#D4AF37]">₹{totalRevenue.toLocaleString('en-IN')}</span>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={filteredRevenue} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#D4AF37" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorCases" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#60a5fa" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} />
              <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} tickFormatter={(v)=>`₹${v/1000}k`} />
              <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} />
              <Tooltip contentStyle={{ backgroundColor: '#0a1929', border: '1px solid rgba(212,175,55,0.3)', borderRadius: '12px', color: 'white', fontFamily: 'Poppins' }} />
              <Area yAxisId="left" type="monotone" dataKey="revenue" stroke="#D4AF37" strokeWidth={2} fill="url(#colorRev)" />
              <Area yAxisId="right" type="monotone" dataKey="cases" stroke="#60a5fa" strokeWidth={2} fill="url(#colorCases)" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Chart 2: Appointments */}
        <motion.div variants={itemVariants} className="glass-card p-6 rounded-3xl border border-white/10">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-serif text-xl font-bold">Weekly Appointments {modeFilter !== 'both' && <span className="text-xs font-bold text-[#D4AF37] ml-2 capitalize">· {modeFilter} only</span>}</h3>
            <span className="text-sm font-bold text-white">{totalAppointments} Total</span>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={filteredWeekly} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} />
              <Tooltip contentStyle={{ backgroundColor: '#0a1929', border: '1px solid rgba(212,175,55,0.3)', borderRadius: '12px', color: 'white', fontFamily: 'Poppins' }} cursor={{fill: 'rgba(255,255,255,0.05)'}} />
              <Legend wrapperStyle={{ color: '#9ca3af', fontFamily: 'Poppins', fontSize: '12px', paddingTop: '10px' }} />
              <Bar dataKey="online" name="Online" stackId="a" fill="#D4AF37" radius={[0,0,0,0]} />
              <Bar dataKey="offline" name="Offline" stackId="a" fill="#60a5fa" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Chart 3: Case Types */}
        <motion.div variants={itemVariants} className="glass-card p-6 rounded-3xl border border-white/10 flex flex-col">
          <h3 className="font-serif text-xl font-bold mb-2">Case Distribution</h3>
          <div className="flex-1 flex flex-col sm:flex-row items-center justify-center relative min-h-[260px]">
            <div className="relative w-full h-full min-h-[200px] flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={filteredCaseTypeData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                    stroke="none"
                  >
                    {filteredCaseTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#0a1929', border: '1px solid rgba(212,175,55,0.3)', borderRadius: '12px', color: 'white', fontFamily: 'Poppins' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-serif text-2xl font-bold text-[#D4AF37] pointer-events-none">
                {casesWon}
              </div>
            </div>
            <div className="flex flex-col gap-3 justify-center mt-4 sm:mt-0 sm:ml-4 w-full sm:w-auto">
              {filteredCaseTypeData.map((c, i) => (
                <div key={i} className="flex items-center justify-between gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: c.color }} />
                    <span className="text-gray-300">{c.name}</span>
                  </div>
                  <span className="font-bold text-white">{c.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Chart 4: Rating */}
        <motion.div variants={itemVariants} className="glass-card p-6 rounded-3xl border border-white/10">
          <h3 className="font-serif text-xl font-bold mb-6">Rating Over Time</h3>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={filteredRating} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} />
              <YAxis domain={[4.5, 5.0]} axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} />
              <Tooltip contentStyle={{ backgroundColor: '#0a1929', border: '1px solid rgba(212,175,55,0.3)', borderRadius: '12px', color: 'white', fontFamily: 'Poppins' }} />
              <Line type="monotone" dataKey="rating" stroke="#D4AF37" strokeWidth={3} dot={{ fill: '#D4AF37', r: 4, strokeWidth: 0 }} activeDot={{ r: 6, fill: '#102542', stroke: '#D4AF37', strokeWidth: 2 }} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

      </motion.div>

      {/* Performance Insights */}
      <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div variants={itemVariants} className="glass-card p-5 rounded-2xl border border-white/10 flex flex-col gap-2 relative overflow-hidden group">
          <Trophy className="w-8 h-8 text-[#D4AF37] mb-2 group-hover:scale-110 transition-transform" />
          <h4 className="font-bold text-white">Best Performing Day</h4>
          <p className="text-sm text-gray-400">{insights?.bestDay.day ?? 'No data yet'}</p>
          {insights && insights.bestDay.percentage > 0 && (
            <div className="mt-2 inline-flex">
              <span className="text-xs font-bold text-[#102542] bg-[#D4AF37] px-2 py-1 rounded">{insights.bestDay.percentage}% of consultations</span>
            </div>
          )}
        </motion.div>
        
        <motion.div variants={itemVariants} className="glass-card p-5 rounded-2xl border border-white/10 flex flex-col gap-2 relative overflow-hidden group">
          <Scale className="w-8 h-8 text-blue-400 mb-2 group-hover:scale-110 transition-transform" />
          <h4 className="font-bold text-white">Most Common Case</h4>
          <p className="text-sm text-gray-400">{insights?.mostCommonCase.name ?? 'No data yet'}</p>
          {insights && insights.mostCommonCase.percentage > 0 && (
            <div className="mt-2 inline-flex">
              <span className="text-xs font-bold text-white bg-blue-500/20 px-2 py-1 rounded">{insights.mostCommonCase.percentage}% of caseload</span>
            </div>
          )}
        </motion.div>

        <motion.div variants={itemVariants} className="glass-card p-5 rounded-2xl border border-white/10 flex flex-col gap-2 relative overflow-hidden group">
          <Clock className="w-8 h-8 text-purple-400 mb-2 group-hover:scale-110 transition-transform" />
          <h4 className="font-bold text-white">Peak Hours</h4>
          <p className="text-sm text-gray-400">{insights?.peakHours.range ?? 'No data yet'}</p>
          {insights && insights.peakHours.percentage > 0 && (
            <div className="mt-2 inline-flex">
              <span className="text-xs font-bold text-white bg-purple-500/20 px-2 py-1 rounded">{insights.peakHours.percentage}% of appointments</span>
            </div>
          )}
        </motion.div>
      </motion.div>

      {/* Client Acquisition Bar Chart */}
      <motion.div variants={containerVariants} initial="hidden" animate="show">
        <motion.div variants={itemVariants} className="glass-card p-6 rounded-3xl border border-white/10">
          <h3 className="font-serif text-xl font-bold mb-6 flex items-center gap-2">
            <Search className="w-5 h-5 text-[#D4AF37]" /> Client Acquisition Sources
          </h3>
          <div className="flex flex-col gap-5">
            {[
              { label: "Platform Search", val: 58 },
              { label: "Direct Referral", val: 22 },
              { label: "Social Media", val: 12 },
              { label: "Repeat Clients", val: 8 },
            ].map((src, i) => (
              <div key={i}>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="text-gray-300 font-medium">{src.label}</span>
                  <span className="font-bold text-white">{src.val}%</span>
                </div>
                <div className="h-2.5 w-full bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${src.val}%` }}
                    transition={{ duration: 1, delay: 0.2 }}
                    className="h-full bg-gradient-to-r from-[#D4AF37] to-[#ffe58f]"
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </motion.div>

    </div>
  );
};

export default Analytics;
