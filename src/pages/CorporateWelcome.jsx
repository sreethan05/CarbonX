import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Globe, ShieldCheck, TrendingUp, Leaf } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function CorporateWelcome() {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="pb-24 px-4 pt-6 max-w-4xl mx-auto">
      {/* Hero */}
      <div className="bg-forest-900 text-white rounded-2xl p-8 mb-6 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-40 h-40 bg-forest-700/20 rounded-full blur-3xl" />
        <div className="relative">
          <span className="text-[10px] text-forest-300 font-bold uppercase tracking-wider">Corporate ESG Portal</span>
          <h1 className="text-2xl font-black mt-2">Welcome, {user?.name || 'Corporate Buyer'}</h1>
          <p className="text-xs text-white/60 mt-2 leading-relaxed max-w-md">
            Purchase verified carbon credits from Indian farmers. Audit BRSR reports. Fund sustainable agroforestry. All backed by satellite verification.
          </p>
          <button onClick={() => navigate('/marketplace')}
            className="mt-6 px-6 py-3 bg-forest-500 hover:bg-forest-400 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-all">
            Browse Marketplace <ArrowRight size={14} />
          </button>
        </div>
      </div>

      {/* Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {[
          { icon: Globe, title: 'Global ESG Compliance', desc: 'Meet BRSR and UN NetZero targets with verified carbon offsets.' },
          { icon: ShieldCheck, title: 'Satellite Verified', desc: 'Every credit backed by Sentinel-2 NDVI data and blockchain ledger.' },
          { icon: TrendingUp, title: 'Transparent Pricing', desc: 'Direct farmer-to-buyer marketplace. No middlemen. Fair prices.' },
        ].map((f, i) => (
          <div key={i} className="bg-white rounded-2xl border border-forest-100 shadow-sm p-5">
            <div className="w-10 h-10 bg-forest-50 text-forest-700 rounded-xl flex items-center justify-center mb-3"><f.icon size={20} /></div>
            <h3 className="text-sm font-bold text-carbon-900">{f.title}</h3>
            <p className="text-[11px] text-carbon-500 mt-1 leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="bg-forest-50 border border-forest-100 rounded-2xl p-6 text-center">
        <Leaf className="w-10 h-10 text-forest-600 mx-auto mb-3" />
        <h3 className="text-sm font-bold text-forest-900">Ready to offset your carbon footprint?</h3>
        <p className="text-xs text-forest-700 mt-1 mb-4">Browse verified carbon credits from farmers across India.</p>
        <button onClick={() => navigate('/marketplace')}
          className="px-6 py-3 bg-forest-800 text-white rounded-xl text-xs font-bold hover:bg-forest-900 transition-colors">
          Enter Marketplace
        </button>
      </div>
    </div>
  );
}
