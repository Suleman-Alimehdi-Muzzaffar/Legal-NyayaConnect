import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, 
  CalendarCheck, 
  FileText, 
  MessageSquare, 
  Clock, 
  Settings,
  CheckCircle2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useListNotifications, useMarkNotificationRead, getListNotificationsQueryKey } from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';

const NotificationsPage = () => {
  const [activeTab, setActiveTab] = useState('all');
  const { data: notifications } = useListNotifications();
  const queryClient = useQueryClient();
  const markNotificationReadMutation = useMarkNotificationRead({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListNotificationsQueryKey() });
      },
    },
  });
  const [clearedIds, setClearedIds] = useState<string[]>([]);

  const notificationsList = (notifications ?? []).filter(n => !clearedIds.includes(n.id));

  const tabs = [
    { id: 'all', label: 'All' },
    { id: 'appointment', label: 'Appointments' },
    { id: 'document', label: 'Documents' },
    { id: 'message', label: 'Messages' },
    { id: 'reminder', label: 'Reminders' }
  ];

  const filteredNotifs = notificationsList.filter(n => activeTab === 'all' || n.type === activeTab);
  const unreadCount = notificationsList.filter(n => !n.isRead).length;

  const markAllRead = () => {
    notificationsList.filter(n => !n.isRead).forEach(n => markNotificationReadMutation.mutate({ id: n.id }));
  };

  const clearAll = () => {
    setClearedIds(notificationsList.map(n => n.id));
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'appointment': return <CalendarCheck className="w-5 h-5 text-blue-400" />;
      case 'document': return <FileText className="w-5 h-5 text-purple-400" />;
      case 'message': return <MessageSquare className="w-5 h-5 text-green-400" />;
      case 'reminder': return <Clock className="w-5 h-5 text-yellow-400" />;
      default: return <Settings className="w-5 h-5 text-gray-400" />;
    }
  };

  const getIconBg = (type: string) => {
    switch (type) {
      case 'appointment': return 'bg-blue-500/10 border-blue-500/20';
      case 'document': return 'bg-purple-500/10 border-purple-500/20';
      case 'message': return 'bg-green-500/10 border-green-500/20';
      case 'reminder': return 'bg-yellow-500/10 border-yellow-500/20';
      default: return 'bg-gray-500/10 border-gray-500/20';
    }
  };

  const getBorderColor = (type: string) => {
    switch (type) {
      case 'appointment': return 'border-l-blue-500';
      case 'document': return 'border-l-purple-500';
      case 'message': return 'border-l-green-500';
      case 'reminder': return 'border-l-yellow-500';
      default: return 'border-l-gray-500';
    }
  };

  // Group by date (simplified for mock data)
  const today = new Date();
  
  const formatDateGroup = (dateStr: string) => {
    const d = new Date(dateStr);
    if (d.toDateString() === today.toDateString()) return "Today";
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
    
    return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
  };

  const groupedNotifs = filteredNotifs.reduce((acc, notif) => {
    const group = formatDateGroup(notif.timestamp);
    if (!acc[group]) acc[group] = [];
    acc[group].push(notif);
    return acc;
  }, {} as Record<string, typeof notificationsList>);

  return (
    <div className="flex flex-col gap-6 md:gap-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h2 className="font-serif text-3xl font-bold">Notifications</h2>
          {unreadCount > 0 && (
            <span className="bg-[#D4AF37] text-[#102542] text-sm font-bold px-3 py-1 rounded-full">
              {unreadCount} Unread
            </span>
          )}
        </div>
        <div className="flex items-center gap-4">
          <button onClick={markAllRead} className="text-sm font-semibold text-[#D4AF37] hover:underline flex items-center gap-1">
            <CheckCircle2 className="w-4 h-4" /> Mark all read
          </button>
          <div className="w-px h-4 bg-white/20" />
          <button onClick={clearAll} className="text-sm font-medium text-gray-400 hover:text-white transition-colors">
            Clear All
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "whitespace-nowrap px-5 py-2 rounded-full text-sm font-semibold transition-all duration-300 border",
              activeTab === tab.id 
                ? "bg-[#D4AF37]/10 text-[#D4AF37] border-[#D4AF37]/50" 
                : "bg-transparent text-gray-400 border-transparent hover:bg-white/5 hover:text-white"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="flex flex-col gap-8">
        <AnimatePresence>
          {Object.keys(groupedNotifs).length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="glass-card rounded-3xl py-20 flex flex-col items-center justify-center text-center border border-white/10"
            >
              <div className="w-24 h-24 bg-[#D4AF37]/10 rounded-full flex items-center justify-center mb-6 text-[#D4AF37]">
                <Bell className="w-10 h-10" />
              </div>
              <h3 className="font-serif text-2xl font-bold mb-2 text-white">You're all caught up!</h3>
              <p className="text-gray-400 max-w-sm">There are no new notifications to show right now. Check back later.</p>
            </motion.div>
          ) : (
            Object.entries(groupedNotifs).map(([group, items]) => (
              <div key={group} className="flex flex-col gap-4">
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">{group}</h3>
                <div className="flex flex-col gap-3">
                  {items.map((notif, i) => (
                    <motion.div
                      key={notif.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -50 }}
                      transition={{ delay: i * 0.05 }}
                      className={cn(
                        "glass-card rounded-xl p-4 md:p-5 flex flex-col md:flex-row gap-4 md:items-center border-l-4 transition-all duration-300 relative group",
                        getBorderColor(notif.type),
                        !notif.isRead ? "bg-white/[0.08] hover:bg-white/[0.12] border-y-white/20 border-r-white/20" : "border-y-white/5 border-r-white/5 opacity-70 hover:opacity-100"
                      )}
                      onClick={!notif.isRead ? () => markNotificationReadMutation.mutate({ id: notif.id }) : undefined}
                    >
                      {/* Unread Dot */}
                      {!notif.isRead && (
                        <div className="absolute top-5 right-5 w-2 h-2 rounded-full bg-[#D4AF37] shadow-[0_0_8px_rgba(212,175,55,0.8)]" />
                      )}

                      <div className="flex gap-4 flex-1">
                        <div className={cn("w-12 h-12 rounded-full flex items-center justify-center shrink-0 border", getIconBg(notif.type))}>
                          {getIcon(notif.type)}
                        </div>
                        <div className="flex-1 pr-6">
                          <h4 className={cn("font-serif text-lg font-bold mb-1", !notif.isRead ? "text-white" : "text-gray-300")}>
                            {notif.title}
                          </h4>
                          <p className="text-sm text-gray-400 leading-relaxed mb-2 line-clamp-2 md:line-clamp-none">
                            {notif.message}
                          </p>
                          <div className="text-xs text-gray-500 font-medium">
                            {new Date(notif.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </div>

                      {notif.actionLabel && notif.actionLink && (
                        <div className="md:shrink-0 pt-3 md:pt-0 border-t border-white/10 md:border-none md:ml-4">
                          <Link 
                            to={notif.actionLink} 
                            className="inline-block bg-transparent border border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37]/10 font-semibold px-4 py-2 rounded-lg text-xs transition-colors"
                          >
                            {notif.actionLabel}
                          </Link>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default NotificationsPage;