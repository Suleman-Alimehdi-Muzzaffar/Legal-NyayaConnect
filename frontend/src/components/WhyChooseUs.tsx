import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Zap, IndianRupee, BookOpen, Lock, Clock } from 'lucide-react';
import { useLanguage } from '@/lib/language-context';

const WhyChooseUs = () => {
  const { t } = useLanguage();

  const reasons = [
    {
      icon: Shield,
      title: t('wcu.verifiedLawyers'),
      description: t('wcu.verifiedLawyersDesc')
    },
    {
      icon: Zap,
      title: t('wcu.instantConsult'),
      description: t('wcu.instantConsultDesc')
    },
    {
      icon: IndianRupee,
      title: t('wcu.transparentPricing'),
      description: t('wcu.transparentPricingDesc')
    },
    {
      icon: BookOpen,
      title: t('wcu.allAreas'),
      description: t('wcu.allAreasDesc')
    },
    {
      icon: Lock,
      title: t('wcu.confidentiality'),
      description: t('wcu.confidentialityDesc')
    },
    {
      icon: Clock,
      title: t('wcu.support247'),
      description: t('wcu.support247Desc')
    }
  ];

  return (
    <section className="py-24 bg-[#0a1a2e] relative">
      <div className="container mx-auto px-6 md:px-12">
        <div className="text-center mb-16">
          <motion.h2 
            className="font-serif text-3xl md:text-5xl font-bold mb-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            {t('wcu.title')} <span className="text-[#D4AF37]">{t('wcu.titleHighlight')}</span>
          </motion.h2>
          <motion.p 
            className="font-sans text-gray-400 max-w-2xl mx-auto text-lg"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            {t('wcu.subtitle')}
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {reasons.map((reason, index) => {
            const Icon = reason.icon;
            return (
              <motion.div
                key={index}
                className="glass-card p-8 rounded-2xl group hover:scale-[1.02] transition-all duration-300 hover:border-[#D4AF37]/50 hover:shadow-[0_0_30px_rgba(212,175,55,0.15)] relative overflow-hidden"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-[#D4AF37]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl" />
                
                <div className="relative z-10">
                  <div className="w-14 h-14 rounded-xl bg-[#102542] border border-[#D4AF37]/30 flex items-center justify-center mb-6 group-hover:border-[#D4AF37] transition-colors">
                    <Icon className="w-7 h-7 text-[#D4AF37]" />
                  </div>
                  <h3 className="font-serif text-xl font-semibold mb-3 text-white group-hover:text-[#D4AF37] transition-colors">
                    {reason.title}
                  </h3>
                  <p className="font-sans text-sm text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors">
                    {reason.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
