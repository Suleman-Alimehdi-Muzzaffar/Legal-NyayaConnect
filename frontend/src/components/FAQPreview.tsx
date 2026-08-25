import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus } from 'lucide-react';

const faqs = [
  {
    question: "How do I find the right lawyer for my specific case?",
    answer: "You can browse our directory by practice area, location, and language. We also offer a smart matching system—simply briefly describe your legal issue, and our algorithm will suggest the top 3 most qualified advocates near you."
  },
  {
    question: "Are the initial consultations completely free?",
    answer: "Yes, many advocates on NyayaConnect offer an introductory call. This allows you to explain your situation and evaluate if the lawyer is the right fit before committing to any paid services."
  },
  {
    question: "How are the lawyers verified on your platform?",
    answer: "Every advocate undergoes a rigorous 4-step verification process. We verify their Bar Council ID, check their active standing, validate their educational credentials, and require a minimum of 3 years of active court practice."
  },
  {
    question: "Can I get help for urgent legal matters?",
    answer: "Absolutely. We have a 'Priority Booking' feature for urgent matters such as bail hearings or immediate injunctions. Lawyers marked as 'Available Now' can connect with you within 15 minutes."
  },
  {
    question: "Is my personal information and case details kept confidential?",
    answer: "Yes. Client-attorney privilege applies from the moment you share details. Our platform uses end-to-end bank-grade encryption (AES-256) for all messages and document uploads. We never share your data with third parties."
  }
];

const FAQPreview = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-24 bg-[#102542]">
      <div className="container mx-auto px-6 md:px-12">
        <div className="flex flex-col lg:flex-row gap-16">
          <div className="w-full lg:w-1/3">
            <motion.h2 
              className="font-serif text-3xl md:text-5xl font-bold mb-6"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              Frequently Asked <span className="text-[#D4AF37]">Questions</span>
            </motion.h2>
            <motion.p 
              className="font-sans text-gray-400 text-lg mb-8"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              Everything you need to know about navigating the legal system with NyayaConnect.
            </motion.p>
            <motion.button 
              className="font-sans text-sm font-semibold text-white hover:text-[#D4AF37] transition-colors flex items-center gap-2 group"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              View Help Center
              <span className="w-6 h-[1px] bg-white group-hover:bg-[#D4AF37] transition-colors block"></span>
            </motion.button>
          </div>

          <div className="w-full lg:w-2/3">
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <motion.div 
                  key={index}
                  className="glass-card rounded-xl overflow-hidden border border-white/5"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <button
                    className="w-full px-6 py-5 flex items-center justify-between text-left focus:outline-none"
                    onClick={() => toggleFAQ(index)}
                  >
                    <span className={`font-serif text-lg font-semibold transition-colors ${openIndex === index ? 'text-[#D4AF37]' : 'text-white'}`}>
                      {faq.question}
                    </span>
                    <motion.div
                      animate={{ rotate: openIndex === index ? 45 : 0 }}
                      transition={{ duration: 0.2 }}
                      className={`flex-shrink-0 ml-4 w-8 h-8 rounded-full flex items-center justify-center ${openIndex === index ? 'bg-[#D4AF37]/20 text-[#D4AF37]' : 'bg-white/5 text-white'}`}
                    >
                      <Plus className="w-5 h-5" />
                    </motion.div>
                  </button>
                  
                  <AnimatePresence>
                    {openIndex === index && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                      >
                        <div className="px-6 pb-6 pt-0 font-sans text-gray-400 text-sm md:text-base leading-relaxed">
                          {faq.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQPreview;