import React, { lazy, Suspense } from 'react';
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
const DetailedFarmAnalytics = lazy(() => import('./pages/DetailedFarmAnalytics'));
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
const SupportCenter = lazy(() => import('./pages/SupportCenter'));

function RouteFallback() {
  return <div className="min-h-screen flex items-center justify-center text-xs text-carbon-500">Loading…</div>;
}

function ProtectedRoute({ children, roles, redirectTo = '/farmer/login' }) {
  const { isAuthenticated, role } = useAuth();
  if (!isAuthenticated) return <Navigate to={redirectTo} replace />;
  if (roles && !roles.includes(role)) return <Navigate to={redirectTo} replace />;
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
              <Route path="/farmer/land-verification" element={<ProtectedRoute roles={['farmer']}><FarmOwnershipVerification /></ProtectedRoute>} />
              <Route path="/farm-verification" element={<ProtectedRoute roles={['farmer']}><FarmOwnershipVerification /></ProtectedRoute>} />
              <Route path="/farm-map" element={<ProtectedRoute roles={['farmer']}><FarmMapRegistration /></ProtectedRoute>} />
              <Route path="/farm-details" element={<ProtectedRoute roles={['farmer']}><FarmDetailsForm /></ProtectedRoute>} />
              <Route path="/satellite-preview" element={<ProtectedRoute roles={['farmer']}><SatellitePreview /></ProtectedRoute>} />
              <Route path="/verification-success" element={<ProtectedRoute roles={['farmer']}><VerificationSuccess /></ProtectedRoute>} />
              <Route path="/submission-success" element={<ProtectedRoute roles={['farmer']}><SuccessScreen /></ProtectedRoute>} />

              {/* Farmer Dashboard & Analytics & Wallet */}
              <Route path="/farmer/dashboard" element={<ProtectedRoute roles={['farmer']}><FarmerDashboard /></ProtectedRoute>} />
              <Route path="/dashboard" element={<ProtectedRoute roles={['farmer', 'buyer', 'fpo', 'verifier', 'admin']}><DashboardRouter /></ProtectedRoute>} />
              <Route path="/farmer/passport/:farmId" element={<ProtectedRoute roles={['farmer']}><Suspense fallback={<RouteFallback />}><DetailedFarmAnalytics /></Suspense></ProtectedRoute>} />
              <Route path="/farm-analytics" element={<ProtectedRoute roles={['farmer']}><Suspense fallback={<RouteFallback />}><DetailedFarmAnalytics /></Suspense></ProtectedRoute>} />
              <Route path="/farmer/wallet" element={<ProtectedRoute roles={['farmer']}><CarbonWallet /></ProtectedRoute>} />
              <Route path="/wallet" element={<ProtectedRoute roles={['farmer']}><CarbonWallet /></ProtectedRoute>} />

              {/* FPO Command Center & Pooling */}
              <Route path="/fpo/dashboard" element={<ProtectedRoute roles={['fpo', 'verifier', 'admin']} redirectTo="/fpo/login"><FPODashboard /></ProtectedRoute>} />
              <Route path="/fpo/credit-pooling" element={<ProtectedRoute roles={['fpo', 'verifier', 'admin']} redirectTo="/fpo/login"><FPODashboard /></ProtectedRoute>} />

              {/* Admin Oversight */}
              <Route path="/admin/dashboard" element={<ProtectedRoute roles={['admin', 'verifier']}><AdminDashboard /></ProtectedRoute>} />

              {/* Corporate Buyer Portal & Marketplace */}
              <Route path="/corporate/welcome" element={<CorporateWelcome />} />
              <Route path="/corporate-welcome" element={<CorporateWelcome />} />
              <Route path="/corporate/dashboard" element={<ProtectedRoute roles={['buyer']} redirectTo="/corporate/login"><CorporateDashboard /></ProtectedRoute>} />
              <Route path="/marketplace" element={<ProtectedRoute roles={['farmer', 'buyer', 'fpo', 'verifier', 'admin']}><Marketplace /></ProtectedRoute>} />
              <Route path="/create-listing" element={<ProtectedRoute roles={['buyer']}><CreateListing /></ProtectedRoute>} />
              <Route path="/marketplace/checkout" element={<ProtectedRoute roles={['buyer']}><CorporateCreditAnalysis /></ProtectedRoute>} />
              <Route path="/credit-analysis/:id" element={<ProtectedRoute roles={['buyer']}><CorporateCreditAnalysis /></ProtectedRoute>} />
              <Route path="/buyer/certificates/:certId" element={<ProtectedRoute roles={['buyer']}><CertificateRetirementPage /></ProtectedRoute>} />

              {/* Support */}
              <Route path="/support" element={<Suspense fallback={<RouteFallback />}><SupportCenter /></Suspense>} />

              {/* Catch-all */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Layout>
        </Router>
      </LanguageProvider>
    </AuthProvider>
  );
}
