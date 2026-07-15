import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useParams, Link } from 'react-router-dom';
import { servicesData } from '../data/servicesData';
import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle2, Calendar } from 'lucide-react';

const ServiceDetail = () => {
  const { slug } = useParams();
  const service = servicesData.find(s => s.slug === slug);

  if (!service) {
    return (
      <div className="min-h-screen bg-[#102542] text-white flex flex-col items-center justify-center">
        <h1 className="font-serif text-4xl text-[#D4AF37] mb-4">Service Not Found</h1>
        <Link to="/services" className="text-gray-300 hover:text-white underline">Back to Services</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#102542] text-white selection:bg-[#D4AF37] selection:text-[#102542] flex flex-col">
      <Navbar />
      <main className="flex-grow pt-32 pb-24">
        <div className="container mx-auto px-6 md:px-12">
          <Link to="/services" className="inline-flex items-center gap-2 text-gray-400 hover:text-[#D4AF37] mb-8 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to all services
          </Link>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
              <h1 className="font-serif text-4xl md:text-6xl font-bold mb-6 text-white">
                {service.name}
              </h1>
              <p className="font-sans text-xl text-gray-300 mb-8 leading-relaxed">
                {service.description}
              </p>
              
              <div className="glass-card p-8 rounded-2xl border border-[#D4AF37]/20 mb-8">
                <h3 className="font-serif text-2xl font-bold mb-4">Required Documents</h3>
                <ul className="space-y-3">
                  {service.documents.map((doc, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-[#D4AF37] shrink-0 mt-0.5" />
                      <span className="text-gray-300 font-sans">{doc}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
            
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
              <div className="bg-[#0a1a2e] p-8 rounded-3xl border border-[#D4AF37]/30 shadow-[0_0_30px_rgba(212,175,55,0.1)] sticky top-32">
                <h3 className="font-serif text-2xl font-bold mb-6 pb-4 border-b border-white/10">Book Consultation</h3>
                
                <div className="mb-6">
                  <p className="text-gray-400 font-sans text-sm mb-1">Estimated Fee</p>
                  <p className="text-2xl font-bold text-white">{service.fee}</p>
                </div>
                
                <div className="mb-8 p-4 rounded-xl bg-white/5 border border-[#D4AF37]/20">
                  <p className="text-gray-400 font-sans text-sm mb-2">Recommended Expert</p>
                  <p className="font-bold text-white">{service.lawyerName}</p>
                  <p className="text-[#D4AF37] text-sm">{service.lawyerSpec}</p>
                </div>
                
                <button className="w-full flex items-center justify-center gap-2 bg-[#D4AF37] hover:bg-[#c4a133] text-[#102542] font-sans font-bold py-4 rounded-xl transition-all duration-300 transform hover:-translate-y-1">
                  <Calendar className="w-5 h-5" /> Schedule Appointment
                </button>
                <p className="text-center text-gray-500 text-xs mt-4">100% Secure & Confidential</p>
              </div>
            </motion.div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ServiceDetail;
