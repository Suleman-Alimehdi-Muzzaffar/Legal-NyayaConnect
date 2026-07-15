import React from 'react';
import { Link } from 'react-router-dom';
import { Scale, Twitter, Linkedin, Facebook, Instagram, MapPin, Mail, Phone } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-[#050f1a] pt-20 pb-8 border-t border-[#D4AF37]/20 relative z-10">
      <div className="container mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          
          {/* Column 1: Brand */}
          <div className="flex flex-col gap-6">
            <Link to="/" className="flex items-center gap-2 group w-fit">
              <Scale className="w-8 h-8 text-[#D4AF37] group-hover:scale-110 transition-transform duration-300" />
              <span className="font-serif text-2xl font-bold tracking-wide text-white">
                Nyaya<span className="text-[#D4AF37]">Connect</span>
              </span>
            </Link>
            <p className="font-sans text-sm text-gray-400 leading-relaxed pr-4">
              Premium legal services platform connecting citizens with India's top advocates. Justice made simple, transparent, and accessible.
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:bg-[#D4AF37] hover:text-[#102542] transition-all duration-300">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:bg-[#D4AF37] hover:text-[#102542] transition-all duration-300">
                <Linkedin className="w-4 h-4" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:bg-[#D4AF37] hover:text-[#102542] transition-all duration-300">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:bg-[#D4AF37] hover:text-[#102542] transition-all duration-300">
                <Instagram className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h4 className="font-serif text-lg font-semibold text-white mb-6 flex items-center gap-2">
              <span className="w-4 h-[2px] bg-[#D4AF37]"></span> Quick Links
            </h4>
            <ul className="flex flex-col gap-3 font-sans text-sm text-gray-400">
              <li><Link to="/" className="hover:text-[#D4AF37] transition-colors">Home</Link></li>
              <li><Link to="/about" className="hover:text-[#D4AF37] transition-colors">About Us</Link></li>
              <li><Link to="/services" className="hover:text-[#D4AF37] transition-colors">Services</Link></li>
              <li><Link to="/legal-resources" className="hover:text-[#D4AF37] transition-colors">Legal Resources</Link></li>
              <li><Link to="/testimonials" className="hover:text-[#D4AF37] transition-colors">Testimonials</Link></li>
              <li><Link to="/faq" className="hover:text-[#D4AF37] transition-colors">FAQ</Link></li>
              <li><Link to="/contact" className="hover:text-[#D4AF37] transition-colors">Contact Support</Link></li>
            </ul>
          </div>

          {/* Column 3: Practice Areas */}
          <div>
            <h4 className="font-serif text-lg font-semibold text-white mb-6 flex items-center gap-2">
              <span className="w-4 h-[2px] bg-[#D4AF37]"></span> Practice Areas
            </h4>
            <ul className="flex flex-col gap-3 font-sans text-sm text-gray-400">
              <li><Link to="/services/criminal-law" className="hover:text-[#D4AF37] transition-colors">Criminal Defense</Link></li>
              <li><Link to="/services/family-law" className="hover:text-[#D4AF37] transition-colors">Family & Divorce Law</Link></li>
              <li><Link to="/services/property-law" className="hover:text-[#D4AF37] transition-colors">Property Disputes</Link></li>
              <li><Link to="/services/corporate-law" className="hover:text-[#D4AF37] transition-colors">Corporate & Startup</Link></li>
              <li><Link to="/services/cyber-crime" className="hover:text-[#D4AF37] transition-colors">Cyber Crime</Link></li>
              <li><Link to="/services/tax-law" className="hover:text-[#D4AF37] transition-colors">Tax & Compliance</Link></li>
            </ul>
          </div>

          {/* Column 4: Contact */}
          <div>
            <h4 className="font-serif text-lg font-semibold text-white mb-6 flex items-center gap-2">
              <span className="w-4 h-[2px] bg-[#D4AF37]"></span> Contact Us
            </h4>
            <ul className="flex flex-col gap-4 font-sans text-sm text-gray-400">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-[#D4AF37] shrink-0 mt-0.5" />
                <span>Level 14, Supreme Court Chamber Bldg,<br />Bhagwan Dass Road, New Delhi 110001</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-[#D4AF37] shrink-0" />
                <a href="mailto:support@nyayaconnect.in" className="hover:text-white transition-colors">support@nyayaconnect.in</a>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-[#D4AF37] shrink-0" />
                <a href="tel:+9118001234567" className="hover:text-white transition-colors">1800-123-4567 (Toll Free)</a>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-[#D4AF37]/30 flex flex-col md:flex-row items-center justify-between gap-4 font-sans text-xs text-gray-500">
          <p>© {new Date().getFullYear()} NyayaConnect. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link to="/privacy-policy" className="hover:text-[#D4AF37] transition-colors">Privacy Policy</Link>
            <Link to="/terms-conditions" className="hover:text-[#D4AF37] transition-colors">Terms of Service</Link>
            <Link to="/cookie-policy" className="hover:text-[#D4AF37] transition-colors">Cookie Policy</Link>
            <Link to="/disclaimer" className="hover:text-[#D4AF37] transition-colors">Disclaimer</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
