import React, { useMemo, useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { motion, AnimatePresence } from 'framer-motion';
import { Star } from 'lucide-react';
import { useListLawyerReviews } from '@workspace/api-client-react';

const Testimonials = () => {
  const { data: reviews } = useListLawyerReviews();
  const allReviews = reviews ?? [];
  const [filter, setFilter] = useState('All');

  const filters = useMemo(() => {
    const types = Array.from(new Set(allReviews.map((r) => r.caseType).filter(Boolean)));
    return ['All', ...types];
  }, [allReviews]);

  const averageRating = useMemo(() => {
    if (allReviews.length === 0) return null;
    return allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
  }, [allReviews]);

  const filtered = filter === 'All' ? allReviews : allReviews.filter((r) => r.caseType === filter);

  return (
    <div className="min-h-screen bg-[#102542] text-white selection:bg-[#D4AF37] selection:text-[#102542] flex flex-col">
      <Navbar />
      <main className="flex-grow pt-32 pb-24">
        
        {/* Hero */}
        <section className="container mx-auto px-6 md:px-12 mb-16 text-center">
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="font-serif text-5xl md:text-7xl font-bold mb-8">
            Voices of <span className="text-[#D4AF37]">Trust</span>
          </motion.h1>

          {averageRating !== null && allReviews.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}
              className="inline-flex flex-wrap items-center justify-center gap-8 glass-card py-4 px-8 rounded-full border border-[#D4AF37]/30"
            >
              <div className="flex items-center gap-2"><Star className="w-5 h-5 text-[#D4AF37]" fill="#D4AF37" /><span className="font-bold font-serif text-xl">{averageRating.toFixed(1)}/5</span> <span className="text-gray-400 font-sans text-sm">Average Rating</span></div>
              <div className="w-px h-6 bg-white/20 hidden md:block"></div>
              <div className="font-bold font-serif text-xl">{allReviews.length} <span className="text-gray-400 font-sans text-sm font-normal">Reviews</span></div>
            </motion.div>
          )}
        </section>

        {/* Filters */}
        {filters.length > 1 && (
          <section className="container mx-auto px-6 md:px-12 mb-10">
            <div className="flex flex-wrap gap-3 justify-center">
              {filters.map((f) => (
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
        )}

        {/* Review Grid */}
        <section className="container mx-auto px-6 md:px-12 mb-20">
          {filtered.length === 0 ? (
            <div className="text-center py-16">
              <Star className="w-12 h-12 text-[#D4AF37] mx-auto mb-4 opacity-50" />
              <p className="font-sans text-gray-400 text-lg">No reviews yet. Check back soon — every review here is from a real client consultation.</p>
            </div>
          ) : (
            <motion.div layout className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
              <AnimatePresence>
                {filtered.map((review) => (
                  <motion.div
                    key={review.id}
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
                    <p className="font-sans text-gray-300 leading-relaxed mb-6 italic">"{review.comment}"</p>
                    <div className="flex justify-between items-end border-t border-white/10 pt-4">
                      <h4 className="font-serif font-bold text-white">{review.author}</h4>
                      {review.caseType && (
                        <span className="px-3 py-1 bg-[#D4AF37]/10 text-[#D4AF37] text-xs font-bold rounded-full">{review.caseType}</span>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </section>

      </main>
      <Footer />
    </div>
  );
};

export default Testimonials;