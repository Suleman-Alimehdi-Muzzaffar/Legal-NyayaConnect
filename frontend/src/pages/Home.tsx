import React from 'react';
import Navbar from '../components/Navbar';
import HeroSection from '../components/HeroSection';
import WhyChooseUs from '../components/WhyChooseUs';
import HowItWorks from '../components/HowItWorks';
import ServicesPreview from '../components/ServicesPreview';
import LegalCategories from '../components/LegalCategories';
import FeaturedLawyers from '../components/FeaturedLawyers';
import Statistics from '../components/Statistics';
import Testimonials from '../components/Testimonials';
import FAQPreview from '../components/FAQPreview';
import CallToAction from '../components/CallToAction';
import Footer from '../components/Footer';
import SEO from '../components/SEO';

const Home = () => {
  return (
    <div className="min-h-screen bg-[#102542] text-white selection:bg-[#D4AF37] selection:text-[#102542] overflow-x-hidden">
      <SEO title="Home" description="NyayaConnect — India's premium legal platform. Find verified lawyers, book consultations, manage cases." canonical="/" jsonLd={{ "@context": "https://schema.org", "@type": "Organization", name: "NyayaConnect", url: "https://nyayaconnect.in" }} />
      <Navbar />
      <main>
        <HeroSection />
        <WhyChooseUs />
        <HowItWorks />
        <ServicesPreview />
        <LegalCategories />
        <FeaturedLawyers />
        <Statistics />
        <Testimonials />
        <FAQPreview />
        <CallToAction />
      </main>
      <Footer />
    </div>
  );
};

export default Home;
