import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Compass, Wallet, Cpu, HeartHandshake, ArrowRight, CheckCircle2, ChevronDown } from 'lucide-react';
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
    { step: "01", name: "Register Farm", desc: "Draw land boundaries on our ISRO-Bhuvan compatible mapping screen via Aadhaar validation.", icon: Compass },
    { step: "02", name: "Satellite Check", desc: "Our AI model analyses Sentinel & Landsat imagery to verify historical tree and vegetative index.", icon: Cpu },
    { step: "03", name: "Sequestration Model", desc: "Machine Learning calculates net organic carbon dioxide absorbed by your crop & trees.", icon: ShieldCheck },
    { step: "04", name: "Credit Tokenization", desc: "We mint high-integrity ERC-1155 carbon credits backed by immutable satellite hashes.", icon: Wallet },
    { step: "05", name: "UPI Direct Pay", desc: "Corporate buyers purchase verified assets directly, triggering instant UPI bank payout.", icon: HeartHandshake }
  ];

  return (
    <div className="min-h-screen bg-warm-white font-inter">
      {/* Header bar */}
      <header className="py-4 px-6 md:px-12 bg-white/75 backdrop-blur-md sticky top-0 z-40 border-b border-forest-50/50 flex justify-between items-center shadow-sm">
        <span className="font-manrope font-extrabold text-xl text-forest-800 tracking-tight flex items-center gap-1.5">
          🌱 CarbonX
        </span>
        <div className="hidden md:flex gap-6 items-center text-sm font-semibold text-carbon-600">
          <a href="#how-it-works" className="hover:text-forest-700 transition-colors">Scientific Pipeline</a>
          <a href="#marketplace" className="hover:text-forest-700 transition-colors">Live Market</a>
          <a href="#success" className="hover:text-forest-700 transition-colors">Farmer Success</a>
          <a href="#faq" className="hover:text-forest-700 transition-colors">FAQ</a>
        </div>
        <button 
          onClick={() => navigate('/role-selection')}
          className="bg-forest-800 hover:bg-forest-900 text-white font-poppins text-xs font-bold px-5 py-2.5 rounded-2xl shadow transition-all duration-200"
        >
          Enter Platform
        </button>
      </header>

      {/* Hero Section */}
      <section className="relative py-16 px-6 md:px-12 max-w-7xl mx-auto grid md:grid-cols-12 gap-12 items-center">
        {/* Animated Satellite grid backdrop */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#2E7D32_1.5px,transparent_1.5px)] [background-size:24px_24px] pointer-events-none"></div>
        
        <div className="md:col-span-7 space-y-6 relative z-10 text-center md:text-left">
          
          <h1 className="text-4xl md:text-6xl font-extrabold font-manrope text-carbon-900 leading-tight">
            Turn Sustainable Farming into <span className="text-forest-800 underline decoration-earth-light decoration-4">Income</span>
          </h1>
          <p className="text-sm md:text-base text-carbon-600 leading-relaxed max-w-xl">
            Empowering Indian smallholder farmers to register farmland, receive AI/satellite-verified carbon credits, and sell directly to global corporate buyers with zero middleman commissions.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start pt-3">
            <button 
              onClick={() => navigate('/role-selection')}
              className="bg-forest-800 hover:bg-forest-900 text-white text-sm font-bold font-poppins px-8 py-4 rounded-2xl shadow-lg hover:shadow-premium flex items-center justify-center gap-2 transition-all"
            >
              Register Your Farm <ArrowRight size={16} />
            </button>
            <button 
              onClick={() => navigate('/corporate-welcome')}
              className="border-2 border-forest-200 hover:border-forest-400 bg-white/50 text-forest-900 text-sm font-bold font-poppins px-8 py-4 rounded-2xl flex items-center justify-center transition-all"
            >
              Explore Marketplace
            </button>
          </div>
        </div>

        {/* Hero Interactive dashboard preview */}
        <div className="md:col-span-5 relative">
          <div className="bg-white/80 border border-forest-100 rounded-[32px] p-6 shadow-2xl backdrop-blur-md relative overflow-hidden animate-in fade-in zoom-in duration-500">
            <div className="absolute top-0 right-0 w-32 h-32 bg-forest-100/40 rounded-full blur-3xl"></div>
            
            {/* Satellite sweep animation simulation */}
            <div className="absolute inset-x-0 w-full h-0.5 bg-forest-300 shadow-md animate-scan-line"></div>
            
            <div className="flex justify-between items-center pb-4 border-b border-forest-50 mb-4">
              <span className="text-[10px] font-bold text-forest-700 tracking-wider uppercase">🛰️ Sentinel Live Scan</span>
              <span className="text-[9px] font-extrabold text-white upi-badge px-2 py-0.5 rounded-full shadow-sm">ACTIVE GPS</span>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-xs font-semibold text-carbon-400">Total Credits Distributed</p>
                <div className="flex items-baseline gap-1.5 mt-0.5">
                  <span className="text-3xl font-extrabold text-carbon-800 font-manrope">1,24,500</span>
                  <span className="text-xs font-bold text-forest-600">tCO2e</span>
                </div>
              </div>

              {/* Progress visual */}
              <div className="bg-forest-50 border border-forest-100 rounded-2xl p-4">
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span className="text-forest-800">Warangal Agroforestry</span>
                  <span className="text-profit">+₹18,500</span>
                </div>
                <div className="w-full bg-forest-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-forest-600 h-full rounded-full animate-pulse-soft" style={{ width: '74%' }}></div>
                </div>
                <div className="flex justify-between text-[9px] text-carbon-400 mt-1.5">
                  <span>NDVI: 0.74 (Excellent)</span>
                  <span>Confidence: 98.2%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust bar */}
      <section className="bg-white py-6 border-y border-forest-100/50">
        <div className="max-w-7xl mx-auto px-6 flex flex-wrap justify-around items-center gap-6 text-xs font-bold text-carbon-500 tracking-wider font-poppins">
          <div className="flex items-center gap-2">🟢 ISRO BHUVAN SPATIAL DATA</div>
          <div className="flex items-center gap-2">🛡️ SECURED SMART CONTRACTS</div>
          <div className="flex items-center gap-2">⚡ INSTANT UPI BANK PAYMENTS</div>
          <div className="flex items-center gap-2">📜 GOVT REGULATORY ALIGNED</div>
        </div>
      </section>

      {/* Live impact summary cards */}
      <section className="py-16 px-6 max-w-7xl mx-auto space-y-12">
        <h2 className="text-3xl font-extrabold text-center text-carbon-900 font-manrope">Real-time Environmental Impact</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="premium-card p-8 text-center bg-white hover:border-forest-200">
            <p className="text-[10px] font-bold text-carbon-400 uppercase tracking-widest mb-1">Active Carbon Farms</p>
            <p className="text-4xl font-extrabold text-forest-800 font-manrope">14,200+</p>
            <p className="text-xs text-carbon-500 mt-2 font-inter">Verified smallholder plots across Telangana & Andhra Pradesh.</p>
          </div>
          <div className="premium-card p-8 text-center bg-white hover:border-forest-200">
            <p className="text-[10px] font-bold text-carbon-400 uppercase tracking-widest mb-1">Certified CO2 Sequestration</p>
            <p className="text-4xl font-extrabold text-forest-800 font-manrope">2,85,400t</p>
            <p className="text-xs text-carbon-500 mt-2 font-inter">Calculated via Sentinel multispectral vegetation health scans.</p>
          </div>
          <div className="premium-card p-8 text-center bg-white hover:border-forest-200">
            <p className="text-[10px] font-bold text-carbon-400 uppercase tracking-widest mb-1">Total Payouts Distributed</p>
            <p className="text-4xl font-extrabold text-forest-800 font-manrope">₹12.4 Crores</p>
            <p className="text-xs text-carbon-500 mt-2 font-inter">Direct UPI payouts credited straight to farmers' linked accounts.</p>
          </div>
        </div>
      </section>

      {/* Scientific pipeline */}
      <section id="how-it-works" className="py-16 bg-forest-900 text-white px-6">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center max-w-xl mx-auto space-y-3">
            <h2 className="text-3xl font-extrabold font-manrope">Scientific Pipeline</h2>
            <p className="text-xs text-forest-200">Our MRV carbon estimation workflow combines geospatial intelligence with digital public registries.</p>
          </div>

          <div className="grid md:grid-cols-5 gap-6">
            {pipeline.map((item, idx) => (
              <div key={idx} className="bg-forest-800/50 border border-forest-700/50 p-6 rounded-2xl space-y-4 hover:bg-forest-800 transition-all duration-300">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-earth-light tracking-widest uppercase">Step {item.step}</span>
                  <item.icon size={20} className="text-sky-light" />
                </div>
                <h3 className="text-base font-bold font-poppins">{item.name}</h3>
                <p className="text-xs text-forest-200/80 leading-relaxed font-inter">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Farmer Success Story */}
      <section id="success" className="py-16 px-6 max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-center">
        <div className="rounded-[40px] overflow-hidden border border-forest-100 shadow-2xl relative h-[400px]">
          <img 
            src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=600" 
            alt="Telangana Farmer" 
            className="w-full h-full object-cover" 
          />
          <div className="absolute bottom-6 left-6 bg-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3">
            <div>
              <p className="text-xs font-bold text-carbon-800">Earned Total</p>
              <p className="text-base font-extrabold text-forest-800">₹18,500</p>
            </div>
            <span className="text-[10px] font-bold text-white upi-badge px-2 py-0.5 rounded-md">UPI CREDITED</span>
          </div>
        </div>

        <div className="space-y-6">
          <span className="text-xs font-bold text-forest-800 tracking-wider uppercase font-poppins">Success Story</span>
          <h2 className="text-3xl font-extrabold font-manrope text-carbon-900 leading-tight">
            "Carbon is my new cash crop"
          </h2>
          <blockquote className="text-sm italic text-carbon-600 leading-relaxed relative">
            "I registered my 2-acre paddy field. Within days, the satellites scanned it and calculated my carbon sequestration values. I received my credits tokenized on blockchain and sold them to corporate buyers. The UPI payout arrived directly in my bank account with zero middleman paperwork!"
          </blockquote>
          <div>
            <p className="text-sm font-bold text-carbon-800">Ramaiah G.</p>
            <p className="text-xs text-forest-600">Venkateshwara Pally, Warangal District</p>
          </div>
        </div>
      </section>

      {/* Marketplace mini preview */}
      <section id="marketplace" className="py-16 bg-forest-50 px-6 border-y border-forest-100/50">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <h2 className="text-3xl font-extrabold text-carbon-900 font-manrope">Live Credit Marketplace</h2>
            <p className="text-xs text-carbon-500">Transparent trading prices backing smallholder ecological practices.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {auctions.length === 0 ? (
              <p className="col-span-full text-center text-sm text-carbon-500 py-8">
                No active listings yet. Register a farm and list credits to appear here.
              </p>
            ) : (
            auctions.map(auc => (
              <div key={auc.id} className="bg-white rounded-3xl overflow-hidden shadow-card border border-forest-100 flex flex-col justify-between">
                <div className="h-44 overflow-hidden relative">
                  <img src={auc.image} alt={auc.crop} className="w-full h-full object-cover" />
                  <span className="absolute top-3 right-3 text-[9px] font-extrabold bg-emerald-600 text-white px-2.5 py-0.5 rounded-full tracking-wider uppercase">ACTIVE</span>
                </div>
                <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-carbon-800">{auc.crop}</h3>
                    <p className="text-xs text-carbon-400 mt-1">{auc.farmer} • {auc.location}</p>
                  </div>
                  <div className="flex justify-between border-t border-forest-50 pt-4 text-xs">
                    <div>
                      <p className="text-[10px] text-carbon-400 font-bold uppercase">Volume</p>
                      <p className="font-extrabold text-carbon-800">{auc.credits}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-carbon-400 font-bold uppercase">Current Bid</p>
                      <p className="font-extrabold text-forest-800">{auc.currentBid}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => navigate('/role-selection')}
                    className="w-full bg-carbon-800 hover:bg-carbon-900 text-white font-poppins text-xs font-bold py-3 rounded-2xl shadow transition-all duration-200"
                  >
                    Place Bid
                  </button>
                </div>
              </div>
            ))
            )}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-16 px-6 max-w-4xl mx-auto space-y-12">
        <h2 className="text-3xl font-extrabold text-center text-carbon-900 font-manrope">Frequently Asked Questions</h2>
        <div className="space-y-4">
          <div className="bg-white border border-forest-100/50 p-6 rounded-3xl space-y-2">
            <h3 className="text-sm font-bold text-carbon-800 font-poppins">What are carbon credits?</h3>
            <p className="text-xs text-carbon-600 leading-relaxed font-inter">
              Carbon credits represent a verified reduction of carbon dioxide in the atmosphere. Sustainable practices like crop rotation, agroforestry, and zero-tillage absorb carbon from the atmosphere, generating credits that can be sold.
            </p>
          </div>
          <div className="bg-white border border-forest-100/50 p-6 rounded-3xl space-y-2">
            <h3 className="text-sm font-bold text-carbon-800 font-poppins">How does satellite verification work?</h3>
            <p className="text-xs text-carbon-600 leading-relaxed font-inter">
              Our system pulls multi-spectral data from Sentinel and Landsat satellites. We analyze indices like NDVI (Normalized Difference Vegetation Index) to track seasonal crop cycles and canopy tree growth, providing verifiably real offsets without on-site paperwork.
            </p>
          </div>
          <div className="bg-white border border-forest-100/50 p-6 rounded-3xl space-y-2">
            <h3 className="text-sm font-bold text-carbon-800 font-poppins">Is an Aadhaar verification required?</h3>
            <p className="text-xs text-carbon-600 leading-relaxed font-inter">
              Yes, Aadhaar verification ensures zero land overlap frauds and securely links the farmland plot to the correct legal owner, establishing the required credit authenticity for institutional global buyers.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-carbon-900 text-white py-12 px-6 border-t border-carbon-800">
        <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-8 mb-8 text-xs font-inter">
          <div className="space-y-4">
            <span className="font-manrope font-extrabold text-lg text-emerald-400 tracking-tight">🌱 CarbonX</span>
            <p className="text-carbon-400 leading-relaxed">Empowering smallholder Indian farmers through satellite-driven carbon credit ecosystems.</p>
          </div>
          <div>
            <h4 className="font-bold font-poppins text-white uppercase mb-3">Governance</h4>
            <ul className="space-y-1.5 text-carbon-400">
              <li>ISRO Compatibility</li>
              <li>Ministry of Agriculture Partnership</li>
              <li>CCTS Compliance</li>
              <li>Gold Standard Registers</li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold font-poppins text-white uppercase mb-3">Enterprise</h4>
            <ul className="space-y-1.5 text-carbon-400">
              <li>Scope 3 ESG Reports</li>
              <li>Smart Contract audits</li>
              <li>API Integration</li>
              <li>Bulk Credits bidding</li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold font-poppins text-white uppercase mb-3">Contact</h4>
            <p className="text-carbon-400">support@carbonx.org.in</p>
            <p className="text-carbon-500 mt-2">New Delhi • Warangal, Telangana</p>
          </div>
        </div>
        <div className="max-w-7xl mx-auto border-t border-carbon-800 pt-6 flex flex-col sm:flex-row justify-between items-center text-[10px] text-carbon-500 gap-4">
          <p>© 2026 CarbonX. Supported by Digital India & Ministry of Agriculture.</p>
          <div className="flex gap-4">
            <a href="#" className="hover:underline">Privacy Policy</a>
            <a href="#" className="hover:underline">Terms of Service</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
