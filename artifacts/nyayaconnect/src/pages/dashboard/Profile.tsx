import React, { useState } from 'react';
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
  Award
} from 'lucide-react';
import { cn } from '@/lib/utils';
import FormInput from '@/components/forms/FormInput';
import FormSelect from '@/components/forms/FormSelect';

const Profile = () => {
  const [formData, setFormData] = useState({
    fullName: 'Rahul Mehta',
    email: 'rahul@email.com',
    phone: '+91 98765 43210',
    dob: '1985-04-12',
    gender: 'Male',
    street: '123/4 Lotus Apartments',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400050',
    language: 'English',
    communication: 'Email'
  });

  const legalInterests = ["Property", "Corporate", "Tax", "Cyber"];

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
          
          <div className="relative group cursor-pointer">
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#8c7324] flex items-center justify-center font-serif text-4xl font-bold text-[#102542] border-4 border-[#102542] ring-4 ring-[#D4AF37]/30 shadow-[0_0_30px_rgba(212,175,55,0.4)]">
              RM
            </div>
            <div className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white backdrop-blur-sm border-4 border-transparent">
              <Camera className="w-8 h-8" />
            </div>
          </div>

          <div className="flex-1 text-center md:text-left">
            <h1 className="font-serif text-3xl md:text-4xl font-bold mb-2">{formData.fullName}</h1>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-4">
              <span className="bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                Client Account
              </span>
              <span className="flex items-center gap-1 text-sm text-gray-400">
                <Shield className="w-4 h-4 text-green-400" /> Verified Member
              </span>
              <span className="text-sm text-gray-400 border-l border-white/10 pl-3">
                Since March 2024
              </span>
            </div>

            <div className="max-w-md w-full mt-6">
              <div className="flex justify-between text-xs font-medium text-gray-400 mb-1.5">
                <span>Profile Completion</span>
                <span className="text-[#D4AF37]">75%</span>
              </div>
              <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: "75%" }}
                  transition={{ duration: 1, delay: 0.5 }}
                  className="h-full bg-gradient-to-r from-[#D4AF37] to-[#ffe58f]"
                />
              </div>
            </div>
          </div>

          <div className="shrink-0 flex gap-3 w-full md:w-auto">
            <button className="flex-1 md:flex-none bg-[#D4AF37] hover:bg-[#c4a133] text-[#102542] font-bold px-6 py-3 rounded-xl transition-all shadow-[0_4px_15px_rgba(212,175,55,0.3)] hover:-translate-y-0.5">
              Edit Profile
            </button>
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
                options={[
                  {label:"Maharashtra", value:"Maharashtra"}, {label:"Delhi", value:"Delhi"}, {label:"Karnataka", value:"Karnataka"}
                ]}
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
            <button className="bg-[#D4AF37] hover:bg-[#c4a133] text-[#102542] font-bold px-8 py-4 rounded-xl transition-all shadow-[0_4px_15px_rgba(212,175,55,0.3)] hover:-translate-y-0.5">
              Save All Changes
            </button>
          </div>

        </div>

        {/* Right Column: Stats & Activity */}
        <div className="lg:w-80 shrink-0 flex flex-col gap-6">
          
          <div className="glass-card rounded-3xl p-6 border border-white/10 flex flex-col gap-4">
            <h3 className="font-serif text-lg font-bold border-b border-white/10 pb-3">Account Overview</h3>
            <div className="flex items-center justify-between py-2 border-b border-white/5">
              <span className="text-gray-400 text-sm flex items-center gap-2"><Briefcase className="w-4 h-4" /> Cases Handled</span>
              <span className="font-bold text-lg text-white">3</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-white/5">
              <span className="text-gray-400 text-sm flex items-center gap-2"><UserIcon className="w-4 h-4" /> Lawyers Consulted</span>
              <span className="font-bold text-lg text-white">4</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-gray-400 text-sm flex items-center gap-2"><Award className="w-4 h-4" /> Account Status</span>
              <span className="text-green-400 font-bold text-sm bg-green-500/10 px-2 py-1 rounded">Active</span>
            </div>
          </div>

          <div className="glass-card rounded-3xl p-6 border border-white/10">
            <h3 className="font-serif text-lg font-bold border-b border-white/10 pb-3 mb-4">My Lawyers</h3>
            <div className="flex flex-col gap-4">
              {[
                { name: "Adv. Priya Sharma", spec: "Family Law", avatar: "PS", color: "from-[#D4AF37] to-[#8c7324]" },
                { name: "Adv. Rajesh Kumar", spec: "Property Law", avatar: "RK", color: "from-blue-600 to-indigo-800" },
                { name: "Adv. Ananya Mehta", spec: "Corporate Law", avatar: "AM", color: "from-purple-600 to-fuchsia-800" }
              ].map((l, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className={cn("w-10 h-10 rounded-full flex items-center justify-center font-serif font-bold text-white shadow-inner bg-gradient-to-br", l.color)}>
                    {l.avatar}
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

export default Profile;