import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Scale, Lock, Mail, ArrowLeft, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import FormInput from '@/components/forms/FormInput';
import FormPasswordInput from '@/components/forms/FormPasswordInput';
import { useForgotPassword } from '@workspace/api-client-react';

const ForgotPassword = () => {
  const forgotPasswordMutation = useForgotPassword();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [passwordData, setPasswordData] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [countdown, setCountdown] = useState(59);

  // Countdown timer for step 2
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === 2 && countdown > 0) {
      timer = setInterval(() => setCountdown(c => c - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [step, countdown]);

  // Particles background
  const dots = Array.from({ length: 30 }).map((_, i) => ({
    id: i,
    top: `${Math.random() * 100}%`,
    left: `${Math.random() * 100}%`,
    size: Math.random() * 3 + 1,
    delay: Math.random() * 5,
    duration: Math.random() * 10 + 10,
  }));

  const handleSendLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email) return;
    try {
      await forgotPasswordMutation.mutateAsync({ data: { email } });
      setStep(2);
      setCountdown(59);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to send reset link. Please try again.');
    }
  };

  // Simulate clicking the reset link
  const simulateResetClick = () => {
    setStep(3);
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Password reset successfully');
    // Would typically redirect to login here
  };

  const slideVariants = {
    hidden: { opacity: 0, x: 40 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.4 } },
    exit: { opacity: 0, x: -40, transition: { duration: 0.3 } }
  };

  return (
    <div className="min-h-screen bg-[#102542] text-white selection:bg-[#D4AF37] selection:text-[#102542] relative overflow-hidden flex items-center justify-center p-6">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0a1a2e] via-[#102542] to-[#0a1a2e] z-0" />
      <div className="absolute inset-0 z-0 opacity-30">
        {dots.map((dot) => (
          <motion.div
            key={dot.id}
            className="absolute rounded-full bg-[#D4AF37]"
            style={{ top: dot.top, left: dot.left, width: dot.size, height: dot.size }}
            animate={{ y: [0, -100], opacity: [0, 0.8, 0] }}
            transition={{ repeat: Infinity, duration: dot.duration, delay: dot.delay, ease: "linear" }}
          />
        ))}
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-10 shadow-2xl overflow-hidden min-h-[450px] flex flex-col">
          <div className="flex justify-center mb-8">
            <Link to="/" className="inline-block">
              <Scale className="w-10 h-10 text-[#D4AF37]" />
            </Link>
          </div>

          <div className="flex-grow relative">
            <AnimatePresence mode="wait">
              {/* STEP 1: Enter Email */}
              {step === 1 && (
                <motion.div
                  key="step1"
                  variants={slideVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="flex flex-col h-full"
                >
                  <div className="flex flex-col items-center mb-8">
                    <div className="w-16 h-16 bg-[#D4AF37]/10 rounded-full flex items-center justify-center mb-4">
                      <Lock className="w-8 h-8 text-[#D4AF37]" />
                    </div>
                    <h1 className="font-serif text-2xl font-bold text-center mb-2">Forgot Password?</h1>
                    <p className="font-sans text-gray-400 text-center text-sm">
                      Enter your registered email and we'll send you a reset link.
                    </p>
                  </div>

                  <form onSubmit={handleSendLink} className="space-y-6 flex-grow">
                    <FormInput
                      label="Email Address"
                      name="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      icon={Mail}
                      placeholder="name@example.com"
                      required
                    />

                    <button
                      type="submit"
                      disabled={forgotPasswordMutation.isPending}
                      className="w-full bg-[#D4AF37] hover:bg-[#c4a133] disabled:opacity-60 text-[#102542] font-sans font-bold py-4 rounded-xl transition-all hover:-translate-y-1 shadow-[0_4px_15px_rgba(212,175,55,0.3)] mt-4 inline-flex items-center justify-center gap-2"
                    >
                      {forgotPasswordMutation.isPending && <Loader2 className="w-5 h-5 animate-spin" />}
                      Send Reset Link
                    </button>
                    {error && (
                      <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/30 text-red-300 font-sans text-sm rounded-xl p-4 mt-4">
                        <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                        <span>{error}</span>
                      </div>
                    )}
                  </form>

                  <div className="mt-8 text-center">
                    <Link to="/login" className="inline-flex items-center gap-2 text-gray-400 hover:text-white font-sans text-sm transition-colors">
                      <ArrowLeft className="w-4 h-4" /> Back to Login
                    </Link>
                  </div>
                </motion.div>
              )}

              {/* STEP 2: Check Email */}
              {step === 2 && (
                <motion.div
                  key="step2"
                  variants={slideVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="flex flex-col items-center h-full text-center"
                >
                  <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mb-6">
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", delay: 0.2 }}>
                      <CheckCircle className="w-10 h-10 text-green-500" />
                    </motion.div>
                  </div>
                  
                  <h1 className="font-serif text-2xl font-bold mb-3">Check Your Email</h1>
                  <p className="font-sans text-gray-400 text-sm mb-8">
                    We've sent a password reset link to <br/><span className="text-white font-medium">{email}</span>
                  </p>

                  <div className="mt-auto space-y-6 w-full">
                    <button 
                      onClick={simulateResetClick}
                      className="w-full bg-white/5 border border-white/10 hover:bg-white/10 text-white font-sans font-semibold py-3 rounded-xl transition-all text-sm"
                    >
                      Simulate opening link from email
                    </button>

                    <div className="font-sans text-sm">
                      <span className="text-gray-400">Didn't receive it? </span>
                      {countdown > 0 ? (
                        <span className="text-gray-500">Resend in 00:{countdown.toString().padStart(2, '0')}</span>
                      ) : (
                        <button onClick={() => setCountdown(59)} className="text-[#D4AF37] hover:underline">
                          Resend now
                        </button>
                      )}
                    </div>

                    <div className="pt-4 border-t border-white/10">
                      <Link to="/login" className="inline-flex items-center gap-2 text-gray-400 hover:text-white font-sans text-sm transition-colors">
                        <ArrowLeft className="w-4 h-4" /> Back to Login
                      </Link>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* STEP 3: Reset Password (Simulated) */}
              {step === 3 && (
                <motion.div
                  key="step3"
                  variants={slideVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="flex flex-col h-full"
                >
                  <div className="flex flex-col items-center mb-8">
                    <h1 className="font-serif text-2xl font-bold text-center mb-2">Create New Password</h1>
                    <p className="font-sans text-gray-400 text-center text-sm">
                      Please enter your new password below.
                    </p>
                  </div>

                  <form onSubmit={handleResetPassword} className="space-y-6 flex-grow">
                    <FormPasswordInput
                      label="New Password"
                      name="newPassword"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                      placeholder="Enter new password"
                      showStrengthMeter
                      required
                    />
                    
                    <FormPasswordInput
                      label="Confirm New Password"
                      name="confirmPassword"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                      placeholder="Repeat new password"
                      required
                    />

                    <button className="w-full bg-[#D4AF37] hover:bg-[#c4a133] text-[#102542] font-sans font-bold py-4 rounded-xl transition-all hover:-translate-y-1 shadow-[0_4px_15px_rgba(212,175,55,0.3)] mt-4">
                      Reset Password
                    </button>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;