import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, 
  Bell, 
  Eye, 
  Palette, 
  CreditCard, 
  HelpCircle,
  ChevronRight,
  AlertTriangle,
  Download,
  Trash2,
  Cog,
  Mail,
  Phone,
  Clock,
  MessageSquare,
  ExternalLink,
  Sun,
  Moon,
  Monitor,
  Type,
  Loader2,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import FormPasswordInput from '@/components/forms/FormPasswordInput';
import { toast } from 'sonner';
import { useAuth } from '@/lib/auth-context';
import { useListAppointments, useListDocuments, useListNotifications, useDeleteAccount, useChangePassword, useGetAccountVisibility, useUpdateAccountVisibility, useCreateDataExportRequest, useGetMyDataExports, ApiError } from '@workspace/api-client-react';
import { getSavedTheme, getSavedFontScale, applyTheme, applyFontScale, type Theme } from '@/lib/appearance';

const VISIBILITY_KEY = 'nyayaconnect.profileVisibility';

const visibilityStorageKey = (userId?: string) => (userId ? `${VISIBILITY_KEY}.${userId}` : VISIBILITY_KEY);

const visibilityToLabel = (v: 'public' | 'lawyers_only' | 'private') =>
  v === 'public' ? 'Public' : v === 'private' ? 'Private' : 'Lawyers Only';

const labelToVisibility = (label: string): 'public' | 'lawyers_only' | 'private' =>
  label === 'Public' ? 'public' : label === 'Private' ? 'private' : 'lawyers_only';
const NOTIF_PREFS_KEY = 'nyayaconnect.notificationPrefs';

const DEFAULT_NOTIF_PREFS = [
  { id: 'appointments', title: "Appointment Reminders", desc: "Get notified 24 hours and 1 hour before.", email: true, sms: true },
  { id: 'documents', title: "Document Updates", desc: "When a lawyer reviews or updates a file.", email: true, sms: false },
  { id: 'messages', title: "New Messages", desc: "When you receive a direct message.", email: true, sms: true },
  { id: 'promos', title: "Promotional & Tips", desc: "Legal tips, news, and platform updates.", email: false, sms: false },
];

const loadValue = <T,>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
};

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c >>> 0;
  }
  return table;
})();

