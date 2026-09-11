import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider, useAuth } from './context/AuthContext';

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
import FPODashboard from './pages/FPODashboard';
import FPOLogin from './pages/FPOLogin';
import AdminDashboard from './pages/AdminDashboard';
import CorporateWelcome from './pages/CorporateWelcome';
import CorporateLogin from './pages/CorporateLogin';
import CorporateDashboard from './pages/CorporateDashboard';
import Marketplace from './pages/Marketplace';
import CreateListing from './pages/CreateListing';
import CorporateCreditAnalysis from './pages/CorporateCreditAnalysis';
import CertificateRetirementPage from './pages/CertificateRetirementPage';
import SupportCenter from './pages/SupportCenter';

function ProtectedRoute({ children, roles }) {
  const { isAuthenticated, role } = useAuth();
  if (!isAuthenticated) return <Navigate to="/farmer/login" replace />;
  if (roles && !roles.includes(role)) return <Navigate to="/dashboard" replace />;
  return children;
}

function DashboardRouter() {
  const { role } = useAuth();
  switch (role) {
    case 'buyer':
      return <CorporateDashboard />;
    case 'fpo':
    case 'verifier':
      return <FPODashboard />;
    case 'admin':
      return <AdminDashboard />;
    default:
      return <FarmerDashboard />;
  }
}

export default function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <Router>
          <Layout>
            <Routes>
              {/* Public Gateway & Role Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/role-selection" element={<RoleSelection />} />

              {/* Farmer Auth & Onboarding Routes */}
              <Route path="/farmer/register" element={<FarmerRegister />} />
              <Route path="/farmer-register" element={<FarmerRegister />} />
              <Route path="/farmer/login" element={<FarmerLogin />} />
              <Route path="/farmer-login" element={<FarmerLogin />} />
              <Route path="/onboarding" element={<WelcomeTutorial />} />
              <Route path="/welcome-tutorial" element={<WelcomeTutorial />} />

              {/* FPO & Corporate Login Routes */}
              <Route path="/fpo/login" element={<FPOLogin />} />
              <Route path="/fpo-login" element={<FPOLogin />} />
              <Route path="/corporate/login" element={<CorporateLogin />} />
              <Route path="/corporate-login" element={<CorporateLogin />} />

              {/* Farmer Verification & Mapping Flow */}
              <Route path="/farmer/land-verification" element={<FarmOwnershipVerification />} />
              <Route path="/farm-verification" element={<FarmOwnershipVerification />} />
              <Route path="/farm-map" element={<FarmMapRegistration />} />
              <Route path="/farm-details" element={<FarmDetailsForm />} />
              <Route path="/satellite-preview" element={<SatellitePreview />} />
              <Route path="/verification-success" element={<VerificationSuccess />} />
              <Route path="/submission-success" element={<SuccessScreen />} />

              {/* Farmer Dashboard & Analytics & Wallet */}
              <Route path="/farmer/dashboard" element={<FarmerDashboard />} />
              <Route path="/dashboard" element={<DashboardRouter />} />
              <Route path="/farmer/passport/:farmId" element={<DetailedFarmAnalytics />} />
              <Route path="/farm-analytics" element={<DetailedFarmAnalytics />} />
              <Route path="/farmer/wallet" element={<CarbonWallet />} />
              <Route path="/wallet" element={<CarbonWallet />} />

              {/* FPO Command Center & Pooling */}
              <Route path="/fpo/dashboard" element={<FPODashboard />} />
              <Route path="/fpo/credit-pooling" element={<FPODashboard />} />

              {/* Admin Oversight */}
              <Route path="/admin/dashboard" element={<AdminDashboard />} />

              {/* Corporate Buyer Portal & Marketplace */}
              <Route path="/corporate/welcome" element={<CorporateWelcome />} />
              <Route path="/corporate-welcome" element={<CorporateWelcome />} />
              <Route path="/corporate/dashboard" element={<CorporateDashboard />} />
              <Route path="/marketplace" element={<Marketplace />} />
              <Route path="/create-listing" element={<CreateListing />} />
              <Route path="/marketplace/checkout" element={<CorporateCreditAnalysis />} />
              <Route path="/credit-analysis/:id" element={<CorporateCreditAnalysis />} />
              <Route path="/buyer/certificates/:certId" element={<CertificateRetirementPage />} />

              {/* Support */}
              <Route path="/support" element={<SupportCenter />} />

              {/* Catch-all */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Layout>
        </Router>
      </LanguageProvider>
    </AuthProvider>
  );
}
