import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import GEEMap from '../components/GEEMap';
import { ArrowLeft, ArrowRight, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { analyzeFarm, saveFarm } from '../services/api';

export default function FarmMapRegistration() {
  const navigate = useNavigate();
  const { user, addFarm, refreshUser, token } = useAuth();
  const [drawnGeojson, setDrawnGeojson] = useState(null);
  const [mapStats, setMapStats] = useState({ area: 0, score: 0, ndvi: 0 });
  const [analyzing, setAnalyzing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [analysisError, setAnalysisError] = useState('');

  const handleAreaCalculated = (stats) => setMapStats(stats);
  const handleGeojsonDrawn = (geojson) => {
    setDrawnGeojson(geojson);
    setAnalysisResult(null);
    setAnalysisError('');
  };

  const handleAnalyze = async () => {
    if (!drawnGeojson) { setAnalysisError('Draw your farm boundary first.'); return; }
    setAnalyzing(true);
    setAnalysisError('');
    try {
      const res = await analyzeFarm(drawnGeojson, 'My Farm', 'Mixed Crop', 'Drip');
      if (res.success) {
        setAnalysisResult(res);
        localStorage.setItem('carbonx_last_analysis', JSON.stringify(res));
        localStorage.setItem('carbonx_last_geojson', JSON.stringify(drawnGeojson));
      } else {
        setAnalysisError(res.message || 'Analysis failed. Ensure backend is running.');
      }
    } catch {
      setAnalysisError('Could not reach backend. Ensure it is running on localhost:8000.');
    }
    setAnalyzing(false);
  };

  const handleSaveAndContinue = async () => {
    if (!analysisResult) return;
    setSaving(true);
    try {
      const res = await saveFarm({ ...analysisResult, geojson: drawnGeojson });
      if (res.success) {
        addFarm(res.farm);
        await refreshUser();
        navigate('/farm-details');
      } else {
        navigate('/farm-details');
      }
    } catch {
      navigate('/farm-details');
    }
    setSaving(false);
  };

  return (
    <div className="pb-24 px-4 pt-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-5">
        <button onClick={() => navigate('/dashboard')} className="p-2 rounded-xl bg-white border border-forest-100 text-carbon-600 hover:text-forest-800">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-lg font-bold text-carbon-900">Map Your Farm</h1>
          <p className="text-[11px]text-carbon-500">Draw boundaries on the satellite map</p>
        </div>
      </div>

      {analysisError && (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-3 mb-4 text-xs text-rose-700 flex items-center gap-2">
          <AlertCircle size={16} /> {analysisError}
        </div>
      )}

      <div className="bg-white rounded-2xl border border-forest-100 shadow-sm overflow-hidden mb-4">
        <GEEMap onGeojsonDrawn={handleGeojsonDrawn} onAreaCalculated={handleAreaCalculated} />
      </div>

      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="bg-white border border-forest-100 rounded-2xl p-3 text-center shadow-sm">
          <p className="text-[9px] uppercase text-carbon-400 font-bold">Area</p>
          <p className="text-lg font-black text-carbon-900">{mapStats.area.toFixed(2)}</p>
          <p className="text-[9px] text-carbon-500">hectares</p>
        </div>
        <div className="bg-white border border-forest-100 rounded-2xl p-3 text-center shadow-sm">
          <p className="text-[9px] uppercase text-carbon-400 font-bold">NDVI</p>
          <p className="text-lg font-black text-forest-700">{mapStats.ndvi.toFixed(2)}</p>
          <p className="text-[9px] text-carbon-500">index</p>
        </div>
        <div className="bg-white border border-forest-100 rounded-2xl p-3 text-center shadow-sm">
          <p className="text-[9px] uppercase text-carbon-400 font-bold">Bio Score</p>
          <p className="text-lg font-black text-amber-700">{Math.round(mapStats.score)}</p>
          <p className="text-[9px] text-carbon-500">/100</p>
        </div>
      </div>

      {analysisResult && (
        <div className="bg-forest-50 border border-forest-200 rounded-2xl p-5 mb-4">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle2 size={18} className="text-forest-600" />
            <h3 className="text-sm font-bold text-forest-900">Satellite Analysis Complete</h3>
          </div>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div><p className="text-[9px] uppercase text-carbon-400 font-bold">Carbon Tonnes</p><p className="font-bold text-carbon-800 mt-0.5">{analysisResult.carbon_tonnes} t CO2e</p></div>
            <div><p className="text-[9px] uppercase text-carbon-400 font-bold">Biodiversity</p><p className="font-bold text-carbon-800 mt-0.5">{analysisResult.biodiversity_score}/100</p></div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <button onClick={handleAnalyze} disabled={!drawnGeojson || analyzing}
          className="py-3.5 bg-forest-800 text-white rounded-2xl text-xs font-bold hover:bg-forest-900 transition-colors disabled:opacity-40 flex items-center justify-center gap-2">
          {analyzing ? <><Loader2 size={16} className="animate-spin" /> Analyzing...</> : <><CheckCircle2 size={16} /> Analyze with Satellite</>}
        </button>
        <button onClick={handleSaveAndContinue} disabled={!analysisResult || saving}
          className="py-3.5 bg-white border border-forest-200 text-carbon-800 rounded-2xl text-xs font-bold hover:bg-forest-50 transition-colors disabled:opacity-40 flex items-center justify-center gap-2">
          {saving ? <Loader2 size={16} className="animate-spin" /> : <><span>Continue</span><ArrowRight size={14} /></>}
        </button>
      </div>
    </div>
  );
}