function crc32(data: Uint8Array): number {
  let crc = 0xFFFFFFFF;
  for (let i = 0; i < data.length; i++) {
    crc = (crc >>> 8) ^ CRC_TABLE[(crc ^ data[i]) & 0xFF];
  }
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

function buildZip(files: { name: string; content: string }[]): Blob {
  const encoder = new TextEncoder();
  const localParts: Uint8Array[] = [];
  const centralParts: Uint8Array[] = [];
  let offset = 0;

  for (const file of files) {
    const name = encoder.encode(file.name);
    const content = encoder.encode(file.content);
    const crc = crc32(content);
    const size = content.length;

    const local = new Uint8Array(30 + name.length);
    const lv = new DataView(local.buffer);
    lv.setUint32(0, 0x04034b50, true);
    lv.setUint16(4, 20, true);
    lv.setUint16(6, 0x0800, true);
    lv.setUint16(8, 0, true);
    lv.setUint16(10, 0, true);
    lv.setUint16(12, 0x21, true);
    lv.setUint32(14, crc, true);
    lv.setUint32(18, size, true);
    lv.setUint32(22, size, true);
    lv.setUint16(26, name.length, true);
    lv.setUint16(28, 0, true);
    local.set(name, 30);
    localParts.push(local, content);

    const central = new Uint8Array(46 + name.length);
    const cv = new DataView(central.buffer);
    cv.setUint32(0, 0x02014b50, true);
    cv.setUint16(4, 20, true);
    cv.setUint16(6, 20, true);
    cv.setUint16(8, 0x0800, true);
    cv.setUint16(10, 0, true);
    cv.setUint16(12, 0, true);
    cv.setUint16(14, 0x21, true);
    cv.setUint32(16, crc, true);
    cv.setUint32(20, size, true);
    cv.setUint32(24, size, true);
    cv.setUint16(28, name.length, true);
    cv.setUint16(30, 0, true);
    cv.setUint16(32, 0, true);
    cv.setUint16(34, 0, true);
    cv.setUint16(36, 0, true);
    cv.setUint32(38, 0, true);
    cv.setUint32(42, offset, true);
    central.set(name, 46);
    centralParts.push(central);
    offset += local.length + size;
  }

  const localSize = localParts.reduce((s, c) => s + c.length, 0);
  const centralSize = centralParts.reduce((s, c) => s + c.length, 0);

  const eocd = new Uint8Array(22);
  const ev = new DataView(eocd.buffer);
  ev.setUint32(0, 0x06054b50, true);
  ev.setUint16(4, 0, true);
  ev.setUint16(6, 0, true);
  ev.setUint16(8, files.length, true);
  ev.setUint16(10, files.length, true);
  ev.setUint32(12, centralSize, true);
  ev.setUint32(16, localSize, true);
  ev.setUint16(20, 0, true);

  const out = new Uint8Array(localSize + centralSize + 22);
  let pos = 0;
  for (const part of localParts) { out.set(part, pos); pos += part.length; }
  for (const part of centralParts) { out.set(part, pos); pos += part.length; }
  out.set(eocd, pos);

  return new Blob([out], { type: 'application/zip' });
}

const Settings = () => {
  const navigate = useNavigate();
  const { user, token, signOut } = useAuth();
  const deleteAccountMutation = useDeleteAccount({
    request: { headers: token ? { authorization: `Bearer ${token}` } : undefined },
  });
  const changePasswordMutation = useChangePassword({
    request: { headers: token ? { authorization: `Bearer ${token}` } : undefined },
  });
  const { data: savedVisibility } = useGetAccountVisibility({
    request: { headers: token ? { authorization: `Bearer ${token}` } : undefined },
  });
  const updateVisibilityMutation = useUpdateAccountVisibility({
    request: { headers: token ? { authorization: `Bearer ${token}` } : undefined },
  });
  const createDataExportMutation = useCreateDataExportRequest({
    request: { headers: token ? { authorization: `Bearer ${token}` } : undefined },
  });
  const { data: dataExports, refetch: refetchDataExports } = useGetMyDataExports({
    request: { headers: token ? { authorization: `Bearer ${token}` } : undefined },
  });
  const { data: appointments } = useListAppointments();
  const { data: documents } = useListDocuments();
  const { data: notifications } = useListNotifications();
  const [activeSection, setActiveSection] = useState('security');
  const [visibility, setVisibility] = useState<string>(() => localStorage.getItem(visibilityStorageKey(user?.id)) ?? 'Lawyers Only');
  const [theme, setTheme] = useState<Theme>(() => getSavedTheme(user?.id));
  const [fontScale, setFontScale] = useState<number>(() => getSavedFontScale(user?.id));
  const [notificationPrefs, setNotificationPrefs] = useState(() => loadValue(NOTIF_PREFS_KEY, DEFAULT_NOTIF_PREFS));
  const [password, setPassword] = useState({ current: '', next: '', confirm: '' });
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [requestingExport, setRequestingExport] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    applyTheme(theme, user?.id);
  }, [theme, user?.id]);

  useEffect(() => {
    applyFontScale(fontScale, user?.id);
  }, [fontScale, user?.id]);

// Fetch notification preferences from backend on mount
  useEffect(() => {
    if (!token) return;
    fetch(`/api/user/notification-preferences`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })
      .then(async (res) => {
        if (!res.ok) return;
        const data = (await res.json()) as { preferences?: Record<string, boolean> };
        if (data?.preferences) {
          const map = new Map<string, boolean>(Object.entries(data.preferences));
          setNotificationPrefs(
            DEFAULT_NOTIF_PREFS.map((item) => ({
              ...item,
              email: map.get(`${item.id}_email`) ?? item.email,
              sms: map.get(`${item.id}_sms`) ?? item.sms,
            }))
          );
        }
      })
      .catch(() => {});
  }, [token]);

  const handleThemeChange = (next: Theme) => {
    setTheme(next);
    applyTheme(next, user?.id);
    toast.success(next === 'system' ? 'Theme set to System Default' : `Theme set to ${next === 'light' ? 'Light' : 'Dark'}`);
  };

  const handleFontChange = (scale: number) => {
    setFontScale(scale);
    applyFontScale(scale, user?.id);
    toast.success(scale === 0.875 ? 'Text size: Small' : scale === 1.125 ? 'Text size: Large' : 'Text size: Default');
  };

  useEffect(() => {
    if (!savedVisibility) return;
    const label = visibilityToLabel(savedVisibility.visibility);
    setVisibility(label);
    localStorage.setItem(visibilityStorageKey(user?.id), label);
  }, [savedVisibility, user?.id]);

  const handleVisibilityChange = (opt: string) => {
    const prev = visibility;
    const next = opt;
    setVisibility(next);
    localStorage.setItem(visibilityStorageKey(user?.id), next);
    updateVisibilityMutation.mutate(
      { data: { visibility: labelToVisibility(next) } },
      {
        onSuccess: () => toast.success(`Profile visibility set to "${next}"`),
        onError: (err) => {
          setVisibility(prev);
          localStorage.setItem(visibilityStorageKey(user?.id), prev);
          if (err instanceof ApiError && err.status === 401) {
            signOut();
            toast.error('Your session has expired. Please log in again.');
          } else {
            toast.error('Could not save visibility. Please try again.');
          }
        },
      },
    );
  };

