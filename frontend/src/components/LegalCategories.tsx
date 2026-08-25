import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, Building, Scale, Laptop, 
  ShoppingCart, Briefcase, Plane, Landmark, 
  FileText, Shield, FileSignature,
  Gavel
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useListLawyers } from '@workspace/api-client-react';

const PRACTICE_AREAS: { name: string; icon: LucideIcon }[] = [
  { name: 'Family Law', icon: Users },
  { name: 'Property Law', icon: Building },
  { name: 'Criminal Law', icon: Gavel },
  { name: 'Cyber Law', icon: Laptop },
  { name: 'Consumer Law', icon: ShoppingCart },
  { name: 'Corporate Law', icon: Briefcase },
  { name: 'Immigration Law', icon: Plane },
  { name: 'Banking Law', icon: Landmark },
  { name: 'Tax Law', icon: FileText },
  { name: 'Intellectual Property', icon: Shield },
  { name: 'Labour Law', icon: FileSignature },
  { name: 'Civil Law', icon: Scale },
];

const LegalCategories = () => {
  const { data: lawyers } = useListLawyers();
  const [showAll, setShowAll] = useState(false);

  const counts = React.useMemo(() => {
    const map = new Map<string, number>();
    for (const lawyer of lawyers ?? []) {
      map.set(
        lawyer.primarySpecialization,
        (map.get(lawyer.primarySpecialization) ?? 0) + 1
      );
    }
    return map;
  }, [lawyers]);

  const visibleCategories = showAll ? PRACTICE_AREAS : PRACTICE_AREAS.slice(0, 4);

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
        </div>

        <motion.div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          <AnimatePresence mode="popLayout">
          {visibleCategories.map((cat, idx) => {
            const Icon = cat.icon;
            const count = counts.get(cat.name) ?? 0;
            return (
              <motion.div 
                key={cat.name} 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: (idx % 4) * 0.05 }}
              >
                <Link
                  to="/find-lawyers"
                  className="glass-card rounded-xl p-5 md:p-6 group hover:bg-white/[0.08] border border-white/5 hover:border-[#D4AF37]/50 transition-all duration-300 cursor-pointer flex flex-col items-start gap-4 hover:-translate-y-1 block"
                >
                  <div className="p-3 bg-[#102542] rounded-lg group-hover:bg-[#D4AF37] transition-colors duration-300 border border-[#D4AF37]/20 group-hover:border-transparent">
                    <Icon className="w-6 h-6 text-[#D4AF37] group-hover:text-[#102542] transition-colors duration-300" />
                  </div>
                  <div>
                    <h3 className="font-serif text-base md:text-lg font-semibold text-white group-hover:text-[#D4AF37] transition-colors mb-1">
                      {cat.name}
                    </h3>
                    {count > 0 && (
                      <p className="font-sans text-xs text-gray-400">
                        {count.toLocaleString()} Lawyer{count === 1 ? '' : 's'}
                      </p>
                    )}
                  </div>
                </Link>
              </motion.div>
            );
          })}
          </AnimatePresence>
        </motion.div>

        <div className="flex justify-center mt-10">
          <button
            onClick={() => setShowAll(s => !s)}
            className="font-sans text-sm font-semibold text-[#D4AF37] hover:text-white border border-[#D4AF37] hover:bg-[#D4AF37] px-8 py-3 rounded-full transition-all duration-300"
          >
            {showAll ? 'Show Less' : 'Show More'}
          </button>
        </div>
      </div>
    </section>
  );
};

export default LegalCategories;