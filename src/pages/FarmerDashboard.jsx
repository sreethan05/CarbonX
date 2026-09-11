import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { MapPin, ShieldCheck, Wallet, ArrowRight, Compass, AlertTriangle } from 'lucide-react';
import VerificationBadge from '../components/VerificationBadge';
import { useAuth } from '../context/AuthContext';

export default function FarmerDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const navState = location.state || {};

  // Default farms dataset
  const farms = [
    {
      id: 'TEL-124A',
      surveyNumber: '124/A',
      acres: 2.50,
      crop: 'Cotton & Paddy',
      badge: 'REGISTRY',
      credits: 12.50,
      earnings: 4250,
      ndvi: 0.78,
      status: 'VERIFIED'
    },
    {
      id: 'TEL-124B',
      surveyNumber: '124/B',
      acres: 2.10,
      crop: 'Cotton',
      badge: 'REGISTRY_DOC',
      credits: 9.80,
      earnings: 3136,
      ndvi: 0.72,
      status: 'VERIFIED'
    },
    {
      id: 'TEL-124C',
      surveyNumber: '124/C',
      acres: 1.80,
      crop: 'Paddy',
      badge: 'DOCUMENT',
      credits: 7.20,
      earnings: 2232,
      ndvi: 0.68,
      status: 'VERIFIED'
    },
    {
      id: 'TEL-124D',
      surveyNumber: '124/D',
      acres: 2.20,
      crop: 'Cotton',
      badge: 'PENDING',
      credits: 0,
      earnings: 0,
      ndvi: 0.54,
      status: 'PENDING_REVIEW',
      flagReason: 'Boundary overlap conflict detected — FPO attestation required'
    }
  ];

  const [selectedFarmIndex, setSelectedFarmIndex] = useState(0);

  // If navigated with explicit farmer details state (e.g. from FPO Dashboard)
  const farmerName = navState.farmerName || user?.name || 'K. Ramesh';
  const village = navState.village || user?.village || 'Pochampally';
  const district = navState.district || user?.district || 'Yadadri Bhuvanagiri';

  const currentFarm = navState.surveyNumber ? {
    id: `FARM-${navState.surveyNumber}`,
    surveyNumber: navState.surveyNumber,
    acres: navState.acres || 2.50,
    crop: navState.crop || 'Cotton & Paddy',
    badge: navState.badge || 'REGISTRY',
    credits: navState.credits !== undefined ? navState.credits : 12.50,
    earnings: (navState.credits || 12.50) * 340,
    ndvi: 0.78,
    status: navState.badge === 'PENDING' ? 'PENDING_REVIEW' : 'VERIFIED'
  } : farms[selectedFarmIndex];

  const isPending = currentFarm.badge === 'PENDING';

  return (
    <div className="min-h-screen bg-[#F8FAF8] font-inter text-slate-900 py-8 px-4 md:px-10">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Top Profile Bar */}
        <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <VerificationBadge badge={currentFarm.badge} showTier size="sm" />
              {navState.farmerName && (
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider bg-slate-100 border border-slate-200 px-2 py-0.5 rounded">
                  FPO Inspected Record
                </span>
              )}
            </div>
            <h1 className="text-2xl font-extrabold text-[#0F172A] font-manrope tracking-tight">{farmerName}</h1>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5 font-medium">
              <MapPin className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
              <span>{village}, {district} | Selected Land Parcel: Survey {currentFarm.surveyNumber} ({currentFarm.acres} Acres)</span>
            </p>
          </div>

          {/* Right-Aligned Horizontal Pill Selector */}
          {!navState.surveyNumber && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-slate-500 mr-1">Switch Farm:</span>
              {farms.map((f, idx) => (
                <button
                  key={f.id}
                  onClick={() => setSelectedFarmIndex(idx)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${
                    selectedFarmIndex === idx
                      ? 'bg-[#1B4332] text-white border-[#1B4332] shadow-xs'
                      : 'bg-[#F8FAF8] text-slate-700 border-slate-200 hover:bg-emerald-50'
                  }`}
                >
                  Survey {f.surveyNumber} ({f.badge})
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Highlighted Revenue Card */}
        {isPending ? (
          <div className="bg-amber-50 border border-amber-200 text-amber-950 rounded-2xl p-6 shadow-xs relative overflow-hidden space-y-3">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-6 h-6 text-amber-700 shrink-0 mt-1" />
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-amber-900 uppercase tracking-wider bg-amber-200 px-2.5 py-0.5 rounded-full">
                    Verification Incomplete
                  </span>
                  <span className="text-[10px] text-amber-800 font-semibold bg-white/80 px-2 py-0.5 rounded">
                    Demo Mode
                  </span>
                </div>
                <h2 className="text-xl font-extrabold font-manrope text-amber-950">
                  Complete verification to earn carbon credits
                </h2>
                <p className="text-xs text-amber-800 max-w-2xl leading-relaxed">
                  This farmland parcel (<code className="font-mono font-bold">Survey {currentFarm.surveyNumber}</code>) has a <strong>PENDING</strong> badge status. Credit minting and UPI earnings are strictly locked until verification or FPO attestation is complete.
                </p>
              </div>
            </div>

            <div className="pt-2 flex flex-wrap gap-3">
              <button
                onClick={() => navigate('/farmer/land-verification')}
                className="px-5 py-2.5 bg-[#1B4332] hover:bg-[#2D6A4F] text-white font-bold text-xs rounded-xl transition-all shadow-xs flex items-center gap-2"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Complete Verification Flow</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-[#F0FDF4] border border-[#BBF7D0] text-slate-900 rounded-2xl p-6 shadow-sm relative overflow-hidden">
            <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider bg-white border border-emerald-200 px-2.5 py-0.5 rounded-full">
                    ESTIMATED ANNUAL CARBON REVENUE
                  </span>
                  <span className="text-[10px] font-semibold text-slate-500 bg-white/80 px-2 py-0.5 rounded border border-slate-200">
                    Live Benchmark
                  </span>
                </div>
                <h2 className="text-3xl md:text-4xl font-extrabold font-manrope text-[#1B4332] mt-2">
                  ₹{currentFarm.earnings.toLocaleString('en-IN')} <span className="text-sm font-normal text-slate-600">/ year</span>
                </h2>
                <p className="text-xs text-slate-600 mt-1 max-w-xl font-medium">
                  {currentFarm.acres} acres {currentFarm.crop} = {currentFarm.credits} credits/year, benchmarked under verified {currentFarm.badge} badge status.
                </p>
              </div>

              <button
                onClick={() => navigate('/farmer/wallet')}
                className="px-6 py-3 bg-[#1B4332] hover:bg-[#2D6A4F] text-white font-bold text-xs rounded-xl transition-all shadow-sm flex items-center gap-2 shrink-0"
              >
                <Wallet className="w-4 h-4 text-emerald-300" />
                <span>Open Wallet & UPI Ledger</span>
              </button>
            </div>
          </div>
        )}

        {/* 3-Column Core Metric Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-slate-200 border-l-4 border-l-emerald-600 shadow-sm rounded-2xl p-6 space-y-1">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">NDVI Vegetation Index</p>
            <p className="text-3xl font-extrabold text-[#1B4332] font-manrope">{currentFarm.ndvi} Index</p>
            <p className="text-xs text-slate-500 font-medium pt-1">Sentinel-2 Multi-Spectral Active Vegetation Canopy</p>
          </div>

          <div className="bg-white border border-slate-200 border-l-4 border-l-emerald-600 shadow-sm rounded-2xl p-6 space-y-1">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Active Carbon Credits</p>
            {isPending ? (
              <div>
                <p className="text-2xl font-extrabold text-rose-700 font-manrope">0.00 MT CO2e</p>
                <p className="text-xs text-rose-700 font-semibold mt-1">Blocked (PENDING Status)</p>
              </div>
            ) : (
              <div>
                <p className="text-3xl font-extrabold text-slate-900 font-manrope">{currentFarm.credits} tCO2e</p>
                <p className="text-xs text-emerald-800 font-semibold mt-1">Minted & Verified ({currentFarm.badge})</p>
              </div>
            )}
          </div>

          <div className="bg-white border border-slate-200 border-l-4 border-l-emerald-600 shadow-sm rounded-2xl p-6 space-y-1">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Soil Biodiversity Index</p>
            <p className="text-3xl font-extrabold text-amber-700 font-manrope">8.4 / 10</p>
            <p className="text-xs text-slate-500 font-medium pt-1">Ecosystem Richness Score</p>
          </div>
        </div>

      </div>
    </div>
  );
}
