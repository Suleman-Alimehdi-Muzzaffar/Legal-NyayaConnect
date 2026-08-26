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
import { useLanguage } from '@/lib/language-context';

const LegalCategories = () => {
  const { t } = useLanguage();
  const { data: lawyers } = useListLawyers();
  const [showAll, setShowAll] = useState(false);

  const PRACTICE_AREAS: { name: string; icon: LucideIcon; key: string }[] = [
    { name: t('lc.familyLaw'), icon: Users, key: 'lc.familyLaw' },
    { name: t('lc.propertyLaw'), icon: Building, key: 'lc.propertyLaw' },
    { name: t('lc.criminalLaw'), icon: Gavel, key: 'lc.criminalLaw' },
    { name: t('lc.cyberLaw'), icon: Laptop, key: 'lc.cyberLaw' },
    { name: t('lc.consumerLaw'), icon: ShoppingCart, key: 'lc.consumerLaw' },
    { name: t('lc.corporateLaw'), icon: Briefcase, key: 'lc.corporateLaw' },
    { name: t('lc.immigrationLaw'), icon: Plane, key: 'lc.immigrationLaw' },
    { name: t('lc.bankingLaw'), icon: Landmark, key: 'lc.bankingLaw' },
    { name: t('lc.taxLaw'), icon: FileText, key: 'lc.taxLaw' },
    { name: t('lc.intellectualProperty'), icon: Shield, key: 'lc.intellectualProperty' },
    { name: t('lc.labourLaw'), icon: FileSignature, key: 'lc.labourLaw' },
    { name: t('lc.civilLaw'), icon: Scale, key: 'lc.civilLaw' },
  ];

  const counts = React.useMemo(() => {
    const map = new Map<string, number>();
    const enNames: Record<string, string> = {
      'lc.familyLaw': 'Family Law',
      'lc.propertyLaw': 'Property Law',
      'lc.criminalLaw': 'Criminal Law',
      'lc.cyberLaw': 'Cyber Law',
      'lc.consumerLaw': 'Consumer Law',
      'lc.corporateLaw': 'Corporate Law',
      'lc.immigrationLaw': 'Immigration Law',
      'lc.bankingLaw': 'Banking Law',
      'lc.taxLaw': 'Tax Law',
      'lc.intellectualProperty': 'Intellectual Property',
      'lc.labourLaw': 'Labour Law',
      'lc.civilLaw': 'Civil Law',
    };
    for (const lawyer of lawyers ?? []) {
      const enName = enNames[lawyer.primarySpecialization] ?? lawyer.primarySpecialization;
      for (const cat of PRACTICE_AREAS) {
        if (enNames[cat.key] === enName || cat.name === lawyer.primarySpecialization) {
          map.set(cat.key, (map.get(cat.key) ?? 0) + 1);
        }
      }
    }
    return map;
  }, [lawyers, t]);

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
              {t('lc.title')} <span className="text-[#D4AF37]">{t('lc.titleHighlight')}</span>
            </motion.h2>
            <motion.p 
              className="font-sans text-gray-400"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              {t('lc.subtitle')}
            </motion.p>
          </div>
        </div>

        <motion.div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          <AnimatePresence mode="popLayout">
          {visibleCategories.map((cat, idx) => {
            const Icon = cat.icon;
            const count = counts.get(cat.key) ?? 0;
            return (
              <motion.div 
                key={cat.key} 
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
                        {count.toLocaleString()} {count === 1 ? t('lc.lawyer') : t('lc.lawyers')}
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
            {showAll ? t('lc.showLess') : t('lc.showMore')}
          </button>
        </div>
      </div>
    </section>
  );
};

export default LegalCategories;
