import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Building, Compass, ArrowRight, ShieldCheck, Database, Award, 
  BarChart3, Satellite, FileSpreadsheet, Lock, AlertCircle, TrendingUp 
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function CorporateWelcome() {
  const navigate = useNavigate();

  // Mock corporate carbon metrics over time
  const offsetHistory = [
    { year: '2023', offset: 1200, target: 1500 },
    { year: '2024', offset: 2100, target: 2500 },
    { year: '2025', offset: 3800, target: 4000 },
    { year: '2026', offset: 4250, target: 5000 },
  ];

  // Active auction tickers
  const auctionPreview = [
    { id: "auc-01", origin: "Warangal, Telangana", crop: "Andhra Paddy Cluster", credits: "420 tCO2e", currentBid: "₹520 / credit", spread: "Bid: ₹515 | Ask: ₹525", ndvi: "0.78", status: "Live" },
    { id: "auc-02", origin: "Medak, Telangana", crop: "Wetland Agroforestry", credits: "1,200 tCO2e", currentBid: "₹480 / credit", spread: "Bid: ₹470 | Ask: ₹490", ndvi: "0.82", status: "Live" },
    { id: "auc-03", origin: "Mandya, Karnataka", crop: "Sugarcane Sequestration", credits: "850 tCO2e", currentBid: "₹540 / credit", spread: "Bid: ₹530 | Ask: ₹550", ndvi: "0.75", status: "Ending Soon" },
  ];

  // Mock State-wise supply indicators
  const stateSupply = [
    { state: "Telangana", supply: "14,280 tCO2e", projects: "82 Farms", quality: "98.2% AI Confidence" },
    { state: "Andhra Pradesh", supply: "9,640 tCO2e", projects: "45 Farms", quality: "94.5% AI Confidence" },
    { state: "Karnataka", supply: "12,110 tCO2e", projects: "60 Farms", quality: "96.4% AI Confidence" },
  ];

  const handleEnterCorporate = () => {
    // Set corporate session key
    localStorage.setItem('carbonx_user_role', 'corporate');
    navigate('/corporate-dashboard');
  };

  return (
    <div className="min-h-screen bg-carbon-950 text-white font-inter overflow-x-hidden selection:bg-emerald-500 selection:text-black">
      
      {/* Premium Bloomberg Ticker Top Panel */}
      <div className="bg-black border-b border-carbon-900 py-2.5 px-6 flex items-center justify-between overflow-hidden gap-12 select-none">
        <div className="flex items-center gap-1.5 whitespace-nowrap text-[10px] tracking-wider uppercase font-mono font-bold">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
          <span className="text-emerald-400">CarbonX INDEX (CXI):</span>
          <span className="text-white">₹520.00 (+4.8% / 7D)</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-[9px] font-mono tracking-widest text-carbon-400">
          <span>SENTINEL-2B REVISIT CYCLE: 5 DAYS</span>
          <span>● verified smart contracts: 1,420</span>
          <span>● average ndvi coefficient: 0.76</span>
          <span>● blockchain settled: ₹12.4 Cr</span>
        </div>
      </div>

      {/* Corporate Header */}
      <header className="py-4 px-6 max-w-7xl mx-auto flex justify-between items-center border-b border-carbon-900/60 sticky top-0 bg-carbon-950/80 backdrop-blur-xl z-40">
        <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => navigate('/')}>
          <span className="w-9 h-9 bg-emerald-600 rounded-xl flex items-center justify-center text-white font-extrabold text-lg">🌱</span>
          <span className="font-manrope font-black text-xl tracking-tight text-white">CarbonX <span className="text-emerald-400 text-xs font-mono font-medium tracking-wide uppercase px-2 py-0.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 ml-1.5">Enterprise</span></span>
        </div>
        
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/role-selection')}
            className="text-xs font-bold font-poppins text-carbon-300 hover:text-white transition-colors"
          >
            Change Portal
          </button>
          <button 
            onClick={handleEnterCorporate}
            className="bg-emerald-600 hover:bg-emerald-700 text-black font-extrabold text-xs font-poppins px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-emerald-500/10"
          >
            Login as Corporate
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 px-6 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Decorative dynamic neon grid lines */}
        <div className="absolute right-0 top-1/4 w-[500px] h-[500px] bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none"></div>
        <div className="absolute left-0 bottom-10 w-[300px] h-[300px] bg-blue-500/5 blur-[90px] rounded-full pointer-events-none"></div>

        <div className="space-y-6 max-w-xl">
          <span className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-3 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase font-mono">
            🛰️ Space-Borne MRV Audit Platform
          </span>
          
          <h1 className="text-4xl sm:text-5xl font-black font-manrope leading-[1.1] tracking-tight">
            Purchase Verified Indian Carbon Credits with <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">Full Satellite Transparency</span>
          </h1>
          
          <p className="text-sm text-carbon-300 leading-relaxed font-inter">
            Enterprise-grade carbon procurement powered by AI, satellite MRV, and blockchain verification. Streamline your Scope 3 compliance audits and BRSR reporting instantly.
          </p>

          <div className="flex flex-wrap gap-4 pt-3">
            <button 
              onClick={() => {
                localStorage.setItem('carbonx_user_role', 'corporate');
                navigate('/marketplace');
              }}
              className="bg-gradient-to-r from-emerald-400 to-teal-500 hover:from-emerald-500 hover:to-teal-600 text-black font-extrabold text-xs font-poppins px-7 py-4 rounded-2xl shadow-xl shadow-emerald-500/10 transition-all flex items-center gap-1.5"
            >
              <span>Explore Marketplace</span>
              <ArrowRight size={15} />
            </button>
            
            <button 
              onClick={() => alert("Request Demo registered. Our ESG consulting team will coordinate standard BRSR templates with your CFO within 24 hours.")}
              className="border border-carbon-800 hover:border-carbon-600 text-white font-bold text-xs font-poppins px-7 py-4 rounded-2xl transition-all"
            >
              Request Enterprise Demo
            </button>
          </div>
        </div>

        {/* Dashboard Preview Module (Framer-inspired Bloomberg UI) */}
        <div className="bg-carbon-900/60 border border-carbon-800 rounded-[32px] p-6 shadow-2xl backdrop-blur-md relative space-y-6">
          <div className="flex justify-between items-center border-b border-carbon-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-500/10 text-emerald-400 rounded-xl flex items-center justify-center">
                <Building className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] text-carbon-400 uppercase font-mono font-bold">Sustainability Portfolio</p>
                <h3 className="text-sm font-extrabold text-white">TATA ESG Solutions</h3>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2.5 py-1 rounded-full font-bold uppercase">
                96.4% Compliant
              </span>
            </div>
          </div>

          {/* Core metrics grid */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-black/30 border border-carbon-800/40 p-3.5 rounded-2xl text-center">
              <p className="text-[9px] uppercase tracking-wider text-carbon-400 font-bold">Offset Scope 3</p>
              <p className="text-lg font-black text-white mt-1">4,250 t</p>
            </div>
            <div className="bg-black/30 border border-carbon-800/40 p-3.5 rounded-2xl text-center">
              <p className="text-[9px] uppercase tracking-wider text-carbon-400 font-bold">Target 2026</p>
              <p className="text-lg font-black text-emerald-400 mt-1">5,000 t</p>
            </div>
            <div className="bg-black/30 border border-carbon-800/40 p-3.5 rounded-2xl text-center">
              <p className="text-[9px] uppercase tracking-wider text-carbon-400 font-bold">Secured Funds</p>
              <p className="text-lg font-black text-white mt-1">₹22.1 Lakh</p>
            </div>
          </div>

          {/* Area Chart inside preview card */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-[10px] font-mono text-carbon-400">
              <span>Annual Offset Progress (tCO2e)</span>
              <span className="text-emerald-400">+102% CAGR</span>
            </div>
            <div className="h-[120px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={offsetHistory} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
                  <defs>
                    <linearGradient id="colorOffset" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="year" stroke="#4B5563" fontSize={9} fontClassName="font-mono" />
                  <YAxis stroke="#4B5563" fontSize={9} fontClassName="font-mono" />
                  <Tooltip contentStyle={{ backgroundColor: '#111827', borderColor: '#1F2937', color: '#FFF', fontSize: 11 }} />
                  <Area type="monotone" dataKey="offset" stroke="#10B981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorOffset)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

      </section>

      {/* Corporate Trust Matrix */}
      <section className="bg-black/50 border-y border-carbon-900 py-16 px-6">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-black font-manrope">The Gold Standard of Compliance and Trust</h2>
            <p className="text-xs text-carbon-400 max-w-lg mx-auto leading-relaxed">
              Every carbon credit on our exchange undergoes rigorous, institutional audits to ensure permanent, real-world climate impacts.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-carbon-900/30 border border-carbon-800 p-5 rounded-[24px] space-y-3">
              <div className="w-10 h-10 bg-emerald-500/10 text-emerald-400 rounded-xl flex items-center justify-center">
                <Satellite className="w-5 h-5" />
              </div>
              <h3 className="text-xs font-bold">Satellite MRV Validation</h3>
              <p className="text-[10px] text-carbon-400 leading-relaxed">
                Sentinel-2 and Landsat multi-spectral bands scan biomass densities, water indices, and NDVI health, replacing human manual audit error.
              </p>
            </div>

            <div className="bg-carbon-900/30 border border-carbon-800 p-5 rounded-[24px] space-y-3">
              <div className="w-10 h-10 bg-blue-500/10 text-blue-400 rounded-xl flex items-center justify-center">
                <Database className="w-5 h-5" />
              </div>
              <h3 className="text-xs font-bold">Blockchain Cryptographic Audit</h3>
              <p className="text-[10px] text-carbon-400 leading-relaxed">
                Credits are issued as smart-contract-controlled tokens. Public ledger audits guarantee double-counting prevention.
              </p>
            </div>

            <div className="bg-carbon-900/30 border border-carbon-800 p-5 rounded-[24px] space-y-3">
              <div className="w-10 h-10 bg-purple-500/10 text-purple-400 rounded-xl flex items-center justify-center">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <h3 className="text-xs font-bold">Audit-Ready Scope 3 Reporting</h3>
              <p className="text-[10px] text-carbon-400 leading-relaxed">
                Generate downloadable, fully verified ESG reports, BRSR Section E, and CSR records compliant with Indian Sebi specifications.
              </p>
            </div>

            <div className="bg-carbon-900/30 border border-carbon-800 p-5 rounded-[24px] space-y-3">
              <div className="w-10 h-10 bg-amber-500/10 text-amber-400 rounded-xl flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-xs font-bold">CCTS-Ready Infrastructure</h3>
              <p className="text-[10px] text-carbon-400 leading-relaxed">
                Engineered from the ground up to match the standards of India’s Carbon Credit Trading Scheme (CCTS) Bureau of Energy Efficiency.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Credit Quality Explainer Section */}
      <section className="py-20 px-6 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        
        {/* Left Column: Visual Metrics panel */}
        <div className="bg-gradient-to-b from-carbon-900 to-black border border-carbon-800 rounded-[36px] p-6 space-y-5 relative">
          <div className="absolute top-4 right-4 text-[9px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full uppercase">
            Validation Protocol
          </div>
          
          <h3 className="text-sm font-extrabold text-white uppercase tracking-wider font-mono">Biomass Analytics & AI Validation</h3>
          
          <div className="space-y-4">
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] font-semibold text-carbon-300">
                <span>NDVI Health Verification Index</span>
                <span className="text-emerald-400">98.2% Accuracy</span>
              </div>
              <div className="w-full h-2.5 bg-carbon-850 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: '92%' }}></div>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-[11px] font-semibold text-carbon-300">
                <span>Biodiversity / Soil Organic Carbon (SOC) Scale</span>
                <span className="text-emerald-400">82/100 Soil Index</span>
              </div>
              <div className="w-full h-2.5 bg-carbon-850 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-400 rounded-full" style={{ width: '82%' }}></div>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-[11px] font-semibold text-carbon-300">
                <span>Satellite Revisit and Drift Consistency</span>
                <span className="text-emerald-400">5-Day Temporal Cycle</span>
              </div>
              <div className="w-full h-2.5 bg-carbon-850 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full" style={{ width: '100%' }}></div>
              </div>
            </div>
          </div>

          <div className="bg-black/40 border border-carbon-800 rounded-2xl p-4 flex gap-3 text-[10px] leading-relaxed text-carbon-300">
            <AlertCircle size={18} className="text-emerald-400 shrink-0 mt-0.5" />
            <p>
              <strong>AI Fraud Shield</strong>: Our proprietary ML pipelines flag historic field overlap, cadastral boundary encroachment, or synthetic vegetation spikes, ensuring 0% double-issuance risks.
            </p>
          </div>
        </div>

        {/* Right Column: Text Explainer */}
        <div className="space-y-6">
          <h2 className="text-3xl font-black font-manrope">Scientific Verification, Zero Greenwashing.</h2>
          <p className="text-xs text-carbon-300 leading-relaxed font-inter">
            CarbonX doesn't rely on self-reported agrarian claims. We pair direct PM-Kisan bank matches with deep orbital monitoring. 
          </p>

          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs shrink-0 font-bold">1</div>
              <div>
                <h4 className="text-xs font-bold text-white">NDVI Sequestration Mapping</h4>
                <p className="text-[10px] text-carbon-400 mt-1 leading-relaxed">
                  We measure the photosynthetic light absorption metrics of crops to calculate net carbon accumulation year-over-year.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center text-xs shrink-0 font-bold">2</div>
              <div>
                <h4 className="text-xs font-bold text-white">Biodiversity & Agroforestry Valuation</h4>
                <p className="text-[10px] text-carbon-400 mt-1 leading-relaxed">
                  Farmers planting boundary timber trees (Teak, Mahogany) earn premium biodiversity multipliers, driving higher carbon value.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center text-xs shrink-0 font-bold">3</div>
              <div>
                <h4 className="text-xs font-bold text-white">Instant UPI Settlement Escrow</h4>
                <p className="text-[10px] text-carbon-400 mt-1 leading-relaxed">
                  No three-month verification delays. When a corporate buyer approves a trade, funds flow instantly to rural bank accounts.
                </p>
              </div>
            </div>
          </div>
        </div>

      </section>

      {/* Active Auctions Preview & Spreads */}
      <section className="bg-black/30 border-t border-carbon-900 py-20 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* Active Spreads Ticker */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex justify-between items-end border-b border-carbon-900 pb-4">
              <div>
                <h2 className="text-2xl font-black font-manrope">Live Exchange Trading Floor</h2>
                <p className="text-[10px] text-carbon-400 mt-0.5">Real-time auction orderbook. Transact with direct verification anchors.</p>
              </div>
              <button 
                onClick={() => {
                  localStorage.setItem('carbonx_user_role', 'corporate');
                  navigate('/marketplace');
                }}
                className="text-xs font-bold text-emerald-400 hover:underline flex items-center gap-1"
              >
                Open Trading Floor <ArrowRight size={14} />
              </button>
            </div>

            <div className="space-y-3.5">
              {auctionPreview.map(auc => (
                <div key={auc.id} className="bg-carbon-900/40 border border-carbon-850 p-4 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-emerald-500/30 transition-all">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-white">{auc.crop}</span>
                      <span className="text-[9px] font-mono text-carbon-400">{auc.origin}</span>
                    </div>
                    <p className="text-[10px] text-carbon-400">Total size: {auc.credits} • NDVI Confidence: {auc.ndvi}</p>
                  </div>
                  
                  <div className="flex items-center gap-5 w-full sm:w-auto justify-between sm:justify-end">
                    <div className="text-right">
                      <p className="text-xs font-black text-emerald-400">{auc.currentBid}</p>
                      <p className="text-[9px] font-mono text-carbon-400">{auc.spread}</p>
                    </div>
                    <button 
                      onClick={() => {
                        localStorage.setItem('carbonx_user_role', 'corporate');
                        navigate('/marketplace');
                      }}
                      className="bg-carbon-800 hover:bg-emerald-600 hover:text-black text-white px-4 py-2.5 rounded-xl text-[10px] font-bold tracking-wider uppercase transition-all"
                    >
                      Inspect / Bid
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Regional Supply Metrics */}
          <div className="bg-carbon-900/60 border border-carbon-850 p-6 rounded-[28px] space-y-6">
            <h3 className="text-xs font-black tracking-wider uppercase font-mono text-white border-b border-carbon-800 pb-3">
              State-wise Carbon Supply
            </h3>
            
            <div className="space-y-4">
              {stateSupply.map((sup, idx) => (
                <div key={idx} className="space-y-2 border-b border-carbon-900/60 pb-3 last:border-b-0 last:pb-0">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-white">{sup.state}</span>
                    <span className="text-emerald-400 font-extrabold">{sup.supply}</span>
                  </div>
                  <div className="flex justify-between text-[10px] text-carbon-400 font-mono">
                    <span>{sup.projects}</span>
                    <span>{sup.quality}</span>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="pt-2 text-[9px] text-carbon-400 font-mono leading-relaxed bg-black/40 border border-carbon-800/40 rounded-xl p-3">
              🌱 Cumulative national carbon supply is verified using ISRO Bhuvan geospatial templates.
            </div>
          </div>

        </div>
      </section>

      {/* Corporate Call to Action Footer */}
      <footer className="py-20 bg-black border-t border-carbon-900 px-6 text-center space-y-6">
        <h2 className="text-3xl font-black font-manrope max-w-lg mx-auto leading-snug">
          Fund Verified Rural Carbon Sink Projects Today
        </h2>
        <p className="text-xs text-carbon-400 max-w-sm mx-auto leading-relaxed">
          Unlock standard, pre-audited carbon compliance portfolios and secure seamless direct-to-farmer bank trades.
        </p>

        <button 
          onClick={handleEnterCorporate}
          className="bg-emerald-400 hover:bg-emerald-500 text-black font-black text-xs font-poppins px-8 py-4 rounded-2xl shadow-xl shadow-emerald-500/10 transition-all uppercase tracking-wider"
        >
          Enter Corporate Portal
        </button>

        <div className="pt-12 text-[10px] text-carbon-500 font-mono space-y-1">
          <p>© 2026 CarbonX Platforms Private Limited. Direct public agricultural clearinghouse infrastructure.</p>
          <p>Sentinel satellite images sourced from Copernicus Sentinel-2 open access repository.</p>
        </div>
      </footer>

    </div>
  );
}
