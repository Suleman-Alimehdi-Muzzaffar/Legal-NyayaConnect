import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Scale, User, Mail, Phone, MapPin, ShieldCheck, Star } from 'lucide-react';
import FormInput from '@/components/forms/FormInput';
import FormPasswordInput from '@/components/forms/FormPasswordInput';
import FormSelect from '@/components/forms/FormSelect';
import FormCheckbox from '@/components/forms/FormCheckbox';
import StepIndicator from '@/components/forms/StepIndicator';

const ClientRegister = () => {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    city: '',
    state: '',
    language: '',
    interests: [] as string[],
    agreed: false
  });

  const states = [
    { value: 'mh', label: 'Maharashtra' },
    { value: 'dl', label: 'Delhi' },
    { value: 'ka', label: 'Karnataka' },
    { value: 'up', label: 'Uttar Pradesh' },
    { value: 'wb', label: 'West Bengal' },
    // Simplified list for implementation
  ];

  const languages = [
    { value: 'en', label: 'English' },
    { value: 'hi', label: 'Hindi' },
    { value: 'mr', label: 'Marathi' },
    { value: 'bn', label: 'Bengali' },
  ];

  const interestsOptions = ['Property', 'Family', 'Criminal', 'Corporate', 'Cyber', 'Consumer'];

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleInterestToggle = (interest: string) => {
    setFormData(prev => {
      if (prev.interests.includes(interest)) {
        return { ...prev, interests: prev.interests.filter(i => i !== interest) };
      }
      return { ...prev, interests: [...prev.interests, interest] };
    });
  };

  const nextStep = () => setStep(1);
  const prevStep = () => setStep(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Register client:', formData);
  };

  const stepVariants = {
    hidden: (direction: number) => ({ opacity: 0, x: direction > 0 ? 40 : -40 }),
    visible: { opacity: 1, x: 0, transition: { duration: 0.4 } },
    exit: (direction: number) => ({ opacity: 0, x: direction > 0 ? -40 : 40, transition: { duration: 0.3 } })
  };

  return (
    <div className="min-h-screen bg-[#102542] text-white selection:bg-[#D4AF37] selection:text-[#102542] flex flex-col md:flex-row">
      {/* Left Panel */}
      <div className="hidden md:flex w-[40%] bg-gradient-to-b from-[#0a1a2e] to-[#102542] p-12 flex-col relative border-r border-[#D4AF37]/20">
        <Link to="/" className="flex items-center gap-2 group w-fit mb-16">
          <Scale className="w-8 h-8 text-[#D4AF37] group-hover:scale-110 transition-transform duration-300" />
          <span className="font-serif text-2xl font-bold tracking-wide text-white">
            Nyaya<span className="text-[#D4AF37]">Connect</span>
          </span>
        </Link>

        <div className="flex-grow flex flex-col justify-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="w-32 h-32 mb-8 text-[#D4AF37]/20">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
            <h1 className="font-serif text-4xl font-bold mb-4">Register as a Client</h1>
            <p className="font-sans text-gray-300 text-lg mb-12">
              Join millions of Indians who trust NyayaConnect for their legal needs.
            </p>

            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-[#D4AF37]/10 flex items-center justify-center shrink-0">
                  <Star className="w-5 h-5 text-[#D4AF37]" />
                </div>
                <div>
                  <h4 className="font-bold text-white">Free to join</h4>
                  <p className="text-sm text-gray-400">No hidden charges to register</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-[#D4AF37]/10 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5 text-[#D4AF37]" />
                </div>
                <div>
                  <h4 className="font-bold text-white">Secure & private</h4>
                  <p className="text-sm text-gray-400">100% confidential consultations</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-[#D4AF37]/10 flex items-center justify-center shrink-0">
                  <Scale className="w-5 h-5 text-[#D4AF37]" />
                </div>
                <div>
                  <h4 className="font-bold text-white">Expert lawyers</h4>
                  <p className="text-sm text-gray-400">Verified supreme & high court advocates</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="mt-auto pt-8 font-sans">
          <span className="text-gray-400">Already registered? </span>
          <Link to="/login" className="text-[#D4AF37] hover:underline font-semibold">
            Login
          </Link>
        </div>
      </div>

      {/* Right Panel */}
      <div className="w-full md:w-[60%] p-6 md:p-12 lg:p-20 overflow-y-auto">
        <div className="max-w-xl mx-auto">
          {/* Mobile Logo */}
          <Link to="/" className="md:hidden flex items-center gap-2 group w-fit mb-10">
            <Scale className="w-8 h-8 text-[#D4AF37]" />
            <span className="font-serif text-2xl font-bold tracking-wide text-white">
              Nyaya<span className="text-[#D4AF37]">Connect</span>
            </span>
          </Link>

          <div className="mb-10">
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-[#D4AF37]/10 text-[#D4AF37] text-xs font-bold uppercase tracking-wider mb-4 border border-[#D4AF37]/30">
              Client Registration
            </div>
            <h2 className="font-serif text-3xl font-bold">Create Your Account</h2>
          </div>

          <StepIndicator 
            steps={[{ label: "Personal Details" }, { label: "Preferences" }]} 
            currentStep={step} 
            className="mb-12"
          />

          <form onSubmit={handleSubmit} className="relative overflow-hidden">
            <AnimatePresence mode="wait" custom={1}>
              {step === 0 && (
                <motion.div
                  key="step1"
                  custom={1}
                  variants={stepVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="space-y-6"
                >
                  <FormInput
                    label="Full Name"
                    name="fullName"
                    value={formData.fullName}
                    onChange={(e) => handleChange('fullName', e.target.value)}
                    icon={User}
                    placeholder="John Doe"
                    required
                  />
                  <FormInput
                    label="Email Address"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    icon={Mail}
                    placeholder="john@example.com"
                    required
                  />
                  <FormInput
                    label="Phone Number"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    icon={Phone}
                    placeholder="+91 98765 43210"
                    required
                  />
                  <FormPasswordInput
                    label="Password"
                    name="password"
                    value={formData.password}
                    onChange={(e) => handleChange('password', e.target.value)}
                    placeholder="Create a strong password"
                    showStrengthMeter
                    required
                  />
                  <FormPasswordInput
                    label="Confirm Password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={(e) => handleChange('confirmPassword', e.target.value)}
                    placeholder="Repeat password"
                    required
                  />
                  <div className="pt-4">
                    <button
                      type="button"
                      onClick={nextStep}
                      className="w-full bg-[#D4AF37] hover:bg-[#c4a133] text-[#102542] font-sans font-bold text-lg py-4 rounded-xl transition-all hover:-translate-y-1 shadow-[0_4px_15px_rgba(212,175,55,0.3)]"
                    >
                      Next Step
                    </button>
                  </div>
                </motion.div>
              )}

              {step === 1 && (
                <motion.div
                  key="step2"
                  custom={-1}
                  variants={stepVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="space-y-6"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormInput
                      label="City"
                      name="city"
                      value={formData.city}
                      onChange={(e) => handleChange('city', e.target.value)}
                      icon={MapPin}
                      placeholder="Mumbai"
                      required
                    />
                    <FormSelect
                      label="State"
                      name="state"
                      value={formData.state}
                      onChange={(e) => handleChange('state', e.target.value)}
                      options={states}
                      placeholder="Select State"
                      required
                    />
                  </div>
                  
                  <FormSelect
                    label="Preferred Language"
                    name="language"
                    value={formData.language}
                    onChange={(e) => handleChange('language', e.target.value)}
                    options={languages}
                    placeholder="Select Language"
                    required
                  />

                  <div>
                    <label className="block font-sans text-sm font-medium text-gray-300 mb-3">
                      Legal Interests (Optional)
                    </label>
                    <div className="flex flex-wrap gap-3">
                      {interestsOptions.map(interest => (
                        <button
                          key={interest}
                          type="button"
                          onClick={() => handleInterestToggle(interest)}
                          className={`px-4 py-2 rounded-full font-sans text-sm border transition-all duration-300 ${
                            formData.interests.includes(interest)
                              ? 'bg-[#D4AF37]/20 border-[#D4AF37] text-[#D4AF37]'
                              : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/30'
                          }`}
                        >
                          {interest}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-white/10">
                    <FormCheckbox
                      checked={formData.agreed}
                      onChange={(c) => handleChange('agreed', c)}
                      required
                    >
                      I agree to the <Link to="/terms-conditions" className="text-[#D4AF37] hover:underline">Terms & Conditions</Link> and <Link to="/privacy-policy" className="text-[#D4AF37] hover:underline">Privacy Policy</Link>
                    </FormCheckbox>
                  </div>

                  <div className="pt-4 flex gap-4">
                    <button
                      type="button"
                      onClick={prevStep}
                      className="w-1/3 bg-transparent border border-white/20 hover:bg-white/5 text-white font-sans font-bold text-lg py-4 rounded-xl transition-all"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={!formData.agreed}
                      className="w-2/3 bg-[#D4AF37] hover:bg-[#c4a133] disabled:opacity-50 disabled:hover:bg-[#D4AF37] disabled:hover:translate-y-0 text-[#102542] font-sans font-bold text-lg py-4 rounded-xl transition-all hover:-translate-y-1 shadow-[0_4px_15px_rgba(212,175,55,0.3)]"
                    >
                      Create Account
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </form>
          
          <div className="md:hidden mt-8 text-center font-sans">
            <span className="text-gray-400">Already registered? </span>
            <Link to="/login" className="text-[#D4AF37] hover:underline font-semibold">
              Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientRegister;