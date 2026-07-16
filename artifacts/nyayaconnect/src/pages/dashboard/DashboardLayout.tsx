import React, { useState } from 'react';
import { Outlet, NavLink, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Scale, 
  LayoutDashboard, 
  CalendarCheck, 
  FileText, 
  Calendar, 
  Bell, 
  BookOpen, 
  User, 
  Settings, 
  LogOut, 
  Home,
  Menu,
  Search,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { mockNotifications } from '@/data/dashboardData';

const DashboardLayout = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const unreadCount = mockNotifications.filter(n => !n.isRead).length;

  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/dashboard') return 'Dashboard Overview';
    if (path.includes('appointments')) return 'Appointments';
    if (path.includes('documents')) return 'Documents';
    if (path.includes('calendar')) return 'Calendar';
    if (path.includes('notifications')) return 'Notifications';
    if (path.includes('profile')) return 'My Profile';
    if (path.includes('settings')) return 'Settings';
    return 'Client Portal';
  };

  const navItems = [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard', exact: true },
    { label: 'Appointments', icon: CalendarCheck, path: '/dashboard/appointments' },
    { label: 'Documents', icon: FileText, path: '/dashboard/documents' },
    { label: 'Calendar', icon: Calendar, path: '/dashboard/calendar' },
    { label: 'Notifications', icon: Bell, path: '/dashboard/notifications', badge: unreadCount },
  ];

  const accountItems = [
    { label: 'Legal Guidance', icon: BookOpen, path: '/legal-resources', external: true },
    { label: 'Profile', icon: User, path: '/dashboard/profile' },
    { label: 'Settings', icon: Settings, path: '/dashboard/settings' },
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
          <span className="text-[#D4AF37] text-xs font-semibold uppercase tracking-wider pl-10">Client Portal</span>
        </Link>
      </div>

      {/* User Info */}
      <div className="p-6 border-b border-white/10 flex flex-col items-center text-center shrink-0">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#8c7324] flex items-center justify-center text-2xl font-serif font-bold text-[#102542] mb-3 border-2 border-[#102542] ring-2 ring-[#D4AF37]/50 shadow-[0_0_15px_rgba(212,175,55,0.3)]">
          RM
        </div>
        <h3 className="font-serif text-lg font-bold">Rahul Mehta</h3>
        <p className="text-sm text-gray-400 truncate w-full">rahul@email.com</p>
        <div className="mt-2 bg-[#D4AF37]/20 text-[#D4AF37] px-3 py-1 rounded-full text-xs font-semibold border border-[#D4AF37]/30">
          Client Account
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
                {item.badge && item.badge > 0 && (
                  <span className="bg-[#D4AF37] text-[#102542] text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            ))}
          </nav>
        </div>

        <div>
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 mb-3">Account</h4>
          <nav className="flex flex-col gap-1">
            {accountItems.map((item) => (
              item.external ? (
                <Link
                  key={item.path}
                  to={item.path}
                  className="flex items-center gap-3 px-6 py-3 font-sans text-sm font-medium text-gray-300 hover:bg-white/5 hover:text-white border-l-2 border-transparent transition-all duration-300"
                >
                  <item.icon className="w-5 h-5" />
                  <span className="flex-1">{item.label}</span>
                </Link>
              ) : (
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
              )
            ))}
          </nav>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="p-4 border-t border-white/10 shrink-0 flex flex-col gap-2">
        <Link to="/" className="flex items-center gap-3 px-4 py-2 font-sans text-sm font-medium text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/5">
          <Home className="w-4 h-4" />
          Back to Home
        </Link>
        <button className="flex items-center gap-3 px-4 py-2 font-sans text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-400/10 transition-colors w-full rounded-lg">
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
            <button className="w-10 h-10 rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors">
              <Search className="w-5 h-5" />
            </button>
            <Link 
              to="/dashboard/notifications"
              className="relative w-10 h-10 rounded-full flex items-center justify-center text-gray-400 hover:text-[#D4AF37] hover:bg-[#D4AF37]/10 transition-colors"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-2 right-2.5 w-2 h-2 bg-[#D4AF37] rounded-full ring-2 ring-[#102542]" />
              )}
            </Link>
            <Link to="/dashboard/profile" className="w-10 h-10 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#8c7324] flex items-center justify-center font-serif text-sm font-bold text-[#102542] border-2 border-[#102542] ring-2 ring-[#D4AF37]/50 md:ml-2">
              RM
            </Link>
          </div>
        </header>

        {/* Scrollable Page Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 scrollbar-hide relative">
          <div className="max-w-7xl mx-auto w-full pb-20">
            <Outlet />
          </div>
        </div>
      </main>

    </div>
  );
};

export default DashboardLayout;
