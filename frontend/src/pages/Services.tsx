import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck, FileText, IndianRupee } from 'lucide-react';
import { servicesData } from '../data/servicesData';
import ServiceIcon from '../components/ServiceIcon';

const Services = () => {

  return (
    <div className="min-h-screen bg-[#102542] text-white selection:bg-[#D4AF37] selection:text-[#102542] flex flex-col">
      <Navbar />
      <main className="flex-grow pt-32 pb-24">
        
        {/* Hero Section */}
        <section className="container mx-auto px-6 md:px-12 mb-20 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-serif text-5xl md:text-6xl font-bold mb-6"
          >
            Legal Services <span className="text-[#D4AF37]">Tailored for You</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="font-sans text-xl text-gray-300 max-w-3xl mx-auto"
          >
            Find specialized advocates for your unique legal requirements. Transparent fees, verified professionals, and secure consultations.
          </motion.p>
        </section>

        {/* Services Grid */}
        <section className="container mx-auto px-6 md:px-12 mb-24">
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={{
              hidden: {},
              show: { transition: { staggerChildren: 0.1 } }
            }}
          >
            {servicesData.map((service) => (
              <motion.div
                key={service.slug}
                variants={{
                  hidden: { opacity: 0, y: 30 },
                  show: { opacity: 1, y: 0 }
                }}
                className="glass-card rounded-2xl p-8 border border-[#D4AF37]/20 hover:border-[#D4AF37] hover:shadow-[0_0_30px_rgba(212,175,55,0.2)] transition-all duration-300 transform hover:scale-[1.02] flex flex-col h-full group"
              >
                <div className="mb-6 flex justify-between items-start">
                  <div className="w-20 h-20 bg-[#102542] rounded-xl border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37] shadow-inner group-hover:bg-[#D4AF37]/10 transition-colors">
                    <ServiceIcon type={service.svgType} />
                  </div>
                </div>
                
                <h3 className="font-serif text-2xl font-bold text-white mb-3 group-hover:text-[#D4AF37] transition-colors min-h-[4rem]">{service.name}</h3>
                <p className="font-sans text-gray-400 text-sm mb-6 line-clamp-2">{service.description}</p>
                
                <div className="bg-[#0a1a2e] rounded-xl p-4 mb-6 border border-white/5 flex-grow">
                  <h4 className="font-sans text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2 mb-3">
                    <FileText className="w-4 h-4 text-[#D4AF37]" /> Required Documents
                  </h4>
                  <ul className="text-gray-400 text-sm space-y-2">
                    {service.documents.map((doc, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-[#D4AF37] leading-snug">•</span>
                        <span className="flex-1">{doc}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex items-center gap-2 mb-4 text-sm font-sans">
                  <IndianRupee className="w-4 h-4 text-[#D4AF37]" />
                  <span className="text-gray-300">Est. Fee:</span>
                  <span className="text-white font-semibold">{service.fee}</span>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-[#D4AF37]/10 to-transparent border-l-2 border-[#D4AF37] mb-6">
                  <ShieldCheck className="w-5 h-5 text-[#D4AF37]" />
                  <div>
                    <div className="text-xs text-gray-400 font-sans">Recommended</div>
                    <div className="text-sm font-bold text-white">Browse Verified Advocates</div>
                  </div>
                </div>

                <Link 
                  to={`/services/${service.slug}`}
                  className="mt-auto w-full flex items-center justify-center gap-2 bg-white/5 hover:bg-[#D4AF37] text-white hover:text-[#102542] border border-[#D4AF37]/30 hover:border-[#D4AF37] font-sans font-semibold py-3 rounded-xl transition-all duration-300"
                >
                  Get Consultation <ArrowRight className="w-4 h-4" />
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* Custom Help CTA */}
        <section className="container mx-auto px-6 md:px-12">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-[#0a1a2e] to-[#102542] border border-[#D4AF37]/30 rounded-3xl p-10 md:p-16 text-center shadow-[0_0_40px_rgba(212,175,55,0.1)] relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#D4AF37]/10 blur-[100px] rounded-full pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#D4AF37]/10 blur-[100px] rounded-full pointer-events-none"></div>
            
            <h2 className="font-serif text-3xl md:text-5xl font-bold mb-4 relative z-10">Need Custom Legal Help?</h2>
            <p className="font-sans text-gray-300 max-w-2xl mx-auto mb-8 relative z-10">
              Not sure which category your case falls under? Talk to our legal advisors who will guide you to the right advocate for free.
            </p>
            <Link to="/contact" className="inline-block bg-[#D4AF37] hover:bg-[#c4a133] text-[#102542] font-sans text-lg font-bold px-10 py-4 rounded-xl transition-all duration-300 shadow-[0_4px_20px_rgba(212,175,55,0.3)] hover:-translate-y-1 relative z-10">
              Speak to an Advisor
            </Link>
          </motion.div>
        </section>

      </main>
      <Footer />
    </div>
  );
};

export default Services;
