import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Scale, Mail, AlertCircle, Loader2 } from 'lucide-react';
import FormInput from '@/components/forms/FormInput';
import FormPasswordInput from '@/components/forms/FormPasswordInput';
import FormCheckbox from '@/components/forms/FormCheckbox';
import { useAuth } from '@/lib/auth-context';
import { ApiError } from '@workspace/api-client-react';

const Login = () => {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [loginType, setLoginType] = useState<'client' | 'lawyer'>('client');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    remember: false
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Particles background
  const dots = Array.from({ length: 30 }).map((_, i) => ({
    id: i,
    top: `${Math.random() * 100}%`,
    left: `${Math.random() * 100}%`,
    size: Math.random() * 3 + 1,
    delay: Math.random() * 5,
    duration: Math.random() * 10 + 10,
  }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await signIn(formData.email, formData.password);
      navigate(user.role === 'lawyer' ? '/lawyer-dashboard' : '/dashboard', { replace: true });
    } catch (err) {
      setError(err instanceof ApiError && typeof err.data?.message === 'string' ? err.data.message : 'Unable to sign in. Please try again.');
    } finally {
      setLoading(false);
    }
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

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#D4AF37] hover:bg-[#c4a133] disabled:opacity-60 disabled:hover:translate-y-0 text-[#102542] font-sans font-bold text-lg py-4 rounded-xl transition-all hover:-translate-y-1 shadow-[0_4px_15px_rgba(212,175,55,0.3)] mt-2 inline-flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="w-5 h-5 animate-spin" />}
              Sign In
            </button>

            {error && (
              <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/30 text-red-300 font-sans text-sm rounded-xl p-4 mt-4">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </form>

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