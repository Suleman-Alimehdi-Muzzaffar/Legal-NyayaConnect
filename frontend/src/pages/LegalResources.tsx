import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { BookOpen, PlayCircle, FileText, Mail, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react';

const getYouTubeEmbedUrl = (url?: string): string => {
  if (!url) return '';
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([\w-]+)/);
  return match ? `https://www.youtube.com/embed/${match[1]}?autoplay=1` : url;
};

const LegalResources = () => {
  const [activeTab, setActiveTab] = useState('All');
  const [email, setEmail] = useState('');
  const [subscribeStatus, setSubscribeStatus] = useState<'idle' | 'subscribing' | 'done'>('idle');
  const [subscribeError, setSubscribeError] = useState('');
  const [playingSlug, setPlayingSlug] = useState<string | null>(null);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setSubscribeError('Please enter a valid email address.');
      return;
    }
    setSubscribeError('');
    setSubscribeStatus('subscribing');
    setTimeout(() => {
      setSubscribeStatus('done');
      localStorage.setItem('nyayaconnect.newsletter', trimmed);
    }, 700);
  };
  
  const tabs = ['All', 'Articles', 'Guides', 'Videos', 'News'];
  
  interface Resource {
    type: string;
    slug: string;
    title: string;
    desc: string;
    date: string;
    featured?: boolean;
    color: string;
    videoUrl?: string;
  }

  const resources: Resource[] = [
    { type: 'Guides', slug: 'know-your-rights', title: 'Know Your Rights — A Complete Guide for Indian Citizens', desc: 'Comprehensive handbook on fundamental rights and civic duties in India.', date: 'Jan 10, 2025', featured: true, color: 'from-blue-600/80 to-blue-900/80' },
    { type: 'Articles', slug: 'property-dispute-resolution', title: 'Understanding Property Dispute Resolution', desc: 'Step by step process to resolve inherited property disputes out of court.', date: 'Jan 12, 2025', color: 'from-emerald-600/80 to-emerald-900/80' },
    { type: 'Videos', slug: 'how-to-file-an-fir', title: 'How to file an FIR correctly', desc: 'Expert advocate explains the legal procedure for filing a First Information Report.', date: 'Jan 14, 2025', color: 'from-red-600/80 to-red-900/80', videoUrl: 'https://youtu.be/6qQGaztlkO0' },
    { type: 'News', slug: 'digital-privacy-ruling', title: 'Supreme Court ruling on digital privacy', desc: 'Impact of the new DPDP Act on consumer data protection.', date: 'Jan 15, 2025', color: 'from-cyan-600/80 to-cyan-900/80' },
    { type: 'Guides', slug: 'startup-incorporation-playbook', title: 'Startup Incorporation Playbook', desc: 'Legal checklist for founders incorporating a Pvt Ltd company.', date: 'Dec 28, 2024', color: 'from-orange-600/80 to-orange-900/80' },
    { type: 'Articles', slug: 'consumer-ecommerce-rights', title: 'Consumer Rights in E-commerce', desc: 'How to claim refunds and file cases against defective online products.', date: 'Dec 15, 2024', color: 'from-pink-600/80 to-pink-900/80' },
    { type: 'Videos', slug: 'family-court-procedures', title: 'Navigating Family Court Procedures', desc: 'A walkthrough of proceedings in matrimonial disputes.', date: 'Dec 10, 2024', color: 'from-yellow-600/80 to-yellow-900/80', videoUrl: 'https://youtu.be/NI5yjC7Wnv0' },
    { type: 'Articles', slug: 'cybercrime-first-24-hours', title: 'Cybercrime: Immediate actions to take', desc: 'First 24 hours checklist if you fall victim to financial cyber fraud.', date: 'Dec 05, 2024', color: 'from-teal-600/80 to-teal-900/80' },
    { type: 'News', slug: 'labour-code-amendments', title: 'New amendments in Labour Laws', desc: 'What employers need to know about the upcoming labour codes.', date: 'Nov 25, 2024', color: 'from-rose-600/80 to-rose-900/80' },
  ];

  const filteredResources = activeTab === 'All' ? resources : resources.filter(r => r.type === activeTab);
  const featuredResource = resources.find(r => r.featured);

  return (
    <div className="min-h-screen bg-[#102542] text-white selection:bg-[#D4AF37] selection:text-[#102542] flex flex-col">
      <Navbar />
      <main className="flex-grow pt-32 pb-24">
        
        {/* Hero */}
        <section className="container mx-auto px-6 md:px-12 mb-16">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-3xl mx-auto">
            <h1 className="font-serif text-4xl md:text-6xl font-bold mb-6">Legal <span className="text-[#D4AF37]">Resources & Guides</span></h1>
            <p className="font-sans text-xl text-gray-300">Empowering ordinary citizens with clear, jargon-free legal knowledge. Access our library of articles, videos, and guides.</p>
          </motion.div>
        </section>

        <div className="container mx-auto px-6 md:px-12">
          <div className="flex flex-col lg:flex-row gap-12">
            
            {/* Main Content */}
            <div className="lg:w-3/4">
              
              {/* Featured Card */}
              {activeTab === 'All' && featuredResource && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  className="mb-12 relative overflow-hidden rounded-3xl group"
                >
                  <div className={`absolute inset-0 bg-gradient-to-r ${featuredResource.color} mix-blend-multiply`}></div>
                  <div className="absolute inset-0 bg-black/40"></div>
                  <div className="relative z-10 p-10 md:p-16 border border-[#D4AF37]/30 rounded-3xl h-full flex flex-col justify-end min-h-[400px]">
                    <span className="inline-block px-4 py-1 bg-[#D4AF37] text-[#102542] text-xs font-bold uppercase tracking-wider rounded-full mb-6 w-fit">{featuredResource.type}</span>
                    <h2 className="font-serif text-3xl md:text-5xl font-bold text-white mb-4 leading-tight">{featuredResource.title}</h2>
                    <p className="font-sans text-lg text-gray-200 mb-8 max-w-2xl">{featuredResource.desc}</p>
                    <Link to="/legal-resources/know-your-rights" className="bg-white text-[#102542] hover:bg-[#D4AF37] font-sans font-bold px-8 py-3 rounded-xl transition-colors w-fit flex items-center gap-2">
                      <BookOpen className="w-5 h-5" /> Read Complete Guide
                    </Link>
                  </div>
                </motion.div>
              )}

              {/* Tabs */}
              <div className="flex overflow-x-auto hide-scrollbar gap-2 mb-10 pb-2">
                {tabs.map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`whitespace-nowrap px-6 py-2.5 rounded-full font-sans text-sm font-semibold transition-all ${
                      activeTab === tab ? 'bg-[#D4AF37] text-[#102542]' : 'bg-white/5 text-gray-300 hover:bg-white/10'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Grid */}
              <motion.div layout className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <AnimatePresence mode="popLayout">
                  {filteredResources.filter(r => !r.featured || activeTab !== 'All').map((resource, idx) => (
                    <motion.div
                      key={resource.title}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.3 }}
                      className="glass-card rounded-2xl overflow-hidden border border-[#D4AF37]/20 hover:border-[#D4AF37] transition-all group flex flex-col"
                    >
                      <div className={`h-40 w-full relative overflow-hidden ${playingSlug === resource.slug ? '' : `bg-gradient-to-br ${resource.color}`}`}>
                        {playingSlug === resource.slug ? (
                          <iframe
                            src={getYouTubeEmbedUrl(resource.videoUrl)}
                            title={resource.title}
                            className="w-full h-full"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            allowFullScreen
                          />
                        ) : (
                          <>
                            <div className="absolute inset-0 bg-[#102542]/20"></div>
                            {resource.type === 'Videos' ? (
                              <button
                                type="button"
                                onClick={() => setPlayingSlug(resource.slug)}
                                className="absolute inset-0 flex items-center justify-center"
                                aria-label={`Play ${resource.title}`}
                              >
                                <PlayCircle className="w-16 h-16 text-white/80 group-hover:scale-110 transition-transform" />
                              </button>
                            ) : (
                              <FileText className="w-16 h-16 text-white/80 absolute inset-0 m-auto" />
                            )}
                          </>
                        )}
                      </div>
                      <div className="p-6 flex flex-col flex-grow">
                        <div className="flex justify-between items-center mb-3">
                          <span className="text-[#D4AF37] text-xs font-bold uppercase tracking-wider">{resource.type}</span>
                          <span className="text-gray-500 text-xs">{resource.date}</span>
                        </div>
                        <h3 className="font-serif text-xl font-bold text-white mb-2 line-clamp-2 group-hover:text-[#D4AF37] transition-colors">{resource.title}</h3>
                        <p className="font-sans text-sm text-gray-400 mb-6 flex-grow line-clamp-2">{resource.desc}</p>
                        
                        <div className="mt-auto">
                          <Link to={`/legal-resources/resources/${resource.slug}`} className="flex items-center gap-2 text-white hover:text-[#D4AF37] text-sm font-semibold transition-colors">
                            Read Article <ArrowRight className="w-4 h-4" />
                          </Link>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            </div>

            {/* Sidebar */}
            <div className="lg:w-1/4 space-y-8">
              <div className="glass-card p-6 rounded-2xl border border-white/10">
                <h3 className="font-serif text-xl font-bold text-white mb-6 pb-4 border-b border-white/10">Browse Topics</h3>
                <ul className="space-y-4">
                  {[
                    { name: 'Constitutional Rights', slug: 'constitutional-rights' },
                    { name: 'Property Laws', slug: 'property-laws' },
                    { name: 'Consumer Protection', slug: 'consumer-protection' },
                    { name: 'Criminal Procedure', slug: 'criminal-procedure' },
                    { name: 'Family Law Basics', slug: 'family-law-basics' },
                    { name: 'Digital Rights', slug: 'digital-rights' },
                  ].map(topic => (
                    <li key={topic.slug}>
                      <Link to={`/legal-resources/topics/${topic.slug}`} className="font-sans text-gray-300 hover:text-[#D4AF37] flex items-center justify-between group transition-colors">
                        {topic.name} <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transform -translate-x-2 group-hover:translate-x-0 transition-all" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-gradient-to-b from-[#D4AF37]/20 to-transparent p-6 rounded-2xl border border-[#D4AF37]/30 text-center">
                <Mail className="w-10 h-10 text-[#D4AF37] mx-auto mb-4" />
                <h3 className="font-serif text-xl font-bold text-white mb-2">Stay Updated</h3>
                <p className="font-sans text-sm text-gray-300 mb-6">Get legal news and free templates delivered to your inbox.</p>

                {subscribeStatus === 'done' ? (
                  <div className="flex items-start gap-3 bg-emerald-500/10 border border-emerald-500/40 rounded-xl p-4 text-left">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                    <p className="font-sans text-sm text-emerald-300">
                      You're subscribed! Legal updates will be sent to <span className="font-bold">{email}</span>.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubscribe} className="text-left">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Your email address"
                      className="w-full bg-[#102542] border border-white/20 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#D4AF37] mb-2"
                    />
                    {subscribeError && <p className="text-red-400 text-xs mb-2">{subscribeError}</p>}
                    <button
                      type="submit"
                      disabled={subscribeStatus === 'subscribing'}
                      className="w-full bg-[#D4AF37] text-[#102542] font-bold py-3 rounded-xl hover:bg-[#c4a133] disabled:opacity-60 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                    >
                      {subscribeStatus === 'subscribing' ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" /> Subscribing...
                        </>
                      ) : (
                        'Subscribe'
                      )}
                    </button>
                  </form>
                )}
              </div>
            </div>

          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default LegalResources;