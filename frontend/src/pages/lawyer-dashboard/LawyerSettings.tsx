import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, 
  Bell, 
  Calendar as CalendarIcon, 
  IndianRupee, 
  Eye, 
  HelpCircle,
  ChevronRight,
  Download,
  Trash2,
  AlertTriangle,
  Mail,
  Phone,
  Clock,
  MessageSquare,
  ExternalLink,
  Video,
  Loader2,
  Palette,
  Sun,
  Moon,
  Monitor,
  Type
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getSavedTheme, getSavedFontScale, applyTheme, applyFontScale, type Theme } from '@/lib/appearance';
import FormPasswordInput from '@/components/forms/FormPasswordInput';
import FormInput from '@/components/forms/FormInput';
import FormSelect from '@/components/forms/FormSelect';
import { toast } from 'sonner';
import { useAuth } from '@/lib/auth-context';
import { googleAuthStart, useGoogleAuthStatus, useDeleteAccount, useChangePassword, useCreateDataExportRequest, useGetMyDataExports, ApiError } from '@workspace/api-client-react';

const SCHEDULE_KEY = 'nyayaconnect.availability';
const PRICING_KEY = 'nyayaconnect.lawyerPricing';
const NOTIF_KEY = 'nyayaconnect.lawyerNotifications';

const DEFAULT_SCHEDULE = [
  { day: "Monday", active: true, start: "09:00", end: "17:00" },
  { day: "Tuesday", active: true, start: "09:00", end: "17:00" },
  { day: "Wednesday", active: true, start: "09:00", end: "17:00" },
  { day: "Thursday", active: true, start: "09:00", end: "17:00" },
  { day: "Friday", active: true, start: "09:00", end: "17:00" },
  { day: "Saturday", active: true, start: "10:00", end: "14:00" },
  { day: "Sunday", active: false, start: "10:00", end: "14:00" },
];

const DEFAULT_PRICING = { fee: '1500', policy: 'Moderate', lateFee: '500' };

const DEFAULT_NOTIFS = [
  { id: 'appointments', title: "New Appointment Requests", desc: "Instantly when a client books a slot.", email: true, sms: true },
  { id: 'payments', title: "Payment Alerts", desc: "When a consultation fee is credited.", email: true, sms: false },
  { id: 'hearings', title: "Hearing Reminders", desc: "Daily digest of next day's court listings.", email: true, sms: true },
  { id: 'reviews', title: "New Client Reviews", desc: "When a client rates your consultation.", email: true, sms: false },
];

const loadValue = <T,>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
};

