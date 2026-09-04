import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft, ShieldCheck, Compass, BarChart3, Info, AlertTriangle, 
  Satellite, Cpu, Award, TrendingUp, HelpCircle, ChevronRight, RefreshCw
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { farmsToAnalytics } from '../utils/farmAnalytics';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts';

export default function CorporateCreditAnalysis() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { farms } = useAuth();
  const analyticsFarms = farmsToAnalytics(farms);
  const farm = analyticsFarms.find((f) => f.id === id) || analyticsFarms[0];

  if (!farm) {
    return (
      <div className="min-h-screen bg-carbon-950 text-white flex flex-col items-center justify-center p-6">
        <p className="text-sm text-carbon-400 mb-4">No verified farm data available. Browse the marketplace for live listings.</p>
        <button type="button" onClick={() => navigate('/marketplace')} className="px-6 py-3 bg-emerald-600 rounded-2xl text-xs font-bold">
          Open Marketplace
        </button>
      </div>
    );
  }

  // Pricing trends from recent marketplace activity
  const priceTrendData = [
    { week: 'W1', value: 480 },
    { week: 'W2', value: 495 },
    { week: 'W3', value: 510 },
    { week: 'W4', value: 505 },
    { week: 'W5', value: 520 },
  ];

  // Bid states
  const [bidAmount, setBidAmount] = useState(530); // INR per credit
  const [bidStatus, setBidStatus] = useState("idle"); // idle, processing, completed
  const [escrowStep, setEscrowStep] = useState(0); // 0: unpaid, 1: locked, 2: processing, 3: settled

  const handlePlaceBid = (e) => {
    e.preventDefault();
    setBidStatus("processing");
    setEscrowStep(1);

    setTimeout(() => {
      setEscrowStep(2);
      setTimeout(() => {
        setEscrowStep(3);
        setBidStatus("completed");
        
        // Push notification of bid to outbid logic
        const currentNotifs = JSON.parse(localStorage.getItem('carbonx_notifications') || '[]');
        const newNotif = {
          id: Date.now(),
          text: `Corporate Bid Locked: ₹${(bidAmount * 24).toLocaleString()} for ${farm.cropType}.`,
          time: "Just now",
          type: "success"
        };
        localStorage.setItem('carbonx_notifications', JSON.stringify([newNotif, ...currentNotifs]));
      }, 1500);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-carbon-950 text-white font-inter pb-24 select-none">
      
      {/* Space intelligence top header */}
      <header className="sticky top-0 z-40 bg-carbon-900/90 backdrop-blur border-b border-carbon-800 py-3.5 px-6 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/marketplace')} className="p-2 hover:bg-carbon-800 rounded-xl text-carbon-300 transition-colors">
            <ArrowLeft size={18} />
          </button>
          <div>
            <span className="text-[9px] text-emerald-400 font-mono font-bold tracking-widest uppercase">🛰️ SENTINEL-2 ANALYTICAL TELEMETRY</span>
            <h1 className="text-sm font-black text-white">{farm.name} ({farm.cropType})</h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-3 py-1.5 rounded-full font-mono font-bold">
            CONFIDENCE: {farm.aiConfidence}
          </span>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 columns: Climate diagnostics */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* NDVI Telemetry Visual Block */}
          <div className="bg-carbon-900/60 border border-carbon-800 rounded-[32px] p-6 shadow-2xl space-y-6">
            <div className="flex justify-between items-center border-b border-carbon-800 pb-4">
              <div className="flex items-center gap-2.5">
                <Compass className="text-emerald-400 w-5 h-5 animate-pulse" />
                <div>
                  <h3 className="text-sm font-extrabold">Historic & Forecasted Vegetation Index (NDVI)</h3>
                  <p className="text-[10px] text-carbon-400">Chlorophyll light absorption ratios mapped over 12 months.</p>
                </div>
              </div>
              <span className="text-[10px] font-mono text-carbon-300">Temporal cycle: 5-days</span>
            </div>

            <div className="h-[220px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={farm.ndviTrend} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
                  <defs>
                    <linearGradient id="ndviColor" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.25}/>
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="forecastColor" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.25}/>
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" stroke="#4B5563" fontSize={9} fontClassName="font-mono" />
                  <YAxis stroke="#4B5563" fontSize={9} fontClassName="font-mono" domain={[0, 1.0]} />
                  <Tooltip contentStyle={{ backgroundColor: '#111827', borderColor: '#1F2937', color: '#FFF' }} />
                  <Legend wrapperStyle={{ fontSize: 10, fontFamily: 'monospace' }} />
                  <Area type="monotone" name="Historical Scans" dataKey="historical" stroke="#10B981" strokeWidth={2} fillOpacity={1} fill="url(#ndviColor)" connectNulls />
                  <Area type="monotone" name="Sequestration Forecast" dataKey="forecast" stroke="#3B82F6" strokeWidth={2} strokeDasharray="4 4" fillOpacity={1} fill="url(#forecastColor)" connectNulls />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Soil organic carbon & yield parameters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            <div className="bg-carbon-900/40 border border-carbon-800 p-5 rounded-[24px] space-y-2">
              <span className="text-[9px] uppercase tracking-wider font-mono text-carbon-400 font-bold">Soil Organic Carbon (SOC)</span>
              <h4 className="text-xl font-black text-white">{farm.soilCarbon}</h4>
              <p className="text-[9px] text-emerald-400 font-medium">✓ Highly optimal retention</p>
            </div>

            <div className="bg-carbon-900/40 border border-carbon-800 p-5 rounded-[24px] space-y-2">
              <span className="text-[9px] uppercase tracking-wider font-mono text-carbon-400 font-bold">Biodiversity Score</span>
              <h4 className="text-xl font-black text-emerald-400">{farm.biodiversity}</h4>
              <p className="text-[9px] text-carbon-400 font-mono">Teak & Boundary Forestry</p>
            </div>

            <div className="bg-carbon-900/40 border border-carbon-800 p-5 rounded-[24px] space-y-2">
              <span className="text-[9px] uppercase tracking-wider font-mono text-carbon-400 font-bold">Water Retention Index</span>
              <h4 className="text-xl font-black text-white">{farm.waterRetention}</h4>
              <p className="text-[9px] text-blue-400 font-medium">✓ Multi-layered cover cropping</p>
            </div>

          </div>

          {/* Risk Permanence Matrices */}
          <div className="bg-carbon-900/60 border border-carbon-800 rounded-[32px] p-6 shadow-2xl space-y-4">
            <h3 className="text-xs font-black tracking-wider uppercase font-mono text-white border-b border-carbon-800 pb-3">
              Dry Biomass Permanence & Risk Scale
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              <div className="space-y-2">
                <div className="flex justify-between text-[11px] font-semibold text-carbon-300">
                  <span>Wildfire Anomaly Risk</span>
                  <span className="text-emerald-400 font-mono font-bold">Low (1.2%)</span>
                </div>
                <div className="w-full h-2 bg-carbon-850 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: '12%' }}></div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-[11px] font-semibold text-carbon-300">
                  <span>Climatic Weather Drift / Drought</span>
                  <span className="text-emerald-400 font-mono font-bold">Low (4.8%)</span>
                </div>
                <div className="w-full h-2 bg-carbon-850 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-400 rounded-full" style={{ width: '22%' }}></div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-[11px] font-semibold text-carbon-300">
                  <span>Cadastral Encroachment / Overlap</span>
                  <span className="text-emerald-400 font-mono font-bold">0.0% Anomaly</span>
                </div>
                <div className="w-full h-2 bg-carbon-850 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: '0%' }}></div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-[11px] font-semibold text-carbon-300">
                  <span>Historical Yield Stability Coefficient</span>
                  <span className="text-emerald-400 font-mono font-bold">Excellent (98.4%)</span>
                </div>
                <div className="w-full h-2 bg-carbon-850 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: '98%' }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Satellite scan logs */}
          <div className="bg-carbon-900/60 border border-carbon-800 rounded-[32px] p-6 shadow-2xl space-y-4">
            <h3 className="text-xs font-black tracking-wider uppercase font-mono text-white border-b border-carbon-800 pb-3 flex items-center gap-1.5">
              <Satellite size={16} className="text-emerald-400 animate-spin" />
              Copernicus Sentinel Orbital Transit Log
            </h3>
            
            <div className="space-y-3 font-mono text-[10px]">
              {farm.scans.map((scan, index) => (
                <div key={scan.id} className="p-3 bg-black/40 border border-carbon-800 rounded-xl flex justify-between items-center gap-4">
                  <div className="flex items-center gap-3">
                    <span className="text-emerald-500">📥</span>
                    <div>
                      <p className="font-bold text-white">{scan.source}</p>
                      <p className="text-carbon-400 text-[9px] mt-0.5">{scan.time}</p>
                    </div>
                  </div>
                  <span className="bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/10">
                    {scan.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right column: Bidding Panel & Escrow tracker */}
        <div className="space-y-6">
          
          {/* Trust badges */}
          <div className="bg-carbon-900/60 border border-carbon-800 rounded-[32px] p-5 shadow-2xl space-y-3 flex flex-wrap gap-2 justify-center">
            <span className="inline-flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase font-mono">
              ✓ AI Verified
            </span>
            <span className="inline-flex items-center gap-1 bg-blue-500/10 border border-blue-500/20 text-blue-400 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase font-mono">
              🛰️ Satellite Scanned
            </span>
            <span className="inline-flex items-center gap-1 bg-purple-500/10 border border-purple-500/20 text-purple-400 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase font-mono">
              ☘️ High Biodiversity
            </span>
            <span className="inline-flex items-center gap-1 bg-amber-500/10 border border-amber-500/20 text-amber-400 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase font-mono">
              🏛️ CCTS Compliant
            </span>
          </div>

          {/* Live Orderbook / Bid Placement */}
          <div className="bg-white border border-forest-100 text-carbon-900 rounded-[32px] p-6 shadow-card space-y-5">
            <div className="flex justify-between items-start border-b border-forest-50 pb-3">
              <div>
                <h3 className="text-xs font-bold text-carbon-500 uppercase tracking-wide">Live Auction Bidding</h3>
                <h2 className="text-xl font-extrabold text-carbon-900 font-manrope mt-1">₹12,480 <span className="text-xs font-medium text-carbon-400">Total Valuation</span></h2>
              </div>
              <span className="text-[10px] bg-rose-100 border border-rose-200 text-rose-700 px-2 py-0.5 rounded-full font-bold uppercase animate-pulse">
                Live Countdown: 14h 42m
              </span>
            </div>

            <form onSubmit={handlePlaceBid} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-carbon-500 uppercase tracking-wide">Your Bid Amount (per Credit)</label>
                <div className="relative">
                  <span className="absolute left-4 top-3.5 text-xs font-bold text-carbon-500">₹</span>
                  <input 
                    type="number"
                    min={521}
                    value={bidAmount}
                    onChange={e => setBidAmount(parseInt(e.target.value) || 0)}
                    disabled={bidStatus === 'processing' || bidStatus === 'completed'}
                    className="w-full bg-warm-white border border-forest-100 rounded-2xl p-3.5 text-xs font-bold pl-8 focus:ring-0 focus:border-forest-400"
                    required
                  />
                </div>
                <p className="text-[9px] text-carbon-400">Minimum bid increment rule requires: &gt; ₹520</p>
              </div>

              <div className="space-y-1 bg-forest-50/50 border border-forest-100/50 rounded-2xl p-3.5 text-xs">
                <div className="flex justify-between font-semibold text-carbon-600">
                  <span>Carbon Quantity:</span>
                  <span className="font-extrabold text-carbon-800">24.0 tCO2e</span>
                </div>
                <div className="flex justify-between font-semibold text-carbon-600">
                  <span>Expected Bid Value:</span>
                  <span className="font-extrabold text-carbon-800">₹{(bidAmount * 24).toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-semibold text-carbon-600">
                  <span>Projected BRSR Scope Offset:</span>
                  <span className="font-extrabold text-profit">24.0 Metric Tons</span>
                </div>
              </div>

              {bidStatus === 'completed' ? (
                <button
                  type="button"
                  onClick={() => navigate('/corporate-dashboard')}
                  className="w-full py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-black text-xs font-extrabold font-poppins flex items-center justify-center gap-1.5 transition-all shadow-lg shadow-emerald-500/15"
                >
                  <span>Proceed to Corporate ESG Dashboard</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={bidStatus === 'processing'}
                  className={`w-full py-4 rounded-2xl text-xs font-extrabold font-poppins flex items-center justify-center gap-1.5 transition-all shadow-lg ${
                    bidStatus === 'processing'
                      ? 'bg-forest-100 text-forest-800 cursor-not-allowed shadow-none'
                      : 'bg-forest-800 hover:bg-forest-900 text-white shadow-forest-800/10'
                  }`}
                >
                  {bidStatus === 'processing' ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Locking Escrow Funds...</span>
                    </>
                  ) : (
                    <>
                      <TrendingUp className="w-4 h-4" />
                      <span>Submit Competitive Bid</span>
                    </>
                  )}
                </button>
              )}
            </form>

            {/* PAYMENT ESCROW TRACKER LEDGER */}
            {escrowStep > 0 && (
              <div className="border-t border-forest-50 pt-4 space-y-4">
                <h4 className="text-[10px] font-bold text-carbon-500 uppercase tracking-wider">
                  Payment Clearing Escrow Tracker
                </h4>
                
                <div className="space-y-3.5">
                  
                  {/* Step 1: Locked */}
                  <div className="flex gap-3 text-xs">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[9px] shrink-0 ${
                      escrowStep >= 1 ? 'bg-emerald-100 text-emerald-800' : 'bg-forest-50 text-carbon-400'
                    }`}>
                      {escrowStep >= 1 ? '✓' : '1'}
                    </div>
                    <div>
                      <p className={`font-bold ${escrowStep >= 1 ? 'text-carbon-800' : 'text-carbon-400'}`}>
                        Escrow Payout Locked
                      </p>
                      <p className="text-[9px] text-carbon-400 mt-0.5">
                        ₹{(bidAmount * 24).toLocaleString()} is securely locked under bank clearing vaults.
                      </p>
                    </div>
                  </div>

                  {/* Step 2: Processing */}
                  <div className="flex gap-3 text-xs">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[9px] shrink-0 ${
                      escrowStep >= 2 ? 'bg-emerald-100 text-emerald-800' : 'bg-forest-50 text-carbon-400'
                    }`}>
                      {escrowStep >= 2 ? '✓' : '2'}
                    </div>
                    <div>
                      <p className={`font-bold ${escrowStep >= 2 ? 'text-carbon-800' : 'text-carbon-400'}`}>
                        Satellite Verification Lockin
                      </p>
                      <p className="text-[9px] text-carbon-400 mt-0.5">
                        Matching current Sentinel orbit paths to assert permanent carbon.
                      </p>
                    </div>
                  </div>

                  {/* Step 3: Settled */}
                  <div className="flex gap-3 text-xs">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[9px] shrink-0 ${
                      escrowStep >= 3 ? 'bg-emerald-100 text-emerald-800 animate-pulse' : 'bg-forest-50 text-carbon-400'
                    }`}>
                      {escrowStep >= 3 ? '✓' : '3'}
                    </div>
                    <div>
                      <p className={`font-bold ${escrowStep >= 3 ? 'text-carbon-800' : 'text-carbon-400'}`}>
                        Settled & Token Transferred
                      </p>
                      {escrowStep >= 3 ? (
                        <div className="text-[9px] text-carbon-400 mt-0.5 space-y-1">
                          <p className="text-emerald-700 font-semibold">✓ ERC-1155 Token #CS-8829 assigned to TATA ESG Portfolio.</p>
                          <p className="font-mono bg-forest-50 p-1.5 rounded border border-forest-100 overflow-x-auto truncate">TX: 0x9f1a...48b2</p>
                        </div>
                      ) : (
                        <p className="text-[9px] text-carbon-400 mt-0.5">
                          Direct UPI wire and token assignment to Corporate Portfolio.
                        </p>
                      )}
                    </div>
                  </div>

                </div>
              </div>
            )}
          </div>

        </div>

      </main>

    </div>
  );
}
