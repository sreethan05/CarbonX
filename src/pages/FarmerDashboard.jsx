import { useNavigate } from 'react-router-dom';
import { MapPin, Leaf, PlusCircle, ArrowUpRight, ShieldCheck, AlertTriangle, Wallet } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { combinedCredits } from '../services/api';

export default function FarmerDashboard() {
  const navigate = useNavigate();
  const { user, farms, kyc } = useAuth();

  const displayName = user?.name || 'Farmer';
  const displayLocation = [user?.village, user?.district].filter(Boolean).join(', ') || '';
  const kycStatus = kyc?.status || 'PENDING';
  const isVerified = kyc?.status === 'VERIFIED';
  const isFlagged = kycStatus === 'FLAGGED';
  const kycBadge = kyc?.badge || kyc?.extracted_fields?.badge;

  let totalCarbon = 0, totalBio = 0, totalCombined = 0, totalArea = 0;
  farms.forEach((f) => {
    const c = combinedCredits(f);
    totalCarbon += c.carbon;
    totalBio += c.biodiversity;
    totalCombined += c.total;
    totalArea += parseFloat(f.area_hectares) || 0;
  });

  return (
    <div className="pb-24 px-4 pt-6 max-w-4xl mx-auto">
      {/* Welcome */}
      <div className="bg-white rounded-2xl border border-forest-100 p-5 mb-4 shadow-sm">
        <p className="text-xs text-carbon-500">Welcome back</p>
        <h1 className="text-xl font-bold text-carbon-900 mt-0.5">{displayName}</h1>
        {displayLocation && (
          <p className="text-[11px] text-carbon-500 flex items-center gap-1 mt-1">
            <MapPin size={11} /> {displayLocation}
          </p>
        )}
        {user?.phone && <p className="text-[10px] font-mono text-carbon-400 mt-1">+91 {user.phone}</p>}
      </div>

      {/* KYC banner */}
      {!isVerified && (
        <button
          onClick={() => navigate('/farm-verification')}
          className="w-full bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-4 flex items-center gap-3 text-left hover:bg-amber-100 transition-colors"
        >
          <ShieldCheck size={20} className="text-amber-600 shrink-0" />
          <div className="flex-1">
            <p className="text-xs font-bold text-amber-900">Complete KYC Verification to start earning credits</p>
            <p className="text-[11px] text-amber-700">Upload your Pahani land record to unlock the marketplace and wallet.</p>
          </div>
          <ArrowUpRight size={16} className="text-amber-600" />
        </button>
      )}
      {isVerified && (
        <div className="w-full bg-forest-50 border border-forest-200 rounded-2xl p-4 mb-4 flex items-center gap-3">
          <ShieldCheck size={20} className="text-forest-600 shrink-0" />
          <div>
            <p className="text-xs font-bold text-forest-900">KYC Verified</p>
            <p className="text-[11px] text-forest-700">Your land ownership is confirmed</p>
          </div>
          {kycBadge && <span className="ml-auto rounded-lg bg-white border border-forest-200 px-2 py-1 text-[9px] font-black tracking-wide text-forest-800">{kycBadge}</span>}
        </div>
      )}

      {isFlagged && (
        <button
          onClick={() => navigate('/farm-verification')}
          className="w-full bg-rose-50 border border-rose-200 rounded-2xl p-4 mb-4 flex items-center gap-3 text-left hover:bg-rose-100 transition-colors"
        >
          <AlertTriangle size={20} className="text-rose-600 shrink-0" />
          <div className="flex-1">
            <p className="text-xs font-bold text-rose-900">KYC Flagged — Re-upload Required</p>
            <p className="text-[11px] text-rose-700">{kyc?.reasons?.[0] || 'Issues found with your document. Please re-upload.'}</p>
          </div>
          <ArrowUpRight size={16} className="text-rose-600" />
        </button>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 mb-4 text-center">
        <div className="bg-white border border-forest-100 rounded-2xl p-3 shadow-sm">
          <p className="text-[9px] text-carbon-400 uppercase font-bold">Carbon</p>
          <p className="text-lg font-black text-amber-800">{totalCarbon.toFixed(1)}</p>
          <p className="text-[9px] text-carbon-500">tCO2e</p>
        </div>
        <div className="bg-white border border-forest-100 rounded-2xl p-3 shadow-sm">
          <p className="text-[9px] text-carbon-400 uppercase font-bold">Biodiversity</p>
          <p className="text-lg font-black text-forest-700">{totalBio.toFixed(1)}</p>
          <p className="text-[9px] text-carbon-500">credits</p>
        </div>
        <div className="bg-forest-50 border border-forest-200 rounded-2xl p-3 shadow-sm">
          <p className="text-[9px] text-forest-700 uppercase font-bold">Total</p>
          <p className="text-lg font-black text-forest-900">{totalCombined.toFixed(1)}</p>
          <p className="text-[9px] text-forest-600">credits</p>
        </div>
      </div>

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
              <li
                key={farm.id || i}
                className="bg-white border border-forest-100 rounded-xl px-4 py-3 flex justify-between items-center text-xs hover:shadow-sm transition-shadow cursor-pointer"
                onClick={() => navigate('/farm-analytics')}
              >
                <div>
                  <p className="font-bold text-carbon-900">{farm.name || 'My Farm'}</p>
                  <p className="text-[10px] text-carbon-500 mt-0.5">
                    {farm.area_hectares} ha · NDVI {farm.ndvi} · {farm.crop_type || 'Mixed Crop'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-black text-forest-700">{c.total} t</p>
                  <p className="text-[9px] text-carbon-400">C {c.carbon} + B {c.biodiversity}</p>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {/* Actions */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => navigate('/farm-map')}
          className="flex flex-col items-start p-4 bg-forest-800 text-white rounded-2xl text-left hover:bg-forest-900 transition-colors"
        >
          <PlusCircle className="w-5 h-5 mb-2" />
          <span className="text-xs font-bold">Map New Farm</span>
          <span className="text-[10px] opacity-80 mt-1">Draw boundaries on satellite map</span>
        </button>
        <button
          onClick={() => navigate('/marketplace')}
          className="flex flex-col items-start p-4 bg-white border border-forest-100 rounded-2xl text-left shadow-sm hover:shadow-md transition-shadow"
        >
          <ArrowUpRight className="w-5 h-5 mb-2 text-forest-800" />
          <span className="text-xs font-bold">Marketplace</span>
          <span className="text-[10px] text-carbon-500 mt-1">Browse carbon credit listings</span>
        </button>
        <button onClick={() => navigate('/wallet')} className="col-span-2 flex items-center justify-center gap-2 py-3 border border-forest-100 bg-white rounded-2xl text-xs font-bold text-carbon-700 hover:bg-forest-50"><Wallet size={14} /> Open Carbon Wallet</button>
        {isVerified && (
          <button
            onClick={() => navigate('/create-listing')}
            className="col-span-2 flex items-center justify-center gap-2 py-3 bg-forest-600 text-white rounded-2xl text-xs font-bold hover:bg-forest-700 transition-colors"
          >
            <Leaf size={14} /> List Credits for Sale
          </button>
        )}
      </div>
    </div>
  );
}