const LawyerSettings = () => {
  const navigate = useNavigate();
  const { user, token, signOut } = useAuth();
  const deleteAccountMutation = useDeleteAccount({
    request: { headers: token ? { authorization: `Bearer ${token}` } : undefined },
  });
  const changePasswordMutation = useChangePassword({
    request: { headers: token ? { authorization: `Bearer ${token}` } : undefined },
  });
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeSection, setActiveSection] = useState('availability');
  const [connectingGoogle, setConnectingGoogle] = useState(false);

  const { data: googleStatus } = useGoogleAuthStatus({ userId: user?.id ?? '' });
  const googleConnected = Boolean(googleStatus?.connected);

  useEffect(() => {
    const status = searchParams.get('google');
    if (status === 'connected') toast.success('Google Calendar connected');
    else if (status === 'error') toast.error('Failed to connect Google Calendar');
    if (status) setSearchParams({}, { replace: true });
  }, [searchParams, setSearchParams]);

  const handleConnectGoogle = async () => {
    if (!user?.id) {
      toast.error('Please sign in to connect Google Calendar');
      return;
    }
    setConnectingGoogle(true);
    try {
      const res = await googleAuthStart({ userId: user.id });
      window.location.href = res.authorizationUrl;
    } catch {
      toast.error('Failed to start Google connection');
      setConnectingGoogle(false);
    }
  };

  const [schedule, setSchedule] = useState<typeof DEFAULT_SCHEDULE>(() => loadValue(SCHEDULE_KEY, DEFAULT_SCHEDULE));
  const [pricing, setPricing] = useState(() => loadValue(PRICING_KEY, DEFAULT_PRICING));
  const [savingPricing, setSavingPricing] = useState(false);
  const [notificationPrefs, setNotificationPrefs] = useState(() => loadValue(NOTIF_KEY, DEFAULT_NOTIFS));
  const [visibility, setVisibility] = useState<'Public' | 'Private'>('Public');
  const [savingVisibility, setSavingVisibility] = useState(false);
  const [password, setPassword] = useState({ current: '', next: '', confirm: '' });
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [requestingExport, setRequestingExport] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  const { data: myExports, refetch: refetchExports } = useGetMyDataExports({
    request: { headers: token ? { authorization: `Bearer ${token}` } : undefined },
    query: { enabled: Boolean(token), queryKey: ['my-data-exports', user?.email ?? 'anon'] } as unknown as never,
  });
  const createExportMutation = useCreateDataExportRequest({
    request: { headers: token ? { authorization: `Bearer ${token}` } : undefined },
  });
  const [theme, setTheme] = useState<Theme>(() => getSavedTheme(user?.id));
  const [fontScale, setFontScale] = useState<number>(() => getSavedFontScale(user?.id));

  useEffect(() => {
    applyTheme(theme, user?.id);
  }, [theme, user?.id]);

  useEffect(() => {
    applyFontScale(fontScale, user?.id);
  }, [fontScale, user?.id]);

  useEffect(() => {
    let cancelled = false;
    const loadVisibility = async () => {
      if (!token) return;
      try {
        const res = await fetch(`/api/lawyer/visibility`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) return;
        const data = await res.json();
        if (cancelled || typeof data !== 'object' || data == null) return;
        if (data.visibility === 'private') setVisibility('Private');
        else if (data.visibility === 'public') setVisibility('Public');
      } catch {
        // keep default
      }
    };
    loadVisibility();
    return () => { cancelled = true; };
  }, [token]);

  const sections = [
    { id: 'availability', label: 'Availability', icon: CalendarIcon },
    { id: 'integrations', label: 'Google Calendar', icon: Video },
    { id: 'pricing', label: 'Pricing & Policies', icon: IndianRupee },
    { id: 'security', label: 'Account Security', icon: ShieldCheck },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Privacy & Data', icon: Eye },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'help', label: 'Help & Support', icon: HelpCircle },
  ];

  const CustomToggle = ({ checked, onChange }: { checked: boolean, onChange: () => void }) => (
    <button 
      onClick={onChange}
      className={cn(
        "relative w-12 h-6 rounded-full transition-colors duration-300 outline-none shrink-0",
        checked ? "bg-[#D4AF37]" : "bg-white/10"
      )}
    >
      <div className={cn(
        "absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform duration-300",
        checked ? "translate-x-6" : "translate-x-0"
      )} />
    </button>
  );

  const updateDay = (index: number, patch: Partial<{ active: boolean; start: string; end: string }>) => {
    setSchedule(prev => prev.map((d, i) => (i === index ? { ...d, ...patch } : d)));
  };

  const handleSaveAvailability = async () => {
    localStorage.setItem(SCHEDULE_KEY, JSON.stringify(schedule));
    try {
      await fetch(`/api/lawyer/availability`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ weeklyHours: schedule }),
      });
    } catch {
      // localStorage save succeeded; backend may fail silently - user still gets toast
    }
    toast.success('Availability saved');
  };

  useEffect(() => {
    let cancelled = false;
    const loadPricing = async () => {
      if (!token) return;
      try {
        const res = await fetch(`/api/lawyer/pricing`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) return;
        const data = await res.json();
        if (cancelled || typeof data !== 'object' || data == null) return;
        setPricing(prev => ({
          ...prev,
          ...(typeof data.fee === 'string' && data.fee !== '' ? { fee: data.fee } : {}),
          ...(typeof data.policy === 'string' && data.policy !== '' ? { policy: data.policy } : {}),
          ...(typeof data.lateFee === 'string' && data.lateFee !== '' ? { lateFee: data.lateFee } : {}),
        }));
      } catch {
        // fall back to localStorage/defaults
      }
    };
    loadPricing();
    return () => { cancelled = true; };
  }, [token]);

  const handleUpdatePricing = async () => {
    setSavingPricing(true);
    try {
      const res = await fetch(`/api/lawyer/pricing`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ fee: pricing.fee, policy: pricing.policy, lateFee: pricing.lateFee }),
      });
      if (res.status === 401) {
        toast.error('Your session has expired. Please sign in again.');
        return;
      }
      if (!res.ok) {
        toast.error('Failed to update pricing. Please try again.');
        return;
      }
      localStorage.setItem(PRICING_KEY, JSON.stringify(pricing));
      toast.success('Pricing & policies updated');
    } catch {
      toast.error('Failed to update pricing. Please check your connection and try again.');
    } finally {
      setSavingPricing(false);
    }
  };

  // Load live preferences from backend on mount
  useEffect(() => {
    if (!token) return;
    fetch(`/api/user/notification-preferences`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        if (!res.ok) return;
        const data = (await res.json()) as { preferences?: Record<string, boolean> };
        if (!data?.preferences) return;
        const map = new Map(Object.entries(data.preferences));
        setNotificationPrefs((prev) => {
          const next = prev.map((item) => ({
            ...item,
            email: map.has(`${item.id}_email`) ? (map.get(`${item.id}_email`) as boolean) : item.email,
            sms: map.has(`${item.id}_sms`) ? (map.get(`${item.id}_sms`) as boolean) : item.sms,
          }));
          localStorage.setItem(NOTIF_KEY, JSON.stringify(next));
          return next;
        });
      })
      .catch(() => {});
  }, [token]);

  const toggleNotif = async (id: string, channel: 'email' | 'sms') => {
    const current = notificationPrefs.find((n) => n.id === id);
    if (!current) return;
    const newValue = channel === 'email' ? !current.email : !current.sms;
    // optimistic update
    setNotificationPrefs((prev) => {
      const next = prev.map((n) => {
        if (n.id !== id) return n;
        return channel === 'email' ? { ...n, email: newValue } : { ...n, sms: newValue };
      });
      localStorage.setItem(NOTIF_KEY, JSON.stringify(next));
      return next;
    });

    if (!token) return;
    const channelKey = `${id}_${channel}`;
    try {
      const res = await fetch(`/api/user/notification-preferences`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ preferences: { [channelKey]: newValue } }),
      });
      if (!res.ok) throw new Error('Failed to save');
      // keep optimistic state
    } catch {
      // revert on failure
      setNotificationPrefs((prev) => {
        const next = prev.map((n) => {
          if (n.id !== id) return n;
          return channel === 'email' ? { ...n, email: !newValue } : { ...n, sms: !newValue };
        });
        localStorage.setItem(NOTIF_KEY, JSON.stringify(next));
        return next;
      });
      toast.error('Could not save notification preference. Please try again.');
    }
  };

  const handleVisibilityChange = async (opt: string) => {
    const next = opt === "Public" ? "Public" : "Private";
    const prev = visibility;
    setVisibility(next);
    setSavingVisibility(true);
    try {
      const res = await fetch(`/api/lawyer/visibility`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ visibility: next === "Public" ? "public" : "private" }),
      });
      if (res.status === 401) {
        setVisibility(prev);
        toast.error('Your session has expired. Please sign in again.');
        return;
      }
      if (!res.ok) {
        setVisibility(prev);
        toast.error('Failed to update visibility. Please try again.');
        return;
      }
      toast.success(next === "Public" ? 'Profile is now public — visible in the lawyer directory and to clients.' : 'Profile is now private — hidden from the lawyer directory.');
    } catch {
      setVisibility(prev);
      toast.error('Failed to update visibility. Please check your connection.');
    } finally {
      setSavingVisibility(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (!password.current || !password.next || !password.confirm) {
      toast.error('Please fill in all password fields');
      return;
    }
    if (password.next.length < 8) {
      toast.error('New password must be at least 8 characters');
      return;
    }
    if (password.next !== password.confirm) {
      toast.error('New passwords do not match');
      return;
    }
    setChangingPassword(true);
    try {
      await changePasswordMutation.mutateAsync({
        data: { currentPassword: password.current, newPassword: password.next },
      });
      toast.success('Password updated successfully');
      setPassword({ current: '', next: '', confirm: '' });
    } catch (err) {
      toast.error(err instanceof ApiError && typeof err.data?.message === 'string' ? err.data.message : 'Failed to update password. Please try again.');
    } finally {
      setChangingPassword(false);
    }
  };

  const handleRequestExport = async () => {
    setRequestingExport(true);
    try {
      await createExportMutation.mutateAsync();
      toast.success('Data export requested. An admin will review and grant it shortly.');
      await refetchExports();
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        toast.error('A request is already pending. Please wait for admin approval.');
        await refetchExports();
      } else if (err instanceof ApiError && err.status === 401) {
        toast.error('Your session has expired. Please sign in again.');
      } else {
        toast.error('Failed to request data export. Please try again.');
      }
    } finally {
      setRequestingExport(false);
    }
  };

  const handleDownloadZip = async () => {
    setDownloading(true);
    try {
      const res = await fetch(`/api/data-exports/me/download`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      if (res.status === 403) {
        toast.error('Your export has not been approved yet. Please wait for admin approval.');
        return;
      }
      if (res.status === 401) {
        toast.error('Your session has expired. Please sign in again.');
        return;
      }
      if (!res.ok) {
        toast.error('Failed to download ZIP archive. Please try again.');
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'nyayaconnect-lawyer-export.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('ZIP archive downloaded');
    } catch {
      toast.error('Failed to download ZIP archive. Please check your connection.');
    } finally {
      setDownloading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      setTimeout(() => setConfirmDelete(false), 5000);
      toast.warning('Are you sure? Click again to permanently delete your account.');
      return;
    }
    if (!user?.email) {
      toast.error('You must be signed in to delete your account.');
      return;
    }
    setDeletingAccount(true);
    try {
      await deleteAccountMutation.mutateAsync({ data: { email: user.email } });
      signOut();
      toast.success('Your account has been deleted.');
      navigate('/');
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Failed to delete your account. Please try again.');
      setConfirmDelete(false);
    } finally {
      setDeletingAccount(false);
    }
  };

  const renderSectionContent = () => {
    switch (activeSection) {
      case 'availability':
        return (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-8">
            <div>
              <h3 className="text-xl font-serif font-bold mb-2">Weekly Availability</h3>
              <p className="text-sm text-gray-400 mb-6">Set your regular consulting hours. These will be visible on your public profile for clients to book appointments.</p>
              
              <div className="flex flex-col gap-4 max-w-2xl">
                {schedule.map((s, i) => (
                  <div key={s.day} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-white/5 rounded-xl border border-white/10">
                    <div className="flex items-center gap-4 w-32 shrink-0">
                      <CustomToggle checked={s.active} onChange={() => updateDay(i, { active: !s.active })} />
                      <span className={cn("font-semibold", s.active ? "text-white" : "text-gray-500")}>{s.day}</span>
                    </div>
                    {s.active ? (
                      <div className="flex items-center gap-3 flex-1 sm:justify-end">
                        <input type="time" value={s.start} onChange={e => updateDay(i, { start: e.target.value })} className="bg-[#102542] border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white focus:border-[#D4AF37]/50 outline-none" />
                        <span className="text-gray-500">to</span>
                        <input type="time" value={s.end} onChange={e => updateDay(i, { end: e.target.value })} className="bg-[#102542] border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white focus:border-[#D4AF37]/50 outline-none" />
                      </div>
                    ) : (
                      <div className="flex-1 sm:text-right text-sm text-gray-500 italic">Unavailable</div>
                    )}
                  </div>
                ))}
              </div>
              <button onClick={handleSaveAvailability} className="bg-[#D4AF37] hover:bg-[#c4a133] text-[#102542] font-bold px-6 py-3 rounded-xl transition-all mt-6 shadow-[0_4px_15px_rgba(212,175,55,0.3)]">
                Save Availability
              </button>
            </div>
          </motion.div>
        );

      case 'integrations':
        return (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-8">
            <div>
              <h3 className="text-xl font-serif font-bold mb-2">Google Calendar</h3>
              <p className="text-sm text-gray-400 mb-6 max-w-xl">Connect your Google account so NyayaConnect can create Google Meet links for your online consultations. The meeting link is added to your appointment and shared with the client automatically.</p>

              <div className="flex items-center justify-between gap-4 p-5 bg-white/5 rounded-xl border border-white/10 max-w-2xl">
                <div className="flex items-center gap-4">
                  <div className={cn("p-3 rounded-lg", googleConnected ? "bg-green-500/10 text-green-400" : "bg-[#D4AF37]/10 text-[#D4AF37]")}>
                    <Video className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-semibold text-white">{googleConnected ? "Connected" : "Not connected"}</div>
                    <div className="text-xs text-gray-400 mt-0.5">{googleConnected ? "Google Meet links will be created on your calendar." : "Connect to start generating Google Meet links."}</div>
                  </div>
                </div>
                <button
                  onClick={handleConnectGoogle}
                  disabled={connectingGoogle}
                  className="bg-[#D4AF37] hover:bg-[#c4a133] text-[#102542] font-bold px-5 py-2.5 rounded-xl transition-colors whitespace-nowrap disabled:opacity-60"
                >
                  {connectingGoogle ? 'Redirecting...' : googleConnected ? 'Reconnect' : 'Connect Google Calendar'}
                </button>
              </div>
            </div>
          </motion.div>
        );

      case 'pricing':
        return (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-8">
            <div>
              <h3 className="text-xl font-serif font-bold mb-6">Pricing Configuration</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl">
                <FormInput
                  label="Consultation Fee (per session)" name="fee" icon={IndianRupee} type="number"
                  value={pricing.fee} onChange={e => setPricing(prev => ({ ...prev, fee: e.target.value }))}
                />
              </div>
            </div>

            <div className="border-t border-white/10 pt-8">
              <h3 className="text-xl font-serif font-bold mb-6">Cancellation Policy</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl">
                <FormSelect 
                  label="Policy strictness" name="policy" 
                  value={pricing.policy} onChange={e => setPricing(prev => ({ ...prev, policy: e.target.value }))}
                  options={[
                    {label:"Flexible (Full refund up to 2hrs before)", value:"Flexible"},
                    {label:"Moderate (Full refund up to 24hrs before)", value:"Moderate"},
                    {label:"Strict (No refunds)", value:"Strict"}
                  ]}
                />
                <FormInput 
                  label="Late Cancellation Fee" name="lateFee" icon={IndianRupee} type="number" value={pricing.lateFee}
                  onChange={e => setPricing(prev => ({ ...prev, lateFee: e.target.value }))}
                  hint="Charged if client no-shows."
                />
              </div>
            </div>

            <button onClick={handleUpdatePricing} disabled={savingPricing} className="bg-[#D4AF37] hover:bg-[#c4a133] text-[#102542] font-bold px-6 py-3 rounded-xl transition-all w-40 shadow-[0_4px_15px_rgba(212,175,55,0.3)] disabled:opacity-60 inline-flex items-center justify-center gap-2">
              {savingPricing && <Loader2 className="w-4 h-4 animate-spin" />}
              Update Pricing
            </button>
          </motion.div>
        );

      case 'security':
        return (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-8">
            <div>
              <h3 className="text-xl font-serif font-bold mb-4">Change Password</h3>
              <div className="max-w-md flex flex-col gap-4">
                <FormPasswordInput label="Current Password" name="current" value={password.current} onChange={e => setPassword({ ...password, current: e.target.value })} />
                <FormPasswordInput label="New Password" name="new" showStrengthMeter value={password.next} onChange={e => setPassword({ ...password, next: e.target.value })} />
                <FormPasswordInput label="Confirm New Password" name="confirm" value={password.confirm} onChange={e => setPassword({ ...password, confirm: e.target.value })} />
                <button onClick={handleUpdatePassword} disabled={changingPassword} className="bg-[#D4AF37] text-[#102542] font-bold py-3 rounded-xl mt-2 hover:bg-[#c4a133] transition-colors w-32 disabled:opacity-50 inline-flex items-center justify-center gap-2">
                  {changingPassword && <Loader2 className="w-4 h-4 animate-spin" />}
                  Update
                </button>
              </div>
            </div>
          </motion.div>
        );

      case 'notifications':
        return (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-8">
            <h3 className="text-xl font-serif font-bold mb-2">Notification Preferences</h3>
            
            <div className="flex flex-col gap-6 max-w-2xl">
              {notificationPrefs.map((item) => (
                <div key={item.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-white/5 rounded-xl border border-white/10">
                  <div className="flex-1">
                    <div className="font-semibold text-white">{item.title}</div>
                    <div className="text-xs text-gray-400 mt-1">{item.desc}</div>
                  </div>
                  <div className="flex items-center gap-6 shrink-0">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <span className="text-sm text-gray-300">Email</span>
                      <CustomToggle checked={item.email} onChange={() => toggleNotif(item.id, 'email')} />
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <span className="text-sm text-gray-300">SMS</span>
                      <CustomToggle checked={item.sms} onChange={() => toggleNotif(item.id, 'sms')} />
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        );

      case 'privacy': {
        const exportsList = (myExports as unknown as Array<{ id: string; status: string; kind?: string; requestedAt?: string; reason?: string }> | undefined) ?? [];
        const latestExport = exportsList.find((e) => e.kind === 'lawyer_zip') ?? exportsList[0];
        const exportStatus = latestExport?.status as 'pending' | 'granted' | 'denied' | undefined;
        return (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-8">
            <div>
              <h3 className="text-xl font-serif font-bold mb-4">Profile Visibility</h3>
              <p className="text-sm text-gray-400 mb-4 max-w-xl">Control whether your profile appears in the lawyer directory and on your public profile page. Private hides you from browsing clients (including the client portal directory).</p>
              <div className="flex gap-4 max-w-2xl">
                {["Public", "Private (Direct Link Only)"].map((opt) => (
                  <label key={opt} className="flex-1 cursor-pointer relative">
                    <input
                      type="radio"
                      name="visibility"
                      className="peer sr-only"
                      checked={visibility === (opt === "Public" ? "Public" : "Private")}
                      onChange={() => handleVisibilityChange(opt)}
                      disabled={savingVisibility}
                    />
                    <div className="h-full p-4 rounded-xl border border-white/10 bg-white/5 peer-checked:border-[#D4AF37] peer-checked:bg-[#D4AF37]/10 transition-all text-center">
                      <div className="font-semibold text-sm mb-1 peer-checked:text-[#D4AF37]">{opt}</div>
                    </div>
                  </label>
                ))}
              </div>
              {savingVisibility && (
                <p className="text-xs text-[#D4AF37] mt-3 flex items-center gap-1.5"><Loader2 className="w-3 h-3 animate-spin" /> Saving visibility...</p>
              )}
            </div>

            <div className="border-t border-white/10 pt-8">
              <h3 className="text-xl font-serif font-bold mb-2 flex items-center gap-2">
                <Download className="w-5 h-5 text-[#D4AF37]" /> Export Data
              </h3>
              <p className="text-sm text-gray-400 mb-4 max-w-xl">Request a copy of your personal data, appointments, and uploaded documents. An admin must approve the request before the download becomes available.</p>
              {exportStatus === 'pending' && (
                <div className="max-w-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 rounded-xl p-4 mb-4">
                  <p className="font-semibold text-sm">Request pending admin approval</p>
                  <p className="text-xs text-amber-200/80 mt-1">Your ZIP archive will be available to download once an admin grants the request.</p>
                </div>
              )}
              {exportStatus === 'denied' && (
                <div className="max-w-xl bg-red-500/10 border border-red-500/30 text-red-300 rounded-xl p-4 mb-4">
                  <p className="font-semibold text-sm">Request denied{latestExport?.reason ? ` — ${latestExport.reason}` : ''}</p>
                  <p className="text-xs text-red-200/80 mt-1">You can submit a new request below.</p>
                </div>
              )}
              {exportStatus === 'granted' && (
                <div className="max-w-xl bg-green-500/10 border border-green-500/30 text-green-300 rounded-xl p-4 mb-4">
                  <p className="font-semibold text-sm">Request approved — your ZIP archive is ready.</p>
                  <p className="text-xs text-green-200/80 mt-1">Click download to get your data. You can also request a fresh export.</p>
                </div>
              )}
              <div className="flex flex-wrap gap-3">
                {(exportStatus === undefined || exportStatus === 'denied') && (
                  <button onClick={handleRequestExport} disabled={requestingExport} className="bg-transparent border border-white/20 hover:bg-white/10 text-white font-semibold py-2.5 px-6 rounded-xl transition-colors disabled:opacity-60 inline-flex items-center gap-2">
                    {requestingExport && <Loader2 className="w-4 h-4 animate-spin" />}
                    Generate ZIP Archive
                  </button>
                )}
                {exportStatus === 'pending' && (
                  <button disabled className="bg-white/5 border border-white/10 text-gray-400 font-semibold py-2.5 px-6 rounded-xl cursor-not-allowed inline-flex items-center gap-2">
                    <Clock className="w-4 h-4" /> Pending admin approval
                  </button>
                )}
                {exportStatus === 'granted' && (
                  <>
                    <button onClick={handleDownloadZip} disabled={downloading} className="bg-[#D4AF37] hover:bg-[#c4a133] text-[#102542] font-bold py-2.5 px-6 rounded-xl transition-colors disabled:opacity-60 inline-flex items-center gap-2">
                      {downloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                      {downloading ? 'Downloading...' : 'Download ZIP Archive'}
                    </button>
                    <button onClick={handleRequestExport} disabled={requestingExport} className="bg-transparent border border-white/20 hover:bg-white/10 text-white font-semibold py-2.5 px-6 rounded-xl transition-colors disabled:opacity-60 inline-flex items-center gap-2">
                      {requestingExport && <Loader2 className="w-4 h-4 animate-spin" />}
                      Request New Archive
                    </button>
                  </>
                )}
              </div>
            </div>

            <div className="border-t border-red-500/20 pt-8">
              <h3 className="text-xl font-serif font-bold mb-2 flex items-center gap-2 text-red-400">
                <AlertTriangle className="w-5 h-5" /> Danger Zone
              </h3>
              <p className="text-sm text-gray-400 mb-4 max-w-xl">Permanently delete your lawyer account. You will be delisted from the platform and all associated data will be removed from the database.</p>
              <button
                onClick={handleDeleteAccount}
                disabled={deletingAccount}
                className={cn(
                  "font-bold py-2.5 px-6 rounded-xl transition-colors flex items-center gap-2 disabled:opacity-50",
                  confirmDelete
                    ? "bg-red-500 text-white border border-red-500"
                    : "bg-red-500/10 border border-red-500/30 hover:bg-red-500 text-red-400 hover:text-white"
                )}
              >
                <Trash2 className="w-4 h-4" /> {deletingAccount ? 'Deleting…' : confirmDelete ? 'Click again to confirm' : 'Delete Account'}
              </button>
            </div>
          </motion.div>
        );
        }

      case 'appearance':
        return (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-8">
            <div>
              <h3 className="text-xl font-serif font-bold mb-4">Theme</h3>
              <p className="text-sm text-gray-400 mb-6 max-w-xl">Choose how the portal looks on your device.</p>
              <div className="flex flex-col sm:flex-row gap-4 max-w-2xl">
                {[
                  { label: "Light", icon: Sun },
                  { label: "Dark", icon: Moon },
                  { label: "System Default", icon: Monitor },
                ].map((opt) => {
                  const value: Theme = opt.label === "Light" ? "light" : opt.label === "Dark" ? "dark" : "system";
                  return (
                    <label key={opt.label} className="flex-1 cursor-pointer relative">
                      <input type="radio" name="theme" className="peer sr-only" checked={theme === value} onChange={() => {
                        setTheme(value);
                        applyTheme(value, user?.id);
                        toast.success(value === 'system' ? 'Theme set to System Default' : `Theme set to ${value === 'light' ? 'Light' : 'Dark'}`);
                      }} />
                      <div className="h-full p-4 rounded-xl border border-white/10 bg-white/5 peer-checked:border-[#D4AF37] peer-checked:bg-[#D4AF37]/10 transition-all text-center flex flex-col items-center gap-2">
                        <opt.icon className="w-6 h-6 peer-checked:text-[#D4AF37]" />
                        <div className="font-semibold text-sm">{opt.label}</div>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="border-t border-white/10 pt-8">
              <h3 className="text-xl font-serif font-bold mb-2 flex items-center gap-2">
                <Type className="w-5 h-5 text-[#D4AF37]" /> Text Size
              </h3>
              <p className="text-sm text-gray-400 mb-6 max-w-xl">Adjust the size of text throughout the portal.</p>
              <div className="flex gap-3 max-w-xl">
                {[
                  { label: "A-", scale: 0.875 },
                  { label: "A", scale: 1 },
                  { label: "A+", scale: 1.125 },
                ].map((opt) => (
                  <button
                    key={opt.label}
                    onClick={() => {
                      setFontScale(opt.scale);
                      applyFontScale(opt.scale, user?.id);
                      toast.success(opt.scale === 0.875 ? 'Text size: Small' : opt.scale === 1.125 ? 'Text size: Large' : 'Text size: Default');
                    }}
                    className={cn(
                      "flex-1 py-3 rounded-xl border font-semibold transition-all duration-300",
                      fontScale === opt.scale
                        ? "bg-[#D4AF37]/10 border-[#D4AF37]/30 text-[#D4AF37]"
                        : "bg-white/5 border-white/10 text-white hover:bg-white/10"
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        );

      case 'help':
        return (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-8">
            <div>
              <h3 className="text-xl font-serif font-bold mb-4">Contact Support</h3>
              <div className="flex flex-col gap-3 max-w-2xl">
                <div className="flex items-center gap-4 p-4 bg-white/5 rounded-xl border border-white/10">
                  <div className="p-3 bg-[#D4AF37]/10 rounded-lg text-[#D4AF37]">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="font-semibold text-white">Email Support</span>
                    <a href="mailto:support@nyayaconnect.in" className="text-sm text-gray-400 hover:text-[#D4AF37] transition-colors">support@nyayaconnect.in</a>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 bg-white/5 rounded-xl border border-white/10">
                  <div className="p-3 bg-[#D4AF37]/10 rounded-lg text-[#D4AF37]">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="font-semibold text-white">Phone Support</span>
                    <span className="text-sm text-gray-400">1800-123-4567 (Toll Free)</span>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 bg-white/5 rounded-xl border border-white/10">
                  <div className="p-3 bg-[#D4AF37]/10 rounded-lg text-[#D4AF37]">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="font-semibold text-white">Support Hours</span>
                    <span className="text-sm text-gray-400">Mon – Sat, 9:00 AM – 9:00 PM IST</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-white/10 pt-8">
              <h3 className="text-xl font-serif font-bold mb-2 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-[#D4AF37]" /> Frequently Asked Questions
              </h3>
              <p className="text-sm text-gray-400 mb-4 max-w-xl">Find quick answers about listings, appointments, payments, and client management.</p>
              <Link to="/faq" className="inline-flex items-center gap-2 bg-transparent border border-white/20 hover:bg-white/10 text-white font-semibold py-2.5 px-6 rounded-xl transition-colors">
                Visit Help Center <ExternalLink className="w-4 h-4" />
              </Link>
            </div>

            <div className="border-t border-white/10 pt-8">
              <h3 className="text-xl font-serif font-bold mb-2">Report an Issue</h3>
              <p className="text-sm text-gray-400 mb-4 max-w-xl">Facing a problem with a booking, payout, or client consultation? Our team will get back to you within 24 hours.</p>
              <Link to="/contact" className="bg-[#D4AF37] text-[#102542] font-bold py-3 px-6 rounded-xl hover:bg-[#c4a133] transition-colors inline-flex items-center gap-2">
                Report an Issue
              </Link>
            </div>
          </motion.div>
        );

      default:
        return (
          <div className="flex flex-col items-center justify-center py-20 text-center text-gray-400">
            <h3 className="font-serif text-2xl font-bold mb-2 text-white">Under Construction</h3>
            <p>This section is being updated.</p>
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col gap-6 md:gap-8 max-w-6xl mx-auto h-[calc(100vh-10rem)]">
      <h2 className="font-serif text-3xl font-bold">Settings</h2>
      
      <div className="flex flex-col md:flex-row gap-8 h-full min-h-0">
        
        {/* Left Nav */}
        <div className="md:w-64 shrink-0 flex flex-col gap-2">
          {sections.map(sec => (
            <button
              key={sec.id}
              onClick={() => setActiveSection(sec.id)}
              className={cn(
                "w-full flex items-center justify-between p-4 rounded-xl text-sm font-semibold transition-all duration-300",
                activeSection === sec.id
                  ? "bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#D4AF37]"
                  : "bg-transparent border border-transparent text-gray-400 hover:bg-white/5 hover:text-white"
              )}
            >
              <div className="flex items-center gap-3">
                <sec.icon className="w-5 h-5" />
                {sec.label}
              </div>
              <ChevronRight className={cn("w-4 h-4 transition-transform", activeSection === sec.id ? "translate-x-1" : "")} />
            </button>
          ))}
        </div>

        {/* Right Content Area */}
        <div className="flex-1 glass-card rounded-3xl p-6 md:p-10 border border-white/10 overflow-y-auto custom-scrollbar">
          <AnimatePresence mode="wait">
            {renderSectionContent()}
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
};

export default LawyerSettings;
