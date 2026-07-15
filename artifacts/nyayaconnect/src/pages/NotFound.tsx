import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, MessageSquare } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-[#102542] text-white selection:bg-[#D4AF37] selection:text-[#102542] flex flex-col relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#D4AF37]/10 blur-[100px] rounded-full"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#D4AF37]/5 blur-[100px] rounded-full"></div>
        
        {/* Animated Particles */}
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-[#D4AF37]/40 rounded-full"
              initial={{
                x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000),
                y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 1000),
              }}
              animate={{
                y: [null, Math.random() * -100],
                opacity: [0, 1, 0]
              }}
              transition={{
                duration: 5 + Math.random() * 5,
                repeat: Infinity,
                ease: "linear",
                delay: Math.random() * 5
              }}
            />
          ))}
        </div>
      </div>

      <Navbar />
      
      <main className="flex-grow flex flex-col items-center justify-center pt-32 pb-24 relative z-10">
        <div className="container mx-auto px-6 md:px-12 text-center max-w-3xl">
          
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }} 
            animate={{ scale: 1, opacity: 1 }} 
            transition={{ type: "spring", stiffness: 100 }}
            className="mb-8"
          >
            {/* Broken Gavel SVG */}
            <svg viewBox="0 0 200 200" className="w-48 h-48 mx-auto" fill="none">
              <motion.g 
                animate={{ rotate: [-5, 5, -5] }} 
                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              >
                <path d="M70 130L30 170" stroke="#D4AF37" strokeWidth="12" strokeLinecap="round" />
                <path d="M60 120L110 70C115 65 125 65 130 70L150 90C155 95 155 105 150 110L100 160C95 165 85 165 80 160L60 140C55 135 55 125 60 120Z" fill="#D4AF37" stroke="#D4AF37" strokeWidth="4" />
                <path d="M120 60L160 20" stroke="white" strokeWidth="12" strokeLinecap="round" strokeDasharray="5,5" />
              </motion.g>
              {/* Crack */}
              <path d="M100 70L90 100L110 110L90 140" stroke="#102542" strokeWidth="4" />
            </svg>
          </motion.div>

          <motion.h1 
            initial={{ y: 20, opacity: 0 }} 
            animate={{ y: 0, opacity: 1 }} 
            transition={{ delay: 0.1 }}
            className="font-serif text-8xl md:text-9xl font-black mb-4 text-transparent bg-clip-text bg-gradient-to-b from-[#D4AF37] to-[#8a7224]"
          >
            404
          </motion.h1>
          
          <motion.h2 
            initial={{ y: 20, opacity: 0 }} 
            animate={{ y: 0, opacity: 1 }} 
            transition={{ delay: 0.2 }}
            className="font-serif text-3xl font-bold text-white mb-4"
          >
            Page Not Found
          </motion.h2>
          
          <motion.p 
            initial={{ y: 20, opacity: 0 }} 
            animate={{ y: 0, opacity: 1 }} 
            transition={{ delay: 0.3 }}
            className="font-sans text-xl text-gray-400 mb-10"
          >
            The legal document you're looking for seems to have gone missing or has been overruled.
          </motion.p>
          
          <motion.div 
            initial={{ y: 20, opacity: 0 }} 
            animate={{ y: 0, opacity: 1 }} 
            transition={{ delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-6"
          >
            <Link to="/" className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#D4AF37] hover:bg-[#c4a133] text-[#102542] font-sans font-bold px-8 py-4 rounded-xl transition-all hover:-translate-y-1 shadow-[0_4px_15px_rgba(212,175,55,0.3)]">
              Go Home <ArrowRight className="w-5 h-5" />
            </Link>
            <Link to="/contact" className="w-full sm:w-auto flex items-center justify-center gap-2 bg-transparent border-2 border-[#D4AF37]/50 hover:border-[#D4AF37] text-white hover:bg-[#D4AF37]/10 font-sans font-bold px-8 py-4 rounded-xl transition-all hover:-translate-y-1">
              <MessageSquare className="w-5 h-5" /> Contact Support
            </Link>
          </motion.div>
          
        </div>
      </main>
      
      <div className="relative z-10">
        <Footer />
      </div>
    </div>
  );
};

export default NotFound;