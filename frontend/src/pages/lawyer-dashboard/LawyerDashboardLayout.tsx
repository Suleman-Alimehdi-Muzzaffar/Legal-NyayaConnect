import React, { useState } from 'react';
import { Outlet, NavLink, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Scale,
  LayoutDashboard,
  Users,
  CalendarCheck,
  FileText,
  Calendar,
  Star,
  BarChart2,
  Bell,
  MessageSquare,
  User,
  Settings,
  LogOut,
  Menu,
  X,
  ShieldCheck
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { avatarUrl } from '@/lib/avatar';
import { useGetLawyerDashboard, useListLawyerNotifications, useGetVerificationStatus, ApiError } from '@workspace/api-client-react';
import { useAuth } from '@/lib/auth-context';

const LawyerDashboardLayout = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { user, signOut } = useAuth();
  const { data: lawyer } = useGetLawyerDashboard();
  const { data: lawyerNotifications } = useListLawyerNotifications();
  const { data: verification, error: verificationError } = useGetVerificationStatus(
    { email: user?.email ?? '' },
    { query: { enabled: Boolean(user?.email), queryKey: ['getVerificationStatus', user?.email] } },
  );

  const verificationState = verification
    ? verification.status
    : verificationError instanceof ApiError && verificationError.status === 404
      ? 'not_submitted'
      : null;

  const handleSignOut = () => {
    signOut();
    window.location.assign(import.meta.env.BASE_URL);
  };

  const unreadCount = (lawyerNotifications ?? []).filter(n => !n.isRead).length;
  const fallbackInitials =
    (user?.name ?? 'L')
      .split(/\s+/)
      .map((part) => part[0])
      .filter(Boolean)
      .slice(0, 2)
      .join('')
      .toUpperCase() || 'L';
  const loggedInLawyer = {
    name: lawyer?.name ?? user?.name ?? 'Lawyer',
    initials: lawyer?.initials ?? fallbackInitials,
    gradient: lawyer?.gradient ?? 'from-[#D4AF37] to-[#8c7324]',
    email: lawyer?.email ?? user?.email ?? '',
    isVerified: lawyer?.isVerified ?? false,
    isPremium: lawyer?.isPremium ?? false,
  };

  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/lawyer-dashboard') return 'Dashboard Overview';
    if (path.includes('clients')) return 'My Clients';
    if (path.includes('appointments')) return 'Appointments';
    if (path.includes('documents')) return 'Documents';
    if (path.includes('calendar')) return 'Calendar';
    if (path.includes('reviews')) return 'Reviews';
    if (path.includes('analytics')) return 'Analytics';
    if (path.includes('notifications')) return 'Notifications';
    if (path.includes('messages')) return 'Messages';
    if (path.includes('profile')) return 'My Profile';
    if (path.includes('settings')) return 'Settings';
    return 'Lawyer Portal';
  };

  const navItems = [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/lawyer-dashboard', exact: true },
    { label: 'Clients', icon: Users, path: '/lawyer-dashboard/clients' },
    { label: 'Appointments', icon: CalendarCheck, path: '/lawyer-dashboard/appointments' },
    { label: 'Documents', icon: FileText, path: '/lawyer-dashboard/documents' },
    { label: 'Calendar', icon: Calendar, path: '/lawyer-dashboard/calendar' },
    { label: 'Messages', icon: MessageSquare, path: '/lawyer-dashboard/messages' },
    { label: 'Reviews', icon: Star, path: '/lawyer-dashboard/reviews' },
    { label: 'Analytics', icon: BarChart2, path: '/lawyer-dashboard/analytics' },
  ];

  const accountItems = [
    { label: 'Notifications', icon: Bell, path: '/lawyer-dashboard/notifications', badge: unreadCount },
    { label: 'Profile', icon: User, path: '/lawyer-dashboard/profile' },
    { label: 'Settings', icon: Settings, path: '/lawyer-dashboard/settings' },
  ];

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-[#0a1929] border-r border-white/10 w-64 text-white overflow-y-auto scrollbar-hide">
      {/* Logo */}
      <div className="p-6 border-b border-white/10 shrink-0">
        <Link to="/" className="flex flex-col gap-1 group">
          <div className="flex items-center gap-2">
            <Scale className="w-8 h-8 text-[#D4AF37] transition-transform duration-300 group-hover:scale-110" />
            <span className="font-serif text-2xl font-bold tracking-wide">
              Nyaya<span className="text-[#D4AF37]">Connect</span>
            </span>
          </div>
          <span className="text-[#D4AF37] text-xs font-semibold uppercase tracking-wider pl-10">Lawyer Portal</span>
        </Link>
      </div>

      {/* User Info */}
      <div className="p-6 border-b border-white/10 flex flex-col items-center text-center shrink-0">
        <div className={cn("w-16 h-16 rounded-full flex items-center justify-center text-2xl font-serif font-bold text-[#102542] mb-3 border-2 border-[#102542] ring-2 ring-[#D4AF37]/50 shadow-[0_0_15px_rgba(212,175,55,0.3)] bg-gradient-to-br overflow-hidden", loggedInLawyer.gradient)}>
          {user?.avatar ? <img src={avatarUrl(user.avatar)} alt={loggedInLawyer.name} className="w-full h-full object-cover" /> : loggedInLawyer.initials}
        </div>
        <h3 className="font-serif text-lg font-bold">{loggedInLawyer.name || user?.name || 'Lawyer'}</h3>
        <p className="text-sm text-gray-400 truncate w-full">{loggedInLawyer.email || user?.email || ''}</p>
        <div className="mt-2 flex items-center gap-2 justify-center flex-wrap">
          {loggedInLawyer.isVerified && (
            <div className="bg-green-500/20 text-green-400 px-2 py-0.5 rounded text-[10px] font-bold border border-green-500/30 uppercase tracking-wider">
              Verified
            </div>
          )}
          {loggedInLawyer.isPremium && (
            <div className="bg-[#D4AF37]/20 text-[#D4AF37] px-2 py-0.5 rounded text-[10px] font-bold border border-[#D4AF37]/30 uppercase tracking-wider">
              Premium
            </div>
          )}
        </div>
        <div className="mt-2 bg-[#D4AF37]/20 text-[#D4AF37] px-3 py-1 rounded-full text-xs font-semibold border border-[#D4AF37]/30">
          Lawyer Account
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 py-6 flex flex-col gap-8">
        <div>
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 mb-3">Main Menu</h4>
          <nav className="flex flex-col gap-1">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.exact}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) => cn(
                  "flex items-center gap-3 px-6 py-3 font-sans text-sm font-medium transition-all duration-300",
                  isActive 
                    ? "bg-[#D4AF37]/15 border-l-2 border-[#D4AF37] text-[#D4AF37]" 
                    : "text-gray-300 hover:bg-white/5 hover:text-white border-l-2 border-transparent"
                )}
              >
                <item.icon className="w-5 h-5" />
                <span className="flex-1">{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        <div>
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 mb-3">Account</h4>
          <nav className="flex flex-col gap-1">
            {accountItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) => cn(
                  "flex items-center gap-3 px-6 py-3 font-sans text-sm font-medium transition-all duration-300",
                  isActive 
                    ? "bg-[#D4AF37]/15 border-l-2 border-[#D4AF37] text-[#D4AF37]" 
                    : "text-gray-300 hover:bg-white/5 hover:text-white border-l-2 border-transparent"
                )}
              >
                <item.icon className="w-5 h-5" />
                <span className="flex-1">{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="p-4 border-t border-white/10 shrink-0 flex flex-col gap-2">
        <button onClick={handleSignOut} className="flex items-center gap-3 px-4 py-2 font-sans text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-400/10 transition-colors w-full rounded-lg">
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-[100dvh] flex bg-[#102542] text-white overflow-hidden font-sans">
      
      {/* Desktop Sidebar */}
      <aside className="hidden md:block w-64 shrink-0 h-screen sticky top-0 z-40 shadow-2xl">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
            />
            <motion.aside
              initial={{ x: -260 }}
              animate={{ x: 0 }}
              exit={{ x: -260 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 bottom-0 z-50 md:hidden shadow-2xl"
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden relative">
        
        {/* Top Sticky Header */}
        <header className="h-16 shrink-0 bg-[#102542]/80 backdrop-blur-md border-b border-white/10 sticky top-0 z-30 flex items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-4">
            <button 
              className="md:hidden p-2 -ml-2 text-gray-300 hover:text-white rounded-lg hover:bg-white/5"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="font-serif text-xl md:text-2xl font-bold tracking-wide">{getPageTitle()}</h1>
          </div>
          
          <div className="flex items-center gap-2 md:gap-4">
            <Link 
              to="/lawyer-dashboard/notifications"
              className="relative w-10 h-10 rounded-full flex items-center justify-center text-gray-400 hover:text-[#D4AF37] hover:bg-[#D4AF37]/10 transition-colors"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-2 right-2.5 w-2 h-2 bg-[#D4AF37] rounded-full ring-2 ring-[#102542]" />
              )}
            </Link>
            <Link to="/lawyer-dashboard/profile" className={cn("w-10 h-10 rounded-full flex items-center justify-center font-serif text-sm font-bold text-[#102542] border-2 border-[#102542] ring-2 ring-[#D4AF37]/50 md:ml-2 bg-gradient-to-br overflow-hidden", loggedInLawyer.gradient)}>
              {user?.avatar ? <img src={avatarUrl(user.avatar)} alt={loggedInLawyer.name} className="w-full h-full object-cover" /> : loggedInLawyer.initials}
            </Link>
          </div>
        </header>

        {/* Scrollable Page Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 scrollbar-hide relative">
          <div className="max-w-7xl mx-auto w-full pb-20">
            {verificationState === 'pending' && (
              <div className="mb-4 flex items-start gap-3 bg-amber-500/10 border border-amber-500/30 text-amber-300 font-sans text-sm rounded-xl p-4">
                <ShieldCheck className="w-5 h-5 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Verification in progress</p>
                  <p className="text-amber-200/80">
                    Your documents are being reviewed by our team. Your profile will be activated within 24–48 hours.
                  </p>
                </div>
              </div>
            )}
            {verificationState === 'rejected' && (
              <div className="mb-4 flex items-start gap-3 bg-red-500/10 border border-red-500/30 text-red-300 font-sans text-sm rounded-xl p-4">
                <ShieldCheck className="w-5 h-5 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Verification rejected</p>
                  <p className="text-red-200/80">
                    {verification?.reason ? `Reason: ${verification.reason} ` : ''}Please re-submit your documents to get verified.
                  </p>
                </div>
              </div>
            )}
            {verificationState === 'not_submitted' && (
              <div className="mb-4 flex items-start gap-3 bg-white/5 border border-white/10 text-gray-300 font-sans text-sm rounded-xl p-4">
                <ShieldCheck className="w-5 h-5 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Verification not submitted</p>
                  <p className="text-gray-400">
                    Complete the registration document step to get the verified badge on your profile.
                  </p>
                </div>
              </div>
            )}
            <Outlet />
          </div>
        </div>
      </main>

    </div>
  );
};

export default LawyerDashboardLayout;
