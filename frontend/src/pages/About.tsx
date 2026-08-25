import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { motion } from 'framer-motion';
import { Scale, Users, Shield } from 'lucide-react';
import { useListLawyers } from '@workspace/api-client-react';

const About = () => {
  const { data: lawyers } = useListLawyers();
  const lawyerCount = lawyers?.length ?? 0;
  const cityCount = lawyers ? new Set(lawyers.map((l) => l.city).filter(Boolean)).size : 0;
  const averageRating =
    lawyers && lawyers.length > 0
      ? lawyers.reduce((sum, l) => sum + (l.rating ?? 0), 0) / lawyers.length
      : null;

  const stats = [
    { value: `${lawyerCount}+`, label: 'Verified Lawyers' },
    { value: `${cityCount}+`, label: 'Cities Covered' },
    ...(averageRating !== null ? [{ value: `${averageRating.toFixed(1)}/5`, label: 'Average Rating' }] : []),
  ];

  return (
    <div className="min-h-screen bg-[#102542] text-white selection:bg-[#D4AF37] selection:text-[#102542] flex flex-col">
      <Navbar />
      <main className="flex-grow pt-32 pb-24">
        
        {/* Hero Section */}
        <section className="container mx-auto px-6 md:px-12 mb-24">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="text-center max-w-4xl mx-auto"
          >
            <h1 className="font-serif text-5xl md:text-7xl font-bold mb-8">
              Our <span className="text-[#D4AF37] relative inline-block">
                Story
                <span className="absolute -bottom-2 left-0 w-full h-1 bg-[#D4AF37]"></span>
              </span>
            </h1>
            <p className="font-sans text-xl text-gray-300 leading-relaxed mb-16">
              NyayaConnect is on a mission to democratize legal access in India. We believe that professional legal counsel should not be a privilege for the few, but a fundamental right for all. By bridging the gap between citizens and India's finest legal minds, we ensure justice is simple, transparent, and accessible.
            </p>
          </motion.div>

          {/* Vision & Values */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="glass-card p-8 rounded-2xl border border-[#D4AF37]/20 hover:border-[#D4AF37]/50 transition-colors"
            >
              <div className="w-14 h-14 bg-[#D4AF37]/10 rounded-xl flex items-center justify-center mb-6">
                <Scale className="w-8 h-8 text-[#D4AF37]" />
              </div>
              <h3 className="font-serif text-2xl font-bold mb-4">Our Vision</h3>
              <p className="text-gray-400 font-sans leading-relaxed">
                To become India's most trusted and accessible legal ecosystem, where anyone can find the right legal help within minutes.
              </p>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="glass-card p-8 rounded-2xl border border-[#D4AF37]/20 hover:border-[#D4AF37]/50 transition-colors"
            >
              <div className="w-14 h-14 bg-[#D4AF37]/10 rounded-xl flex items-center justify-center mb-6">
                <Users className="w-8 h-8 text-[#D4AF37]" />
              </div>
              <h3 className="font-serif text-2xl font-bold mb-4">Empowerment</h3>
              <p className="text-gray-400 font-sans leading-relaxed">
                Empowering individuals with knowledge and the right representation to fight for their rights confidently.
              </p>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="glass-card p-8 rounded-2xl border border-[#D4AF37]/20 hover:border-[#D4AF37]/50 transition-colors"
            >
              <div className="w-14 h-14 bg-[#D4AF37]/10 rounded-xl flex items-center justify-center mb-6">
                <Shield className="w-8 h-8 text-[#D4AF37]" />
              </div>
              <h3 className="font-serif text-2xl font-bold mb-4">Integrity</h3>
              <p className="text-gray-400 font-sans leading-relaxed">
                Upholding the highest standards of transparency, confidentiality, and professional ethics in every interaction.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Stats Section */}
        {lawyerCount > 0 && (
          <section className="bg-[#0a1a2e] py-20 border-y border-[#D4AF37]/20 mb-24">
            <div className="container mx-auto px-6 md:px-12">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                {stats.map((stat, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="text-center"
                  >
                    <div className="font-serif text-4xl md:text-5xl font-bold text-[#D4AF37] mb-2">{stat.value}</div>
                    <div className="font-sans text-gray-400 uppercase tracking-wider text-sm">{stat.label}</div>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        )}

      </main>
      <Footer />
    </div>
  );
};

export default About;