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
import Marketplace from './pages/Marketplace';
import CorporateWelcome from './pages/CorporateWelcome';
import CreateListing from './pages/CreateListing';
import CorporateCreditAnalysis from './pages/CorporateCreditAnalysis';
import CorporateDashboard from './pages/CorporateDashboard';
import AdminDashboard from './pages/AdminDashboard';
import SupportCenter from './pages/SupportCenter';

function ProtectedRoute({ children, roles }) {
  const { isAuthenticated, role } = useAuth();
  if (!isAuthenticated) return <Navigate to="/farmer-login" replace />;
  if (roles && !roles.includes(role)) return <Navigate to="/dashboard" replace />;
  return children;
}

function DashboardRouter() {
  const { role } = useAuth();
  switch (role) {
    case 'buyer':
      return <CorporateDashboard />;
    case 'verifier':
      return <AdminDashboard />;
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
              {/* Public routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/role-selection" element={<RoleSelection />} />
              <Route path="/farmer-register" element={<FarmerRegister />} />
              <Route path="/farmer-login" element={<FarmerLogin />} />

              {/* Farmer flow */}
              <Route path="/onboarding" element={<ProtectedRoute><WelcomeTutorial /></ProtectedRoute>} />
              <Route path="/farm-map" element={<ProtectedRoute><FarmMapRegistration /></ProtectedRoute>} />
              <Route path="/farm-details" element={<ProtectedRoute><FarmDetailsForm /></ProtectedRoute>} />
              <Route path="/satellite-preview" element={<ProtectedRoute><SatellitePreview /></ProtectedRoute>} />
              <Route path="/submission-success" element={<ProtectedRoute><SuccessScreen /></ProtectedRoute>} />
              <Route path="/farm-verification" element={<ProtectedRoute><FarmOwnershipVerification /></ProtectedRoute>} />
              <Route path="/verification-success" element={<ProtectedRoute><VerificationSuccess /></ProtectedRoute>} />

              {/* Shared authenticated routes */}
              <Route path="/dashboard" element={<ProtectedRoute><DashboardRouter /></ProtectedRoute>} />
              <Route path="/farm-analytics" element={<ProtectedRoute><DetailedFarmAnalytics /></ProtectedRoute>} />
              <Route path="/wallet" element={<ProtectedRoute><CarbonWallet /></ProtectedRoute>} />
              <Route path="/marketplace" element={<ProtectedRoute><Marketplace /></ProtectedRoute>} />
              <Route path="/support" element={<ProtectedRoute><SupportCenter /></ProtectedRoute>} />

              {/* Buyer routes */}
              <Route path="/corporate-welcome" element={<ProtectedRoute roles={['buyer']}><CorporateWelcome /></ProtectedRoute>} />
              <Route path="/credit-analysis/:id" element={<ProtectedRoute><CorporateCreditAnalysis /></ProtectedRoute>} />

              {/* Farmer-only routes */}
              <Route path="/create-listing" element={<ProtectedRoute roles={['farmer']}><CreateListing /></ProtectedRoute>} />

              {/* Catch-all */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Layout>
        </Router>
      </LanguageProvider>
    </AuthProvider>
  );
}
