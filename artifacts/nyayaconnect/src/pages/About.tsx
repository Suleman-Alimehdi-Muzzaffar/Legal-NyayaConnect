import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { motion } from 'framer-motion';
import { Scale, Users, Shield, Award, Linkedin } from 'lucide-react';

const About = () => {
  const team = [
    { name: 'Arjun Mehta', role: 'CEO', initials: 'AM', color: 'from-blue-600 to-indigo-800' },
    { name: 'Priya Sharma', role: 'CTO', initials: 'PS', color: 'from-purple-600 to-fuchsia-800' },
    { name: 'Ravi Kumar', role: 'Head of Legal', initials: 'RK', color: 'from-emerald-600 to-teal-800' },
    { name: 'Nisha Gupta', role: 'Product Lead', initials: 'NG', color: 'from-orange-600 to-red-800' },
    { name: 'Vikram Singh', role: 'Head of Partnerships', initials: 'VS', color: 'from-cyan-600 to-blue-800' },
    { name: 'Ananya Bose', role: 'Customer Success', initials: 'AB', color: 'from-pink-600 to-rose-800' },
  ];

  const milestones = [
    { year: '2019', title: 'The Genesis', desc: 'NyayaConnect was founded with a vision to democratize legal access in India.' },
    { year: '2020', title: 'First 1,000 Lawyers', desc: 'Reached our first major milestone of verified advocates on the platform.' },
    { year: '2021', title: 'Nationwide Expansion', desc: 'Expanded services to over 100 cities across India.' },
    { year: '2022', title: 'Award Winning Platform', desc: 'Recognized as the best LegalTech startup by Startup India.' },
    { year: '2024', title: '1 Million Consultations', desc: 'Successfully facilitated over a million legal consultations.' },
  ];

  const stats = [
    { value: '10,000+', label: 'Verified Lawyers' },
    { value: '500+', label: 'Cities Covered' },
    { value: '1M+', label: 'Consultations' },
    { value: '4.8/5', label: 'Average Rating' },
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

        {/* Timeline Section */}
        <section className="container mx-auto px-6 md:px-12 mb-24">
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-center mb-16">Our Journey</h2>
          <div className="max-w-3xl mx-auto relative">
            <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-0.5 bg-[#D4AF37]/30 transform -translate-x-1/2"></div>
            {milestones.map((milestone, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className={`relative flex items-center justify-between mb-12 w-full ${index % 2 === 0 ? 'md:flex-row-reverse' : ''}`}
              >
                <div className="hidden md:block w-5/12"></div>
                <div className="absolute left-8 md:left-1/2 w-8 h-8 rounded-full bg-[#102542] border-4 border-[#D4AF37] transform -translate-x-1/2 z-10 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-[#D4AF37]"></div>
                </div>
                <div className="w-full pl-20 md:pl-0 md:w-5/12">
                  <div className={`glass-card p-6 rounded-2xl border border-[#D4AF37]/20 ${index % 2 === 0 ? 'md:text-left' : 'md:text-right'}`}>
                    <span className="inline-block px-3 py-1 bg-[#D4AF37]/10 text-[#D4AF37] text-sm font-bold rounded-full mb-3">{milestone.year}</span>
                    <h4 className="font-serif text-xl font-bold text-white mb-2">{milestone.title}</h4>
                    <p className="text-gray-400 font-sans text-sm">{milestone.desc}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Team Section */}
        <section className="container mx-auto px-6 md:px-12 mb-24">
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-center mb-16">Meet Our Team</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="glass-card rounded-2xl p-8 text-center group border border-[#D4AF37]/10 hover:border-[#D4AF37]/40 transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_0_30px_rgba(212,175,55,0.15)]"
              >
                <div className={`w-32 h-32 mx-auto rounded-full bg-gradient-to-br ${member.color} p-1 mb-6`}>
                  <div className="w-full h-full bg-[#102542] rounded-full flex items-center justify-center font-serif text-4xl font-bold text-white">
                    {member.initials}
                  </div>
                </div>
                <h3 className="font-serif text-2xl font-bold text-white mb-2">{member.name}</h3>
                <p className="text-[#D4AF37] font-sans font-medium mb-6">{member.role}</p>
                <a href="#" className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/5 hover:bg-[#D4AF37] hover:text-[#102542] text-gray-400 transition-colors">
                  <Linkedin className="w-5 h-5" />
                </a>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Trust Badges */}
        <section className="container mx-auto px-6 md:px-12 text-center">
          <h3 className="font-serif text-2xl font-bold text-white mb-8">Recognized & Trusted By</h3>
          <div className="flex flex-wrap justify-center gap-6 md:gap-12">
            {['Bar Council of India Partner', 'ISO 27001 Certified', 'DPDP Compliant', 'Startup India Recognized'].map((badge, i) => (
              <div key={i} className="flex items-center gap-3 px-6 py-3 glass-card rounded-full border border-white/10">
                <Award className="w-6 h-6 text-[#D4AF37]" />
                <span className="font-sans text-sm font-medium text-gray-300">{badge}</span>
              </div>
            ))}
          </div>
        </section>

      </main>
      <Footer />
    </div>
  );
};

export default About;
