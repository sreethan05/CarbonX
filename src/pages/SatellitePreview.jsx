import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Satellite, Cpu, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function SatellitePreview() {
  const navigate = useNavigate();
  const [logIndex, setLogIndex] = useState(0);
  const [analysis, setAnalysis] = useState(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('carbonx_last_analysis');
      if (saved) setAnalysis(JSON.parse(saved));
    } catch {}
  }, []);

  const logs = [
    'Locking Sentinel-2 & Landsat-8 orbits...',
    'Pulling multi-spectral raster bands...',
    `Computing NDVI index${analysis ? `: ${analysis.ndvi}` : '...'}`,
    `Verifying tree-canopy volume: ${analysis ? `${analysis.tree_cover || 68}% cover` : 'calculating...'}`,
    `Calculating net biomass: ${analysis ? `${analysis.carbon_tonnes}t CO2e` : 'processing...'}`,
    `Biodiversity score: ${analysis ? `${analysis.biodiversity_score}/100` : 'scoring...'}`,
    'Generating blockchain ledger hash for verification...',
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setLogIndex((prev) => {
        if (prev < logs.length - 1) return prev + 1;
        clearInterval(interval);
        setTimeout(() => navigate('/submission-success'), 1200);
        return prev;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [navigate, analysis]);

  return (
    <div className="min-h-screen bg-forest-900 flex flex-col items-center justify-center px-4 py-8 text-white">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="relative w-24 h-24 mx-auto mb-6">
            <div className="absolute inset-0 bg-forest-700 rounded-full animate-pulse-soft" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Satellite size={40} className="text-forest-300" />
            </div>
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-forest-300 to-transparent animate-scan-line" />
          </div>
          <h1 className="text-xl font-manrope font-bold text-white">Satellite Scan in Progress</h1>
          <p className="text-xs text-forest-300 mt-2">Analyzing your farm with Sentinel-2 multispectral imagery</p>
        </div>

        <div className="bg-forest-800/50 border border-forest-700 rounded-2xl p-5 space-y-3">
          {logs.map((log, i) => {
            const done = logIndex > i;
            const active = logIndex === i;
            return (
              <div key={i} className={`flex items-center gap-3 transition-all ${i > logIndex ? 'opacity-30' : ''}`}>
                <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 transition-all ${done ? 'bg-forest-500 text-white' : active ? 'bg-forest-400 text-white' : 'bg-forest-700 text-forest-500'}`}>
                  {done ? <CheckCircle2 size={14} /> : active ? <Cpu size={14} className="animate-pulse" /> : <span className="text-[8px] font-mono">{i + 1}</span>}
                </div>
                <span className={`text-xs font-mono ${done ? 'text-forest-200' : active ? 'text-white' : 'text-forest-500'}`}>{log}</span>
              </div>
            );
          })}
        </div>

        <div className="mt-6 text-center">
          <div className="inline-flex items-center gap-2 text-[10px] text-forest-400 font-mono">
            <div className="w-2 h-2 bg-forest-400 rounded-full animate-pulse" />
            <span>PROCESSING · {Math.round((logIndex / logs.length) * 100)}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
