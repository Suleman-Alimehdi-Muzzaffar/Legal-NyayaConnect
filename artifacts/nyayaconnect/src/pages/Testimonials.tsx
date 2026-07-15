import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, ShieldCheck, Play } from 'lucide-react';

const Testimonials = () => {
  const [filter, setFilter] = useState('All');
  const filters = ['All', 'Property', 'Family', 'Criminal', 'Corporate', 'Cyber'];

  const testimonials = [
    { name: 'Sanjay Kapoor', city: 'Mumbai', type: 'Property', date: 'Dec 2024', rating: 5, text: 'I was struggling with an ancestral property dispute for years. NyayaConnect matched me with Adv. Rajesh who resolved the matter out of court within 6 months. Absolute lifesavers.', verified: true },
    { name: 'Meenakshi Iyer', city: 'Chennai', type: 'Family', date: 'Nov 2024', rating: 5, text: 'Navigating my divorce was emotionally draining. The lawyer I found here was not only legally brilliant but incredibly compassionate. Transparent billing, no hidden surprises.', verified: true },
    { name: 'Rohan Desai', city: 'Delhi', type: 'Corporate', date: 'Jan 2025', rating: 4, text: 'Used their platform to find counsel for my startup incorporation and IP filings. The process was seamless and the lawyer was extremely knowledgeable about the tech sector.', verified: true },
    { name: 'Anita Sharma', city: 'Pune', type: 'Cyber', date: 'Oct 2024', rating: 5, text: 'Fell victim to a financial phishing scam. NyayaConnect got me immediate legal assistance to freeze accounts and file the FIR correctly. We managed to recover most of the funds.', verified: true },
    { name: 'Karan Singh', city: 'Chandigarh', type: 'Criminal', date: 'Sep 2024', rating: 5, text: 'Got falsely implicated in a case. The criminal defense lawyer assigned to me was fierce, responsive, and got me bail on the first hearing itself. Highly recommend this platform.', verified: true },
    { name: 'Neha Gupta', city: 'Bangalore', type: 'Property', date: 'Aug 2024', rating: 4, text: 'Smooth process for title verification before I bought my first apartment. Saved me from investing in a disputed property. Very professional service.', verified: true },
    { name: 'Amit Verma', city: 'Hyderabad', type: 'Corporate', date: 'Jan 2025', rating: 5, text: 'Drafting vendor agreements was a headache until we found our corporate lawyer through NyayaConnect. Now they handle all our legal compliance on a retainer.', verified: true },
    { name: 'Priya Rajan', city: 'Kochi', type: 'Family', date: 'Jul 2024', rating: 5, text: 'Excellent support for child custody matters. The platform ensures you only talk to verified advocates who actually know the specific court procedures in your state.', verified: true },
    { name: 'Vikas Patel', city: 'Ahmedabad', type: 'Cyber', date: 'Jun 2024', rating: 5, text: 'Handled my online trademark infringement case perfectly. The lawyer issued takedown notices and got the fake website shut down within a week.', verified: true },
  ];

  const videos = [
    { name: 'Aditi M.', type: 'Family Dispute Resolution', color: 'from-purple-900 to-[#102542]' },
    { name: 'Rahul S.', type: 'Property Fraud Recovery', color: 'from-emerald-900 to-[#102542]' },
    { name: 'TechSolutions Pvt Ltd', type: 'Corporate Retainer', color: 'from-blue-900 to-[#102542]' }
  ];

  const filtered = filter === 'All' ? testimonials : testimonials.filter(t => t.type === filter);

  return (
    <div className="min-h-screen bg-[#102542] text-white selection:bg-[#D4AF37] selection:text-[#102542] flex flex-col">
      <Navbar />
      <main className="flex-grow pt-32 pb-24">
        
        {/* Hero */}
        <section className="container mx-auto px-6 md:px-12 mb-16 text-center">
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="font-serif text-5xl md:text-7xl font-bold mb-8">
            Voices of <span className="text-[#D4AF37]">Trust</span>
          </motion.h1>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}
            className="inline-flex flex-wrap items-center justify-center gap-8 glass-card py-4 px-8 rounded-full border border-[#D4AF37]/30"
          >
            <div className="flex items-center gap-2"><Star className="w-5 h-5 text-[#D4AF37]" fill="#D4AF37" /><span className="font-bold font-serif text-xl">4.8/5</span> <span className="text-gray-400 font-sans text-sm">Avg Rating</span></div>
            <div className="w-px h-6 bg-white/20 hidden md:block"></div>
            <div className="font-bold font-serif text-xl">10,000+ <span className="text-gray-400 font-sans text-sm font-normal">Reviews</span></div>
            <div className="w-px h-6 bg-white/20 hidden md:block"></div>
            <div className="font-bold font-serif text-xl">98% <span className="text-gray-400 font-sans text-sm font-normal">Satisfaction Rate</span></div>
          </motion.div>
        </section>

        {/* Video Stories */}
        <section className="container mx-auto px-6 md:px-12 mb-24">
          <h2 className="font-serif text-3xl font-bold mb-8">Video Stories</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {videos.map((vid, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className={`h-64 rounded-2xl relative overflow-hidden group cursor-pointer border border-white/10 hover:border-[#D4AF37]/50 transition-colors bg-gradient-to-b ${vid.color}`}
              >
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Play className="w-6 h-6 text-white ml-1" fill="white" />
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
                  <h3 className="font-serif font-bold text-lg text-white">{vid.name}</h3>
                  <p className="font-sans text-sm text-[#D4AF37]">{vid.type}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Filters */}
        <section className="container mx-auto px-6 md:px-12 mb-10">
          <div className="flex flex-wrap gap-3 justify-center">
            {filters.map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-6 py-2 rounded-full font-sans text-sm font-semibold transition-all ${
                  filter === f ? 'bg-[#D4AF37] text-[#102542]' : 'glass-card border border-white/10 text-gray-300 hover:border-[#D4AF37]/50'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </section>

        {/* Masonry Grid */}
        <section className="container mx-auto px-6 md:px-12 mb-20">
          <motion.div layout className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
            <AnimatePresence>
              {filtered.map((review, i) => (
                <motion.div
                  key={i}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                  className="glass-card p-8 rounded-2xl border border-white/10 hover:border-[#D4AF37]/40 transition-colors break-inside-avoid"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex gap-1">
                      {[...Array(review.rating)].map((_, idx) => <Star key={idx} className="w-4 h-4 text-[#D4AF37]" fill="#D4AF37" />)}
                    </div>
                    <span className="text-xs font-sans text-gray-500">{review.date}</span>
                  </div>
                  <p className="font-sans text-gray-300 leading-relaxed mb-6 italic">"{review.text}"</p>
                  <div className="flex justify-between items-end border-t border-white/10 pt-4">
                    <div>
                      <h4 className="font-serif font-bold text-white flex items-center gap-2">
                        {review.name} {review.verified && <ShieldCheck className="w-4 h-4 text-green-400" />}
                      </h4>
                      <p className="font-sans text-xs text-gray-400">{review.city}</p>
                    </div>
                    <span className="px-3 py-1 bg-[#D4AF37]/10 text-[#D4AF37] text-xs font-bold rounded-full">{review.type}</span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        </section>

        {/* Trust Seal */}
        <section className="container mx-auto px-6 md:px-12 text-center border-t border-white/10 pt-16">
          <ShieldCheck className="w-12 h-12 text-[#D4AF37] mx-auto mb-4 opacity-50" />
          <p className="font-sans text-gray-400 text-sm">All reviews are verified by the NyayaConnect Trust & Safety Team.<br/>Only genuine clients who have completed consultations can post reviews.</p>
        </section>

      </main>
      <Footer />
    </div>
  );
};

export default Testimonials;