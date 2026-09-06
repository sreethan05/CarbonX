import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Leaf, PlusCircle, ArrowUpRight, ShieldCheck, AlertTriangle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { combinedCredits } from '../services/api';

export default function FarmerDashboard() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { user, farms, kyc } = useAuth();

  const displayName = user?.name || 'Farmer';
  const displayVillage = [user?.village, user?.district].filter(Boolean).join(', ') || '';

  let totalCarbon = 0;
  let totalBio = 0;
  let totalCombined = 0;
  let totalArea = 0;

  farms.forEach((f) => {
    const c = combinedCredits(f);
    totalCarbon += c.carbon;
    totalBio += c.biodiversity;
    totalCombined += c.total;
    totalArea += parseFloat(f.area_hectares) || 0;
  });

  const kycStatus = kyc?.status || 'PENDING';
  const isVerified = kycStatus === 'VERIFIED';
  const isFlagged = kycStatus === 'FLAGGED';

  return (
    <div className="pb-24 px-4 pt-6 max-w-4xl mx-auto">
      {/* Welcome header */}
      <div className="bg-white rounded-2xl border border-forest-100 p-5 mb-4 shadow-sm">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-xs text-carbon-500">Welcome back</p>
            <h1 className="text-xl font-bold text-carbon-900 mt-0.5">{displayName}</h1>
            <p className="text-[11px] text-carbon-500 flex items-center gap-1 mt-1">
              <MapPin size={11} /> {displayVillage || 'Location not set'}
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            {user?.phone && <p className="text-[10px] font-mono text-carbon-400">+91 {user.phone}</p>}
          </div>
        </div>
      </div>

      {/* KYC Status Banner */}
      {kycStatus === 'PENDING' && (
        <button
          onClick={() => navigate('/farm-verification')}
          className="w-full bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-4 flex items-center gap-3 text-left hover:bg-amber-100 transition-colors cursor-pointer"
        >
          <ShieldCheck size={20} className="text-amber-600 shrink-0" />
          <div className="flex-1">
            <p className="text-xs font-bold text-amber-900">Complete KYC Verification</p>
            <p className="text-[11px] text-amber-700">Verify your land ownership to start earning carbon credits</p>
          </div>
          <ArrowUpRight size={16} className="text-amber-600" />
        </button>
      )}
      {isVerified && (
        <div className="w-full bg-emerald-50 border border-emerald-200 rounded-2xl p-4 mb-4 flex items-center gap-3">
          <ShieldCheck size={20} className="text-emerald-600 shrink-0" />
          <div>
            <p className="text-xs font-bold text-emerald-900">KYC Verified</p>
            <p className="text-[11px] text-emerald-700">Your land ownership is confirmed</p>
          </div>
        </div>
      )}
      {isFlagged && (
        <button
          onClick={() => navigate('/farm-verification')}
          className="w-full bg-rose-50 border border-rose-200 rounded-2xl p-4 mb-4 flex items-center gap-3 text-left hover:bg-rose-100 transition-colors cursor-pointer"
        >
          <AlertTriangle size={20} className="text-rose-600 shrink-0" />
          <div className="flex-1">
            <p className="text-xs font-bold text-rose-900">KYC Flagged — Re-upload Required</p>
            <p className="text-[11px] text-rose-700">
              {kyc?.reasons?.[0] || 'Issues found with your document. Please re-upload.'}
            </p>
          </div>
          <ArrowUpRight size={16} className="text-rose-600" />
        </button>
      )}

      {/* Stats grid */}
      <div className="grid grid-cols-3 gap-2 mb-4 text-center">
        <div className="bg-white border border-forest-100 rounded-2xl p-3 shadow-sm">
          <p className="text-[9px] text-carbon-400 uppercase font-bold">Carbon</p>
          <p className="text-lg font-black text-amber-800">{totalCarbon.toFixed(1)}</p>
          <p className="text-[9px] text-carbon-500">tCO2e</p>
        </div>
        <div className="bg-white border border-forest-100 rounded-2xl p-3 shadow-sm">
          <p className="text-[9px] text-carbon-400 uppercase font-bold">Biodiversity</p>
          <p className="text-lg font-black text-emerald-800">{totalBio.toFixed(1)}</p>
          <p className="text-[9px] text-carbon-500">credits</p>
        </div>
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3 shadow-sm">
          <p className="text-[9px] text-emerald-700 uppercase font-bold">Total</p>
          <p className="text-lg font-black text-emerald-900">{totalCombined.toFixed(1)}</p>
          <p className="text-[9px] text-emerald-600">credits</p>
        </div>
      </div>

      {/* Farm count + area */}
      <p className="text-[11px] text-carbon-500 mb-2">
        {farms.length} farm{farms.length !== 1 ? 's' : ''} mapped · {totalArea.toFixed(2)} hectares
      </p>

      {/* Farm list */}
      {farms.length === 0 ? (
        <div className="bg-white border border-dashed border-forest-200 rounded-2xl p-6 text-center text-sm text-carbon-500 mb-4">
          No farms mapped yet. Click below to register your first farm.
        </div>
      ) : (
        <ul className="space-y-2 mb-4">
          {farms.map((farm, i) => {
            const c = combinedCredits(farm);
            return (
              <li key={farm.id || i} className="bg-white border border-forest-100 rounded-xl px-4 py-3 flex justify-between items-center text-xs hover:shadow-sm transition-shadow cursor-pointer" onClick={() => navigate('/farm-analytics')}>
                <div>
                  <p className="font-bold text-carbon-900">{farm.name || 'My Farm'}</p>
                  <p className="text-[10px] text-carbon-500 mt-0.5">{farm.area_hectares} ha · NDVI {farm.ndvi} · {farm.crop_type || 'Mixed Crop'}</p>
                </div>
                <div className="text-right">
                  <p className="font-black text-emerald-800">{c.total} t</p>
                  <p className="text-[9px] text-carbon-400">C {c.carbon} + B {c.biodiversity}</p>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {/* Action buttons */}
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => navigate('/farm-map')}
          className="flex flex-col items-start p-4 bg-forest-800 text-white rounded-2xl text-left hover:bg-forest-900 transition-colors"
        >
          <PlusCircle className="w-5 h-5 mb-2" />
          <span className="text-xs font-bold">Map New Farm</span>
          <span className="text-[10px] opacity-80 mt-1">Draw boundaries on satellite map</span>
        </button>
        <button
          type="button"
          onClick={() => navigate('/marketplace')}
          className="flex flex-col items-start p-4 bg-white border border-forest-100 rounded-2xl text-left shadow-sm hover:shadow-md transition-shadow"
        >
          <ArrowUpRight className="w-5 h-5 mb-2 text-forest-800" />
          <span className="text-xs font-bold">Marketplace</span>
          <span className="text-[10px] text-carbon-500 mt-1">Browse carbon credit listings</span>
        </button>
        {isVerified && (
          <button
            type="button"
            onClick={() => navigate('/create-listing')}
            className="col-span-2 flex items-center justify-center gap-2 py-3 bg-emerald-600 text-white rounded-2xl text-xs font-bold hover:bg-emerald-700 transition-colors"
          >
            <Leaf size={14} /> List Credits for Sale
          </button>
        )}
      </div>
    </div>
  );
}
