import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { AlertTriangle } from 'lucide-react';

const Disclaimer = () => {
  return (
    <div className="min-h-screen bg-[#102542] text-white selection:bg-[#D4AF37] selection:text-[#102542] flex flex-col">
      <Navbar />
      <main className="flex-grow pt-32 pb-24">
        <div className="container mx-auto px-6 md:px-12">
          
          <div className="mb-12 border-b border-[#D4AF37]/30 pb-8">
            <h1 className="font-serif text-5xl md:text-6xl font-bold mb-4">Legal <span className="text-[#D4AF37]">Disclaimer</span></h1>
          </div>

          <div className="bg-[#D4AF37]/10 border-l-4 border-[#D4AF37] p-6 rounded-r-xl mb-12 flex items-start gap-4">
            <AlertTriangle className="w-8 h-8 text-[#D4AF37] shrink-0" />
            <div>
              <h3 className="font-serif text-xl font-bold text-white mb-2">Important Notice</h3>
              <p className="font-sans text-gray-300">NyayaConnect is a platform to connect users with legal professionals. We do not provide legal advice directly. The information provided on this site is for general informational purposes only.</p>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-12 relative">
            
            <aside className="lg:w-1/4 hidden lg:block">
              <div className="sticky top-32 glass-card p-6 rounded-2xl border border-white/10">
                <h4 className="font-serif font-bold text-lg mb-4 text-[#D4AF37]">Table of Contents</h4>
                <ul className="space-y-3 font-sans text-sm text-gray-400">
                  <li><a href="#general" className="hover:text-white transition-colors">1. General Disclaimer</a></li>
                  <li><a href="#relationship" className="hover:text-white transition-colors">2. No Attorney-Client Relationship</a></li>
                  <li><a href="#accuracy" className="hover:text-white transition-colors">3. Accuracy of Information</a></li>
                  <li><a href="#third-party" className="hover:text-white transition-colors">4. Third-Party Content</a></li>
                  <li><a href="#liability" className="hover:text-white transition-colors">5. Limitation of Liability</a></li>
                  <li><a href="#professional" className="hover:text-white transition-colors">6. Professional Advice Notice</a></li>
                </ul>
              </div>
            </aside>

            <article className="lg:w-3/4 font-sans text-gray-300 leading-relaxed space-y-12">
              
              <section id="general" className="pl-6 border-l-2 border-[#D4AF37]">
                <h2 className="font-serif text-2xl font-bold text-white mb-4">1. General Disclaimer</h2>
                <p>The information contained on NyayaConnect (the "Platform") is provided for general informational purposes only and does not constitute legal advice. While we strive to keep the information up-to-date and correct, we make no representations or warranties of any kind about the completeness, accuracy, reliability, or availability of the information, products, or services contained on the Platform.</p>
              </section>

              <section id="relationship" className="pl-6 border-l-2 border-[#D4AF37]">
                <h2 className="font-serif text-2xl font-bold text-white mb-4">2. No Attorney-Client Relationship</h2>
                <p>Use of the Platform, including submitting queries or reading guides, does not create an attorney-client relationship between you and NyayaConnect. An attorney-client relationship is only formed when you explicitly hire and sign a retainer or agreement with an independent advocate listed on our platform.</p>
              </section>

              <section id="accuracy" className="pl-6 border-l-2 border-[#D4AF37]">
                <h2 className="font-serif text-2xl font-bold text-white mb-4">3. Accuracy of Information</h2>
                <p>Laws and regulations change frequently and vary significantly by jurisdiction. The legal articles, templates, and guides provided on this site may not reflect the most current legal developments. You should not act or refrain from acting on the basis of any content included in this site without seeking legal or other professional advice.</p>
              </section>

              <section id="third-party" className="pl-6 border-l-2 border-[#D4AF37]">
                <h2 className="font-serif text-2xl font-bold text-white mb-4">4. Third-Party Content</h2>
                <p>The Platform may contain links to third-party websites or content. Such links are provided for convenience only. NyayaConnect has no control over and assumes no responsibility for the content, privacy policies, or practices of any third-party sites or services.</p>
              </section>

              <section id="liability" className="pl-6 border-l-2 border-[#D4AF37]">
                <h2 className="font-serif text-2xl font-bold text-white mb-4">5. Limitation of Liability</h2>
                <p>NyayaConnect and its affiliates shall not be liable for any direct, indirect, incidental, consequential, or punitive damages arising out of your access to or use of the Platform, including any actions taken based on information obtained from the site.</p>
              </section>

              <section id="professional" className="pl-6 border-l-2 border-[#D4AF37]">
                <h2 className="font-serif text-2xl font-bold text-white mb-4">6. Professional Advice Notice</h2>
                <p>The templates provided are generic and should be tailored to your specific circumstances by a qualified professional. Do not use generic templates for complex legal matters without review by an independent advocate.</p>
              </section>

            </article>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Disclaimer;