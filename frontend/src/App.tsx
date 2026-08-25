import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { RequireAuth } from './components/auth/RequireAuth';
import SupportChat from './components/SupportChat';
import PushManager from './components/PushManager';

const Home = lazy(() => import('./pages/Home'));
const About = lazy(() => import('./pages/About'));
const Services = lazy(() => import('./pages/Services'));
const ServiceDetail = lazy(() => import('./pages/ServiceDetail'));
const FindLawyers = lazy(() => import('./pages/FindLawyers'));
const LawyerProfile = lazy(() => import('./pages/LawyerProfile'));
const LegalResources = lazy(() => import('./pages/LegalResources'));
const KnowYourRights = lazy(() => import('./pages/KnowYourRights'));
const LegalTopic = lazy(() => import('./pages/LegalTopic'));
const ResourceArticle = lazy(() => import('./pages/ResourceArticle'));
const Testimonials = lazy(() => import('./pages/Testimonials'));
const FAQ = lazy(() => import('./pages/FAQ'));
const Contact = lazy(() => import('./pages/Contact'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const TermsConditions = lazy(() => import('./pages/TermsConditions'));
const CookiePolicy = lazy(() => import('./pages/CookiePolicy'));
const Disclaimer = lazy(() => import('./pages/Disclaimer'));
const NotFound = lazy(() => import('./pages/NotFound'));

// Auth Pages
const ChooseRegistration = lazy(() => import('./pages/auth/ChooseRegistration'));
const ClientRegister = lazy(() => import('./pages/auth/ClientRegister'));
const LawyerRegister = lazy(() => import('./pages/auth/LawyerRegister'));
const Login = lazy(() => import('./pages/auth/Login'));
const ForgotPassword = lazy(() => import('./pages/auth/ForgotPassword'));

// Dashboard Pages
const DashboardLayout = lazy(() => import('./pages/dashboard/DashboardLayout'));
const Dashboard = lazy(() => import('./pages/dashboard/Dashboard'));
const Appointments = lazy(() => import('./pages/dashboard/Appointments'));
const Messages = lazy(() => import('./pages/dashboard/Messages'));
const Documents = lazy(() => import('./pages/dashboard/Documents'));
const CalendarPage = lazy(() => import('./pages/dashboard/Calendar'));
const NotificationsPage = lazy(() => import('./pages/dashboard/Notifications'));
const Profile = lazy(() => import('./pages/dashboard/Profile'));
const Settings = lazy(() => import('./pages/dashboard/Settings'));

// Lawyer Dashboard Pages
const LawyerDashboardLayout = lazy(() => import('./pages/lawyer-dashboard/LawyerDashboardLayout'));
const LawyerDashboard = lazy(() => import('./pages/lawyer-dashboard/LawyerDashboard'));
const Clients = lazy(() => import('./pages/lawyer-dashboard/Clients'));
const LawyerAppointments = lazy(() => import('./pages/lawyer-dashboard/LawyerAppointments'));
const LawyerDocuments = lazy(() => import('./pages/lawyer-dashboard/LawyerDocuments'));
const LawyerCalendar = lazy(() => import('./pages/lawyer-dashboard/LawyerCalendar'));
const Reviews = lazy(() => import('./pages/lawyer-dashboard/Reviews'));
const Analytics = lazy(() => import('./pages/lawyer-dashboard/Analytics'));
const LawyerNotifications = lazy(() => import('./pages/lawyer-dashboard/LawyerNotifications'));
const LawyerDashboardProfile = lazy(() => import('./pages/lawyer-dashboard/LawyerProfile'));
const LawyerSettings = lazy(() => import('./pages/lawyer-dashboard/LawyerSettings'));
const LawyerMessages = lazy(() => import('./pages/lawyer-dashboard/Messages'));

// Admin Pages
const VerificationsAdmin = lazy(() => import('./pages/admin/VerificationsAdmin'));
const DataExportsAdmin = lazy(() => import('./pages/admin/DataExportsAdmin'));
const LawyerArchivesAdmin = lazy(() => import('./pages/admin/LawyerArchivesAdmin'));

function Loader() {
  return (
    <div className="min-h-screen bg-[#102542] flex items-center justify-center">
      <div className="w-10 h-10 border-3 border-white/10 border-t-[#D4AF37] rounded-full animate-spin" />
    </div>
  );
}

function App() {
  const basePath = import.meta.env.BASE_URL.replace(/\/$/, '');
  
  return (
    <BrowserRouter basename={basePath}>
      <Suspense fallback={<Loader />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/services" element={<Services />} />
          <Route path="/services/:slug" element={<ServiceDetail />} />
          <Route path="/find-lawyers" element={<FindLawyers />} />
          <Route path="/lawyers/:slug" element={<LawyerProfile />} />
          <Route path="/legal-resources" element={<LegalResources />} />
          <Route path="/legal-resources/know-your-rights" element={<KnowYourRights />} />
          <Route path="/legal-resources/topics/:slug" element={<LegalTopic />} />
          <Route path="/legal-resources/resources/:slug" element={<ResourceArticle />} />
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
          <Route path="/admin/verifications" element={<VerificationsAdmin />} />
          <Route path="/admin/data-exports" element={<DataExportsAdmin />} />
          <Route path="/admin/lawyer-archives" element={<LawyerArchivesAdmin />} />
          
          {/* Dashboard Routes */}
          <Route
            path="/dashboard"
            element={
              <RequireAuth role="client">
                <DashboardLayout />
              </RequireAuth>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="appointments" element={<Appointments />} />
            <Route path="messages" element={<Messages />} />
            <Route path="documents" element={<Documents />} />
            <Route path="calendar" element={<CalendarPage />} />
            <Route path="notifications" element={<NotificationsPage />} />
            <Route path="profile" element={<Profile />} />
            <Route path="settings" element={<Settings />} />
          </Route>

          {/* Lawyer Dashboard Routes */}
          <Route
            path="/lawyer-dashboard"
            element={
              <RequireAuth role="lawyer">
                <LawyerDashboardLayout />
              </RequireAuth>
            }
          >
            <Route index element={<LawyerDashboard />} />
            <Route path="clients" element={<Clients />} />
            <Route path="appointments" element={<LawyerAppointments />} />
            <Route path="documents" element={<LawyerDocuments />} />
            <Route path="calendar" element={<LawyerCalendar />} />
            <Route path="reviews" element={<Reviews />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="notifications" element={<LawyerNotifications />} />
            <Route path="messages" element={<LawyerMessages />} />
            <Route path="profile" element={<LawyerDashboardProfile />} />
            <Route path="settings" element={<LawyerSettings />} />
          </Route>
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
      <SupportChat />
      <PushManager />
    </BrowserRouter>
  );
}

export default App;
