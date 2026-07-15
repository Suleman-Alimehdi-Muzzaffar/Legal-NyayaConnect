import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const CookiePolicy = () => {
  return (
    <div className="min-h-screen bg-[#102542] text-white selection:bg-[#D4AF37] selection:text-[#102542] flex flex-col">
      <Navbar />
      <main className="flex-grow pt-32 pb-24">
        <div className="container mx-auto px-6 md:px-12">
          
          <div className="mb-12 border-b border-[#D4AF37]/30 pb-8">
            <h1 className="font-serif text-5xl md:text-6xl font-bold mb-4">Cookie <span className="text-[#D4AF37]">Policy</span></h1>
            <span className="inline-block px-4 py-1.5 bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/30 rounded-full font-sans text-sm font-semibold">
              Last updated: January 15, 2025
            </span>
          </div>

          <div className="flex flex-col lg:flex-row gap-12 relative">
            
            <aside className="lg:w-1/4 hidden lg:block">
              <div className="sticky top-32 glass-card p-6 rounded-2xl border border-white/10">
                <h4 className="font-serif font-bold text-lg mb-4 text-[#D4AF37]">Table of Contents</h4>
                <ul className="space-y-3 font-sans text-sm text-gray-400">
                  <li><a href="#what" className="hover:text-white transition-colors">1. What Are Cookies</a></li>
                  <li><a href="#types" className="hover:text-white transition-colors">2. Types of Cookies We Use</a></li>
                  <li><a href="#manage" className="hover:text-white transition-colors">3. How to Manage Cookies</a></li>
                  <li><a href="#third" className="hover:text-white transition-colors">4. Third-Party Cookies</a></li>
                  <li><a href="#updates" className="hover:text-white transition-colors">5. Updates</a></li>
                </ul>
              </div>
            </aside>

            <article className="lg:w-3/4 font-sans text-gray-300 leading-relaxed space-y-12">
              
              <section id="what" className="pl-6 border-l-2 border-[#D4AF37]">
                <h2 className="font-serif text-2xl font-bold text-white mb-4">1. What Are Cookies</h2>
                <p>Cookies are small text files that are placed on your computer or mobile device when you browse websites. They are widely used to make websites work, or work more efficiently, as well as to provide information to the owners of the site. NyayaConnect uses cookies to understand how you use our platform and to improve your experience.</p>
              </section>

              <section id="types" className="pl-6 border-l-2 border-[#D4AF37]">
                <h2 className="font-serif text-2xl font-bold text-white mb-4">2. Types of Cookies We Use</h2>
                <p className="mb-6">We use the following types of cookies on our platform:</p>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-[#0a1a2e] border-b border-[#D4AF37]/30">
                        <th className="p-4 font-serif font-bold text-white">Cookie Name</th>
                        <th className="p-4 font-serif font-bold text-white">Purpose</th>
                        <th className="p-4 font-serif font-bold text-white">Duration</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10">
                      <tr>
                        <td className="p-4 text-[#D4AF37]">session_id</td>
                        <td className="p-4">Essential. Keeps you logged in during your visit and secures your data.</td>
                        <td className="p-4">Session</td>
                      </tr>
                      <tr>
                        <td className="p-4 text-[#D4AF37]">theme_pref</td>
                        <td className="p-4">Functional. Remembers your UI preferences.</td>
                        <td className="p-4">1 Year</td>
                      </tr>
                      <tr>
                        <td className="p-4 text-[#D4AF37]">_ga, _gid</td>
                        <td className="p-4">Analytics. Helps us understand how users navigate the site to improve layout.</td>
                        <td className="p-4">2 Years / 24 Hours</td>
                      </tr>
                      <tr>
                        <td className="p-4 text-[#D4AF37]">payment_int</td>
                        <td className="p-4">Essential. Temporary token required by payment gateways to process transactions.</td>
                        <td className="p-4">30 Minutes</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </section>

              <section id="manage" className="pl-6 border-l-2 border-[#D4AF37]">
                <h2 className="font-serif text-2xl font-bold text-white mb-4">3. How to Manage Cookies</h2>
                <p>You can set your browser to refuse all or some browser cookies, or to alert you when websites set or access cookies. If you disable or refuse cookies, please note that some parts of the NyayaConnect platform may become inaccessible or not function properly, particularly the secure video consultation feature.</p>
              </section>

              <section id="third" className="pl-6 border-l-2 border-[#D4AF37]">
                <h2 className="font-serif text-2xl font-bold text-white mb-4">4. Third-Party Cookies</h2>
                <p>In some special cases, we also use cookies provided by trusted third parties. This includes payment processors (like Razorpay/Stripe) and secure video infrastructure providers. These providers have their own privacy policies governing their use of cookies.</p>
              </section>

              <section id="updates" className="pl-6 border-l-2 border-[#D4AF37]">
                <h2 className="font-serif text-2xl font-bold text-white mb-4">5. Updates</h2>
                <p>We may update this Cookie Policy from time to time in order to reflect changes to the cookies we use or for other operational, legal or regulatory reasons. Please therefore re-visit this Cookie Policy regularly to stay informed about our use of cookies and related technologies.</p>
              </section>

            </article>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CookiePolicy;