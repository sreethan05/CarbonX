import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function SatellitePreview() {
  const navigate = useNavigate();
  const { farms } = useAuth();
  const [logIndex, setLogIndex] = useState(0);
  const [analysis, setAnalysis] = useState(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('carbonx_last_analysis');
      if (saved) setAnalysis(JSON.parse(saved));
    } catch {}
  }, []);

  const logs = [
    "Locking Sentinel-2 & Landsat-8 orbits...",
    "Pulling multi-spectral raster bands...",
    `Computing NDVI index${analysis ? `: ${analysis.ndvi}` : '...'}`,
    `Verifying tree-canopy volume: ${analysis ? `${analysis.tree_cover}% cover` : 'calculating...'}`,
    `Calculating net biomass: ${analysis ? `${analysis.carbon_tonnes}t CO2e` : 'processing...'}`,
    `Biodiversity score: ${analysis ? `${analysis.biodiversity_score}/100` : 'scoring...'}`,
    "Generating blockchain ledger hash for verification..."
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setLogIndex((prev) => {
        if (prev < logs.length - 1) return prev + 1;
        clearInterval(interval);
        setTimeout(() => navigate('/submission-success'), 1000);
        return prev;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [navigate, analysis]);

  return (
    <div className="min-h-screen bg-carbon-900 text-white font-inter flex flex-col justify-between p-6 overflow-hidden relative">
      <div className="absolute inset-0 opacity-20 bg-[linear-gradient(to_right,#0f3810_1px,transparent_1px),linear-gradient(to_bottom,#0f3810_1px,transparent_1px)] [background-size:24px_24px]"></div>

      <div className="relative z-10 flex justify-between items-center pb-4 border-b border-forest-900">
        <span className="font-manrope font-extrabold text-sm text-emerald-400">🛰️ Sentinel MRV System</span>
        <span className="text-[10px] text-sky-light font-mono">STATUS: SCANNING_ORBIT_4</span>
      </div>

      <div className="relative z-10 flex-1 flex flex-col items-center justify-center space-y-8 my-6">
        <div className="relative w-72 h-72 rounded-[40px] overflow-hidden border-2 border-emerald-500 shadow-2xl">
          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&q=80&w=400')` }}></div>
          <div className="absolute inset-0 bg-emerald-950/20"></div>
          <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <polygon points="80,50 200,60 220,180 120,200 60,140"
              fill="rgba(16,185,129,0.25)" stroke="#10B981" strokeWidth="3" className="animate-pulse-soft" />
          </svg>
          <div className="absolute inset-x-0 w-full h-1 bg-emerald-400 shadow-lg animate-scan-line"></div>
        </div>

        {analysis && (
          <div className="w-full max-w-sm grid grid-cols-3 gap-2 text-center text-[10px]">
            <div className="bg-emerald-900/60 border border-emerald-700/40 rounded-xl p-2">
              <p className="text-emerald-400 font-mono font-bold text-xs">{analysis.ndvi}</p>
              <p className="text-white/60 mt-0.5">NDVI</p>
            </div>
            <div className="bg-emerald-900/60 border border-emerald-700/40 rounded-xl p-2">
              <p className="text-emerald-400 font-mono font-bold text-xs">{analysis.area_hectares} ha</p>
              <p className="text-white/60 mt-0.5">Area</p>
            </div>
            <div className="bg-emerald-900/60 border border-emerald-700/40 rounded-xl p-2">
              <p className="text-emerald-400 font-mono font-bold text-xs">{analysis.carbon_tonnes}t</p>
              <p className="text-white/60 mt-0.5">CO2e/yr</p>
            </div>
          </div>
        )}

        <div className="w-full max-w-sm bg-black/40 border border-forest-900/60 p-5 rounded-2xl space-y-2.5 font-mono text-[10px] leading-relaxed">
          <div className="flex justify-between items-center text-emerald-500 border-b border-forest-900/40 pb-2 mb-2 font-poppins font-bold">
            <span>💻 ISRO Bhuvan Analytics Console</span>
            <span className="animate-pulse text-xs">● Live</span>
          </div>
          <div className="space-y-1.5 min-h-[100px]">
            {logs.slice(0, logIndex + 1).map((log, idx) => (
              <p key={idx} className={idx === logIndex ? "text-emerald-300 font-bold" : "text-emerald-500/70"}>
                &gt; {log}
              </p>
            ))}
          </div>
        </div>
      </div>

      <div className="relative z-10 text-center text-[10px] text-emerald-400 font-bold tracking-wider uppercase">
        ⚡ Net Dry Carbon Sequestration Verification System
      </div>
    </div>
  );
}
