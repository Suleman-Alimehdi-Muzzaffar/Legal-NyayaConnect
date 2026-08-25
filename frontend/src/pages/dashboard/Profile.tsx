import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  Camera, 
  Shield, 
  MapPin, 
  Mail, 
  Phone, 
  User as UserIcon,
  Calendar,
  Briefcase,
  Award,
  Trash2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { avatarUrl } from '@/lib/avatar';
import FormInput from '@/components/forms/FormInput';
import FormSelect from '@/components/forms/FormSelect';
import { useAuth } from '@/lib/auth-context';
import { useListAppointments, useListDocuments } from '@workspace/api-client-react';
import { toast } from 'sonner';

const INDIAN_STATES = [
  "Andaman and Nicobar Islands",
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chandigarh",
  "Chhattisgarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jammu and Kashmir",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Ladakh",
  "Lakshadweep",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Puducherry",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal"
].sort();

const Profile = () => {
  const { user, token, updateUser, signOut } = useAuth();
  const { data: appointments } = useListAppointments();
  const { data: documents } = useListDocuments();
  const appointmentsList = appointments ?? [];
  const documentsList = documents ?? [];

  const [formData, setFormData] = useState({
    fullName: user?.name ?? '',
    email: user?.email ?? '',
    phone: user?.phone ?? '',
    dob: user?.dob ?? '',
    gender: user?.gender ?? '',
    street: user?.street ?? '',
    city: user?.city ?? '',
    state: user?.state ?? '',
    pincode: user?.pincode ?? '',
    language: user?.language ?? 'English',
    communication: user?.communication ?? 'Email',
    avatar: user?.avatar ?? ''
  });
  const [saving, setSaving] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const nameParts = (formData.fullName || user?.name || '').split(' ').filter(Boolean);
  const initials = nameParts.length > 0 ? nameParts.map(p => p[0]).slice(0, 2).join('').toUpperCase() : 'U';

  const [legalInterests, setLegalInterests] = useState<string[]>(["Property", "Corporate", "Tax", "Cyber"]);

  const myLawyers = appointmentsList
    .map(a => ({ name: a.lawyerName, spec: a.specialization, avatar: a.lawyerAvatar, color: a.lawyerGradient }))
    .filter((l, i, arr) => arr.findIndex(x => x.name === l.name) === i);

  const handleAvatarChange = (file: File | undefined | null) => {
    if (!file) return;
    const form = new FormData();
    form.append('avatar', file);
    fetch('/api/account/avatar', {
      method: 'POST',
      headers: token ? { authorization: `Bearer ${token}` } : undefined,
      body: form,
    })
      .then(async (res) => {
        if (res.status === 401) {
          signOut();
          toast.error('Your session has expired. Please log in again.');
          return;
        }
        if (!res.ok) throw new Error(`Upload failed (HTTP ${res.status})`);
        const data = await res.json();
        setFormData(prev => ({ ...prev, avatar: data.avatar }));
        updateUser({ avatar: data.avatar });
        toast.success('Profile photo updated');
      })
      .catch(() => toast.error('Failed to upload photo. Please try again.'));
  };

  const handleRemoveAvatar = () => {
    fetch('/api/account/avatar', {
      method: 'DELETE',
      headers: token ? { authorization: `Bearer ${token}` } : undefined,
    })
      .then(async (res) => {
        if (res.status === 401) {
          signOut();
          toast.error('Your session has expired. Please log in again.');
          return;
        }
        if (!res.ok) throw new Error(`Remove failed (HTTP ${res.status})`);
        setFormData(prev => ({ ...prev, avatar: '' }));
        updateUser({ avatar: '' });
        toast.success('Profile photo removed');
      })
      .catch(() => toast.error('Failed to remove photo. Please try again.'));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = { ...formData, name: formData.fullName, practiceAreas: legalInterests };
      const res = await fetch('/api/account/profile', {
        method: 'PATCH',
        headers: {
          'content-type': 'application/json',
          ...(token ? { authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });
      if (res.status === 401) {
        signOut();
        toast.error('Your session has expired. Please log in again.');
        return;
      }
      if (!res.ok) throw new Error(`Save failed (HTTP ${res.status})`);
      const data = await res.json();
      updateUser(data.user);
      toast.success('Profile changes saved');
    } catch {
      toast.error('Failed to save changes. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 md:gap-8 max-w-6xl mx-auto">
      
      {/* Hero Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card rounded-3xl p-8 border border-white/10 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-[#D4AF37]/10 to-transparent pointer-events-none" />
        
        <div className="flex flex-col md:flex-row items-center md:items-start gap-8 relative z-10">
          
          <div className="flex flex-col items-center gap-3">
            <div className="relative group cursor-pointer" onClick={() => avatarInputRef.current?.click()}>
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#8c7324] flex items-center justify-center font-serif text-4xl font-bold text-[#102542] border-4 border-[#102542] ring-4 ring-[#D4AF37]/30 shadow-[0_0_30px_rgba(212,175,55,0.4)] overflow-hidden">
                {formData.avatar ? (
                  <img src={avatarUrl(formData.avatar)} alt={formData.fullName} className="w-full h-full object-cover" />
                ) : (
                  initials
                )}
              </div>
              <div className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white backdrop-blur-sm border-4 border-transparent">
                <Camera className="w-8 h-8" />
              </div>
            </div>
            {formData.avatar && (
              <button
                type="button"
                onClick={handleRemoveAvatar}
                className="flex items-center gap-1.5 text-xs font-semibold text-red-400 border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 rounded-full px-3 py-1.5 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Remove Photo
              </button>
            )}
          </div>
          <input
            ref={avatarInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => { handleAvatarChange(e.target.files?.[0]); e.target.value = ''; }}
          />

          <div className="flex-1 text-center md:text-left">
            <h1 className="font-serif text-3xl md:text-4xl font-bold mb-2">{formData.fullName || 'Your Name'}</h1>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-4">
              <span className="bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                Client Account
              </span>
              <span className="flex items-center gap-1 text-sm text-gray-400">
                <Shield className="w-4 h-4 text-green-400" /> Verified Member
              </span>
            </div>

            <div className="max-w-md w-full mt-6">
              <div className="flex justify-between text-xs font-medium text-gray-400 mb-1.5">
                <span>Profile Completion</span>
                <span className="text-[#D4AF37]">{formData.phone && formData.city && formData.state ? '100%' : '75%'}</span>
              </div>
              <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: formData.phone && formData.city && formData.state ? "100%" : "75%" }}
                  transition={{ duration: 1, delay: 0.5 }}
                  className="h-full bg-gradient-to-r from-[#D4AF37] to-[#ffe58f]"
                />
              </div>
            </div>
          </div>

        </div>
      </motion.div>

      <div className="flex flex-col lg:flex-row gap-6 md:gap-8">
        
        {/* Left Column: Form */}
        <div className="flex-1 flex flex-col gap-6">
          
          <div className="glass-card rounded-3xl p-6 md:p-8 border border-white/10">
            <h3 className="font-serif text-xl font-bold mb-6 flex items-center gap-2">
              <span className="w-2 h-6 bg-[#D4AF37] rounded-full inline-block" />
              Personal Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormInput 
                label="Full Name" name="fullName" icon={UserIcon}
                value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})}
              />
              <FormInput 
                label="Email Address" name="email" icon={Mail} type="email"
                value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}
              />
              <FormInput 
                label="Phone Number" name="phone" icon={Phone}
                value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})}
              />
              <FormInput 
                label="Date of Birth" name="dob" icon={Calendar} type="date"
                value={formData.dob} onChange={e => setFormData({...formData, dob: e.target.value})}
              />
              <FormSelect 
                label="Gender" name="gender" 
                value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})}
                options={[
                  {label:"Male", value:"Male"}, {label:"Female", value:"Female"}, {label:"Other", value:"Other"}
                ]}
              />
            </div>
          </div>

          <div className="glass-card rounded-3xl p-6 md:p-8 border border-white/10">
            <h3 className="font-serif text-xl font-bold mb-6 flex items-center gap-2">
              <span className="w-2 h-6 bg-[#D4AF37] rounded-full inline-block" />
              Address Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <FormInput 
                  label="Street Address" name="street" icon={MapPin}
                  value={formData.street} onChange={e => setFormData({...formData, street: e.target.value})}
                />
              </div>
              <FormInput 
                label="City" name="city"
                value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})}
              />
              <FormSelect 
                label="State" name="state" 
                value={formData.state} onChange={e => setFormData({...formData, state: e.target.value})}
                options={INDIAN_STATES.map(s => ({ label: s, value: s }))}
              />
              <FormInput 
                label="PIN Code" name="pincode"
                value={formData.pincode} onChange={e => setFormData({...formData, pincode: e.target.value})}
              />
            </div>
          </div>

          <div className="glass-card rounded-3xl p-6 md:p-8 border border-white/10">
            <h3 className="font-serif text-xl font-bold mb-6 flex items-center gap-2">
              <span className="w-2 h-6 bg-[#D4AF37] rounded-full inline-block" />
              Preferences
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormSelect 
                label="Preferred Language" name="language" 
                value={formData.language} onChange={e => setFormData({...formData, language: e.target.value})}
                options={[
                  {label:"English", value:"English"}, {label:"Hindi", value:"Hindi"}, {label:"Marathi", value:"Marathi"}
                ]}
              />
              <FormSelect 
                label="Communication Mode" name="communication" 
                value={formData.communication} onChange={e => setFormData({...formData, communication: e.target.value})}
                options={[
                  {label:"Email Only", value:"Email"}, {label:"Email + SMS", value:"Both"}, {label:"WhatsApp", value:"WhatsApp"}
                ]}
              />
              
              <div className="md:col-span-2 mt-2">
                <label className="block font-sans text-sm font-medium text-gray-300 mb-3">Legal Areas of Interest</label>
                <div className="flex flex-wrap gap-2">
                  {["Property", "Family", "Corporate", "Criminal", "Tax", "Cyber", "Consumer"].map(area => (
                    <button
                      key={area}
                      type="button"
                      onClick={() => setLegalInterests(prev => prev.includes(area) ? prev.filter(a => a !== area) : [...prev, area])}
                      className={cn(
                        "px-4 py-2 rounded-full text-sm font-medium transition-all border",
                        legalInterests.includes(area)
                          ? "bg-[#D4AF37]/20 border-[#D4AF37] text-[#D4AF37]"
                          : "bg-white/5 border-white/10 text-gray-400 hover:border-white/30"
                      )}
                    >
                      {area}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-[#D4AF37] hover:bg-[#c4a133] text-[#102542] font-bold px-8 py-4 rounded-xl transition-all shadow-[0_4px_15px_rgba(212,175,55,0.3)] hover:-translate-y-0.5 disabled:opacity-60 disabled:hover:translate-y-0"
            >
              {saving ? 'Saving...' : 'Save All Changes'}
            </button>
          </div>

        </div>

        {/* Right Column: Stats & Activity */}
        <div className="lg:w-80 shrink-0 flex flex-col gap-6">
          
          <div className="glass-card rounded-3xl p-6 border border-white/10 flex flex-col gap-4">
            <h3 className="font-serif text-lg font-bold border-b border-white/10 pb-3">Account Overview</h3>
            <div className="flex items-center justify-between py-2 border-b border-white/5">
              <span className="text-gray-400 text-sm flex items-center gap-2"><Briefcase className="w-4 h-4" /> Cases Handled</span>
              <span className="font-bold text-lg text-white">{appointmentsList.length}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-white/5">
              <span className="text-gray-400 text-sm flex items-center gap-2"><UserIcon className="w-4 h-4" /> Lawyers Consulted</span>
              <span className="font-bold text-lg text-white">{myLawyers.length}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-white/5">
              <span className="text-gray-400 text-sm flex items-center gap-2"><FileIcon className="w-4 h-4" /> Documents</span>
              <span className="font-bold text-lg text-white">{documentsList.length}</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-gray-400 text-sm flex items-center gap-2"><Award className="w-4 h-4" /> Account Status</span>
              <span className="text-green-400 font-bold text-sm bg-green-500/10 px-2 py-1 rounded">Active</span>
            </div>
          </div>

          <div className="glass-card rounded-3xl p-6 border border-white/10">
            <h3 className="font-serif text-lg font-bold border-b border-white/10 pb-3 mb-4">My Lawyers</h3>
            <div className="flex flex-col gap-4">
              {myLawyers.length === 0 && (
                <p className="text-sm text-gray-400">No consultations yet. Book your first appointment to get started.</p>
              )}
              {myLawyers.map((l, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className={cn("w-10 h-10 rounded-full flex items-center justify-center font-serif font-bold text-white shadow-inner bg-gradient-to-br overflow-hidden", l.color || 'from-[#D4AF37] to-[#8c7324]')}>
                    {l.avatar ? (
                      <img src={avatarUrl(l.avatar)} alt={l.name} className="w-full h-full object-cover" />
                    ) : (
                      l.name.split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase()
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-sm text-white truncate">{l.name}</h4>
                    <p className="text-xs text-gray-400 truncate">{l.spec}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

const FileIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
  </svg>
);

export default Profile;
