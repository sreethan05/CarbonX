import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, ClipboardCheck, TreePine, Loader2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { updateProfile } from '../services/api';

export default function FarmDetailsForm() {
  const navigate = useNavigate();
  const { t, currentLang } = useLanguage();
  const { user, token, setUserProfile, farms } = useAuth();
  const latestFarm = farms[0];

  const [crop, setCrop] = useState(latestFarm?.crop_type || 'Mixed Crop');
  const [irrigation, setIrrigation] = useState(latestFarm?.irrigation || 'Drip Irrigation');
  const [soil, setSoil] = useState('Red Sandy Loam');
  const [organic, setOrganic] = useState('Yes - Zero Chemical');
  const [treeCount, setTreeCount] = useState(1240);
  const [waterSource, setWaterSource] = useState('Borewell + Rainwater harvesting');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      navigate('/farmer-login');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await updateProfile({
        preferred_language: currentLang,
      });
      if (res.success && res.user) {
        setUserProfile(res.user);
      }
      localStorage.setItem('carbonx_farm_details', JSON.stringify({
        crop, irrigation, soil, organic, treeCount, waterSource,
      }));
      navigate('/satellite-preview');
    } catch {
      setError(t('serverError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-warm-white flex flex-col justify-between font-inter text-carbon-800">
      <header className="py-4 px-6 bg-white/50 backdrop-blur flex items-center gap-3 border-b border-forest-100/50">
        <button type="button" onClick={() => navigate('/farm-map')} className="p-2 hover:bg-forest-50 rounded-xl text-carbon-600 transition-colors">
          <ArrowLeft size={18} />
        </button>
        <span className="font-manrope font-bold text-sm text-carbon-800">{t('farmDetailsTitle')}</span>
      </header>

      <main className="flex-1 max-w-md mx-auto w-full px-4 py-8 flex flex-col justify-center">
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-2xl px-4 py-2 text-xs text-red-700 text-center">{error}</div>
        )}
        <div className="bg-white border border-forest-100 rounded-[32px] p-6 shadow-card space-y-6">
          <div className="flex gap-3 items-center">
            <div className="p-3 bg-forest-50 text-forest-800 rounded-2xl">
              <ClipboardCheck size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold font-poppins text-carbon-900 leading-tight">{t('farmDetailsTitle')}</h2>
              <p className="text-[10px] text-carbon-400">{t('farmDetailsDesc')}</p>
              {user?.name && <p className="text-[10px] text-forest-700 mt-1">{user.name} · +91 {user.phone}</p>}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-carbon-500 uppercase tracking-wide">{t('cropType')}</label>
              <select value={crop} onChange={(e) => setCrop(e.target.value)}
                className="w-full bg-warm-white border border-forest-100 rounded-2xl p-3 text-xs font-semibold focus:ring-0 focus:border-forest-400">
                <option>Andhra Paddy</option>
                <option>Cotton & Legumes</option>
                <option>Teak & Mixed Forestry</option>
                <option>Millets (Organic)</option>
                <option>Mixed Crop</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-carbon-500 uppercase tracking-wide">{t('irrigationType')}</label>
                <select value={irrigation} onChange={(e) => setIrrigation(e.target.value)}
                  className="w-full bg-warm-white border border-forest-100 rounded-2xl p-3 text-xs font-semibold focus:ring-0 focus:border-forest-400">
                  <option>Drip Irrigation</option>
                  <option>Sprinkler</option>
                  <option>Rainfed / Natural</option>
                  <option>Flood Canal</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-carbon-500 uppercase tracking-wide">{t('soilType')}</label>
                <input type="text" value={soil} onChange={(e) => setSoil(e.target.value)}
                  className="w-full bg-warm-white border border-forest-100 rounded-2xl p-3 text-xs font-semibold focus:ring-0 focus:border-forest-400" required />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-carbon-500 uppercase tracking-wide">Organic practices</label>
              <select value={organic} onChange={(e) => setOrganic(e.target.value)}
                className="w-full bg-warm-white border border-forest-100 rounded-2xl p-3 text-xs font-semibold focus:ring-0 focus:border-forest-400">
                <option>Yes - Zero Chemical</option>
                <option>Partial - Low Chemical</option>
                <option>No - Standard Cultivation</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-carbon-500 uppercase tracking-wide">Trees on plot</label>
              <div className="relative">
                <input type="number" value={treeCount} onChange={(e) => setTreeCount(parseInt(e.target.value, 10) || 0)}
                  className="w-full bg-warm-white border border-forest-100 rounded-2xl p-3 text-xs font-semibold pr-10 focus:ring-0 focus:border-forest-400" required />
                <TreePine size={18} className="absolute right-3 top-3 text-forest-600" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-carbon-500 uppercase tracking-wide">Water sources</label>
              <input type="text" value={waterSource} onChange={(e) => setWaterSource(e.target.value)}
                className="w-full bg-warm-white border border-forest-100 rounded-2xl p-3 text-xs font-semibold focus:ring-0 focus:border-forest-400" required />
            </div>

            <button type="submit" disabled={loading}
              className="w-full bg-forest-800 hover:bg-forest-900 text-white text-xs font-bold font-poppins py-4 rounded-2xl shadow-lg transition-all duration-200 flex items-center justify-center gap-1.5 disabled:opacity-60">
              {loading ? <Loader2 size={14} className="animate-spin" /> : <>{t('saveContinue')} <ArrowRight size={14} /></>}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
