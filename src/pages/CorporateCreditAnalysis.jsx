import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ShieldCheck, Satellite, Cpu, TrendingUp, CheckCircle2, Loader2 } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useAuth } from '../context/AuthContext';
import { farmsToAnalytics } from '../utils/farmAnalytics';

export default function CorporateCreditAnalysis() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { farms } = useAuth();
  const analyticsFarms = farmsToAnalytics(farms);
  const farm = analyticsFarms.find((f) => f.id === id) || analyticsFarms[0];

  const [bidAmount, setBidAmount] = useState(530);
  const [bidStatus, setBidStatus] = useState('idle');

  if (!farm) {
    return (
      <div className="pb-24 px-4 pt-6 max-w-4xl mx-auto">
        <div className="bg-white border border-dashed border-forest-200 rounded-2xl p-8 text-center text-sm text-carbon-500">
          No farm data available. Browse the marketplace for live listings.
          <button onClick={() => navigate('/marketplace')} className="block mx-auto mt-4 px-6 py-3 bg-forest-800 text-white rounded-2xl text-xs font-bold">Open Marketplace</button>
        </div>
      </div>
    );
  }

  const priceTrendData = [
    { week: 'W1', value: 480 }, { week: 'W2', value: 495 }, { week: 'W3', value: 510 },
    { week: 'W4', value: 505 }, { week: 'W5', value: 520 },
  ];

  const handleBid = () => {
    setBidStatus('processing');
    setTimeout(() => setBidStatus('completed'), 2000);
  };

  const checks = [
    { icon: ShieldCheck, label: 'Identity Verified', value: '99.4% Aadhaar match' },
    { icon: Satellite, label: 'Satellite NDVI', value: farm.ndvi?.toFixed(2) || '0.52' },
    { icon: Cpu, label: 'AI Confidence', value: farm.aiConfidence || '95%' },
    { icon: TrendingUp, label: 'Carbon Potential', value: farm.carbonPot || '0 t CO2e/yr' },
  ];

  return (
    <div className="pb-24 px-4 pt-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate('/marketplace')} className="p-2 rounded-xl bg-white border border-forest-100 text-carbon-600 hover:text-forest-800">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-lg font-bold text-carbon-900">{farm.name}</h1>
          <p className="text-[11px] text-carbon-500">{farm.cropType} · Credit Analysis</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        {checks.map((c, i) => {
          const Icon = c.icon;
          return (
            <div key={i} className="bg-white border border-forest-100 rounded-2xl p-4 shadow-sm">
              <Icon size={18} className="text-forest-600 mb-2" />
              <p className="text-[9px] uppercase tracking-wider text-carbon-400 font-bold">{c.label}</p>
              <p className="text-sm font-bold text-carbon-900 mt-0.5">{c.value}</p>
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-2xl border border-forest-100 shadow-sm p-5 mb-4">
        <h3 className="text-xs font-bold text-carbon-800 mb-4">Carbon Credit Price Trend (₹/credit)</h3>
        <div className="h-40 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={priceTrendData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="priceGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2C5E43" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#2C5E43" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="week" tickLine={false} axisLine={false} stroke="#94A3B8" style={{ fontSize: '9px' }} />
              <YAxis tickLine={false} axisLine={false} stroke="#94A3B8" style={{ fontSize: '9px' }} />
              <Tooltip contentStyle={{ backgroundColor: '#1E3127', border: 'none', borderRadius: '12px', color: '#FAF6F0', fontSize: '11px' }} />
              <Area type="monotone" dataKey="value" stroke="#2C5E43" strokeWidth={2} fill="url(#priceGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-forest-900 text-white rounded-2xl p-6 shadow-xl">
        <h3 className="text-sm font-bold mb-4">Place a Bid</h3>
        <div className="flex items-center gap-4 mb-4">
          <div className="flex-1">
            <label className="text-[10px] uppercase tracking-wider text-forest-300 font-bold block mb-2">Your Bid (₹/credit)</label>
            <input type="number" min="100" step="10" value={bidAmount} onChange={e => setBidAmount(parseFloat(e.target.value) || 0)}
              className="w-full p-3.5 bg-forest-800 border border-forest-700 rounded-xl text-lg font-black text-white focus:outline-none focus:border-forest-500" />
          </div>
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-wider text-forest-300 font-bold">Total Value</p>
            <p className="text-2xl font-black text-forest-300">₹{(bidAmount * (parseFloat(farm.carbonPot) || 24)).toLocaleString('en-IN')}</p>
          </div>
        </div>

        {bidStatus === 'completed' ? (
          <div className="p-4 bg-forest-700 border border-forest-600 rounded-xl text-center text-sm font-bold flex items-center justify-center gap-2">
            <CheckCircle2 size={20} /> Bid Placed Successfully!
          </div>
        ) : (
          <button onClick={handleBid} disabled={bidStatus === 'processing'}
            className="w-full py-3.5 bg-forest-500 hover:bg-forest-400 text-white rounded-xl text-sm font-bold transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
            {bidStatus === 'processing' ? <><Loader2 size={18} className="animate-spin" /> Processing...</> : 'Submit Bid'}
          </button>
        )}
      </div>
    </div>
  );
}