const toggleNotif = async (id: string, channel: 'email' | 'sms') => {
  const current = notificationPrefs.find((n) => n.id === id);
  if (!current) return;
  const newValue = channel === 'email' ? !current.email : !current.sms;
  setNotificationPrefs((prev) => {
    const next = prev.map((n) => {
      if (n.id !== id) return n;
      return channel === 'email' ? { ...n, email: newValue } : { ...n, sms: newValue };
    });
    localStorage.setItem(NOTIF_PREFS_KEY, JSON.stringify(next));
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
  } catch {
    setNotificationPrefs((prev) => {
      const next = prev.map((n) => {
        if (n.id !== id) return n;
        return channel === 'email' ? { ...n, email: !newValue } : { ...n, sms: !newValue };
      });
      localStorage.setItem(NOTIF_PREFS_KEY, JSON.stringify(next));
      return next;
    });
    toast.error('Could not save notification preference. Please try again.');
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

  const latestExport = dataExports?.[0];

  const requestDataExport = async () => {
    setRequestingExport(true);
    try {
      await createDataExportMutation.mutateAsync();
      await refetchDataExports();
      toast.success('Data export requested. An admin will review and grant it shortly.');
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        signOut();
        toast.error('Your session has expired. Please log in again.');
      } else if (err instanceof ApiError && err.status === 409) {
        toast.error('A data export request is already pending for your account.');
      } else {
        toast.error(err instanceof Error ? err.message : 'Failed to request data export. Please try again.');
      }
    } finally {
      setRequestingExport(false);
    }
  };

  const downloadData = () => {
    setExporting(true);
    setTimeout(() => {
      const zip = buildZip([
        { name: 'profile.json', content: JSON.stringify(user ?? {}, null, 2) },
        { name: 'appointments.json', content: JSON.stringify(appointments ?? [], null, 2) },
        { name: 'documents.json', content: JSON.stringify(documents ?? [], null, 2) },
        { name: 'notifications.json', content: JSON.stringify(notifications ?? [], null, 2) },
        { name: 'notification-preferences.json', content: JSON.stringify(notificationPrefs, null, 2) },
        { name: 'profile-visibility.json', content: JSON.stringify({ visibility }, null, 2) },
      ]);
      const url = URL.createObjectURL(zip);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'nyayaconnect-data-export.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setExporting(false);
      toast.success('Data export downloaded');
    }, 400);
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

  const sections = [
    { id: 'security', label: 'Account Security', icon: ShieldCheck },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Privacy & Data', icon: Eye },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'help', label: 'Help & Support', icon: HelpCircle },
  ];

  // Custom Toggle Component
  const CustomToggle = ({ checked, onChange }: { checked: boolean, onChange: () => void }) => (
    <button 
      onClick={onChange}
      className={cn(
        "relative w-12 h-6 rounded-full transition-colors duration-300 outline-none",
        checked ? "bg-[#D4AF37]" : "bg-white/10"
      )}
    >
      <div className={cn(
        "absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform duration-300",
        checked ? "translate-x-6" : "translate-x-0"
      )} />
    </button>
  );

  const renderSectionContent = () => {
    switch (activeSection) {
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

      case 'privacy':
        return (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-8">
            <div>
              <h3 className="text-xl font-serif font-bold mb-4">Profile Visibility</h3>
              <div className="flex gap-4 max-w-2xl">
                {["Public", "Lawyers Only", "Private"].map((opt) => (
                  <label key={opt} className="flex-1 cursor-pointer relative">
                    <input
                      type="radio"
                      name="visibility"
                      className="peer sr-only"
                      checked={visibility === opt}
                      onChange={() => handleVisibilityChange(opt)}
                    />
                    <div className="h-full p-4 rounded-xl border border-white/10 bg-white/5 peer-checked:border-[#D4AF37] peer-checked:bg-[#D4AF37]/10 transition-all text-center">
                      <div className="font-semibold text-sm mb-1 peer-checked:text-[#D4AF37]">{opt}</div>
                      <div className="text-[11px] text-gray-500 peer-checked:text-gray-400">
                        {opt === 'Public' ? 'Visible to everyone on NyayaConnect' :
                         opt === 'Lawyers Only' ? 'Visible to lawyers only' :
                         'Hidden from all other users'}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="border-t border-white/10 pt-8">
              <h3 className="text-xl font-serif font-bold mb-2 flex items-center gap-2">
                <Download className="w-5 h-5 text-[#D4AF37]" /> Download My Data
              </h3>
              <p className="text-sm text-gray-400 mb-4 max-w-xl">Request a copy of your personal data, appointments, and uploaded documents. An admin must approve the request before the download becomes available.</p>

              {latestExport?.status === 'pending' && (
                <div className="flex flex-col gap-3 max-w-xl">
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-sm">
                    <Clock className="w-5 h-5 shrink-0" />
                    <div>
                      <div className="font-semibold">Request pending admin approval</div>
                      <div className="text-amber-300/70 text-xs mt-0.5">Requested {new Date(latestExport.requestedAt).toLocaleString()}. You'll be able to download once granted.</div>
                    </div>
                  </div>
                  <button disabled className="bg-transparent border border-white/20 text-white/50 font-semibold py-2.5 px-6 rounded-xl cursor-not-allowed">
                    Request Pending…
                  </button>
                </div>
              )}

              {latestExport?.status === 'granted' && (
                <div className="flex flex-col gap-3 max-w-xl">
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-green-500/10 border border-green-500/30 text-green-400 text-sm">
                    <CheckCircle2 className="w-5 h-5 shrink-0" />
                    <div>
                      <div className="font-semibold">Your data export request was granted</div>
                      <div className="text-green-400/70 text-xs mt-0.5">Approved {latestExport.decidedAt ? new Date(latestExport.decidedAt).toLocaleString() : ''}. Download a copy of your live data.</div>
                    </div>
                  </div>
                  <button onClick={downloadData} disabled={exporting} className="bg-[#D4AF37] hover:bg-[#c4a133] text-[#102542] font-bold py-2.5 px-6 rounded-xl transition-colors disabled:opacity-60 w-fit">
                    {exporting ? 'Generating...' : 'Download My Data'}
                  </button>
                </div>
              )}

              {latestExport?.status === 'denied' && (
                <div className="flex flex-col gap-3 max-w-xl">
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                    <XCircle className="w-5 h-5 shrink-0" />
                    <div>
                      <div className="font-semibold">Your data export request was denied</div>
                      <div className="text-red-400/70 text-xs mt-0.5">{latestExport.reason ? `Reason: ${latestExport.reason}` : 'No reason was provided.'}</div>
                    </div>
                  </div>
                  <button onClick={requestDataExport} disabled={requestingExport} className="bg-transparent border border-white/20 hover:bg-white/10 text-white font-semibold py-2.5 px-6 rounded-xl transition-colors disabled:opacity-60 w-fit">
                    {requestingExport ? 'Requesting...' : 'Request Again'}
                  </button>
                </div>
              )}

              {!latestExport && (
                <button onClick={requestDataExport} disabled={requestingExport} className="bg-transparent border border-white/20 hover:bg-white/10 text-white font-semibold py-2.5 px-6 rounded-xl transition-colors disabled:opacity-60">
                  {requestingExport ? 'Requesting...' : 'Request Data Export'}
                </button>
              )}
            </div>

            <div className="border-t border-red-500/20 pt-8">
              <h3 className="text-xl font-serif font-bold mb-2 flex items-center gap-2 text-red-400">
                <AlertTriangle className="w-5 h-5" /> Danger Zone
              </h3>
              <p className="text-sm text-gray-400 mb-4 max-w-xl">Permanently delete your account and all associated data. This action cannot be undone.</p>
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
                      <input type="radio" name="theme" className="peer sr-only" checked={theme === value} onChange={() => handleThemeChange(value)} />
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
                    onClick={() => handleFontChange(opt.scale)}
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
              <p className="text-sm text-gray-400 mb-4 max-w-xl">Find quick answers about consultations, payments, documents, and more.</p>
              <Link to="/faq" className="inline-flex items-center gap-2 bg-transparent border border-white/20 hover:bg-white/10 text-white font-semibold py-2.5 px-6 rounded-xl transition-colors">
                Visit Help Center <ExternalLink className="w-4 h-4" />
              </Link>
            </div>

            <div className="border-t border-white/10 pt-8">
              <h3 className="text-xl font-serif font-bold mb-2">Report an Issue</h3>
              <p className="text-sm text-gray-400 mb-4 max-w-xl">Facing a problem with a booking, payment, or document? Our team will get back to you within 24 hours.</p>
              <Link to="/contact" className="bg-[#D4AF37] text-[#102542] font-bold py-3 px-6 rounded-xl hover:bg-[#c4a133] transition-colors inline-flex items-center gap-2">
                Report an Issue
              </Link>
            </div>
          </motion.div>
        );

      default:
        return (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-20 text-center text-gray-400">
            <Cog className="w-16 h-16 mb-4 opacity-20" />
            <h3 className="font-serif text-2xl font-bold mb-2 text-white">Work in Progress</h3>
            <p>This settings section is currently under construction.</p>
          </motion.div>
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

export default Settings;