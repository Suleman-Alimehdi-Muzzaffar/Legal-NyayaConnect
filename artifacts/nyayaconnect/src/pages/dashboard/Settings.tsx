import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, 
  Bell, 
  Eye, 
  Palette, 
  CreditCard, 
  HelpCircle,
  ChevronRight,
  Smartphone,
  Laptop,
  AlertTriangle,
  Download,
  Trash2,
  Cog
} from 'lucide-react';
import { cn } from '@/lib/utils';
import FormPasswordInput from '@/components/forms/FormPasswordInput';

const Settings = () => {
  const [activeSection, setActiveSection] = useState('security');

  const sections = [
    { id: 'security', label: 'Account Security', icon: ShieldCheck },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Privacy & Data', icon: Eye },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'billing', label: 'Billing & Payments', icon: CreditCard },
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
                <FormPasswordInput label="Current Password" name="current" />
                <FormPasswordInput label="New Password" name="new" showStrengthMeter />
                <FormPasswordInput label="Confirm New Password" name="confirm" />
                <button className="bg-[#D4AF37] text-[#102542] font-bold py-3 rounded-xl mt-2 hover:bg-[#c4a133] transition-colors w-32">
                  Update
                </button>
              </div>
            </div>

            <div className="border-t border-white/10 pt-8">
              <h3 className="text-xl font-serif font-bold mb-2">Two-Factor Authentication</h3>
              <p className="text-sm text-gray-400 mb-6">Add an extra layer of security to your account. We'll send a code to your mobile device.</p>
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10 max-w-lg">
                <div className="flex flex-col gap-1">
                  <span className="font-semibold text-white">Enable 2FA via SMS</span>
                  <span className="text-xs text-gray-400">Not currently configured</span>
                </div>
                <CustomToggle checked={false} onChange={() => {}} />
              </div>
            </div>

            <div className="border-t border-white/10 pt-8">
              <h3 className="text-xl font-serif font-bold mb-4">Active Sessions</h3>
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-[#D4AF37]/30 max-w-2xl">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-[#D4AF37]/10 rounded-lg text-[#D4AF37]">
                      <Laptop className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-semibold text-white flex items-center gap-2">
                        Mac OS • Chrome <span className="text-[10px] bg-green-500/20 text-green-400 px-2 py-0.5 rounded uppercase font-bold">Current</span>
                      </div>
                      <div className="text-xs text-gray-400 mt-1">Mumbai, India • IP: 192.168.1.1</div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10 max-w-2xl">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-white/10 rounded-lg text-gray-300">
                      <Smartphone className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-semibold text-white">iPhone 13 • Safari</div>
                      <div className="text-xs text-gray-400 mt-1">Delhi, India • Last active 2 days ago</div>
                    </div>
                  </div>
                  <button className="text-sm text-red-400 hover:text-red-300 hover:bg-red-400/10 px-3 py-1.5 rounded transition-colors">
                    Revoke
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        );

      case 'notifications':
        return (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-8">
            <h3 className="text-xl font-serif font-bold mb-2">Notification Preferences</h3>
            
            <div className="flex flex-col gap-6 max-w-2xl">
              {[
                { title: "Appointment Reminders", desc: "Get notified 24 hours and 1 hour before.", email: true, sms: true },
                { title: "Document Updates", desc: "When a lawyer reviews or updates a file.", email: true, sms: false },
                { title: "New Messages", desc: "When you receive a direct message.", email: true, sms: true },
                { title: "Promotional & Tips", desc: "Legal tips, news, and platform updates.", email: false, sms: false },
              ].map((item, i) => (
                <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-white/5 rounded-xl border border-white/10">
                  <div className="flex-1">
                    <div className="font-semibold text-white">{item.title}</div>
                    <div className="text-xs text-gray-400 mt-1">{item.desc}</div>
                  </div>
                  <div className="flex items-center gap-6 shrink-0">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <span className="text-sm text-gray-300">Email</span>
                      <CustomToggle checked={item.email} onChange={() => {}} />
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <span className="text-sm text-gray-300">SMS</span>
                      <CustomToggle checked={item.sms} onChange={() => {}} />
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
                    <input type="radio" name="visibility" className="peer sr-only" defaultChecked={opt === "Lawyers Only"} />
                    <div className="h-full p-4 rounded-xl border border-white/10 bg-white/5 peer-checked:border-[#D4AF37] peer-checked:bg-[#D4AF37]/10 transition-all text-center">
                      <div className="font-semibold text-sm mb-1 peer-checked:text-[#D4AF37]">{opt}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="border-t border-white/10 pt-8">
              <h3 className="text-xl font-serif font-bold mb-2 flex items-center gap-2">
                <Download className="w-5 h-5 text-[#D4AF37]" /> Download My Data
              </h3>
              <p className="text-sm text-gray-400 mb-4 max-w-xl">Request a copy of your personal data, appointments, and uploaded documents. This process may take up to 48 hours.</p>
              <button className="bg-transparent border border-white/20 hover:bg-white/10 text-white font-semibold py-2.5 px-6 rounded-xl transition-colors">
                Request Data Export
              </button>
            </div>

            <div className="border-t border-red-500/20 pt-8">
              <h3 className="text-xl font-serif font-bold mb-2 flex items-center gap-2 text-red-400">
                <AlertTriangle className="w-5 h-5" /> Danger Zone
              </h3>
              <p className="text-sm text-gray-400 mb-4 max-w-xl">Permanently delete your account and all associated data. This action cannot be undone.</p>
              <button className="bg-red-500/10 border border-red-500/30 hover:bg-red-500 text-red-400 hover:text-white font-bold py-2.5 px-6 rounded-xl transition-colors flex items-center gap-2">
                <Trash2 className="w-4 h-4" /> Delete Account
              </button>
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