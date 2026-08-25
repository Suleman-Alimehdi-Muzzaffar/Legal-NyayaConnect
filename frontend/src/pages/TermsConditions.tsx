import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const TermsConditions = () => {
  return (
    <div className="min-h-screen bg-[#102542] text-white selection:bg-[#D4AF37] selection:text-[#102542] flex flex-col">
      <Navbar />
      <main className="flex-grow pt-32 pb-24">
        <div className="container mx-auto px-6 md:px-12">
          
          <div className="mb-12 border-b border-[#D4AF37]/30 pb-8">
            <h1 className="font-serif text-5xl md:text-6xl font-bold mb-4">Terms & <span className="text-[#D4AF37]">Conditions</span></h1>
            <span className="inline-block px-4 py-1.5 bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/30 rounded-full font-sans text-sm font-semibold">
              Last updated: August 23, 2026
            </span>
            <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 bg-green-500/10 border border-green-500/20 rounded-full text-xs text-green-300">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" /> BNS/BNSS/BSA updated 1 July 2024
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-12 relative">
            
            <aside className="lg:w-1/4 hidden lg:block">
              <div className="sticky top-32 glass-card p-6 rounded-2xl border border-white/10">
                <h4 className="font-serif font-bold text-lg mb-4 text-[#D4AF37]">Table of Contents</h4>
                <ul className="space-y-3 font-sans text-sm text-gray-400">
                  <li><a href="#acceptance" className="hover:text-white transition-colors">1. Acceptance</a></li>
                  <li><a href="#services" className="hover:text-white transition-colors">2. Services Description</a></li>
                  <li><a href="#accounts" className="hover:text-white transition-colors">3. User Accounts</a></li>
                  <li><a href="#lawyers" className="hover:text-white transition-colors">4. Lawyer Verification</a></li>
                  <li><a href="#fees" className="hover:text-white transition-colors">5. Fees & Payments</a></li>
                  <li><a href="#ip" className="hover:text-white transition-colors">6. Intellectual Property</a></li>
                  <li><a href="#prohibited" className="hover:text-white transition-colors">7. Prohibited Conduct</a></li>
                  <li><a href="#disclaimers" className="hover:text-white transition-colors">8. Disclaimers</a></li>
                  <li><a href="#liability" className="hover:text-white transition-colors">9. Limitation of Liability</a></li>
                  <li><a href="#indemnification" className="hover:text-white transition-colors">10. Indemnification</a></li>
                  <li><a href="#governing" className="hover:text-white transition-colors">11. Governing Law</a></li>
                  <li><a href="#dispute" className="hover:text-white transition-colors">12. Dispute Resolution</a></li>
                  <li><a href="#termination" className="hover:text-white transition-colors">13. Termination</a></li>
                  <li><a href="#changes" className="hover:text-white transition-colors">14. Changes to Terms</a></li>
                  <li><a href="#contact" className="hover:text-white transition-colors">15. Contact</a></li>
                </ul>
              </div>
            </aside>

            <article className="lg:w-3/4 font-sans text-gray-300 leading-relaxed space-y-12">
              
              <section id="acceptance" className="pl-6 border-l-2 border-[#D4AF37]">
                <h2 className="font-serif text-2xl font-bold text-white mb-4">1. Acceptance</h2>
                <p>By accessing and using NyayaConnect (the "Platform"), you agree to be bound by these Terms and Conditions. If you do not agree to all the terms and conditions, then you may not access the Platform or use any services.</p>
              </section>

              <section id="services" className="pl-6 border-l-2 border-[#D4AF37]">
                <h2 className="font-serif text-2xl font-bold text-white mb-4">2. Services Description</h2>
                <p>NyayaConnect is a technology platform that connects users seeking legal advice with independent legal professionals (Advocates). We act merely as a facilitator and are not a law firm. We do not provide legal advice, representation, or legal services directly.</p>
              </section>

              <section id="accounts" className="pl-6 border-l-2 border-[#D4AF37]">
                <h2 className="font-serif text-2xl font-bold text-white mb-4">3. User Accounts</h2>
                <p>You must provide accurate, complete, and current information when creating an account. You are responsible for safeguarding the password that you use to access the Platform and for any activities or actions under your password.</p>
              </section>

              <section id="lawyers" className="pl-6 border-l-2 border-[#D4AF37]">
                <h2 className="font-serif text-2xl font-bold text-white mb-4">4. Lawyer Verification</h2>
                <p>While we perform checks to verify the Bar Council registration of the advocates listed, we do not endorse or recommend any specific advocate. The selection of an advocate is solely the user's responsibility. The attorney-client relationship is strictly between the user and the advocate.</p>
              </section>

              <section id="fees" className="pl-6 border-l-2 border-[#D4AF37]">
                <h2 className="font-serif text-2xl font-bold text-white mb-4">5. Fees & Payments</h2>
                <p>Consultation fees are set by the individual advocates. NyayaConnect charges a nominal platform fee for facilitating the booking and secure video infrastructure. All payments must be made through our secure gateway. Refunds are governed by our Refund Policy.</p>
              </section>

              <section id="ip" className="pl-6 border-l-2 border-[#D4AF37]">
                <h2 className="font-serif text-2xl font-bold text-white mb-4">6. Intellectual Property</h2>
                <p>The Platform and its original content, features, and functionality are and will remain the exclusive property of NyayaConnect and its licensors. The Platform is protected by copyright, trademark, and other laws of India.</p>
              </section>

              <section id="prohibited" className="pl-6 border-l-2 border-[#D4AF37]">
                <h2 className="font-serif text-2xl font-bold text-white mb-4">7. Prohibited Conduct</h2>
                <p>You agree not to use the Platform to submit false information, transmit malware, harass any individual, or bypass our payment systems to directly engage advocates found through the platform without compensating the platform.</p>
              </section>

              <section id="disclaimers" className="pl-6 border-l-2 border-[#D4AF37]">
                <h2 className="font-serif text-2xl font-bold text-white mb-4">8. Disclaimers</h2>
                <p>The Platform is provided on an "AS IS" and "AS AVAILABLE" basis. We make no representations or warranties of any kind, express or implied, as to the operation of their services, or the information, content, or materials included.</p>
              </section>

              <section id="liability" className="pl-6 border-l-2 border-[#D4AF37]">
                <h2 className="font-serif text-2xl font-bold text-white mb-4">9. Limitation of Liability</h2>
                <p>In no event shall NyayaConnect, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, resulting from your use of the Platform.</p>
              </section>

              <section id="indemnification" className="pl-6 border-l-2 border-[#D4AF37]">
                <h2 className="font-serif text-2xl font-bold text-white mb-4">10. Indemnification</h2>
                <p>You agree to defend, indemnify and hold harmless NyayaConnect and its licensee and licensors, and their employees, contractors, agents, officers and directors, from and against any and all claims, damages, obligations, losses, liabilities, costs or debt, and expenses.</p>
              </section>

              <section id="governing" className="pl-6 border-l-2 border-[#D4AF37]">
                <h2 className="font-serif text-2xl font-bold text-white mb-4">11. Governing Law</h2>
                <p>These Terms shall be governed and construed in accordance with the laws of India, without regard to its conflict of law provisions. Criminal references are to BNS/BNSS/BSA 2023 (w.e.f. 1 July 2024, replacing IPC/CrPC/Evidence Act); e.g. IPC 302 maps to BNS 103.</p>
              </section>

              <section id="dispute" className="pl-6 border-l-2 border-[#D4AF37]">
                <h2 className="font-serif text-2xl font-bold text-white mb-4">12. Dispute Resolution</h2>
                <p>Any dispute arising out of or in connection with these Terms shall be subject to the exclusive jurisdiction of the courts in New Delhi, India.</p>
              </section>

              <section id="termination" className="pl-6 border-l-2 border-[#D4AF37]">
                <h2 className="font-serif text-2xl font-bold text-white mb-4">13. Termination</h2>
                <p>We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.</p>
              </section>

              <section id="changes" className="pl-6 border-l-2 border-[#D4AF37]">
                <h2 className="font-serif text-2xl font-bold text-white mb-4">14. Changes to Terms</h2>
                <p>We reserve the right, at our sole discretion, to modify or replace these Terms at any time. By continuing to access or use our Service after those revisions become effective, you agree to be bound by the revised terms.</p>
              </section>

              <section id="contact" className="pl-6 border-l-2 border-[#D4AF37]">
                <h2 className="font-serif text-2xl font-bold text-white mb-4">15. Contact</h2>
                <p>If you have any questions about these Terms, please contact us at legal@nyayaconnect.in.</p>
              </section>

            </article>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default TermsConditions;