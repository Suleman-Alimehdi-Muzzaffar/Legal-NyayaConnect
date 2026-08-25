import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  User as UserIcon,
  Mail, 
  Phone, 
  Hash,
  MapPin,
  Shield,
  Star,
  CheckCircle2,
  Briefcase,
  IndianRupee,
  Camera,
  Trash2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { avatarUrl } from '@/lib/avatar';
import FormInput from '@/components/forms/FormInput';
import FormSelect from '@/components/forms/FormSelect';
import FormTextarea from '@/components/forms/FormTextarea';
import { useGetLawyerDashboard, getListLawyersQueryKey, getGetLawyerDashboardQueryKey } from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/lib/auth-context';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

const LawyerProfile = () => {
  const queryClient = useQueryClient();
  const { data: lawyerData } = useGetLawyerDashboard();
  const { user, token, updateUser, signOut } = useAuth();
  const loggedInLawyer = lawyerData ?? { name: "", initials: "", gradient: "", specialization: "", city: "", rating: 0, reviewCount: 0, isVerified: false, isPremium: false, email: "", phone: "", experience: 0, casesWon: 0, totalCases: 0, consultationFee: 0 };

  const [formData, setFormData] = useState({
    fullName: loggedInLawyer.name,
    email: loggedInLawyer.email,
    phone: loggedInLawyer.phone,
    bci: user?.bci ?? '',
    experience: user?.experience ?? (loggedInLawyer.experience ? String(loggedInLawyer.experience) : ''),
    address: user?.address ?? '',
    fee: user?.fee ?? (loggedInLawyer.consultationFee ? String(loggedInLawyer.consultationFee) : ''),
    bio: user?.bio ?? '',
    avatar: user?.avatar ?? ''
  });
  const [saving, setSaving] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const practiceAreas = ["Family Law", "Divorce", "Child Custody", "Property", "Criminal", "Corporate", "Tax", "Cyber"];
  const [selectedAreas, setSelectedAreas] = useState<string[]>(user?.practiceAreas ?? []);
  
  const languages = ["English", "Hindi", "Marathi", "Gujarati", "Tamil", "Telugu", "Kannada", "Malayalam"];
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(user?.languages ?? []);

  const profileCompletion = (() => {
    const fields = [formData.fullName, formData.email, formData.phone, formData.bci, formData.experience, formData.address, formData.fee, formData.bio];
    const filled = fields.filter((f) => typeof f === 'string' ? f.trim() !== '' : f != null).length;
    return filled / fields.length;
  })();

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
        queryClient.invalidateQueries({ queryKey: getListLawyersQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetLawyerDashboardQueryKey() });
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
        queryClient.invalidateQueries({ queryKey: getListLawyersQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetLawyerDashboardQueryKey() });
        toast.success('Profile photo removed');
      })
      .catch(() => toast.error('Failed to remove photo. Please try again.'));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/account/profile', {
        method: 'PATCH',
        headers: {
          'content-type': 'application/json',
          ...(token ? { authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          name: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          avatar: formData.avatar,
          bci: formData.bci,
          experience: formData.experience,
          address: formData.address,
          fee: formData.fee,
          bio: formData.bio,
          practiceAreas: selectedAreas,
          languages: selectedLanguages,
        }),
      });
      if (res.status === 401) {
        signOut();
        toast.error('Your session has expired. Please log in again.');
        return;
      }
      if (!res.ok) throw new Error(`Save failed (HTTP ${res.status})`);
      const data = await res.json();
      updateUser(data.user);
      queryClient.invalidateQueries({ queryKey: getListLawyersQueryKey() });
      queryClient.invalidateQueries({ queryKey: getGetLawyerDashboardQueryKey() });
      toast.success('Profile changes saved');
    } catch {
      toast.error('Failed to save changes. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 md:gap-8 max-w-6xl mx-auto">
      
      {/* Profile Hero Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card rounded-3xl p-8 border border-white/10 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-[#D4AF37]/10 to-transparent pointer-events-none" />
        
        <div className="flex flex-col md:flex-row items-center md:items-start gap-8 relative z-10">
          <div className="flex flex-col items-center gap-3">
            <div className="relative group cursor-pointer shrink-0" onClick={() => avatarInputRef.current?.click()}>
              <div className={cn("w-24 h-24 md:w-32 md:h-32 rounded-full flex items-center justify-center font-serif text-4xl font-bold text-[#102542] border-4 border-[#102542] ring-4 ring-[#D4AF37]/30 shadow-[0_0_30px_rgba(212,175,55,0.4)] overflow-hidden bg-gradient-to-br", loggedInLawyer.gradient)}>
                {formData.avatar ? (
                  <img src={avatarUrl(formData.avatar)} alt={formData.fullName} className="w-full h-full object-cover" />
                ) : (
                  loggedInLawyer.initials
                )}
              </div>
              <div className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white backdrop-blur-sm">
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
            <h1 className="font-serif text-3xl md:text-4xl font-bold mb-2">{loggedInLawyer.name}</h1>
            <div className="text-[#D4AF37] font-semibold text-lg mb-3">{loggedInLawyer.specialization}</div>
            
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-4">
              <span className="flex items-center gap-1 text-sm text-gray-300">
                <Star className="w-4 h-4 text-[#D4AF37]" fill="currentColor" />
                <span className="font-bold text-white">{loggedInLawyer.rating}</span> ({loggedInLawyer.reviewCount} reviews)
              </span>
              <span className="text-gray-500">•</span>
              <span className="text-sm text-gray-300">
                <span className="font-bold text-white">{loggedInLawyer.casesWon}</span> cases won
              </span>
            </div>

            <div className="flex gap-2 justify-center md:justify-start">
              {loggedInLawyer.isVerified && (
                <span className="flex items-center gap-1 bg-green-500/10 text-green-400 border border-green-500/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                  <Shield className="w-3 h-3" /> Verified
                </span>
              )}
              {loggedInLawyer.isPremium && (
                <span className="flex items-center gap-1 bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                  <Star className="w-3 h-3" fill="currentColor" /> Premium
                </span>
              )}
            </div>

            <div className="max-w-md w-full mt-6">
              <div className="flex justify-between text-xs font-medium text-gray-400 mb-1.5">
                <span>Profile Completion</span>
                <span className="text-[#D4AF37]">{Math.round(profileCompletion * 100)}%</span>
              </div>
              <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.round(profileCompletion * 100)}%` }}
                  transition={{ duration: 1, delay: 0.5 }}
                  className="h-full bg-[#D4AF37]"
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
              Professional Information
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
                label="Bar Council Reg. No." name="bci" icon={Hash}
                value={formData.bci} onChange={e => setFormData({...formData, bci: e.target.value})}
              />
              <FormSelect 
                label="Experience" name="experience" 
                value={formData.experience} onChange={e => setFormData({...formData, experience: e.target.value})}
                options={[
                  {label:"1-5 years", value:"5"}, {label:"5-10 years", value:"10"}, {label:"10-15 years", value:"12"}, {label:"15+ years", value:"20"}
                ]}
              />
              <FormInput 
                label="Consultation Fee (₹)" name="fee" icon={IndianRupee} type="number"
                value={formData.fee} onChange={e => setFormData({...formData, fee: e.target.value})}
              />
              <div className="md:col-span-2">
                <FormTextarea 
                  label="Office Address" name="address" rows={3}
                  value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})}
                />
              </div>
            </div>
          </div>

          <div className="glass-card rounded-3xl p-6 md:p-8 border border-white/10">
            <h3 className="font-serif text-xl font-bold mb-6 flex items-center gap-2">
              <span className="w-2 h-6 bg-[#D4AF37] rounded-full inline-block" />
              Practice & Languages
            </h3>
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="block font-sans text-sm font-medium text-gray-300 mb-3">Practice Areas</label>
                <div className="flex flex-wrap gap-2">
                  {practiceAreas.map(area => (
                    <button
                      key={area}
                      onClick={() => setSelectedAreas(prev => prev.includes(area) ? prev.filter(a => a !== area) : [...prev, area])}
                      className={cn(
                        "px-4 py-2 rounded-full text-sm font-medium transition-all border cursor-pointer",
                        selectedAreas.includes(area)
                          ? "bg-[#D4AF37]/20 border-[#D4AF37] text-[#D4AF37]"
                          : "bg-white/5 border-white/10 text-gray-400 hover:border-white/30"
                      )}
                    >
                      {area}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block font-sans text-sm font-medium text-gray-300 mb-3">Languages Spoken</label>
                <div className="flex flex-wrap gap-2">
                  {languages.map(lang => (
                    <button
                      key={lang}
                      onClick={() => setSelectedLanguages(prev => prev.includes(lang) ? prev.filter(l => l !== lang) : [...prev, lang])}
                      className={cn(
                        "px-4 py-2 rounded-full text-sm font-medium transition-all border cursor-pointer",
                        selectedLanguages.includes(lang)
                          ? "bg-[#D4AF37]/20 border-[#D4AF37] text-[#D4AF37]"
                          : "bg-white/5 border-white/10 text-gray-400 hover:border-white/30"
                      )}
                    >
                      {lang}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="glass-card rounded-3xl p-6 md:p-8 border border-white/10">
            <h3 className="font-serif text-xl font-bold mb-6 flex items-center gap-2">
              <span className="w-2 h-6 bg-[#D4AF37] rounded-full inline-block" />
              Professional Bio
            </h3>
            <FormTextarea 
              label="About You" name="bio" rows={5} maxLength={1000}
              value={formData.bio} onChange={e => setFormData({...formData, bio: e.target.value})}
              hint="Write a short, engaging bio highlighting your expertise and experience. This will be visible on your public profile."
            />
            <div className="mt-6">
              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full bg-[#D4AF37] hover:bg-[#c4a133] text-[#102542] font-bold px-8 py-4 rounded-xl transition-all shadow-[0_4px_15px_rgba(212,175,55,0.3)] hover:-translate-y-0.5 disabled:opacity-60 disabled:hover:translate-y-0"
              >
                {saving ? 'Saving...' : 'Save All Changes'}
              </button>
            </div>
          </div>

        </div>

        {/* Right Column: Stats & Verification */}
        <div className="lg:w-80 shrink-0 flex flex-col gap-6">
          
          <div className="glass-card rounded-3xl p-6 border border-green-500/20 bg-green-500/5 relative overflow-hidden">
            <div className="absolute -right-4 -top-4 text-green-500/10 pointer-events-none">
              <Shield className="w-32 h-32" />
            </div>
            <div className="relative z-10">
              <h3 className="font-serif text-lg font-bold text-green-400 mb-4 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5" /> Verified Lawyer
              </h3>
              <ul className="text-sm text-gray-300 flex flex-col gap-2">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-400" /> Bar Council ID Verified</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-400" /> Identity Verified</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-400" /> Education Verified</li>
              </ul>
            </div>
          </div>

          <div className="glass-card rounded-3xl p-6 border border-white/10 flex flex-col gap-4">
            <h3 className="font-serif text-lg font-bold border-b border-white/10 pb-3">Account Stats</h3>
            <div className="flex items-center justify-between py-2 border-b border-white/5">
              <span className="text-gray-400 text-sm flex items-center gap-2"><Briefcase className="w-4 h-4" /> Total Cases</span>
              <span className="font-bold text-lg text-white">{loggedInLawyer.totalCases}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-white/5">
              <span className="text-gray-400 text-sm flex items-center gap-2"><UserIcon className="w-4 h-4" /> Total Clients</span>
              <span className="font-bold text-lg text-white">{loggedInLawyer.totalCases || 0}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-white/5">
              <span className="text-gray-400 text-sm flex items-center gap-2"><Star className="w-4 h-4" /> Reviews</span>
              <span className="font-bold text-lg text-white">{loggedInLawyer.reviewCount}</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-gray-400 text-sm">Experience</span>
              <span className="text-gray-300 text-sm">{loggedInLawyer.experience ? `${loggedInLawyer.experience} years` : 'N/A'}</span>
            </div>
          </div>

          <div className="glass-card rounded-3xl p-6 border border-white/10">
            <h3 className="font-serif text-lg font-bold border-b border-white/10 pb-3 mb-4">Recent Reviews</h3>
            <div className="flex flex-col gap-4">
              {[
                { r: 5, text: "Very professional and empathetic..." },
                { r: 5, text: "Excellent strategy, kept me informed..." }
              ].map((rev, i) => (
                <div key={i} className="bg-white/5 p-3 rounded-xl border border-white/5">
                  <div className="flex gap-1 text-[#D4AF37] mb-1">
                    {[...Array(5)].map((_, j) => <Star key={j} className="w-3 h-3" fill="currentColor" />)}
                  </div>
                  <p className="text-xs text-gray-400 italic line-clamp-2">"{rev.text}"</p>
                </div>
              ))}
            </div>
            <Link to="/lawyer-dashboard/reviews" className="text-xs text-[#D4AF37] hover:underline font-semibold mt-4 block text-center">
              Read All Reviews
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
};

export default LawyerProfile;
