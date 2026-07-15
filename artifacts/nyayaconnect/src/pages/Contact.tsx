import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { motion } from 'framer-motion';
import { MapPin, Mail, Phone, Clock, MessageSquare, Linkedin, Twitter, Facebook, Instagram, Youtube } from 'lucide-react';

const Contact = () => {
  return (
    <div className="min-h-screen bg-[#102542] text-white selection:bg-[#D4AF37] selection:text-[#102542] flex flex-col">
      <Navbar />
      <main className="flex-grow pt-32 pb-24">
        
        {/* Hero */}
        <section className="container mx-auto px-6 md:px-12 mb-16 text-center">
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="font-serif text-5xl md:text-7xl font-bold mb-6">
            Get In <span className="text-[#D4AF37]">Touch</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="font-sans text-xl text-gray-300 max-w-2xl mx-auto">
            Whether you need legal assistance or have a question about our platform, our team is here to help.
          </motion.p>
        </section>

        <section className="container mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24">
            
            {/* Left Column - Contact Info */}
            <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
              
              {/* Map Placeholder */}
              <div className="w-full h-64 bg-[#0a1a2e] rounded-2xl border border-[#D4AF37]/30 mb-10 relative overflow-hidden flex items-center justify-center group">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:20px_20px]"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-[#102542] to-transparent opacity-80"></div>
                <div className="relative z-10 flex flex-col items-center gap-3 text-[#D4AF37] transform group-hover:scale-110 transition-transform">
                  <MapPin className="w-10 h-10" />
                  <span className="font-sans font-bold tracking-widest uppercase text-sm">View on Google Maps</span>
                </div>
              </div>

              <div className="space-y-8 font-sans">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#D4AF37]/10 flex items-center justify-center shrink-0">
                    <MapPin className="w-6 h-6 text-[#D4AF37]" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-lg mb-1">Office Address</h4>
                    <p className="text-gray-400">NyayaConnect Legal Hub,<br/>14th Floor, Cyber City Tower,<br/>Gurugram, Haryana 122002</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#D4AF37]/10 flex items-center justify-center shrink-0">
                    <Mail className="w-6 h-6 text-[#D4AF37]" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-lg mb-1">Email Us</h4>
                    <p className="text-gray-400">support@nyayaconnect.in</p>
                    <p className="text-gray-400">legal@nyayaconnect.in</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#D4AF37]/10 flex items-center justify-center shrink-0">
                    <Phone className="w-6 h-6 text-[#D4AF37]" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-lg mb-1">Call Us</h4>
                    <p className="text-gray-400">+91 98765 43210</p>
                    <p className="text-gray-400">+91 11 4567 8900</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#D4AF37]/10 flex items-center justify-center shrink-0">
                    <Clock className="w-6 h-6 text-[#D4AF37]" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-lg mb-1">Working Hours</h4>
                    <p className="text-gray-400">Mon–Sat: 9:00 AM – 7:00 PM</p>
                    <div className="mt-2 bg-[#D4AF37]/10 border border-[#D4AF37]/30 px-4 py-2 rounded-lg inline-block">
                      <span className="text-[#D4AF37] font-bold text-sm">Emergency 24/7: 1800-XXX-XXXX (Toll Free)</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Right Column - Form */}
            <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
              <div className="glass-card p-8 md:p-10 rounded-3xl border border-[#D4AF37]/20 shadow-2xl">
                <h3 className="font-serif text-3xl font-bold mb-8 border-b border-white/10 pb-4">Send a Message</h3>
                
                <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block font-sans text-sm text-gray-300 mb-2">Full Name</label>
                      <input type="text" className="w-full bg-[#0a1a2e] border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#D4AF37] transition-colors" placeholder="John Doe" />
                    </div>
                    <div>
                      <label className="block font-sans text-sm text-gray-300 mb-2">Phone Number</label>
                      <input type="tel" className="w-full bg-[#0a1a2e] border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#D4AF37] transition-colors" placeholder="+91" />
                    </div>
                  </div>

                  <div>
                    <label className="block font-sans text-sm text-gray-300 mb-2">Email Address</label>
                    <input type="email" className="w-full bg-[#0a1a2e] border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#D4AF37] transition-colors" placeholder="john@example.com" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block font-sans text-sm text-gray-300 mb-2">Subject</label>
                      <select className="w-full bg-[#0a1a2e] border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#D4AF37] transition-colors appearance-none">
                        <option>General Enquiry</option>
                        <option>Legal Consultation</option>
                        <option>Lawyer Registration</option>
                        <option>Partnership</option>
                        <option>Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-sans text-sm text-gray-300 mb-2">Category (Optional)</label>
                      <select className="w-full bg-[#0a1a2e] border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#D4AF37] transition-colors appearance-none">
                        <option>Select Category...</option>
                        <option>Property Law</option>
                        <option>Criminal Defense</option>
                        <option>Family Law</option>
                        <option>Corporate Law</option>
                        <option>Cyber Crime</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block font-sans text-sm text-gray-300 mb-2">Message</label>
                    <textarea rows={4} className="w-full bg-[#0a1a2e] border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#D4AF37] transition-colors resize-none" placeholder="How can we help you?"></textarea>
                  </div>

                  <div>
                    <div className="border-2 border-dashed border-white/20 rounded-xl p-4 text-center hover:border-[#D4AF37] transition-colors cursor-pointer bg-[#0a1a2e]/50">
                      <span className="font-sans text-sm text-gray-400">Attach relevant documents (PDF, JPG — max 5MB)</span>
                    </div>
                  </div>

                  <button className="w-full bg-[#D4AF37] hover:bg-[#c4a133] text-[#102542] font-sans font-bold text-lg px-8 py-4 rounded-xl transition-all hover:-translate-y-1 shadow-[0_4px_15px_rgba(212,175,55,0.3)]">
                    Send Message
                  </button>
                  <p className="text-center text-xs text-gray-500 mt-4">Your information is protected under our Privacy Policy.</p>
                </form>
              </div>

              {/* Quick cards */}
              <div className="grid grid-cols-3 gap-4 mt-8">
                <div className="glass-card p-4 rounded-xl text-center border border-white/10">
                  <Mail className="w-5 h-5 text-[#D4AF37] mx-auto mb-2" />
                  <span className="text-xs text-gray-400 block font-sans">Email Response</span>
                  <span className="text-sm text-white font-bold block font-sans">Under 24 hrs</span>
                </div>
                <div className="glass-card p-4 rounded-xl text-center border border-white/10">
                  <Phone className="w-5 h-5 text-[#D4AF37] mx-auto mb-2" />
                  <span className="text-xs text-gray-400 block font-sans">Phone Support</span>
                  <span className="text-sm text-white font-bold block font-sans">Immediate</span>
                </div>
                <div className="glass-card p-4 rounded-xl text-center border border-white/10">
                  <MessageSquare className="w-5 h-5 text-[#D4AF37] mx-auto mb-2" />
                  <span className="text-xs text-gray-400 block font-sans">WhatsApp Chat</span>
                  <span className="text-sm text-white font-bold block font-sans">Available</span>
                </div>
              </div>
            </motion.div>

          </div>
        </section>

        {/* Social Row */}
        <section className="container mx-auto px-6 md:px-12 mt-24 text-center">
          <h4 className="font-serif text-2xl font-bold mb-8">Connect With Us</h4>
          <div className="flex justify-center gap-6">
            {[Linkedin, Twitter, Facebook, Instagram, Youtube].map((Icon, idx) => (
              <a key={idx} href="#" className="w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:bg-[#D4AF37] hover:text-[#102542] hover:border-[#D4AF37] transition-all transform hover:-translate-y-1">
                <Icon className="w-6 h-6" />
              </a>
            ))}
          </div>
        </section>

      </main>
      <Footer />
    </div>
  );
};

export default Contact;