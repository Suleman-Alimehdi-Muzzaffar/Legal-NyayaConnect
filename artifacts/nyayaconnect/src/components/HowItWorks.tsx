import React from 'react';
import { motion } from 'framer-motion';
import { Search, PhoneCall, Scale } from 'lucide-react';

const steps = [
  {
    number: "01",
    icon: Search,
    title: 'Search & Compare',
    description: 'Browse thousands of verified lawyers by specialization, location, and transparent fee structures.'
  },
  {
    number: "02",
    icon: PhoneCall,
    title: 'Connect Instantly',
    description: 'Book a free 15-minute consultation directly through our platform. Secure and confidential.'
  },
  {
    number: "03",
    icon: Scale,
    title: 'Resolve Your Case',
    description: 'Get expert legal guidance, manage documents, and track progress all in one dashboard.'
  }
];

const HowItWorks = () => {
  return (
    <section className="py-24 bg-[#102542] relative border-t border-b border-[#D4AF37]/10">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-[0.03] z-0" style={{ backgroundImage: 'linear-gradient(#D4AF37 1px, transparent 1px), linear-gradient(90deg, #D4AF37 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      
      <div className="container mx-auto px-6 md:px-12 relative z-10">
        <div className="text-center mb-20">
          <motion.h2 
            className="font-serif text-3xl md:text-5xl font-bold mb-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            How It <span className="text-[#D4AF37]">Works</span>
          </motion.h2>
          <motion.div 
            className="w-24 h-1 bg-[#D4AF37] mx-auto rounded-full"
            initial={{ width: 0 }}
            whileInView={{ width: 96 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          />
        </div>

        <div className="relative">
          {/* Horizontal connecting line (desktop) */}
          <div className="hidden md:block absolute top-1/2 left-[10%] right-[10%] h-[1px] bg-gradient-to-r from-transparent via-[#D4AF37]/50 to-transparent -translate-y-1/2 z-0" />
          
          {/* Vertical connecting line (mobile) */}
          <div className="md:hidden absolute top-[10%] bottom-[10%] left-8 w-[1px] bg-gradient-to-b from-transparent via-[#D4AF37]/50 to-transparent z-0" />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-8">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <motion.div 
                  key={index}
                  className="relative flex flex-col items-center md:items-center text-left md:text-center z-10 group"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                >
                  <div className="flex md:flex-col items-center md:items-center gap-6 md:gap-0 w-full">
                    {/* Circle Badge */}
                    <div className="relative w-16 h-16 md:w-20 md:h-20 shrink-0 md:mb-8 rounded-full bg-[#0a1a2e] border-2 border-[#D4AF37] flex items-center justify-center shadow-[0_0_15px_rgba(212,175,55,0.2)] group-hover:scale-110 transition-transform duration-500">
                      <div className="absolute inset-0 rounded-full bg-[#D4AF37]/10 animate-ping opacity-20" />
                      <Icon className="w-8 h-8 md:w-10 md:h-10 text-[#D4AF37]" />
                      <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-[#D4AF37] text-[#102542] font-serif font-bold text-sm flex items-center justify-center">
                        {step.number}
                      </div>
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 md:w-full">
                      <h3 className="font-serif text-xl md:text-2xl font-bold mb-3">
                        {step.title}
                      </h3>
                      <p className="font-sans text-sm md:text-base text-gray-400 leading-relaxed max-w-xs mx-auto md:mx-auto">
                        {step.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;