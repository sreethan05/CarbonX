import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Compass, Wallet, Cpu, HeartHandshake, ArrowRight, Satellite, Leaf } from 'lucide-react';
import { getMarketplaceListings } from '../services/api';
import { listingToAuction } from '../utils/farmAnalytics';

export default function LandingPage() {
  const navigate = useNavigate();
  const [auctions, setAuctions] = useState([]);

  useEffect(() => {
    getMarketplaceListings()
      .then((res) => {
        if (res.success && res.listings?.length) {
          setAuctions(res.listings.slice(0, 3).map(listingToAuction));
        }
      })
      .catch(() => {});
  }, []);

  const pipeline = [
    { step: '01', name: 'Register Farm', desc: 'Draw land boundaries on our ISRO-Bhuvan compatible mapping screen via Aadhaar validation.', icon: Compass },
    { step: '02', name: 'Satellite Check', desc: 'Our AI model analyses Sentinel-2 & Landsat imagery to verify historical tree and vegetative index.', icon: Satellite },
    { step: '03', name: 'Sequestration Model', desc: 'Machine Learning calculates net organic carbon dioxide absorbed by your crop & trees.', icon: Cpu },
    { step: '04', name: 'Credit Tokenization', desc: 'We mint high-integrity ERC-1155 carbon credits backed by immutable satellite hashes.', icon: ShieldCheck },
    { step: '05', name: 'UPI Direct Pay', desc: 'Corporate buyers purchase verified assets directly, triggering instant UPI bank payout.', icon: Wallet },
  ];

  return (
    <div className="min-h-screen bg-warm-white font-inter">
      <header className="py-3 px-4 md:px-10 bg-white/90 backdrop-blur-md sticky top-0 z-40 border-b border-forest-100/60 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
          <div className="w-9 h-9 bg-forest-700 rounded-xl flex items-center justify-center text-white shadow-sm"><Leaf size={18} /></div>
          <div>
            <span className="font-manrope font-extrabold text-xl text-forest-800 tracking-tight block leading-tight">CarbonX</span>
            <span className="text-[9px] font-semibold text-carbon-400 hidden sm:block">Verified Carbon Sequestration</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/farmer-login')} className="text-xs font-bold text-carbon-700 hover:text-forest-800 px-3 py-1.5 rounded-xl hover:bg-forest-50 transition-colors">Login</button>
          <button onClick={() => navigate('/role-selection')} className="text-xs font-bold text-white bg-forest-800 hover:bg-forest-900 px-4 py-2 rounded-xl transition-colors flex items-center gap-1.5">Get Started <ArrowRight size={13} /></button>
        </div>
      </header>

      <section className="relative px-4 md:px-10 pt-12 md:pt-20 pb-16 md:pb-24 overflow-hidden">
        <div className="absolute inset-0 bg-earth-glow opacity-50" />
        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-1.5 bg-forest-50 border border-forest-100 px-3 py-1.5 rounded-full text-[10px] font-bold text-forest-800 uppercase tracking-wider mb-6">
            <Satellite size={12} /> ISRO + Sentinel-2 + GEE Powered
          </div>
          <h1 className="text-3xl md:text-5xl font-manrope font-extrabold text-carbon-900 tracking-tight leading-tight mb-4">
            Earn Carbon Credits from<br /><span className="text-gradient-green">Sustainable Farming</span>
          </h1>
          <p className="text-sm md:text-base text-carbon-500 max-w-2xl mx-auto leading-relaxed mb-8">
            CarbonX uses satellite imagery and AI to verify your farm's carbon sequestration. Get instant UPI payouts when corporates buy your verified carbon credits.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button onClick={() => navigate('/role-selection')} className="px-6 py-3.5 bg-forest-800 text-white rounded-2xl text-sm font-bold hover:bg-forest-900 transition-colors flex items-center justify-center gap-2 shadow-lg">Start as Farmer <ArrowRight size={16} /></button>
            <button onClick={() => navigate('/farmer-login')} className="px-6 py-3.5 bg-white border border-forest-200 text-carbon-800 rounded-2xl text-sm font-bold hover:bg-forest-50 transition-colors flex items-center justify-center gap-2">Login to Dashboard</button>
          </div>
        </div>
      </section>

      <section className="px-4 md:px-10 py-12 md:py-16 bg-white/60 border-y border-forest-100/60">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-xl md:text-2xl font-manrope font-bold text-carbon-900 text-center mb-2">How CarbonX Works</h2>
          <p className="text-xs text-carbon-500 text-center mb-10">From farm registration to UPI payout in 5 steps</p>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {pipeline.map((p, i) => {
              const Icon = p.icon;
              return (
                <div key={i} className="relative">
                  <div className="bg-white border border-forest-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
                    <div className="w-10 h-10 bg-forest-50 text-forest-700 rounded-xl flex items-center justify-center mb-3"><Icon size={20} /></div>
                    <span className="text-[9px] font-mono font-bold text-forest-400 uppercase tracking-wider">Step {p.step}</span>
                    <h3 className="text-sm font-bold text-carbon-900 mt-1">{p.name}</h3>
                    <p className="text-[11px] text-carbon-500 mt-1.5 leading-relaxed">{p.desc}</p>
                  </div>
                  {i < pipeline.length - 1 && (<div className="hidden md:flex absolute top-1/2 -right-2.5 -translate-y-1/2 z-10 text-forest-300"><ArrowRight size={16} /></div>)}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="px-4 md:px-10 py-12 bg-forest-900 text-white">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div><p className="text-3xl font-black text-forest-300">5-day</p><p className="text-[10px] text-white/60 uppercase tracking-wider mt-1">Satellite Revisit</p></div>
          <div><p className="text-3xl font-black text-forest-300">256-bit</p><p className="text-[10px] text-white/60 uppercase tracking-wider mt-1">Encryption</p></div>
          <div><p className="text-3xl font-black text-forest-300">ERC-1155</p><p className="text-[10px] text-white/60 uppercase tracking-wider mt-1">Token Standard</p></div>
          <div><p className="text-3xl font-black text-forest-300">UPI</p><p className="text-[10px] text-white/60 uppercase tracking-wider mt-1">Instant Payouts</p></div>
        </div>
      </section>

      {auctions.length > 0 && (
        <section className="px-4 md:px-10 py-12">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-xl font-manrope font-bold text-carbon-900 mb-6">Live Carbon Credit Listings</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {auctions.map((a) => (
                <div key={a.id} className="bg-white border border-forest-100 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/marketplace')}>
                  <div className="w-full h-32 bg-forest-100 rounded-xl mb-3 overflow-hidden"><img src={a.image} alt={a.crop} className="w-full h-full object-cover" /></div>
                  <h3 className="text-sm font-bold text-carbon-900">{a.crop}</h3>
                  <p className="text-[10px] text-carbon-400 mt-0.5">{a.farmer} · {a.location}</p>
                  <div className="flex justify-between items-center mt-3 pt-3 border-t border-forest-50">
                    <span className="text-xs font-bold text-forest-700">{a.credits}</span>
                    <span className="text-sm font-black text-carbon-900">{a.currentBid}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="px-4 md:px-10 py-16 bg-forest-50 border-t border-forest-100">
        <div className="max-w-2xl mx-auto text-center">
          <HeartHandshake className="w-12 h-12 text-forest-600 mx-auto mb-4" />
          <h2 className="text-2xl font-manrope font-bold text-carbon-900 mb-3">Ready to Start?</h2>
          <p className="text-sm text-carbon-500 mb-6">Join CarbonX today and turn your sustainable farming practices into carbon credits.</p>
          <button onClick={() => navigate('/role-selection')} className="px-8 py-3.5 bg-forest-800 text-white rounded-2xl text-sm font-bold hover:bg-forest-900 transition-colors flex items-center gap-2 mx-auto shadow-lg">Choose Your Role <ArrowRight size={16} /></button>
        </div>
      </section>

      <footer className="py-6 px-4 md:px-10 bg-carbon-900 text-white/60 text-center text-xs">
        <p>CarbonX · SIH 2026 · Verified Carbon Sequestration for Indian Farmers</p>
      </footer>
    </div>
  );
}
