import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Scale, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/lib/auth-context';

const Navbar = () => {
  const { isAuthenticated, isLawyer, signOut } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Services', path: '/services' },
    { name: 'Legal Resources', path: '/legal-resources' },
    { name: 'Testimonials', path: '/testimonials' },
    { name: 'FAQ', path: '/faq' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-[#102542]/80 backdrop-blur-md border-b border-[#D4AF37]/20 py-3'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="container mx-auto px-6 md:px-12 flex items-center justify-between">
        <div className="flex items-center gap-10">
          <Link to="/" className="flex items-center gap-2 group">
            <Scale className="w-8 h-8 text-[#D4AF37] group-hover:scale-110 transition-transform duration-300" />
            <span className="font-serif text-2xl font-bold tracking-wide text-white">
              Nyaya<span className="text-[#D4AF37]">Connect</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center">
            <ul className="flex items-center gap-6">
              {navLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    className="font-sans text-sm font-medium text-gray-200 hover:text-[#D4AF37] transition-colors relative group"
                  >
                    {link.name}
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#D4AF37] transition-all duration-300 group-hover:w-full"></span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="hidden lg:flex items-center gap-4">
          {isAuthenticated ? (
            <>
              <Link to={isLawyer ? "/lawyer/dashboard" : "/dashboard"} className="font-sans text-sm font-medium text-white hover:text-[#D4AF37] transition-colors px-4 py-2">
                Dashboard
              </Link>
              <button onClick={signOut} className="bg-[#D4AF37] hover:bg-[#c4a133] text-[#102542] font-sans text-sm font-semibold px-6 py-2.5 rounded-full transition-all duration-300 hover:shadow-[0_0_15px_rgba(212,175,55,0.4)] transform hover:-translate-y-0.5">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="font-sans text-sm font-medium text-white hover:text-[#D4AF37] transition-colors px-4 py-2">
                Login
              </Link>
              <Link to="/register" className="bg-[#D4AF37] hover:bg-[#c4a133] text-[#102542] font-sans text-sm font-semibold px-6 py-2.5 rounded-full transition-all duration-300 hover:shadow-[0_0_15px_rgba(212,175,55,0.4)] transform hover:-translate-y-0.5">
                Register
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="lg:hidden text-white hover:text-[#D4AF37] transition-colors"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Nav Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-[#0a1a2e] border-b border-[#D4AF37]/20 overflow-hidden"
          >
            <div className="container mx-auto px-6 py-4 flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className="font-sans text-base font-medium text-gray-200 hover:text-[#D4AF37] transition-colors py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.name}
                </Link>
              ))}
              <div className="flex flex-col gap-3 mt-4 pt-4 border-t border-[#D4AF37]/10">
                {isAuthenticated ? (
                  <>
                    <Link to={isLawyer ? "/lawyer/dashboard" : "/dashboard"} className="font-sans text-base font-medium text-white hover:text-[#D4AF37] transition-colors py-2 text-left block" onClick={() => setMobileMenuOpen(false)}>
                      Dashboard
                    </Link>
                    <button onClick={() => { signOut(); setMobileMenuOpen(false); }} className="bg-[#D4AF37] text-[#102542] font-sans text-base font-semibold px-6 py-3 rounded-xl transition-colors text-center block w-full">
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link to="/login" className="font-sans text-base font-medium text-white hover:text-[#D4AF37] transition-colors py-2 text-left block" onClick={() => setMobileMenuOpen(false)}>
                      Login
                    </Link>
                    <Link to="/register" className="bg-[#D4AF37] text-[#102542] font-sans text-base font-semibold px-6 py-3 rounded-xl transition-colors text-center block" onClick={() => setMobileMenuOpen(false)}>
                      Register
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;