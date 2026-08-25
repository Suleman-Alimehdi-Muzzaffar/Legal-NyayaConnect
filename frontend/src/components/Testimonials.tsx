import React from 'react';
import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';
import { useListLawyerReviews } from '@workspace/api-client-react';

const Testimonials = () => {
  const { data: reviews } = useListLawyerReviews();

  if (!reviews || reviews.length === 0) return null;

  return (
    <section className="py-24 bg-[#0a1a2e]">
      <div className="container mx-auto px-6 md:px-12">
        <div className="text-center mb-16">
          <motion.h2 
            className="font-serif text-3xl md:text-5xl font-bold mb-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            What Our <span className="text-[#D4AF37]">Clients Say</span>
          </motion.h2>
          <motion.p 
            className="font-sans text-gray-400 max-w-2xl mx-auto text-lg"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            Real reviews from clients who found justice and clarity through our network.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {reviews.slice(0, 3).map((review, index) => (
            <motion.div
              key={review.id}
              className="glass-card rounded-2xl p-8 relative"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Quote className="absolute top-6 right-6 w-10 h-10 text-white/5" />
              
              <div className="flex items-center gap-1 mb-6">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className={`w-4 h-4 ${i < (review.rating ?? 0) ? 'text-[#D4AF37]' : 'text-gray-600'}`} 
                    fill={i < (review.rating ?? 0) ? '#D4AF37' : 'none'} 
                  />
                ))}
              </div>
              
              <p className="font-sans text-gray-300 leading-relaxed mb-8 text-sm md:text-base italic">
                "{review.comment}"
              </p>
              
              <div className="flex items-center justify-between mt-auto pt-6 border-t border-white/10">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#D4AF37]/20 flex items-center justify-center font-serif font-bold text-lg text-[#D4AF37]">
                    {(review.author ?? 'C')
                      .split(/\s+/)
                      .map((part) => part[0])
                      .filter(Boolean)
                      .slice(0, 2)
                      .join('')
                      .toUpperCase() || 'C'}
                  </div>
                  <div>
                    <h4 className="font-serif font-semibold text-white">{review.author}</h4>
                    <p className="font-sans text-xs text-gray-400">{review.date}</p>
                  </div>
                </div>
                {review.caseType && (
                  <div className="text-right">
                    <span className="inline-block px-2 py-1 bg-[#D4AF37]/10 text-[#D4AF37] text-xs font-medium rounded font-sans">
                      {review.caseType}
                    </span>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;