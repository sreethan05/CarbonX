import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider } from './context/AuthContext';

import LandingPage from './pages/LandingPage';
import RoleSelection from './pages/RoleSelection';
import FarmerRegister from './pages/FarmerRegister';
import FarmerLogin from './pages/FarmerLogin';
import WelcomeTutorial from './pages/WelcomeTutorial';
import FarmMapRegistration from './pages/FarmMapRegistration';
import FarmDetailsForm from './pages/FarmDetailsForm';
import SatellitePreview from './pages/SatellitePreview';
import SuccessScreen from './pages/SuccessScreen';
import FarmOwnershipVerification from './pages/FarmOwnershipVerification';
import VerificationSuccess from './pages/VerificationSuccess';
import FarmerDashboard from './pages/FarmerDashboard';
import DetailedFarmAnalytics from './pages/DetailedFarmAnalytics';
import CarbonWallet from './pages/CarbonWallet';
import Marketplace from './pages/Marketplace';
import CorporateWelcome from './pages/CorporateWelcome';
import CreateListing from './pages/CreateListing';
import CorporateCreditAnalysis from './pages/CorporateCreditAnalysis';
import CorporateDashboard from './pages/CorporateDashboard';
import AdminDashboard from './pages/AdminDashboard';
import SupportCenter from './pages/SupportCenter';

export default function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <Router>
          <Layout>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/role-selection" element={<RoleSelection />} />
              <Route path="/farmer-register" element={<FarmerRegister />} />
              <Route path="/farmer-login" element={<FarmerLogin />} />
              <Route path="/onboarding" element={<WelcomeTutorial />} />
              <Route path="/farm-map" element={<FarmMapRegistration />} />
              <Route path="/farm-details" element={<FarmDetailsForm />} />
              <Route path="/satellite-preview" element={<SatellitePreview />} />
              <Route path="/submission-success" element={<SuccessScreen />} />
              <Route path="/farm-verification" element={<FarmOwnershipVerification />} />
              <Route path="/verification-success" element={<VerificationSuccess />} />
              <Route path="/farmer-dashboard" element={<FarmerDashboard />} />
              <Route path="/farm-analytics" element={<DetailedFarmAnalytics />} />
              <Route path="/wallet" element={<CarbonWallet />} />
              <Route path="/support" element={<SupportCenter />} />
              <Route path="/marketplace" element={<Marketplace />} />
              <Route path="/corporate-welcome" element={<CorporateWelcome />} />
              <Route path="/create-listing" element={<CreateListing />} />
              <Route path="/credit-analysis/:id" element={<CorporateCreditAnalysis />} />
              <Route path="/corporate-dashboard" element={<CorporateDashboard />} />
              <Route path="/admin-dashboard" element={<AdminDashboard />} />
            </Routes>
          </Layout>
        </Router>
      </LanguageProvider>
    </AuthProvider>
  );
}
