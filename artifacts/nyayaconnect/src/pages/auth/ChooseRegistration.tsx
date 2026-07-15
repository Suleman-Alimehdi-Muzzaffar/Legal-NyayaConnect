import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Scale } from 'lucide-react';

const ChooseRegistration = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2, delayChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  // Particles background
  const dots = Array.from({ length: 40 }).map((_, i) => ({
    id: i,
    top: `${Math.random() * 100}%`,
    left: `${Math.random() * 100}%`,
    size: Math.random() * 3 + 1,
    delay: Math.random() * 5,
    duration: Math.random() * 10 + 10,
  }));

  return (
    <div className="min-h-screen bg-[#102542] text-white selection:bg-[#D4AF37] selection:text-[#102542] relative overflow-hidden flex flex-col">
      {/* Background Particles */}
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

      {/* Header */}
      <header className="relative z-10 p-6 md:px-12 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2 group">
          <Scale className="w-8 h-8 text-[#D4AF37] group-hover:scale-110 transition-transform duration-300" />
          <span className="font-serif text-2xl font-bold tracking-wide text-white">
            Nyaya<span className="text-[#D4AF37]">Connect</span>
          </span>
        </Link>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex items-center justify-center relative z-10 px-6 py-12">
        <motion.div 
          className="w-full max-w-5xl"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="text-center mb-12">
            <motion.h1 variants={itemVariants} className="font-serif text-4xl md:text-5xl font-bold mb-4">
              Join NyayaConnect
            </motion.h1>
            <motion.p variants={itemVariants} className="font-sans text-gray-300 text-lg">
              Choose how you'd like to join our legal community
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
            {/* Client Card */}
            <motion.div variants={itemVariants}>
              <Link to="/register/client" className="block h-full">
                <motion.div 
                  whileHover={{ scale: 1.02, boxShadow: "0 0 40px rgba(212,175,55,0.2)" }}
                  className="h-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 lg:p-12 flex flex-col group transition-all"
                >
                  <div className="w-24 h-24 mb-8 bg-[#D4AF37]/10 rounded-2xl flex items-center justify-center mx-auto group-hover:bg-[#D4AF37]/20 transition-colors">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                      <path d="M21 21v-2a4 4 0 0 0-3-3.85" />
                    </svg>
                  </div>
                  <h2 className="font-serif text-3xl font-bold text-center mb-3">I Need Legal Help</h2>
                  <p className="font-sans text-center text-gray-300 mb-8 flex-grow">
                    Find verified lawyers, book consultations, resolve legal matters
                  </p>
                  
                  <ul className="space-y-4 mb-10 font-sans text-sm text-gray-300">
                    <li className="flex items-center gap-3"><span className="text-[#D4AF37]">✓</span> Free to Register</li>
                    <li className="flex items-center gap-3"><span className="text-[#D4AF37]">✓</span> 10,000+ Verified Lawyers</li>
                    <li className="flex items-center gap-3"><span className="text-[#D4AF37]">✓</span> Instant Consultations</li>
                    <li className="flex items-center gap-3"><span className="text-[#D4AF37]">✓</span> Secure & Confidential</li>
                  </ul>
                  
                  <button className="w-full bg-[#D4AF37] text-[#102542] font-sans font-bold text-lg py-4 rounded-xl shadow-[0_4px_15px_rgba(212,175,55,0.3)] transition-transform">
                    Register as Client
                  </button>
                </motion.div>
              </Link>
            </motion.div>

            {/* Lawyer Card */}
            <motion.div variants={itemVariants}>
              <Link to="/register/lawyer" className="block h-full">
                <motion.div 
                  whileHover={{ scale: 1.02, boxShadow: "0 0 40px rgba(212,175,55,0.2)" }}
                  className="h-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 lg:p-12 flex flex-col group transition-all"
                >
                  <div className="w-24 h-24 mb-8 bg-[#D4AF37]/10 rounded-2xl flex items-center justify-center mx-auto group-hover:bg-[#D4AF37]/20 transition-colors">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                      <path d="m9 12 2 2 4-4" />
                    </svg>
                  </div>
                  <h2 className="font-serif text-3xl font-bold text-center mb-3">I'm a Legal Professional</h2>
                  <p className="font-sans text-center text-gray-300 mb-8 flex-grow">
                    Join India's largest legal platform and grow your practice
                  </p>
                  
                  <ul className="space-y-4 mb-10 font-sans text-sm text-gray-300">
                    <li className="flex items-center gap-3"><span className="text-[#D4AF37]">✓</span> Verified Profile</li>
                    <li className="flex items-center gap-3"><span className="text-[#D4AF37]">✓</span> 1M+ Client Reach</li>
                    <li className="flex items-center gap-3"><span className="text-[#D4AF37]">✓</span> Easy Scheduling</li>
                    <li className="flex items-center gap-3"><span className="text-[#D4AF37]">✓</span> Secure Payments</li>
                  </ul>
                  
                  <button className="w-full bg-transparent border-2 border-[#D4AF37] text-[#D4AF37] group-hover:bg-[#D4AF37] group-hover:text-[#102542] font-sans font-bold text-lg py-4 rounded-xl transition-all duration-300">
                    Register as Lawyer
                  </button>
                </motion.div>
              </Link>
            </motion.div>
          </div>

          <motion.div variants={itemVariants} className="text-center mt-12 font-sans">
            <span className="text-gray-400">Already have an account? </span>
            <Link to="/login" className="text-[#D4AF37] hover:underline font-semibold">
              Login
            </Link>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
};

export default ChooseRegistration;