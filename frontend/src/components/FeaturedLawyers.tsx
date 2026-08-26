import React from 'react';
import { motion } from 'framer-motion';
import { Star, MapPin, Award, Shield, Loader2 } from 'lucide-react';

import { Link } from 'react-router-dom';
import { useListLawyers } from '@workspace/api-client-react';
import { avatarUrl } from '../lib/avatar';
import { useLanguage } from '@/lib/language-context';

const FeaturedLawyers = () => {
  const { t } = useLanguage();
  const { data: lawyers, isLoading } = useListLawyers();

  return (
    <section className="py-24 bg-[#102542] relative">
      <div className="container mx-auto px-6 md:px-12">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#D4AF37]/40 bg-[#D4AF37]/10 mb-6"
          >
            <Award className="w-4 h-4 text-[#D4AF37]" />
            <span className="text-[#D4AF37] font-sans text-xs font-semibold uppercase tracking-wider">{t('fl.badge')}</span>
          </motion.div>
          
          <motion.h2 
            className="font-serif text-3xl md:text-5xl font-bold mb-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            {t('fl.title')} <span className="text-[#D4AF37]">{t('fl.titleHighlight')}</span>
          </motion.h2>
          <motion.p 
            className="font-sans text-gray-400 max-w-2xl mx-auto text-lg"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            {t('fl.subtitle')}
          </motion.p>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <Loader2 className="w-10 h-10 text-[#D4AF37] animate-spin mb-4" />
            <p className="font-sans">{t('fl.loading')}</p>
          </div>
        ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {(lawyers ?? []).slice(0, 4).map((lawyer, index) => (
            <motion.div
              key={lawyer.slug}
              className="glass-card rounded-2xl p-6 group relative overflow-hidden flex flex-col"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-[#D4AF37] transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
              
              <div className="flex flex-col items-center text-center mb-6 pt-2">
                <div className="relative mb-4">
                  <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${lawyer.avatarGradient} flex items-center justify-center p-1`}>
                    <div className="w-full h-full rounded-full bg-[#102542] flex items-center justify-center font-serif text-2xl font-bold text-white shadow-inner">
                      {lawyer.avatar ? (
                        <img src={avatarUrl(lawyer.avatar)} alt={lawyer.name} className="w-full h-full rounded-full object-cover" />
                      ) : (
                        (lawyer.name ?? 'L').split(/\s+/).map((part) => part[0]).filter(Boolean).slice(0, 2).join('').toUpperCase() || 'L'
                      )}
                    </div>
                  </div>
                  <div className="absolute -bottom-2 right-0 bg-[#D4AF37] rounded-full p-1 border-2 border-[#102542]">
                    <Shield className="w-3 h-3 text-[#102542]" fill="#102542" />
                  </div>
                </div>
                
                <h3 className="font-serif text-xl font-bold text-white mb-1 group-hover:text-[#D4AF37] transition-colors">{lawyer.name}</h3>
                <span className="inline-block px-3 py-1 rounded-full bg-[#D4AF37]/10 text-[#D4AF37] text-xs font-semibold font-sans mb-3 border border-[#D4AF37]/20">
                  {lawyer.primarySpecialization}
                </span>
                
                <div className="flex items-center gap-1 text-gray-300 font-sans text-sm mb-1">
                  <MapPin className="w-3.5 h-3.5 text-gray-400" />
                  {lawyer.city}, {lawyer.state}
                </div>
                <div className="text-xs text-gray-500 font-sans">
                  {lawyer.courtRegistrations[0]}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-px bg-white/10 mb-6">
                <div className="bg-[#102542]/80 p-3 text-center">
                  <div className="text-xs text-gray-400 font-sans mb-1">{t('fl.experience')}</div>
                  <div className="font-serif font-bold text-white">{lawyer.experience} Yrs</div>
                </div>
                <div className="bg-[#102542]/80 p-3 text-center">
                  <div className="text-xs text-gray-400 font-sans mb-1">{t('fl.rating')}</div>
                  <div className="flex items-center justify-center gap-1 font-serif font-bold text-white">
                    {lawyer.rating} <Star className="w-3 h-3 text-[#D4AF37]" fill="#D4AF37" />
                  </div>
                </div>
              </div>

              <div className="mt-auto">
                <Link to="/register/client" className="block w-full bg-white/5 hover:bg-[#D4AF37] text-white hover:text-[#102542] border border-[#D4AF37]/30 hover:border-[#D4AF37] text-center font-sans font-semibold py-3 rounded-xl transition-all duration-300">
                  {t('fl.consultNow')}
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedLawyers;
