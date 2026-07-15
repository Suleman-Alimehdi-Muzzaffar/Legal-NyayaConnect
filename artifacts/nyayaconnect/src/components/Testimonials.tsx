import React from 'react';
import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';

const testimonials = [
  {
    name: 'Ramesh Desai',
    city: 'Mumbai',
    initials: 'RD',
    bg: 'bg-blue-900',
    scenario: 'Property Dispute',
    quote: 'I was struggling with a complex family property issue for years. NyayaConnect matched me with Adv. Sharma, and within 3 months, we had a clear resolution out of court. Professional, transparent, and highly effective.',
    rating: 5
  },
  {
    name: 'Sneha Patel',
    city: 'Ahmedabad',
    initials: 'SP',
    bg: 'bg-emerald-900',
    scenario: 'Startup Incorporation',
    quote: 'As a first-time founder, the legal compliance landscape was intimidating. Found a brilliant corporate lawyer here who handled everything from incorporation to founder agreements seamlessly. Worth every rupee.',
    rating: 5
  },
  {
    name: 'Karthik N.',
    city: 'Bangalore',
    initials: 'KN',
    bg: 'bg-purple-900',
    scenario: 'Employment Contract',
    quote: 'Needed an urgent review of a senior executive contract. Booked a consultation at 9 PM, had the call the next morning. The advocate caught clauses I completely missed. Exceptional platform.',
    rating: 4
  }
];

const Testimonials = () => {
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
            Real stories from citizens and businesses who found justice and clarity through our network.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
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
                    className={`w-4 h-4 ${i < testimonial.rating ? 'text-[#D4AF37]' : 'text-gray-600'}`} 
                    fill={i < testimonial.rating ? '#D4AF37' : 'none'} 
                  />
                ))}
              </div>
              
              <p className="font-sans text-gray-300 leading-relaxed mb-8 text-sm md:text-base italic">
                "{testimonial.quote}"
              </p>
              
              <div className="flex items-center justify-between mt-auto pt-6 border-t border-white/10">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-full ${testimonial.bg} flex items-center justify-center font-serif font-bold text-lg text-white`}>
                    {testimonial.initials}
                  </div>
                  <div>
                    <h4 className="font-serif font-semibold text-white">{testimonial.name}</h4>
                    <p className="font-sans text-xs text-gray-400">{testimonial.city}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="inline-block px-2 py-1 bg-[#D4AF37]/10 text-[#D4AF37] text-xs font-medium rounded font-sans">
                    {testimonial.scenario}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;