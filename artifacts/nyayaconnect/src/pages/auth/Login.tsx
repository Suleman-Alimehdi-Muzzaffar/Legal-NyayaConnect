import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Scale, Mail } from 'lucide-react';
import FormInput from '@/components/forms/FormInput';
import FormPasswordInput from '@/components/forms/FormPasswordInput';
import FormCheckbox from '@/components/forms/FormCheckbox';

const Login = () => {
  const [loginType, setLoginType] = useState<'client' | 'lawyer'>('client');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    remember: false
  });

  // Particles background
  const dots = Array.from({ length: 30 }).map((_, i) => ({
    id: i,
    top: `${Math.random() * 100}%`,
    left: `${Math.random() * 100}%`,
    size: Math.random() * 3 + 1,
    delay: Math.random() * 5,
    duration: Math.random() * 10 + 10,
  }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log(`Login as ${loginType}:`, formData);
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
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-10 shadow-2xl">
          <div className="flex flex-col items-center mb-8">
            <Link to="/" className="flex items-center gap-2 mb-6">
              <Scale className="w-10 h-10 text-[#D4AF37]" />
            </Link>
            <h1 className="font-serif text-3xl font-bold text-center mb-2">Welcome Back</h1>
            <p className="font-sans text-gray-400 text-center">Sign in to your account</p>
          </div>

          {/* Type Toggle */}
          <div className="flex bg-[#0a1a2e]/50 p-1 rounded-xl mb-8 border border-white/5">
            <button
              type="button"
              onClick={() => setLoginType('client')}
              className={`flex-1 py-2.5 rounded-lg font-sans text-sm font-semibold transition-all duration-300 relative ${
                loginType === 'client' ? 'text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              Client
              {loginType === 'client' && (
                <motion.div layoutId="loginType" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#D4AF37]" />
              )}
            </button>
            <button
              type="button"
              onClick={() => setLoginType('lawyer')}
              className={`flex-1 py-2.5 rounded-lg font-sans text-sm font-semibold transition-all duration-300 relative ${
                loginType === 'lawyer' ? 'text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              Lawyer
              {loginType === 'lawyer' && (
                <motion.div layoutId="loginType" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#D4AF37]" />
              )}
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <FormInput
              label="Email Address"
              name="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              icon={Mail}
              placeholder="name@example.com"
              required
            />
            
            <FormPasswordInput
              label="Password"
              name="password"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              placeholder="••••••••"
              required
            />

            <div className="flex items-center justify-between pt-1">
              <FormCheckbox
                checked={formData.remember}
                onChange={(c) => setFormData({...formData, remember: c})}
              >
                Remember me
              </FormCheckbox>
              
              <Link to="/forgot-password" className="font-sans text-sm text-[#D4AF37] hover:underline">
                Forgot Password?
              </Link>
            </div>

            <button className="w-full bg-[#D4AF37] hover:bg-[#c4a133] text-[#102542] font-sans font-bold text-lg py-4 rounded-xl transition-all hover:-translate-y-1 shadow-[0_4px_15px_rgba(212,175,55,0.3)] mt-2">
              Sign In
            </button>
          </form>

          <div className="my-8 flex items-center gap-4">
            <div className="h-px bg-white/10 flex-1"></div>
            <span className="font-sans text-xs text-gray-500 uppercase tracking-widest">or continue with</span>
            <div className="h-px bg-white/10 flex-1"></div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button type="button" className="flex items-center justify-center gap-2 py-3 px-4 bg-transparent border border-white/20 rounded-xl hover:bg-white/5 transition-colors">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              <span className="font-sans text-sm font-medium">Google</span>
            </button>
            <button type="button" className="flex items-center justify-center gap-2 py-3 px-4 bg-transparent border border-white/20 rounded-xl hover:bg-white/5 transition-colors">
              <svg className="w-5 h-5 text-[#0077b5]" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
              <span className="font-sans text-sm font-medium">LinkedIn</span>
            </button>
          </div>

          <p className="text-center mt-8 font-sans text-sm text-gray-400">
            Don't have an account?{' '}
            <Link to="/register" className="text-[#D4AF37] hover:underline font-semibold">
              Register
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;