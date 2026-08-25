import React, { useRef, useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { motion } from 'framer-motion';
import { MapPin, Mail, Phone, Clock, MessageSquare, Linkedin, Twitter, Facebook, Instagram, Youtube, Loader2, CheckCircle2, Upload, X, FileText, FileImage } from 'lucide-react';
import { useSubmitContact } from '@workspace/api-client-react';
import type { ContactInput } from '@workspace/api-client-react';

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const MAX_FILES = 5;

const OFFICE_ADDRESS_QUERY = 'NyayaConnect Legal Hub, Cyber City Tower, Gurugram, Haryana 122002';
const mapsEmbedUrl = `https://www.google.com/maps?q=${encodeURIComponent(OFFICE_ADDRESS_QUERY)}&output=embed`;
const mapsLinkUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(OFFICE_ADDRESS_QUERY)}`;

const Contact = () => {
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: 'General Enquiry', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [attachmentError, setAttachmentError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const submitContact = useSubmitContact();

  const setField = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setAttachmentError(null);

    const newFiles: File[] = [];
    for (const file of Array.from(files)) {
      const isPdf = file.type === 'application/pdf';
      const isJpg = file.type === 'image/jpeg';
      if (!isPdf && !isJpg) {
        setAttachmentError('Only PDF and JPG files are allowed.');
        continue;
      }
      if (file.size > MAX_FILE_SIZE) {
        setAttachmentError(`"${file.name}" exceeds the 5MB limit.`);
        continue;
      }
      newFiles.push(file);
    }

    if (attachments.length + newFiles.length > MAX_FILES) {
      setAttachmentError(`You can attach up to ${MAX_FILES} files.`);
      return;
    }

    setAttachments((prev) => [...prev, ...newFiles]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
    setAttachmentError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload: ContactInput = {
      name: form.name,
      email: form.email,
      phone: form.phone || undefined,
      subject: form.subject,
      message: form.message,
    };
    submitContact.mutate(
      {
        data: payload,
      },
      {
        onSuccess: () => {
          setSubmitted(true);
          setAttachments([]);
          setAttachmentError(null);
          setForm({ name: '', email: '', phone: '', subject: 'General Enquiry', message: '' });
        },
      }
    );
  };

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
              
              {/* Map */}
              <div className="w-full h-64 bg-[#0a1a2e] rounded-2xl border border-[#D4AF37]/30 mb-10 relative overflow-hidden">
                <iframe
                  src={mapsEmbedUrl}
                  title="NyayaConnect office location on Google Maps"
                  className="w-full h-full border-0 opacity-90 hover:opacity-100 transition-opacity"
                  style={{ filter: 'invert(0.92) hue-rotate(180deg) contrast(0.9)' }}
                  loading="lazy"
                  allowFullScreen
                  referrerPolicy="no-referrer-when-downgrade"
                />
                <a
                  href={mapsLinkUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 inline-flex items-center gap-2 bg-[#102542]/90 hover:bg-[#D4AF37] hover:text-[#102542] hover:border-transparent border border-[#D4AF37]/50 text-[#D4AF37] font-sans font-bold tracking-widest uppercase text-xs px-5 py-2.5 rounded-full backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 shadow-lg shadow-black/30 whitespace-nowrap"
                >
                  <MapPin className="w-4 h-4" />
                  View on Google Maps
                </a>
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

                {submitted && (
                  <div className="mb-6 flex items-start gap-3 bg-emerald-500/10 border border-emerald-500/40 rounded-xl p-4">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                    <p className="font-sans text-sm text-emerald-300">
                      Thank you! Your message has been sent. Our team will get back to you within 24 hours.
                    </p>
                  </div>
                )}

                {submitContact.error && (
                  <div className="mb-6 flex items-start gap-3 bg-red-500/10 border border-red-500/40 rounded-xl p-4">
                    <MessageSquare className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                    <p className="font-sans text-sm text-red-300">
                      Something went wrong while sending your message. Please try again.
                    </p>
                  </div>
                )}

                <form className="space-y-6" onSubmit={handleSubmit}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block font-sans text-sm text-gray-300 mb-2">Full Name</label>
                      <input type="text" required value={form.name} onChange={setField('name')} className="w-full bg-[#0a1a2e] border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#D4AF37] transition-colors" placeholder="John Doe" />
                    </div>
                    <div>
                      <label className="block font-sans text-sm text-gray-300 mb-2">Phone Number</label>
                      <input type="tel" value={form.phone} onChange={setField('phone')} className="w-full bg-[#0a1a2e] border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#D4AF37] transition-colors" placeholder="+91" />
                    </div>
                  </div>

                  <div>
                    <label className="block font-sans text-sm text-gray-300 mb-2">Email Address</label>
                    <input type="email" required value={form.email} onChange={setField('email')} className="w-full bg-[#0a1a2e] border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#D4AF37] transition-colors" placeholder="john@example.com" />
                  </div>

                  <div>
                    <label className="block font-sans text-sm text-gray-300 mb-2">Subject</label>
                    <select value={form.subject} onChange={setField('subject')} className="w-full bg-[#0a1a2e] border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#D4AF37] transition-colors appearance-none">
                      <option>General Enquiry</option>
                      <option>Legal Consultation</option>
                      <option>Lawyer Registration</option>
                      <option>Partnership</option>
                      <option>Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-sans text-sm text-gray-300 mb-2">Message</label>
                    <textarea rows={4} required value={form.message} onChange={setField('message')} className="w-full bg-[#0a1a2e] border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#D4AF37] transition-colors resize-none" placeholder="How can we help you?"></textarea>
                  </div>

                  <div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,.jpg,.jpeg"
                      multiple
                      className="hidden"
                      onChange={(e) => handleFiles(e.target.files)}
                    />
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-white/20 rounded-xl p-4 text-center hover:border-[#D4AF37] transition-colors cursor-pointer bg-[#0a1a2e]/50"
                    >
                      <Upload className="w-6 h-6 text-[#D4AF37] mx-auto mb-2" />
                      <span className="font-sans text-sm text-gray-400">Click to attach relevant documents (PDF, JPG — max 5MB each, up to {MAX_FILES} files)</span>
                    </div>
                    {attachmentError && (
                      <p className="font-sans text-xs text-red-400 mt-2">{attachmentError}</p>
                    )}
                    {attachments.length > 0 && (
                      <ul className="mt-3 flex flex-col gap-2">
                        {attachments.map((file, idx) => {
                          const Icon = file.type === 'application/pdf' ? FileText : FileImage;
                          return (
                            <li key={`${file.name}-${idx}`} className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-lg px-3 py-2">
                              <Icon className="w-4 h-4 text-[#D4AF37] shrink-0" />
                              <span className="font-sans text-sm text-gray-300 truncate flex-1">{file.name}</span>
                              <span className="font-sans text-xs text-gray-500 shrink-0">{(file.size / (1024 * 1024)).toFixed(2)} MB</span>
                              <button
                                type="button"
                                onClick={() => removeAttachment(idx)}
                                className="text-gray-400 hover:text-red-400 transition-colors shrink-0"
                                aria-label={`Remove ${file.name}`}
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>

                  <button type="submit" disabled={submitContact.isPending} className="w-full bg-[#D4AF37] hover:bg-[#c4a133] disabled:opacity-60 disabled:hover:bg-[#D4AF37] disabled:cursor-not-allowed text-[#102542] font-sans font-bold text-lg px-8 py-4 rounded-xl transition-all hover:-translate-y-1 shadow-[0_4px_15px_rgba(212,175,55,0.3)] flex items-center justify-center gap-2">
                    {submitContact.isPending ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" /> Sending...
                      </>
                    ) : (
                      'Send Message'
                    )}
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
            {[
              { Icon: Linkedin, href: 'https://linkedin.com', label: 'LinkedIn' },
              { Icon: Twitter, href: 'https://twitter.com', label: 'Twitter' },
              { Icon: Facebook, href: 'https://facebook.com', label: 'Facebook' },
              { Icon: Instagram, href: 'https://instagram.com', label: 'Instagram' },
              { Icon: Youtube, href: 'https://youtube.com', label: 'YouTube' },
            ].map(({ Icon, href, label }) => (
              <a key={label} href={href} target="_blank" rel="noreferrer" aria-label={label} className="w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:bg-[#D4AF37] hover:text-[#102542] hover:border-[#D4AF37] transition-all transform hover:-translate-y-1">
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