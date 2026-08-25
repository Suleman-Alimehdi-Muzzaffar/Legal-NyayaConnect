import React from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { ArrowLeft, AlertTriangle, CheckCircle2, ArrowRight } from 'lucide-react';
import { getLegalTopic } from '../data/legalTopics';

const LegalTopic = () => {
  const { slug } = useParams<{ slug: string }>();
  const topic = slug ? getLegalTopic(slug) : undefined;

  if (!topic) {
    return (
      <div className="min-h-screen bg-[#102542] text-white selection:bg-[#D4AF37] selection:text-[#102542] flex flex-col">
        <Navbar />
        <main className="flex-grow pt-32 pb-24">
          <div className="container mx-auto px-6 md:px-12 text-center">
            <h1 className="font-serif text-4xl text-[#D4AF37] mb-4">Topic Not Found</h1>
            <Link to="/legal-resources" className="text-gray-300 hover:text-white underline font-sans">Back to all resources</Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#102542] text-white selection:bg-[#D4AF37] selection:text-[#102542] flex flex-col">
      <Navbar />
      <main className="flex-grow pt-32 pb-24">
        <div className="container mx-auto px-6 md:px-12">

          <div className="mb-12">
            <Link to="/legal-resources" className="inline-flex items-center gap-2 text-gray-400 hover:text-[#D4AF37] mb-8 transition-colors font-sans">
              <ArrowLeft className="w-4 h-4" /> Back to all resources
            </Link>
            <h1 className="font-serif text-4xl md:text-6xl font-bold mb-3 leading-tight">{topic.title}</h1>
            <p className="font-sans text-xl text-[#D4AF37] font-medium mb-6">{topic.tagline}</p>
            <p className="font-sans text-lg text-gray-300 max-w-3xl">{topic.intro}</p>
          </div>

          <div className="bg-[#D4AF37]/10 border-l-4 border-[#D4AF37] p-6 rounded-r-xl mb-12 flex items-start gap-4">
            <AlertTriangle className="w-8 h-8 text-[#D4AF37] shrink-0" />
            <div>
              <h3 className="font-serif text-xl font-bold text-white mb-2">Educational Information Only</h3>
              <p className="font-sans text-gray-300">This topic summary is for general education and is <span className="text-white font-semibold">not legal advice</span>. Laws change and vary by state — always consult a qualified advocate for your specific matter.</p>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-12 relative">

            <aside className="lg:w-1/4 hidden lg:block">
              <div className="sticky top-32 glass-card p-6 rounded-2xl border border-white/10">
                <h4 className="font-serif font-bold text-lg mb-4 text-[#D4AF37]">In this topic</h4>
                <ul className="space-y-3 font-sans text-sm text-gray-400">
                  {topic.sections.map((section, i) => (
                    <li key={section.heading}>
                      <a href={`#section-${i}`} className="hover:text-white transition-colors">{i + 1}. {section.heading}</a>
                    </li>
                  ))}
                </ul>
              </div>
            </aside>

            <article className="lg:w-3/4 font-sans text-gray-300 leading-relaxed space-y-12">
              {topic.sections.map((section, i) => (
                <section key={section.heading} id={`section-${i}`} className="pl-6 border-l-2 border-[#D4AF37]">
                  <h2 className="font-serif text-2xl md:text-3xl font-bold text-white mb-4">{i + 1}. {section.heading}</h2>
                  {section.body.map((para, j) => (
                    <p key={j} className={j > 0 ? 'mt-4' : ''}>{para}</p>
                  ))}
                  {section.bullets && (
                    <ul className="mt-4 space-y-2">
                      {section.bullets.map((bullet, j) => (
                        <li key={j} className="flex items-start gap-3">
                          <CheckCircle2 className="w-5 h-5 text-[#D4AF37] shrink-0 mt-0.5" />
                          <span>{bullet}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </section>
              ))}

              <section className="pl-6">
                <div className="bg-gradient-to-r from-[#0a1a2e] to-[#102542] border border-[#D4AF37]/30 rounded-3xl p-8 md:p-12 text-center shadow-[0_0_40px_rgba(212,175,55,0.1)]">
                  <h2 className="font-serif text-2xl md:text-4xl font-bold mb-4">Need help with a {topic.title.toLowerCase()} matter?</h2>
                  <p className="font-sans text-gray-300 max-w-2xl mx-auto mb-8">Connect with verified advocates who specialise in this area and get a consultation on your specific situation.</p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link to="/register/client" className="inline-flex items-center justify-center gap-2 bg-[#D4AF37] hover:bg-[#c4a133] text-[#102542] font-bold px-8 py-4 rounded-xl transition-all">
                      Get a Lawyer <ArrowRight className="w-5 h-5" />
                    </Link>
                    <Link to="/legal-resources/know-your-rights" className="inline-flex items-center justify-center bg-transparent border border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37]/10 font-semibold px-8 py-4 rounded-xl transition-all">
                      Read the Know Your Rights Guide
                    </Link>
                  </div>
                </div>
              </section>
            </article>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default LegalTopic;
