import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import About from './pages/About';
import Services from './pages/Services';
import ServiceDetail from './pages/ServiceDetail';
import LegalResources from './pages/LegalResources';
import Testimonials from './pages/Testimonials';
import FAQ from './pages/FAQ';
import Contact from './pages/Contact';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsConditions from './pages/TermsConditions';
import CookiePolicy from './pages/CookiePolicy';
import Disclaimer from './pages/Disclaimer';
import NotFound from './pages/NotFound';

// Auth Pages
import ChooseRegistration from './pages/auth/ChooseRegistration';
import ClientRegister from './pages/auth/ClientRegister';
import LawyerRegister from './pages/auth/LawyerRegister';
import Login from './pages/auth/Login';
import ForgotPassword from './pages/auth/ForgotPassword';

function App() {
  const basePath = import.meta.env.BASE_URL.replace(/\/$/, '');
  
  return (
    <BrowserRouter basename={basePath}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/services" element={<Services />} />
        <Route path="/services/:slug" element={<ServiceDetail />} />
        <Route path="/legal-resources" element={<LegalResources />} />
        <Route path="/testimonials" element={<Testimonials />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms-conditions" element={<TermsConditions />} />
        <Route path="/cookie-policy" element={<CookiePolicy />} />
        <Route path="/disclaimer" element={<Disclaimer />} />
        
        {/* Auth Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<ChooseRegistration />} />
        <Route path="/register/client" element={<ClientRegister />} />
        <Route path="/register/lawyer" element={<LawyerRegister />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
