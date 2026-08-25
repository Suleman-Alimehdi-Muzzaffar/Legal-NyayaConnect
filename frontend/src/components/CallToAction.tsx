import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const CallToAction = () => {
  return (
    <section className="relative py-24 overflow-hidden bg-[#0a1a2e]">
      {/* Decorative Background grid/glow */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-[#D4AF37]/20 blur-[120px] rounded-full pointer-events-none"></div>
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="glass-card rounded-3xl p-10 md:p-16 lg:p-20 text-center border border-[#D4AF37]/30 shadow-[0_0_50px_rgba(212,175,55,0.1)] relative overflow-hidden">
          {/* Inner subtle glow */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent"></div>
          
          <motion.h2 
            className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            Ready to Resolve Your <br className="hidden md:block" />
            <span className="gold-gradient-text">Legal Issues?</span>
          </motion.h2>
          
          <motion.p 
            className="font-sans text-lg md:text-xl text-gray-300 mb-10 max-w-2xl mx-auto font-light"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            Connect with India's best lawyers today. Professional guidance is just a click away.
          </motion.p>
          
          <motion.div 
            className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <Link to="/register/client" className="block w-full sm:w-auto bg-[#D4AF37] hover:bg-[#c4a133] text-[#102542] font-sans text-base lg:text-lg font-bold px-8 py-4 rounded-xl transition-all duration-300 shadow-[0_4px_20px_rgba(212,175,55,0.4)] hover:shadow-[0_8px_30px_rgba(212,175,55,0.6)] transform hover:-translate-y-1 text-center">
              Find a Lawyer Now
            </Link>
            <Link to="/services" className="block w-full sm:w-auto bg-transparent border border-white hover:bg-white/10 text-white font-sans text-base lg:text-lg font-semibold px-8 py-4 rounded-xl transition-all duration-300 transform hover:-translate-y-1 text-center">
              Learn More
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default CallToAction;