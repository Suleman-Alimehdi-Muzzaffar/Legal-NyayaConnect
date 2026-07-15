import React from 'react';
import { motion } from 'framer-motion';
import { 
  Users, Building, Scale, Laptop, 
  ShoppingCart, Briefcase, Plane, Landmark, 
  FileText, Shield, FileSignature, Book
} from 'lucide-react';

const categories = [
  { name: 'Family Law', icon: Users, count: 1240 },
  { name: 'Property Law', icon: Building, count: 1850 },
  { name: 'Criminal Law', icon: Scale, count: 2100 },
  { name: 'Cyber Law', icon: Laptop, count: 450 },
  { name: 'Consumer Law', icon: ShoppingCart, count: 980 },
  { name: 'Corporate Law', icon: Briefcase, count: 1560 },
  { name: 'Immigration Law', icon: Plane, count: 320 },
  { name: 'Banking Law', icon: Landmark, count: 740 },
  { name: 'Tax Law', icon: FileText, count: 890 },
  { name: 'Intellectual Property', icon: Shield, count: 520 },
  { name: 'Employment Law', icon: FileSignature, count: 670 },
  { name: 'Constitutional Law', icon: Book, count: 180 },
];

const LegalCategories = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.9, y: 20 },
    visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.4 } },
  };

  return (
    <section className="py-24 bg-[#0a1a2e]">
      <div className="container mx-auto px-6 md:px-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div className="max-w-2xl">
            <motion.h2 
              className="font-serif text-3xl md:text-4xl font-bold mb-4"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              Browse by <span className="text-[#D4AF37]">Practice Area</span>
            </motion.h2>
            <motion.p 
              className="font-sans text-gray-400"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              Find specialized advocates equipped to handle the specific nuances of your legal matter.
            </motion.p>
          </div>
          <motion.button 
            className="font-sans text-sm font-semibold text-[#D4AF37] hover:text-white border border-[#D4AF37] hover:bg-[#D4AF37] px-6 py-2.5 rounded-full transition-all duration-300 w-fit"
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            View All Categories
          </motion.button>
        </div>

        <motion.div 
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {categories.map((cat, idx) => {
            const Icon = cat.icon;
            return (
              <motion.div 
                key={idx} 
                variants={itemVariants}
                className="glass-card rounded-xl p-5 md:p-6 group hover:bg-white/[0.08] border border-white/5 hover:border-[#D4AF37]/50 transition-all duration-300 cursor-pointer flex flex-col items-start gap-4 hover:-translate-y-1"
              >
                <div className="p-3 bg-[#102542] rounded-lg group-hover:bg-[#D4AF37] transition-colors duration-300 border border-[#D4AF37]/20 group-hover:border-transparent">
                  <Icon className="w-6 h-6 text-[#D4AF37] group-hover:text-[#102542] transition-colors duration-300" />
                </div>
                <div>
                  <h3 className="font-serif text-base md:text-lg font-semibold text-white group-hover:text-[#D4AF37] transition-colors mb-1">
                    {cat.name}
                  </h3>
                  <p className="font-sans text-xs text-gray-400">
                    {cat.count.toLocaleString()} Lawyers
                  </p>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};

export default LegalCategories;