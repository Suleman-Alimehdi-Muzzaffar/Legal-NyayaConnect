import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { servicesData } from '../data/servicesData';
import ServiceIcon from './ServiceIcon';
import { useLanguage } from '@/lib/language-context';

const ServicesPreview = () => {
  const { t } = useLanguage();

  return (
    <section className="py-24 bg-[#102542]">
      <div className="container mx-auto px-6 md:px-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div className="max-w-2xl">
            <motion.h2
              className="font-serif text-3xl md:text-4xl font-bold mb-4"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              {t('services.title')} <span className="text-[#D4AF37]">{t('services.titleHighlight')}</span>
            </motion.h2>
            <motion.p
              className="font-sans text-gray-400"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              {t('services.subtitle')}
            </motion.p>
          </div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <Link
              to="/services"
              className="font-sans text-sm font-semibold text-[#D4AF37] hover:text-white border border-[#D4AF37] hover:bg-[#D4AF37] px-6 py-2.5 rounded-full transition-all duration-300 w-fit inline-flex items-center gap-2"
            >
              {t('services.viewAll')} <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>

        <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {servicesData.slice(0, 6).map((service, idx) => (
            <motion.div
              key={service.slug}
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: (idx % 3) * 0.05 }}
            >
              <Link
                to={`/services/${service.slug}`}
                className="glass-card rounded-xl p-5 md:p-6 group hover:bg-white/[0.08] border border-white/5 hover:border-[#D4AF37]/50 transition-all duration-300 cursor-pointer flex items-start gap-4 hover:-translate-y-1 block"
              >
                <div className="p-3 bg-[#102542] rounded-lg group-hover:bg-[#D4AF37] transition-colors duration-300 border border-[#D4AF37]/20 group-hover:border-transparent shrink-0">
                  <ServiceIcon type={service.svgType} className="w-9 h-9" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-semibold text-white group-hover:text-[#D4AF37] transition-colors mb-1">
                    {service.shortName}
                  </h3>
                  <p className="font-sans text-xs text-gray-400">{service.fee}</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default ServicesPreview;
