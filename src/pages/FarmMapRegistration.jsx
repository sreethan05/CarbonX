import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import GEEMap from '../components/GEEMap';
import { Compass, ArrowRight, ArrowLeft, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { analyzeFarm, saveFarm } from '../services/api';

export default function FarmMapRegistration() {
  const navigate = useNavigate();
  const { t } = useLanguage();
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
    if (!drawnGeojson) {
      setAnalysisError(t('drawFirst'));
      return;
    }
    setAnalyzing(true);
    setAnalysisError('');
    try {
      const res = await analyzeFarm(drawnGeojson, 'My Farm', 'Mixed Crop', 'Drip');
      if (res.success) {
        setAnalysisResult(res);
        localStorage.setItem('carbonx_last_analysis', JSON.stringify(res));
        localStorage.setItem('carbonx_last_geojson', JSON.stringify(drawnGeojson));
      } else {
        setAnalysisError(res.message || t('serverError'));
      }
    } catch {
      setAnalysisError(t('backendDown'));
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSavePlot = async () => {
    if (!drawnGeojson) {
      setAnalysisError(t('drawFirst'));
      return;
    }
    if (!token) {
      setAnalysisError(t('loginRequired'));
      return;
    }

    setSaving(true);
    setAnalysisError('');
    try {
      let result = analysisResult;
      if (!result) {
        setAnalyzing(true);
        const analyzeRes = await analyzeFarm(drawnGeojson, 'My Farm', 'Mixed Crop', 'Drip');
        setAnalyzing(false);
        if (!analyzeRes.success) {
          setAnalysisError(analyzeRes.message || t('serverError'));
          return;
        }
        result = analyzeRes;
        setAnalysisResult(analyzeRes);
        localStorage.setItem('carbonx_last_analysis', JSON.stringify(analyzeRes));
        localStorage.setItem('carbonx_last_geojson', JSON.stringify(drawnGeojson));
      }

      const farm = {
        name: 'My Farm',
        crop_type: 'Mixed Crop',
        irrigation: 'Drip',
        geojson: drawnGeojson,
        area_hectares: result.area_hectares,
        ndvi: result.ndvi,
        evi: result.evi,
        carbon_tonnes: result.carbon_tonnes,
        carbon_credits: result.carbon_credits,
        biodiversity_credits: result.biodiversity_credits,
        total_credits: result.total_credits,
        tree_cover: result.tree_cover,
        soil_moisture: result.soil_moisture,
        vegetation_health: result.vegetation_health,
        biodiversity_score: result.biodiversity_score,
        ai_confidence: result.ai_confidence,
        satellite_source: result.satellite_source,
        status: 'Verified',
      };

      const res = await saveFarm(farm);
      if (!res.success) {
        setAnalysisError(res.message || t('serverError'));
        return;
      }
      if (res.farm) addFarm({ ...res.farm, id: res.farm.id });
      await refreshUser();
      navigate('/farm-details');
    } catch {
      setAnalysisError(t('backendDown'));
    } finally {
      setAnalyzing(false);
      setSaving(false);
    }
  };

  const mapDesc = drawnGeojson && mapStats.area
    ? `${t('boundaryClosed')}${mapStats.area} ha`
    : t('geeMapDesc');

  return (
    <div className="min-h-screen bg-warm-white flex flex-col justify-between font-inter text-carbon-800 pb-24">
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-forest-100/50 py-3 px-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => navigate('/onboarding')} className="p-2 hover:bg-forest-50 rounded-xl text-carbon-600 transition-colors">
            <ArrowLeft size={18} />
          </button>
          <span className="font-manrope font-extrabold text-xl text-forest-800 tracking-tight">🌱 CarbonX</span>
        </div>
        <div className="flex items-center gap-2.5">
          <span className="inline-flex items-center gap-1 bg-emerald-100 border border-emerald-200/50 px-3 py-1.5 rounded-full text-xs font-bold text-emerald-800">
            <span className="w-1.5 h-1.5 bg-profit rounded-full animate-ping" />
            {t('liveGps')}
          </span>
          {user && (
            <div className="w-9 h-9 rounded-full overflow-hidden border border-forest-200/80 shadow-sm bg-forest-100 flex items-center justify-center text-forest-800 font-bold text-sm">
              {user.name?.[0] || '?'}
            </div>
          )}
        </div>
      </header>

      <main className="flex-1 p-4 max-w-4xl mx-auto w-full space-y-4">
        <div className="bg-white border border-forest-100/60 p-4 rounded-2xl flex justify-between items-center gap-4 shadow-sm">
          <div>
            <h2 className="text-xs font-bold text-carbon-800">{t('geeMapTitle')}</h2>
            <p className="text-[10px] text-carbon-400 mt-0.5">{mapDesc}</p>
          </div>
          <div className="flex items-center gap-2">
            {drawnGeojson && !analysisResult && (
              <button type="button" onClick={handleAnalyze} disabled={analyzing}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition-all">
                {analyzing ? <><Loader2 size={13} className="animate-spin" /> {t('scanning')}</> : <>🛰️ {t('scanAi')}</>}
              </button>
            )}
            <button type="button" onClick={handleSavePlot} disabled={saving || analyzing || !drawnGeojson}
              className="bg-forest-800 hover:bg-forest-900 disabled:opacity-50 text-white text-xs font-bold font-poppins px-5 py-3 rounded-xl shadow-md flex items-center gap-1.5 transition-all">
              {saving || analyzing ? <><Loader2 size={14} className="animate-spin" /> {t('saving')}</> : <>{t('savePlot')} <ArrowRight size={14} /></>}
            </button>
          </div>
        </div>

        {analysisError && (
          <div className="bg-red-50 border border-red-200 rounded-2xl px-4 py-3 text-xs text-red-700 flex items-center gap-2">
            <AlertCircle size={14} /> {analysisError}
          </div>
        )}

        {analysisResult && (
          <div className="bg-white border border-emerald-200 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle2 size={16} className="text-emerald-600" />
              <span className="text-xs font-bold text-emerald-800">{t('analysisComplete')}</span>
              <span className="text-[10px] bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full text-emerald-700 font-mono">
                {analysisResult.satellite_source}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-3 text-center text-[10px]">
              <StatBox label="NDVI" value={analysisResult.ndvi} sub={analysisResult.vegetation_health} color="emerald" />
              <StatBox label={t('areaLabel')} value={`${analysisResult.area_hectares} ha`} sub={t('mapped')} color="sky" />
              <StatBox label={t('carbonLabel')} value={`${analysisResult.carbon_credits ?? analysisResult.carbon_tonnes}t`} sub={t('credits')} color="amber" />
              <StatBox label={t('combinedLabel')} value={`${analysisResult.total_credits ?? analysisResult.carbon_tonnes}t`} sub={t('totalCredits')} color="indigo" />
              <StatBox label={t('bioLabel')} value={`${analysisResult.biodiversity_score}/100`} sub={t('score')} color="purple" />
              <StatBox label={t('canopy')} value={`${analysisResult.tree_cover}%`} sub={t('canopy')} color="forest" />
            </div>
          </div>
        )}

        <GEEMap onAreaCalculated={handleAreaCalculated} onGeojsonDrawn={handleGeojsonDrawn} />
      </main>

      <nav className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-xl border-t border-forest-100/50 py-2.5 px-4 flex justify-around items-center shadow-lg">
        <NavBtn icon="🏡" label={t('home')} onClick={() => navigate('/farmer-dashboard')} />
        <NavBtn icon={<Compass size={20} className="text-[#E06651]" />} label={t('farm')} active onClick={() => navigate('/farm-map')} />
        <NavBtn icon="🛍️" label={t('market')} onClick={() => navigate('/marketplace')} />
        <NavBtn icon="💰" label={t('wallet')} onClick={() => navigate('/wallet')} />
        <NavBtn icon="👤" label={t('support')} onClick={() => navigate('/support')} />
      </nav>
    </div>
  );
}

const STAT_COLORS = {
  emerald: ["bg-emerald-50", "text-emerald-800", "text-emerald-600"],
  sky: ["bg-sky-50", "text-sky-800", "text-sky-600"],
  amber: ["bg-amber-50", "text-amber-800", "text-amber-600"],
  indigo: ["bg-indigo-50", "text-indigo-800", "text-indigo-600"],
  purple: ["bg-purple-50", "text-purple-800", "text-purple-600"],
  forest: ["bg-forest-50", "text-forest-800", "text-forest-600"],
};
function StatBox({ label, value, sub, color = "emerald" }) {
  const [bg, val, subc] = STAT_COLORS[color] || STAT_COLORS.emerald;
  return (
    <div className={`${bg} rounded-xl p-2.5`}>
      <p className="text-[9px] text-carbon-400 uppercase font-bold">{label}</p>
      <p className={`text-sm font-black ${val}`}>{value}</p>
      <p className={`${subc} font-semibold`}>{sub}</p>
    </div>
  );
}

function NavBtn({ icon, label, onClick, active }) {
  return (
    <button type="button" onClick={onClick} className="flex flex-col items-center justify-center gap-1 flex-1">
      <div className={`px-5 py-1.5 ${active ? 'bg-[#FFEBE7] rounded-full shadow-sm' : ''} text-carbon-400 flex items-center justify-center`}>
        {typeof icon === 'string' ? icon : icon}
      </div>
      <span className={`text-[10px] font-poppins mt-0.5 ${active ? 'font-bold text-carbon-800' : 'font-medium text-carbon-400'}`}>{label}</span>
    </button>
  );
}
