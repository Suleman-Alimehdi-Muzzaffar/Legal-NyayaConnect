import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-[#102542] text-white selection:bg-[#D4AF37] selection:text-[#102542] flex flex-col">
      <Navbar />
      <main className="flex-grow pt-32 pb-24">
        <div className="container mx-auto px-6 md:px-12">
          
          <div className="mb-12 border-b border-[#D4AF37]/30 pb-8">
            <h1 className="font-serif text-5xl md:text-6xl font-bold mb-4">Privacy <span className="text-[#D4AF37]">Policy</span></h1>
            <span className="inline-block px-4 py-1.5 bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/30 rounded-full font-sans text-sm font-semibold">
              Last updated: August 23, 2026
            </span>
            <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 bg-green-500/10 border border-green-500/20 rounded-full text-xs text-green-300">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" /> Legal references updated for BNS/BNSS/BSA (w.e.f. 1 July 2024)
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-12 relative">
            
            {/* Sidebar Navigation */}
            <aside className="lg:w-1/4 hidden lg:block">
              <div className="sticky top-32 glass-card p-6 rounded-2xl border border-white/10">
                <h4 className="font-serif font-bold text-lg mb-4 text-[#D4AF37]">Table of Contents</h4>
                <ul className="space-y-3 font-sans text-sm text-gray-400">
                  <li><a href="#intro" className="hover:text-white transition-colors">1. Introduction</a></li>
                  <li><a href="#data-collection" className="hover:text-white transition-colors">2. Data Collection</a></li>
                  <li><a href="#usage" className="hover:text-white transition-colors">3. How We Use Data</a></li>
                  <li><a href="#sharing" className="hover:text-white transition-colors">4. Data Sharing</a></li>
                  <li><a href="#cookies" className="hover:text-white transition-colors">5. Cookies</a></li>
                  <li><a href="#rights" className="hover:text-white transition-colors">6. Your Rights</a></li>
                  <li><a href="#retention" className="hover:text-white transition-colors">7. Data Retention</a></li>
                  <li><a href="#security" className="hover:text-white transition-colors">8. Security</a></li>
                  <li><a href="#children" className="hover:text-white transition-colors">9. Children's Privacy</a></li>
                  <li><a href="#changes" className="hover:text-white transition-colors">10. Changes to Policy</a></li>
                  <li><a href="#contact" className="hover:text-white transition-colors">11. Contact DPO</a></li>
                </ul>
              </div>
            </aside>

            {/* Content */}
            <article className="lg:w-3/4 font-sans text-gray-300 leading-relaxed space-y-12">
              
              <section id="intro" className="pl-6 border-l-2 border-[#D4AF37]">
                <h2 className="font-serif text-2xl font-bold text-white mb-4">1. Introduction</h2>
                <p>NyayaConnect ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website or use our legal connectivity platform. Please read this privacy policy carefully. If you do not agree with the terms of this privacy policy, please do not access the site.</p>
                <p className="mt-3 text-sm bg-white/5 border border-white/10 rounded-lg p-3"><strong className="text-[#D4AF37]">Legal Update:</strong> All criminal references now cite Bharatiya Nyaya Sanhita (BNS), Bharatiya Nagarik Suraksha Sanhita (BNSS) and Bharatiya Sakshya Adhiniyam (BSA) effective 1 July 2024. Where you see IPC/CrPC/Evidence Act, read as BNS/BNSS/BSA respectively (e.g. IPC 302 → BNS 103, CrPC 438 → BNSS 482).</p>
              </section>

              <section id="data-collection" className="pl-6 border-l-2 border-[#D4AF37]">
                <h2 className="font-serif text-2xl font-bold text-white mb-4">2. Data Collection</h2>
                <p className="mb-3">We may collect information about you in a variety of ways. The information we may collect includes:</p>
                <ul className="list-disc ml-6 space-y-2">
                  <li><strong>Personal Data:</strong> Personally identifiable information, such as your name, email address, phone number, and demographic information that you voluntarily give to us when you register.</li>
                  <li><strong>Case Details:</strong> Documents, briefs, and notes you share securely on the platform for consultation purposes.</li>
                  <li><strong>Derivative Data:</strong> Information our servers automatically collect when you access the site, such as your IP address, browser type, and access times.</li>
                  <li><strong>Financial Data:</strong> Data related to your payment method (e.g., valid credit card number, card brand, expiration date) processed via our secure payment gateway.</li>
                </ul>
              </section>

              <section id="usage" className="pl-6 border-l-2 border-[#D4AF37]">
                <h2 className="font-serif text-2xl font-bold text-white mb-4">3. How We Use Data</h2>
                <p className="mb-3">Having accurate information about you permits us to provide you with a smooth, efficient, and customized experience. Specifically, we may use information collected about you to:</p>
                <ul className="list-disc ml-6 space-y-2">
                  <li>Create and manage your account.</li>
                  <li>Match you with appropriate legal professionals based on your case requirements.</li>
                  <li>Process payments and refunds.</li>
                  <li>Email you regarding your account or appointments.</li>
                  <li>Fulfill and manage interactions with advocates.</li>
                </ul>
              </section>

              <section id="sharing" className="pl-6 border-l-2 border-[#D4AF37]">
                <h2 className="font-serif text-2xl font-bold text-white mb-4">4. Data Sharing</h2>
                <p>We only share your case details and personal data with the specific lawyer you choose to consult. We do not sell, rent, or trade your personal information to third parties. We may disclose your data if required by law, subpoena, or other legal processes, or to protect the rights, property, and safety of others.</p>
              </section>

              <section id="cookies" className="pl-6 border-l-2 border-[#D4AF37]">
                <h2 className="font-serif text-2xl font-bold text-white mb-4">5. Cookies</h2>
                <p>We may use cookies, web beacons, tracking pixels, and other tracking technologies on the Site to help customize the Site and improve your experience. For more information, please refer to our <a href="/cookie-policy" className="text-[#D4AF37] hover:underline">Cookie Policy</a>.</p>
              </section>

              <section id="rights" className="pl-6 border-l-2 border-[#D4AF37]">
                <h2 className="font-serif text-2xl font-bold text-white mb-4">6. Your Rights</h2>
                <p>Under the Digital Personal Data Protection Act (DPDP), you have the right to request access to, correction of, or erasure of your personal data. You may also object to the processing of your data or request data portability. To exercise these rights, contact our Data Protection Officer.</p>
              </section>

              <section id="retention" className="pl-6 border-l-2 border-[#D4AF37]">
                <h2 className="font-serif text-2xl font-bold text-white mb-4">7. Data Retention</h2>
                <p>We will only retain your personal data for as long as necessary to fulfill the purposes we collected it for, including for the purposes of satisfying any legal, accounting, or reporting requirements. Case files are automatically purged 30 days after case closure unless requested otherwise.</p>
              </section>

              <section id="security" className="pl-6 border-l-2 border-[#D4AF37]">
                <h2 className="font-serif text-2xl font-bold text-white mb-4">8. Security</h2>
                <p>We use administrative, technical, and physical security measures to help protect your personal information. All communications between your browser and our servers are encrypted using TLS/SSL technology. Document storage is secured with AES-256 encryption.</p>
              </section>

              <section id="children" className="pl-6 border-l-2 border-[#D4AF37]">
                <h2 className="font-serif text-2xl font-bold text-white mb-4">9. Children's Privacy</h2>
                <p>We do not knowingly solicit information from or market to children under the age of 18. If you become aware of any data we have collected from children under age 18, please contact us immediately.</p>
              </section>

              <section id="changes" className="pl-6 border-l-2 border-[#D4AF37]">
                <h2 className="font-serif text-2xl font-bold text-white mb-4">10. Changes to Policy</h2>
                <p>We reserve the right to make changes to this Privacy Policy at any time and for any reason. We will alert you about any changes by updating the "Last updated" date of this Privacy Policy. You are encouraged to periodically review this Privacy Policy to stay informed of updates.</p>
              </section>

              <section id="contact" className="pl-6 border-l-2 border-[#D4AF37]">
                <h2 className="font-serif text-2xl font-bold text-white mb-4">11. Contact DPO</h2>
                <p>If you have questions or comments about this Privacy Policy, please contact our Data Protection Officer at:</p>
                <div className="mt-4 bg-[#0a1a2e] p-6 rounded-xl border border-white/10">
                  <p className="font-bold text-white">Data Protection Officer</p>
                  <p>NyayaConnect Legal Hub</p>
                  <p>Cyber City Tower, Gurugram, 122002</p>
                  <p className="text-[#D4AF37] mt-2">dpo@nyayaconnect.in</p>
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

export default PrivacyPolicy;