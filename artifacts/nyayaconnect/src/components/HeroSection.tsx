import React from 'react';
import { motion, type Variants } from 'framer-motion';
import { ShieldCheck, Star, Award, ArrowRight } from 'lucide-react';

const HeroSection = () => {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" as const } },
  };

  // Generate some dots for the background pattern
  const dots = Array.from({ length: 50 }).map((_, i) => ({
    id: i,
    top: `${Math.random() * 100}%`,
    left: `${Math.random() * 100}%`,
    size: Math.random() * 3 + 1,
    delay: Math.random() * 5,
    duration: Math.random() * 10 + 10,
  }));

  return (
    <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
      {/* Background with radial gradient and animated particles */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0a1a2e] via-[#102542] to-[#0a1a2e] z-0" />
      <div className="absolute inset-0 z-0 opacity-30">
        {dots.map((dot) => (
          <motion.div
            key={dot.id}
            className="absolute rounded-full bg-[#D4AF37]"
            style={{
              top: dot.top,
              left: dot.left,
              width: dot.size,
              height: dot.size,
            }}
            animate={{
              y: [0, -100],
              opacity: [0, 0.8, 0],
            }}
            transition={{
              repeat: Infinity,
              duration: dot.duration,
              delay: dot.delay,
              ease: "linear",
            }}
          />
        ))}
      </div>

      <div className="container mx-auto px-6 md:px-12 relative z-10">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-8">
          
          {/* Left Content */}
          <motion.div 
            className="w-full lg:w-[60%] flex flex-col items-start pt-12 lg:pt-0"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#D4AF37]/40 bg-[#D4AF37]/10 mb-8 backdrop-blur-sm">
              <Award className="w-4 h-4 text-[#D4AF37]" />
              <span className="text-[#D4AF37] font-sans text-xs md:text-sm font-semibold tracking-wider uppercase">
                India's #1 Legal Platform
              </span>
            </motion.div>
            
            <motion.h1 variants={itemVariants} className="font-serif text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6">
              Justice Made <span className="gold-gradient-text">Simple.</span>
            </motion.h1>
            
            <motion.p variants={itemVariants} className="font-sans text-lg md:text-xl text-gray-300 font-light max-w-2xl mb-10 leading-relaxed">
              Professional Legal Assistance at Your Fingertips. Connect with top-tier advocates, schedule consultations instantly, and resolve your legal matters with confidence.
            </motion.p>
            
            <motion.div variants={itemVariants} className="flex flex-wrap items-center gap-4 mb-12">
              <button className="bg-[#D4AF37] hover:bg-[#c4a133] text-[#102542] font-sans text-base font-semibold px-8 py-4 rounded-xl transition-all duration-300 shadow-[0_4px_20px_rgba(212,175,55,0.3)] hover:shadow-[0_8px_25px_rgba(212,175,55,0.4)] transform hover:-translate-y-1">
                Find Lawyers
              </button>
              <button className="bg-transparent border border-white hover:bg-white/5 text-white font-sans text-base font-semibold px-8 py-4 rounded-xl transition-all duration-300 transform hover:-translate-y-1">
                Book Consultation
              </button>
              <button className="group flex items-center gap-2 text-white hover:text-[#D4AF37] font-sans text-base font-medium px-4 py-4 transition-colors">
                Become a Lawyer
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>
            </motion.div>
            
            <motion.div variants={itemVariants} className="flex flex-wrap items-center gap-6">
              <div className="flex items-center gap-2 bg-[#ffffff0a] backdrop-blur-md px-4 py-2 rounded-lg border border-white/10">
                <ShieldCheck className="w-5 h-5 text-[#D4AF37]" />
                <span className="font-sans text-sm text-gray-200">10,000+ Lawyers</span>
              </div>
              <div className="flex items-center gap-2 bg-[#ffffff0a] backdrop-blur-md px-4 py-2 rounded-lg border border-white/10">
                <Scale className="w-5 h-5 text-[#D4AF37]" />
                <span className="font-sans text-sm text-gray-200">1M+ Cases Solved</span>
              </div>
              <div className="flex items-center gap-2 bg-[#ffffff0a] backdrop-blur-md px-4 py-2 rounded-lg border border-white/10">
                <Star className="w-5 h-5 text-[#D4AF37]" fill="#D4AF37" />
                <span className="font-sans text-sm text-gray-200">4.8★ Rating</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Content - Abstract Illustration */}
          <motion.div 
            className="w-full lg:w-[40%] relative h-[500px] flex items-center justify-center hidden md:flex"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
          >
            <div className="relative w-full max-w-md aspect-square">
              {/* Back Card */}
              <motion.div 
                className="absolute top-10 right-0 w-[80%] aspect-[4/5] glass-card rounded-2xl p-6 border-white/5 opacity-40 rotate-[10deg] origin-bottom-right"
                animate={{ rotate: [10, 12, 10], y: [0, -10, 0] }}
                transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
              />
              
              {/* Middle Card */}
              <motion.div 
                className="absolute top-5 right-5 w-[85%] aspect-[4/5] glass-card rounded-2xl p-6 border-white/10 opacity-70 rotate-[5deg] origin-bottom-right"
                animate={{ rotate: [5, 6, 5], y: [0, -5, 0] }}
                transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay: 0.5 }}
              />
              
              {/* Front Card (Main) */}
              <motion.div 
                className="absolute top-0 right-10 w-[90%] bg-gradient-to-b from-white/10 to-white/5 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-2xl flex flex-col gap-6"
                animate={{ y: [0, -8, 0] }}
                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut", delay: 1 }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#D4AF37] to-[#8c7324] p-[2px]">
                      <div className="w-full h-full rounded-full bg-[#102542] flex items-center justify-center font-serif text-xl font-bold">
                        AM
                      </div>
                    </div>
                    <div>
                      <h3 className="font-serif text-xl font-semibold">Adv. Ananya Mehta</h3>
                      <p className="font-sans text-sm text-[#D4AF37]">Corporate Law</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 bg-white/10 px-2 py-1 rounded text-xs font-sans">
                    <Star className="w-3 h-3 text-[#D4AF37]" fill="#D4AF37" />
                    <span>4.9</span>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full w-[85%] bg-[#D4AF37]" />
                  </div>
                  <div className="h-2 w-3/4 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full w-[60%] bg-white/40" />
                  </div>
                  <div className="h-2 w-1/2 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full w-[40%] bg-white/20" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-2">
                  <div className="glass-card rounded-lg p-3 text-center">
                    <p className="text-xs text-gray-400 font-sans mb-1">Experience</p>
                    <p className="font-serif text-lg font-semibold text-[#D4AF37]">12 Yrs</p>
                  </div>
                  <div className="glass-card rounded-lg p-3 text-center">
                    <p className="text-xs text-gray-400 font-sans mb-1">Cases</p>
                    <p className="font-serif text-lg font-semibold text-[#D4AF37]">850+</p>
                  </div>
                </div>
                
                <button className="w-full py-3 rounded-lg bg-white/5 hover:bg-[#D4AF37] border border-[#D4AF37]/30 hover:border-[#D4AF37] text-white hover:text-[#102542] font-sans text-sm font-semibold transition-all duration-300 mt-2">
                  View Profile
                </button>
              </motion.div>
              
              {/* Floating Element */}
              <motion.div 
                className="absolute -bottom-6 -left-6 glass-card rounded-xl p-4 border border-[#D4AF37]/30 flex items-center gap-4 shadow-xl z-20"
                animate={{ y: [0, 10, 0] }}
                transition={{ repeat: Infinity, duration: 4.5, ease: "easeInOut" }}
              >
                <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
                </div>
                <div>
                  <p className="font-sans text-sm font-semibold">Available Now</p>
                  <p className="font-sans text-xs text-gray-400">Response in 5 mins</p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
      
      {/* Scroll Indicator */}
      <motion.div 
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 hidden md:flex"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
      >
        <span className="font-sans text-xs text-gray-400 uppercase tracking-widest">Scroll</span>
        <motion.div 
          className="w-[1px] h-12 bg-gradient-to-b from-[#D4AF37] to-transparent"
          animate={{ scaleY: [0, 1, 0], originY: [0, 0, 1] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
        />
      </motion.div>
    </section>
  );
};

// Also export Scale from Lucide for HeroSection if it wasn't
import { Scale as ScaleIcon } from 'lucide-react';
// Quick fix for the Scale icon usage above since we didn't import it at the top of HeroSection
const Scale = ScaleIcon;

export default HeroSection;