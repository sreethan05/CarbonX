import React, { useMemo, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Activity, Leaf, TrendingUp, ChevronLeft, Info, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { farmsToAnalytics } from '../utils/farmAnalytics';

export default function DetailedFarmAnalytics() {
  const navigate = useNavigate();
  const { farms } = useAuth();
  const analyticsFarms = useMemo(() => farmsToAnalytics(farms), [farms]);
  const [selectedIdx, setSelectedIdx] = useState(0);

  const farm = analyticsFarms[selectedIdx];

  if (!farm) {
    return (
      <div className="pb-24 px-4 pt-6 max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate('/dashboard')} className="p-2 rounded-xl bg-white border border-forest-100 text-carbon-600">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-bold text-carbon-900">Farm Analytics</h1>
        </div>
        <div className="bg-white border border-dashed border-forest-200 rounded-2xl p-8 text-center text-sm text-carbon-500">
          No farms mapped yet. Map your farm to see detailed analytics.
          <button onClick={() => navigate('/farm-map')} className="block mx-auto mt-4 px-6 py-3 bg-forest-800 text-white rounded-2xl text-xs font-bold">Map Your Farm</button>
        </div>
      </div>
    );
  }

  const metrics = [
    { label: 'NDVI', value: farm.ndvi?.toFixed(2) || '0.52', icon: Activity, color: 'text-forest-700' },
    { label: 'Vegetation', value: farm.vegetationHealth || 'Good', icon: Leaf, color: 'text-forest-600' },
    { label: 'Carbon Potential', value: farm.carbonPot || '0 t CO2e/yr', icon: TrendingUp, color: 'text-amber-700' },
    { label: 'AI Confidence', value: farm.aiConfidence || '95%', icon: Info, color: 'text-sky-700' },
    { label: 'Biodiversity', value: farm.biodiversity || '0/100', icon: Leaf, color: 'text-forest-600' },
    { label: 'Water Retention', value: farm.waterRetention || '0%', icon: Activity, color: 'text-sky-600' },
  ];

  return (
    <div className="pb-24 px-4 pt-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate('/dashboard')} className="p-2 rounded-xl bg-white border border-forest-100 text-carbon-600 hover:text-forest-800">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-lg font-bold text-carbon-900">Farm Analytics</h1>
          <p className="text-[11px] text-carbon-500">Satellite-verified metrics and NDVI trends</p>
        </div>
      </div>

      {analyticsFarms.length > 1 && (
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
          {analyticsFarms.map((f, i) => (
            <button key={i} onClick={() => setSelectedIdx(i)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${i === selectedIdx ? 'bg-forest-800 text-white' : 'bg-white border border-forest-100 text-carbon-600'}`}>
              {f.name}
            </button>
          ))}
        </div>
      )}

      <div className="bg-white rounded-2xl border border-forest-100 shadow-sm p-5 mb-4">
        <h2 className="text-sm font-bold text-carbon-900">{farm.name}</h2>
        <p className="text-[11px] text-carbon-500 mt-0.5">{farm.cropType} · {farm.areaHectares || 'N/A'} hectares</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
        {metrics.map((m, i) => {
          const Icon = m.icon;
          return (
            <div key={i} className="bg-white border border-forest-100 rounded-2xl p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <Icon size={16} className={m.color} />
                <span className="text-[9px] uppercase tracking-wider text-carbon-400 font-bold">{m.label}</span>
              </div>
              <p className="text-lg font-black text-carbon-900">{m.value}</p>
            </div>
          );
        })}
      </div>

      {farm.ndviTrend && (
        <div className="bg-white rounded-2xl border border-forest-100 shadow-sm p-5 mb-4">
          <h3 className="text-xs font-bold text-carbon-800 flex items-center gap-2 mb-4">
            <Calendar size={16} className="text-forest-600" /> NDVI Trend (12 months)
          </h3>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={farm.ndviTrend} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="month" tickLine={false} axisLine={false} stroke="#94A3B8" style={{ fontSize: '9px' }} />
                <YAxis domain={[0.2, 0.9]} tickLine={false} axisLine={false} stroke="#94A3B8" style={{ fontSize: '9px' }} />
                <Tooltip contentStyle={{ backgroundColor: '#1E3127', border: 'none', borderRadius: '12px', color: '#FAF6F0', fontSize: '11px' }} />
                <ReferenceLine y={0.5} stroke="#E29B63" strokeDasharray="5 5" label={{ value: 'Moderate', position: 'right', style: { fontSize: '9px', fill: '#E29B63' } }} />
                <Line type="monotone" dataKey="historical" stroke="#2C5E43" strokeWidth={2} dot={{ r: 3, fill: '#2C5E43' }} connectNulls />
                <Line type="monotone" dataKey="forecast" stroke="#81C784" strokeWidth={2} strokeDasharray="5 5" dot={{ r: 2, fill: '#81C784' }} connectNulls />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="flex gap-4 mt-3 text-[10px]">
            <span className="flex items-center gap-1.5 text-carbon-600"><div className="w-3 h-0.5 bg-forest-700" /> Historical</span>
            <span className="flex items-center gap-1.5 text-carbon-600"><div className="w-3 h-0.5 bg-earth-light border-dashed" /> Forecast</span>
          </div>
        </div>
      )}

      {farm.scans && farm.scans.length > 0 && (
        <div className="bg-white rounded-2xl border border-forest-100 shadow-sm p-5">
          <h3 className="text-xs font-bold text-carbon-800 mb-3">Scan History</h3>
          {farm.scans.map((s) => (
            <div key={s.id} className="flex justify-between items-center text-xs py-2 border-b border-forest-50 last:border-0">
              <div>
                <p className="font-bold text-carbon-800">{s.source}</p>
                <p className="text-[10px] text-carbon-400">{s.time}</p>
              </div>
              <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold ${s.type === 'success' ? 'bg-forest-50 text-forest-700' : 'bg-amber-50 text-amber-700'}`}>{s.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
