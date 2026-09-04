import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import { 
  Activity, 
  Calendar, 
  Compass, 
  Database, 
  Eye, 
  Layers, 
  Leaf, 
  Sparkles, 
  TrendingUp, 
  TrendingDown, 
  AlertCircle,
  HelpCircle,
  ChevronLeft,
  Settings,
  Info
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { farmsToAnalytics } from '../utils/farmAnalytics';

export default function DetailedFarmAnalytics() {
  const navigate = useNavigate();
  const { farms } = useAuth();
  const analyticsFarms = useMemo(() => farmsToAnalytics(farms), [farms]);
  const [selectedFarm, setSelectedFarm] = useState(null);
  const [activeTab, setActiveTab] = useState('ndvi');

  useEffect(() => {
    if (analyticsFarms.length) {
      setSelectedFarm((prev) => {
        if (prev && analyticsFarms.some((f) => f.id === prev.id)) return prev;
        return analyticsFarms[0];
      });
    } else {
      setSelectedFarm(null);
    }
  }, [analyticsFarms]);

  if (!analyticsFarms.length || !selectedFarm) {
    return (
      <div className="pb-24 px-4 pt-4 max-w-md mx-auto bg-earth-cream min-h-screen text-earth-dark font-sans text-center">
        <p className="text-sm text-earth-muted mt-20 mb-4">No farm data yet. Draw a boundary and run satellite analysis first.</p>
        <button
          type="button"
          onClick={() => navigate('/farm-map')}
          className="px-6 py-3 bg-earth-green text-white rounded-2xl text-xs font-bold"
        >
          Map Your Farm
        </button>
      </div>
    );
  }
  
  // Custom mock layers description
  const tabDetails = {
    ndvi: {
      title: "NDVI Vegetation Index",
      desc: "Normalized Difference Vegetation Index measuring plant photosynthetic activity & health using Sentinel-2 near-infrared bands.",
      metricLabel: "Crop Health Index",
      metricValue: selectedFarm.ndvi.toFixed(2),
      metricTag: selectedFarm.vegetationHealth,
      gradientColors: ["#EF4444", "#FBBF24", "#34D399", "#047857"],
      gradientTicks: ["-0.2 (Soil)", "0.3 (Sparse)", "0.6 (Good)", "1.0 (Dense)"]
    },
    carbon: {
      title: "Carbon Sequestration",
      desc: "Calculated biomass carbon capture potential based on canopy coverage, tree count, and soil carbon historical core records.",
      metricLabel: "Carbon Potential",
      metricValue: selectedFarm.carbonPot,
      metricTag: "ISO 14064 Compliant",
      gradientColors: ["#D1FAE5", "#6EE7B7", "#059669", "#064E3B"],
      gradientTicks: ["2t CO2e", "6t CO2e", "10t CO2e", "15t CO2e+"]
    },
    soil: {
      title: "Soil Moisture & Health",
      desc: "Topsoil moisture percentage and Soil Organic Carbon (SOC) density calculated from microwave satellite readings.",
      metricLabel: "Soil Organic Carbon",
      metricValue: selectedFarm.soilCarbon.split(' ')[0],
      metricTag: "Healthy Level",
      gradientColors: ["#EFF6FF", "#93C5FD", "#3B82F6", "#1E3A8A"],
      gradientTicks: ["0% (Dry)", "20% (Low)", "45% (Optimal)", "80%+ (Saturated)"]
    }
  };

  const currentTab = tabDetails[activeTab];

  // Helper for active farm boundary rendering
  const isNorthPlot = selectedFarm.id === analyticsFarms[0]?.id;

  return (
    <div className="pb-24 px-4 pt-4 max-w-md mx-auto bg-earth-cream min-h-screen text-earth-dark font-sans">
      
      {/* Header bar */}
      <div className="flex items-center justify-between mb-4">
        <button 
          onClick={() => navigate('/farmer-dashboard')}
          className="flex items-center justify-center p-2 rounded-xl bg-white border border-earth-green/10 text-earth-muted hover:text-earth-dark"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h2 className="text-sm font-black tracking-wider uppercase text-earth-dark">ISRO / NASA GIS portal</h2>
        <button 
          className="flex items-center justify-center p-2 rounded-xl bg-white border border-earth-green/10 text-earth-muted"
        >
          <Settings className="w-5 h-5" />
        </button>
      </div>

      {/* Farm Selector Tab Bar */}
      <div className="flex gap-2 mb-5 p-1 bg-earth-green/5 border border-earth-green/10 rounded-2xl">
        {analyticsFarms.map((farm) => (
          <button
            key={farm.id}
            onClick={() => setSelectedFarm(farm)}
            className={`flex-1 py-2 px-3 text-xs font-bold rounded-xl transition-all duration-300 ${
              selectedFarm.id === farm.id 
                ? 'bg-earth-green text-white shadow-sm'
                : 'text-earth-muted hover:text-earth-dark'
            }`}
          >
            {farm.name.split(' ')[0]}...
          </button>
        ))}
      </div>

      {/* Live Bhuvan Vector Map Simulator - SCREENSHOT 4 GIS PREVIEW */}
      <div className="relative h-64 w-full bg-earth-dark rounded-3xl border border-earth-green/20 overflow-hidden shadow-lg mb-6">
        
        {/* Simulating active false color layer */}
        <div className="absolute inset-0 bg-cover bg-center transition-all duration-700" style={{
          backgroundImage: `url(${
            isNorthPlot 
              ? activeTab === 'ndvi' 
                ? 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&q=80&w=400'
                : activeTab === 'carbon' 
                  ? 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&q=80&w=400'
                  : 'https://images.unsplash.com/photo-1589923188900-85dae523342b?auto=format&fit=crop&q=80&w=400'
              : 'https://images.unsplash.com/photo-1599839616654-e0b02923c683?auto=format&fit=crop&q=80&w=400'
          })`,
          filter: activeTab === 'ndvi' 
            ? 'hue-rotate(60deg) saturate(1.8)' 
            : activeTab === 'carbon' 
              ? 'hue-rotate(110deg) brightness(0.8) contrast(1.2)' 
              : 'sepia(0.6) hue-rotate(190deg) brightness(0.9)'
        }} />

        {/* Bhuvan HUD Overlays */}
        <div className="absolute top-3 left-3 bg-earth-dark/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 text-[9px] font-mono text-white flex items-center gap-1.5 z-10">
          <Layers className="w-3 h-3 text-earth-accent animate-pulse" />
          <span>BHUVAN GIS LAYER V3.8</span>
        </div>

        <div className="absolute top-3 right-3 bg-earth-dark/80 backdrop-blur-md px-2.5 py-1 rounded-xl border border-white/10 text-[9px] font-mono text-earth-accent z-10 flex items-center gap-1">
          <span className="h-1.5 w-1.5 bg-earth-accent rounded-full animate-ping" />
          <span>ORBIT PASSING: 98%</span>
        </div>

        {/* Map Bounding Polygon overlay */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-10" viewBox="0 0 100 100" preserveAspectRatio="none">
          {isNorthPlot ? (
            <polygon 
              points="15,20 85,15 78,80 20,85" 
              fill={
                activeTab === 'ndvi' 
                  ? 'rgba(46, 125, 50, 0.25)' 
                  : activeTab === 'carbon' 
                    ? 'rgba(21, 67, 34, 0.35)' 
                    : 'rgba(26, 82, 118, 0.25)'
              }
              stroke={
                activeTab === 'ndvi' 
                  ? '#34D399' 
                  : activeTab === 'carbon' 
                    ? '#E29B63' 
                    : '#60A5FA'
              }
              strokeWidth="1.5"
              strokeDasharray="2 1"
            />
          ) : (
            <polygon 
              points="30,30 75,25 65,70 25,60" 
              fill="rgba(46, 125, 50, 0.2)"
              stroke="#34D399"
              strokeWidth="1.5"
              strokeDasharray="2 1"
            />
          )}
          
          {/* Overlay center grid markers */}
          <line x1="50" y1="0" x2="50" y2="100" stroke="rgba(255,255,255,0.08)" strokeWidth="0.5" strokeDasharray="3 3" />
          <line x1="0" y1="50" x2="100" y2="50" stroke="rgba(255,255,255,0.08)" strokeWidth="0.5" strokeDasharray="3 3" />
        </svg>

        {/* GPS location marker pulsing */}
        <div className="absolute top-[48%] left-[45%] -translate-x-1/2 -translate-y-1/2 flex items-center justify-center z-15 pointer-events-none">
          <div className="absolute w-8 h-8 rounded-full bg-white/20 border border-white/50 animate-ping" />
          <div className="w-3.5 h-3.5 rounded-full bg-earth-accent border-2 border-white shadow-md" />
        </div>

        {/* Legend overlays */}
        <div className="absolute bottom-3 left-3 right-3 bg-earth-dark/95 backdrop-blur-md p-2 rounded-2xl border border-white/10 z-10 flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-[9px] text-white/60 font-mono">
            <span>{currentTab.title} Gradient</span>
            <span className="text-white font-bold">{currentTab.metricTag}</span>
          </div>
          {/* Scientific gradient bar */}
          <div 
            className="h-2 w-full rounded-full" 
            style={{
              background: `linear-gradient(to right, ${currentTab.gradientColors.join(', ')})`
            }} 
          />
          <div className="flex justify-between text-[8px] text-white/50 font-mono">
            {currentTab.gradientTicks.map((t, idx) => (
              <span key={idx}>{t}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Analytical Sub-Tabs Selector */}
      <div className="grid grid-cols-3 gap-2 mb-6">
        {Object.keys(tabDetails).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`py-3 px-2 rounded-2xl text-center border transition-all duration-300 ${
              activeTab === tab 
                ? 'bg-white border-earth-green text-earth-green font-bold shadow-sm shadow-earth-green/10'
                : 'bg-white/60 border-earth-green/5 text-earth-muted hover:text-earth-dark hover:bg-white'
            }`}
          >
            <span className="text-[10px] block uppercase tracking-wider font-mono">
              {tab === 'ndvi' ? 'Vegetation' : tab === 'carbon' ? 'Biomass' : 'Hydrology'}
            </span>
            <span className="text-xs mt-1 block font-black">
              {tab === 'ndvi' ? 'NDVI Index' : tab === 'carbon' ? 'Carbon t' : 'Moisture %'}
            </span>
          </button>
        ))}
      </div>

      {/* Main scientific details card */}
      <motion.div 
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl p-5 border border-earth-green/10 shadow-sm mb-6"
      >
        <h3 className="text-sm font-bold text-earth-dark flex items-center gap-1.5 mb-1.5">
          <Leaf className="w-4 h-4 text-earth-green animate-pulse" />
          {currentTab.title}
        </h3>
        <p className="text-xs text-earth-muted leading-relaxed mb-4">
          {currentTab.desc}
        </p>

        {/* GIS Indicators Strip - SCREENSHOT 4 */}
        <div className="grid grid-cols-3 gap-3 border-t border-earth-green/5 pt-4">
          <div className="bg-earth-green/5 p-2.5 rounded-xl border border-earth-green/10 text-center">
            <p className="text-[9px] uppercase tracking-wider text-earth-muted font-bold">Crop Health</p>
            <p className="text-sm font-black text-earth-dark mt-1">{currentTab.metricValue}</p>
            <span className="inline-block text-[8px] bg-earth-green/10 text-earth-green px-1.5 py-0.5 rounded-md font-bold mt-1">
              {currentTab.metricTag}
            </span>
          </div>

          <div className="bg-earth-green/5 p-2.5 rounded-xl border border-earth-green/10 text-center">
            <p className="text-[9px] uppercase tracking-wider text-earth-muted font-bold">Confidence</p>
            <p className="text-sm font-black text-earth-dark mt-1">{selectedFarm.aiConfidence}</p>
            <span className="inline-block text-[8px] bg-blue-500/10 text-blue-600 px-1.5 py-0.5 rounded-md font-bold mt-1">
              ✓ HIGH
            </span>
          </div>

          <div className="bg-earth-green/5 p-2.5 rounded-xl border border-earth-green/10 text-center">
            <p className="text-[9px] uppercase tracking-wider text-earth-muted font-bold">Annual Pot.</p>
            <p className="text-sm font-black text-earth-dark mt-1">{selectedFarm.carbonPot.split(' ')[0]}</p>
            <span className="inline-block text-[8px] bg-earth-accent/25 text-earth-dark px-1.5 py-0.5 rounded-md font-bold mt-1">
              tCO2e/yr
            </span>
          </div>
        </div>
      </motion.div>

      {/* Projection curved chart card - SCREENSHOT 4 CURVED CHART */}
      <div className="bg-white rounded-3xl p-5 border border-earth-green/10 shadow-sm mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="text-xs font-bold text-earth-dark flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-earth-green animate-pulse" />
              NDVI Trend & Projection
            </h4>
            <p className="text-[10px] text-earth-muted mt-0.5">Dual-curved prediction algorithm</p>
          </div>
          <span className="text-[9px] bg-sky-500/10 text-sky-600 px-2 py-0.5 rounded-full font-mono flex items-center gap-1">
            <Database className="w-3.5 h-3.5" /> Planet API
          </span>
        </div>

        {/* Custom Legend */}
        <div className="flex items-center gap-4 text-[10px] font-medium text-earth-muted mb-4 px-1">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-earth-green inline-block rounded-full" />
            <span>Historical Sat Recs</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 border-t-2 border-dashed border-earth-accent inline-block" />
            <span>AI Predictive Yield</span>
          </div>
        </div>

        {/* Recharts Wrapper */}
        <div className="h-44 w-full text-[10px] font-mono">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart 
              data={selectedFarm.ndviTrend}
              margin={{ top: 5, right: 10, left: -25, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis 
                dataKey="month" 
                tickLine={false} 
                axisLine={false} 
                stroke="#94A3B8" 
              />
              <YAxis 
                domain={[0.2, 1.0]} 
                tickLine={false} 
                axisLine={false} 
                stroke="#94A3B8" 
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1E3127', 
                  border: 'none', 
                  borderRadius: '12px',
                  color: '#FAF6F0',
                  fontFamily: 'monospace',
                  fontSize: '11px'
                }}
              />
              
              {/* Reference line marking transition to prediction */}
              <ReferenceLine x="Dec 23" stroke="#E29B63" strokeDasharray="3 3" label={{ value: 'SCAN', fill: '#E29B63', fontSize: 8, position: 'top' }} />

              {/* Historical Line */}
              <Line 
                type="monotone" 
                dataKey="historical" 
                stroke="#2C5E43" 
                strokeWidth={3} 
                dot={{ r: 4, stroke: '#2C5E43', strokeWidth: 2, fill: '#FAF6F0' }}
                activeDot={{ r: 6 }} 
              />
              
              {/* Forecast Line */}
              <Line 
                type="monotone" 
                dataKey="forecast" 
                stroke="#E29B63" 
                strokeWidth={3}
                strokeDasharray="5 5" 
                dot={{ r: 4, stroke: '#E29B63', strokeWidth: 2, fill: '#FAF6F0' }}
                activeDot={{ r: 6 }} 
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Grid Indicators: Tree, Water, Soil, Bio - SCREENSHOT 4 */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white p-4 rounded-3xl border border-earth-green/10 shadow-sm">
          <p className="text-[10px] text-earth-muted font-bold uppercase tracking-wider">Biodiversity Index</p>
          <p className="text-lg font-black text-earth-dark mt-1">{selectedFarm.biodiversity}</p>
          <p className="text-[9px] text-earth-green mt-1">✓ Canopy variety optimal</p>
        </div>

        <div className="bg-white p-4 rounded-3xl border border-earth-green/10 shadow-sm">
          <p className="text-[10px] text-earth-muted font-bold uppercase tracking-wider">Estimated Trees</p>
          <p className="text-lg font-black text-earth-dark mt-1">1,240 <span className="text-xs font-normal text-earth-muted">stems</span></p>
          <p className="text-[9px] text-earth-green mt-1">✓ Laser-measured scan</p>
        </div>

        <div className="bg-white p-4 rounded-3xl border border-earth-green/10 shadow-sm">
          <p className="text-[10px] text-earth-muted font-bold uppercase tracking-wider">Water Retention</p>
          <p className="text-lg font-black text-earth-dark mt-1">{selectedFarm.waterRetention}</p>
          <p className="text-[9px] text-sky-600 mt-1">● Wet root zone stable</p>
        </div>

        <div className="bg-white p-4 rounded-3xl border border-earth-green/10 shadow-sm">
          <p className="text-[10px] text-earth-muted font-bold uppercase tracking-wider">Soil Organic Carbon</p>
          <p className="text-lg font-black text-earth-dark mt-1">{selectedFarm.soilCarbon.split(' ')[0]}</p>
          <p className="text-[9px] text-earth-accent font-semibold mt-1">{selectedFarm.soilCarbon.split(' ')[1]} YoY</p>
        </div>
      </div>

      {/* Green AI Recommendations Panel - SCREENSHOT 4 SUGGESTIONS */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.35 }}
        className="bg-gradient-to-br from-earth-green/10 to-earth-accent/10 border-2 border-earth-green/20 rounded-3xl p-5 mb-6 shadow-sm relative overflow-hidden"
      >
        <div className="absolute right-2 -bottom-4 text-earth-green/10 opacity-30 select-none">
          <Sparkles className="w-20 h-20" />
        </div>

        <div className="flex items-start gap-3">
          <div className="p-2.5 bg-earth-green text-white rounded-xl">
            <Sparkles className="w-4 h-4 text-earth-accent" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-earth-dark uppercase tracking-wider">CarbonX Green AI Suggestion</h4>
            <p className="text-xs text-earth-dark mt-2 leading-relaxed font-medium">
              "Increase nitrogen-fixing cover crops <span className="underline font-bold text-earth-green">(cowpea)</span> by <span className="font-bold text-earth-green">15%</span> before the July monsoon to boost organic carbon from 2.8% to 3.1% and unlock an estimated <span className="font-bold text-earth-accent">₹4,200</span> extra carbon credits."
            </p>
          </div>
        </div>
      </motion.div>

      {/* Scan Logs list (Sentinel scan history) - SCREENSHOT 4 */}
      <div className="bg-white rounded-3xl p-5 border border-earth-green/10 shadow-sm">
        <h4 className="text-xs font-bold text-earth-muted uppercase tracking-wider mb-4 flex items-center gap-1.5">
          <Eye className="w-4 h-4 text-earth-green" /> Satellite Scan History
        </h4>
        <div className="space-y-4">
          {selectedFarm.scans.map((scan) => (
            <div key={scan.id} className="flex justify-between items-center text-xs pb-3 border-b border-earth-green/5 last:border-0 last:pb-0">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl ${
                  scan.type === 'success' 
                    ? 'bg-earth-green/10 text-earth-green'
                    : scan.type === 'info' 
                      ? 'bg-sky-500/10 text-sky-600'
                      : 'bg-earth-dark/5 text-earth-muted'
                }`}>
                  <Compass className="w-4 h-4" />
                </div>
                <div>
                  <h5 className="font-bold text-earth-dark">{scan.source}</h5>
                  <p className="text-[10px] text-earth-muted mt-0.5">{scan.time}</p>
                </div>
              </div>
              <div className="text-right">
                <span className={`inline-block text-[9px] font-mono px-2 py-0.5 rounded-full font-bold ${
                  scan.type === 'success' 
                    ? 'bg-earth-green/10 text-earth-green'
                    : scan.type === 'info' 
                      ? 'bg-sky-500/10 text-sky-600'
                      : 'bg-earth-dark/5 text-earth-muted'
                }`}>
                  {scan.label}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
