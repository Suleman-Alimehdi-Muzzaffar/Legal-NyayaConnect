import React from 'react';
import Navbar from '../components/Navbar';
import HeroSection from '../components/HeroSection';
import WhyChooseUs from '../components/WhyChooseUs';
import HowItWorks from '../components/HowItWorks';
import LegalCategories from '../components/LegalCategories';
import FeaturedLawyers from '../components/FeaturedLawyers';
import Statistics from '../components/Statistics';
import Testimonials from '../components/Testimonials';
import FAQPreview from '../components/FAQPreview';
import CallToAction from '../components/CallToAction';
import Footer from '../components/Footer';

const Home = () => {
  return (
    <div className="min-h-screen bg-[#102542] text-white selection:bg-[#D4AF37] selection:text-[#102542] overflow-x-hidden">
      <Navbar />
      <main>
        <HeroSection />
        <WhyChooseUs />
        <HowItWorks />
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
