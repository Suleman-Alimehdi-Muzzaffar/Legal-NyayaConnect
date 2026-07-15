import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, X, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const faqsData = {
  General: [
    { q: "What is NyayaConnect?", a: "NyayaConnect is a premium legal tech platform that connects citizens with verified, top-tier advocates across India for transparent and secure legal consultations." },
    { q: "How do I sign up?", a: "Click on 'Register' in the top right corner, verify your phone number via OTP, and complete your basic profile to start booking consultations." },
    { q: "Is my data secure?", a: "Absolutely. We employ bank-level encryption and strictly adhere to DPDP regulations. Your case details are only visible to the lawyer you choose to consult." },
    { q: "Are the lawyers verified?", a: "Yes. Every lawyer undergoes a rigorous background check including Bar Council registration verification, experience validation, and peer reviews." },
    { q: "Can I use the service outside India?", a: "NRI services are available. You can consult our lawyers via video call for matters concerning Indian jurisdiction." }
  ],
  Lawyers: [
    { q: "How do I choose the right lawyer?", a: "Our platform matches you based on case category, location, and budget. You can also review lawyer profiles, ratings, and past client testimonials." },
    { q: "Can I change my lawyer later?", a: "Yes, you are free to change your counsel at any time. We can assist in smoothly transferring your case files if needed." },
    { q: "Do the lawyers speak regional languages?", a: "Yes, lawyer profiles list the languages they are fluent in. You can filter advocates based on your preferred language." },
    { q: "What if the lawyer doesn't respond?", a: "We guarantee a 24-hour response window for initial queries. If an advocate is unavailable, our support team will provide an alternate match immediately." },
    { q: "Can I rate a lawyer?", a: "Yes, after a completed consultation, you will be prompted to leave a rating and review which helps maintain quality on the platform." }
  ],
  Consultations: [
    { q: "Is the first consultation free?", a: "We offer an initial 15-minute exploratory call free of charge to help you understand if the lawyer is the right fit for your case." },
    { q: "How does video consultation work?", a: "Once booked, you'll receive a secure video link. At the scheduled time, join via our platform's encrypted video conferencing tool." },
    { q: "Can I share documents securely?", a: "Yes, our portal includes an encrypted document vault where you can upload case files for your lawyer to review before the meeting." },
    { q: "What happens if I miss my slot?", a: "You can reschedule up to 4 hours before the appointment. Missed appointments without notice may incur a cancellation fee." },
    { q: "Can I meet the lawyer in person?", a: "Yes, after initial digital consultations, you can schedule in-person meetings at the advocate's chamber." }
  ],
  Payments: [
    { q: "How are the fees decided?", a: "Fees are transparently displayed on the lawyer's profile. There are no hidden charges. Retainers are signed clearly before heavy work begins." },
    { q: "What payment methods are accepted?", a: "We accept UPI, Credit/Debit Cards, Net Banking, and select digital wallets through our secure payment gateway." },
    { q: "Do you offer refunds?", a: "Refunds are processed if a consultation is cancelled by the lawyer, or if you cancel within the permissible time frame per our policy." },
    { q: "Is there an EMI option for legal fees?", a: "For high-value cases, select advocates offer installment-based payment plans. This can be discussed during the consultation." },
    { q: "Will I get proper invoices?", a: "Yes, GST-compliant invoices are generated automatically and sent to your registered email after every payment." }
  ]
};

const FAQ = () => {
  const [activeCategory, setActiveCategory] = useState('General');
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-[#102542] text-white selection:bg-[#D4AF37] selection:text-[#102542] flex flex-col">
      <Navbar />
      <main className="flex-grow pt-32 pb-24">
        
        {/* Hero */}
        <section className="container mx-auto px-6 md:px-12 mb-16 text-center">
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="font-serif text-5xl md:text-7xl font-bold mb-8">
            Frequently Asked <span className="text-[#D4AF37]">Questions</span>
          </motion.h1>
          
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="max-w-2xl mx-auto relative">
            <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input 
              type="text" 
              placeholder="Search your question..." 
              className="w-full bg-[#0a1a2e] border border-[#D4AF37]/30 rounded-full py-4 pl-14 pr-6 text-white focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-all"
            />
          </motion.div>
        </section>

        <section className="container mx-auto px-6 md:px-12 max-w-4xl mb-24">
          {/* Categories */}
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {Object.keys(faqsData).map((cat) => (
              <button
                key={cat}
                onClick={() => { setActiveCategory(cat); setOpenIndex(null); }}
                className={`px-6 py-3 rounded-full font-sans text-sm font-bold transition-all ${
                  activeCategory === cat ? 'bg-[#D4AF37] text-[#102542]' : 'glass-card border border-white/10 text-gray-300 hover:border-[#D4AF37]/50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Accordion List */}
          <div className="space-y-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeCategory}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                {faqsData[activeCategory as keyof typeof faqsData].map((faq, idx) => (
                  <div key={idx} className="glass-card mb-4 rounded-2xl border border-white/10 overflow-hidden">
                    <button 
                      onClick={() => toggleAccordion(idx)}
                      className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-white/5 transition-colors"
                    >
                      <span className="font-sans font-medium text-lg text-white pr-8">{faq.q}</span>
                      <motion.div animate={{ rotate: openIndex === idx ? 45 : 0 }} className="shrink-0 text-[#D4AF37]">
                        <Plus className="w-5 h-5" />
                      </motion.div>
                    </button>
                    <AnimatePresence>
                      {openIndex === idx && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="px-6 pb-6 pt-0 text-gray-400 font-sans leading-relaxed border-t border-white/5 mt-2 pt-4">
                            {faq.a}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </motion.div>
            </AnimatePresence>
          </div>
        </section>

        {/* CTA */}
        <section className="container mx-auto px-6 md:px-12 text-center">
          <div className="glass-card max-w-2xl mx-auto p-10 rounded-3xl border border-[#D4AF37]/30">
            <h3 className="font-serif text-3xl font-bold mb-4">Still have questions?</h3>
            <p className="font-sans text-gray-400 mb-8">Our support team is available to help you navigate our platform and answer any specific queries.</p>
            <Link to="/contact" className="inline-flex items-center gap-2 bg-[#D4AF37] hover:bg-[#c4a133] text-[#102542] font-sans font-bold px-8 py-3 rounded-xl transition-all hover:-translate-y-1">
              Contact Support <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>

      </main>
      <Footer />
    </div>
  );
};

export default FAQ;