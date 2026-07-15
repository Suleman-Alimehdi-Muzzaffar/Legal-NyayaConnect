import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Scale, User, Mail, Phone, Hash, Building, IndianRupee, ShieldCheck, Award, TrendingUp } from 'lucide-react';
import FormInput from '@/components/forms/FormInput';
import FormPasswordInput from '@/components/forms/FormPasswordInput';
import FormSelect from '@/components/forms/FormSelect';
import FormCheckbox from '@/components/forms/FormCheckbox';
import FormTextarea from '@/components/forms/FormTextarea';
import FormFileUpload from '@/components/forms/FormFileUpload';
import StepIndicator from '@/components/forms/StepIndicator';

const LawyerRegister = () => {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    bciNumber: '',
    experience: '',
    practiceAreas: [] as string[],
    officeAddress: '',
    consultationFee: '',
    languages: [] as string[],
    agreed: false
  });

  const experienceOptions = [
    { value: '0-1', label: '0-1 years' },
    { value: '1-3', label: '1-3 years' },
    { value: '3-5', label: '3-5 years' },
    { value: '5-10', label: '5-10 years' },
    { value: '10-15', label: '10-15 years' },
    { value: '15-20', label: '15-20 years' },
    { value: '20+', label: '20+ years' },
  ];

  const practiceAreaOptions = [
    'Property Law', 'Criminal Law', 'Civil Law', 'Corporate Law', 
    'Family Law', 'Consumer Law', 'Cyber Law', 'Traffic Law', 
    'Labour Law', "Women's Rights", 'Senior Citizen Support', 'Constitutional Law'
  ];

  const languageOptions = [
    'Hindi', 'English', 'Bengali', 'Tamil', 'Telugu', 
    'Marathi', 'Gujarati', 'Kannada', 'Malayalam', 'Punjabi'
  ];

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleArrayToggle = (field: 'practiceAreas' | 'languages', item: string) => {
    setFormData(prev => {
      const array = prev[field];
      if (array.includes(item)) {
        return { ...prev, [field]: array.filter(i => i !== item) };
      }
      return { ...prev, [field]: [...array, item] };
    });
  };

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Register lawyer:', formData);
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
                <path d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" stroke="#D4AF37" strokeWidth="1.5" strokeLinejoin="round" fill="none" />
              </svg>
            </div>
            <h1 className="font-serif text-4xl font-bold mb-4">Register as a Lawyer</h1>
            <p className="font-sans text-gray-300 text-lg mb-12">
              Expand your legal practice and connect with clients across India.
            </p>

            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-[#D4AF37]/10 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5 text-[#D4AF37]" />
                </div>
                <div>
                  <h4 className="font-bold text-white">Verified Badge</h4>
                  <p className="text-sm text-gray-400">Build trust with the NyayaConnect verified mark</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-[#D4AF37]/10 flex items-center justify-center shrink-0">
                  <Award className="w-5 h-5 text-[#D4AF37]" />
                </div>
                <div>
                  <h4 className="font-bold text-white">1M+ Reach</h4>
                  <p className="text-sm text-gray-400">Access thousands of clients daily</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-[#D4AF37]/10 flex items-center justify-center shrink-0">
                  <TrendingUp className="w-5 h-5 text-[#D4AF37]" />
                </div>
                <div>
                  <h4 className="font-bold text-white">Earn More</h4>
                  <p className="text-sm text-gray-400">Manage bookings and payments seamlessly</p>
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
        <div className="max-w-2xl mx-auto">
          {/* Mobile Logo */}
          <Link to="/" className="md:hidden flex items-center gap-2 group w-fit mb-10">
            <Scale className="w-8 h-8 text-[#D4AF37]" />
            <span className="font-serif text-2xl font-bold tracking-wide text-white">
              Nyaya<span className="text-[#D4AF37]">Connect</span>
            </span>
          </Link>

          <div className="mb-10">
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-[#D4AF37]/10 text-[#D4AF37] text-xs font-bold uppercase tracking-wider mb-4 border border-[#D4AF37]/30">
              Lawyer Registration
            </div>
            <h2 className="font-serif text-3xl font-bold">Apply to Join</h2>
          </div>

          <StepIndicator 
            steps={[{ label: "Personal Info" }, { label: "Professional" }, { label: "Verification" }]} 
            currentStep={step} 
            className="mb-12"
          />

          <form onSubmit={handleSubmit} className="relative overflow-hidden min-h-[400px]">
            <AnimatePresence mode="wait" custom={step}>
              {/* STEP 1 */}
              {step === 0 && (
                <motion.div
                  key="step0"
                  custom={1}
                  variants={stepVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="space-y-6"
                >
                  <FormInput
                    label="Full Name (as per Bar Council)"
                    name="fullName"
                    value={formData.fullName}
                    onChange={(e) => handleChange('fullName', e.target.value)}
                    icon={User}
                    placeholder="Adv. John Doe"
                    required
                  />
                  <FormInput
                    label="Email Address"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    icon={Mail}
                    placeholder="advocate@example.com"
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

              {/* STEP 2 */}
              {step === 1 && (
                <motion.div
                  key="step1"
                  custom={1}
                  variants={stepVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="space-y-6"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormInput
                      label="Bar Council Reg. Number"
                      name="bciNumber"
                      value={formData.bciNumber}
                      onChange={(e) => handleChange('bciNumber', e.target.value)}
                      icon={Hash}
                      placeholder="BCI/STATE/YEAR/XXXXX"
                      required
                    />
                    <FormSelect
                      label="Years of Experience"
                      name="experience"
                      value={formData.experience}
                      onChange={(e) => handleChange('experience', e.target.value)}
                      options={experienceOptions}
                      placeholder="Select Experience"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-sans text-sm font-medium text-gray-300 mb-3">
                      Practice Areas <span className="text-red-400">*</span>
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {practiceAreaOptions.map(area => (
                        <button
                          key={area}
                          type="button"
                          onClick={() => handleArrayToggle('practiceAreas', area)}
                          className={`px-3 py-1.5 rounded-lg font-sans text-xs border transition-all duration-300 ${
                            formData.practiceAreas.includes(area)
                              ? 'bg-[#D4AF37]/20 border-[#D4AF37] text-[#D4AF37]'
                              : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/30'
                          }`}
                        >
                          {area}
                        </button>
                      ))}
                    </div>
                  </div>

                  <FormTextarea
                    label="Office Address"
                    name="officeAddress"
                    value={formData.officeAddress}
                    onChange={(e) => handleChange('officeAddress', e.target.value)}
                    rows={3}
                    placeholder="Full address of your primary chamber or office"
                    required
                  />

                  <FormInput
                    label="Consultation Fee"
                    name="consultationFee"
                    value={formData.consultationFee}
                    onChange={(e) => handleChange('consultationFee', e.target.value)}
                    icon={IndianRupee}
                    placeholder="₹500 per session"
                    required
                  />

                  <div>
                    <label className="block font-sans text-sm font-medium text-gray-300 mb-3">
                      Languages Spoken
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {languageOptions.map(lang => (
                        <button
                          key={lang}
                          type="button"
                          onClick={() => handleArrayToggle('languages', lang)}
                          className={`px-3 py-1.5 rounded-lg font-sans text-xs border transition-all duration-300 ${
                            formData.languages.includes(lang)
                              ? 'bg-[#D4AF37]/20 border-[#D4AF37] text-[#D4AF37]'
                              : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/30'
                          }`}
                        >
                          {lang}
                        </button>
                      ))}
                    </div>
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
                      type="button"
                      onClick={nextStep}
                      disabled={formData.practiceAreas.length === 0}
                      className="w-2/3 bg-[#D4AF37] hover:bg-[#c4a133] disabled:opacity-50 text-[#102542] font-sans font-bold text-lg py-4 rounded-xl transition-all hover:-translate-y-1 shadow-[0_4px_15px_rgba(212,175,55,0.3)]"
                    >
                      Next Step
                    </button>
                  </div>
                </motion.div>
              )}

              {/* STEP 3 */}
              {step === 2 && (
                <motion.div
                  key="step2"
                  custom={1}
                  variants={stepVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="space-y-8"
                >
                  <div>
                    <h3 className="font-serif text-xl font-bold mb-2">Upload Verification Documents</h3>
                    <p className="font-sans text-sm text-gray-400 mb-6">All documents are reviewed within 24-48 hours to activate your profile.</p>
                  </div>

                  <div className="space-y-6">
                    <FormFileUpload
                      label="Bar Council Certificate *"
                      name="bciCert"
                      accept=".pdf,.jpg,.png"
                      hint="Official BCI registration certificate"
                      onFilesChange={(files) => console.log(files)}
                    />
                    
                    <FormFileUpload
                      label="Government ID Proof *"
                      name="govId"
                      accept=".pdf,.jpg,.png"
                      hint="Aadhaar, PAN, Passport or Voter ID"
                      onFilesChange={(files) => console.log(files)}
                    />

                    <FormFileUpload
                      label="Degree Certificate *"
                      name="degree"
                      accept=".pdf,.jpg,.png"
                      hint="LLB/LLM degree from recognized university"
                      onFilesChange={(files) => console.log(files)}
                    />

                    <FormFileUpload
                      label="Profile Photo (Optional)"
                      name="photo"
                      accept=".jpg,.png"
                      hint="Clear professional headshot"
                      onFilesChange={(files) => console.log(files)}
                    />
                  </div>

                  <div className="bg-[#D4AF37]/5 border border-[#D4AF37]/30 rounded-xl p-4 mt-6">
                    <p className="font-sans text-sm text-[#D4AF37]">
                      Your profile will be reviewed and activated within 24-48 business hours after document verification.
                    </p>
                  </div>

                  <div className="pt-2">
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
                      className="w-2/3 bg-[#D4AF37] hover:bg-[#c4a133] disabled:opacity-50 disabled:hover:translate-y-0 text-[#102542] font-sans font-bold text-lg py-4 rounded-xl transition-all hover:-translate-y-1 shadow-[0_4px_15px_rgba(212,175,55,0.3)]"
                    >
                      Submit Application
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LawyerRegister;