import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { updateProfile } from '../services/api';

export default function FarmDetailsForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentLang } = useLanguage();
  const { token, setUserProfile, farms } = useAuth();
  const latestFarm = farms[0];

  const pahaniCrop = location.state?.cropType || '';
  const pahaniIrrigation = location.state?.irrigation || '';
  const hasPahaniPrefill = Boolean(pahaniCrop || pahaniIrrigation);
  const [crop, setCrop] = useState(pahaniCrop || latestFarm?.crop_type || 'Mixed Crop');
  const [irrigation, setIrrigation] = useState(pahaniIrrigation || latestFarm?.irrigation || 'Drip Irrigation');
  const [soil, setSoil] = useState('Red Sandy Loam');
  const [organic, setOrganic] = useState('Yes - Zero Chemical');
  const [treeCount, setTreeCount] = useState(1240);
  const [waterSource, setWaterSource] = useState('Borewell + Rainwater harvesting');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) { navigate('/farmer-login'); return; }
    setLoading(true);
    setError('');
    try {
      const res = await updateProfile({ preferred_language: currentLang });
      if (res.success && res.user) setUserProfile(res.user);
      localStorage.setItem('carbonx_farm_details', JSON.stringify({ crop, irrigation, soil, organic, treeCount, waterSource }));
      navigate('/satellite-preview');
    } catch {
      setError('Could not save. Check your connection.');
    }
    setLoading(false);
  };

  const crops = [...new Set([crop, 'Paddy (Rice)', 'Cotton', 'Maize', 'Groundnut', 'Teak', 'Mango', 'Mixed Crop'])];
  const irrigations = [...new Set([irrigation, 'Drip Irrigation', 'Flood Irrigation', 'Sprinkler', 'Rainfed'])];
  const soils = ['Red Sandy Loam', 'Black Cotton Soil', 'Alluvial', 'Laterite'];
  const organics = ['Yes - Zero Chemical', 'Partial Organic', 'Conventional'];

  const Select = ({ label, value, onChange, options }) => (
    <div>
      <label className="text-[10px] font-bold uppercase tracking-wider text-carbon-400 block mb-1.5">{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)}
        className="w-full p-3 bg-forest-50 border border-forest-100 rounded-xl text-sm font-semibold text-carbon-800 focus:outline-none focus:border-forest-600 focus:bg-white cursor-pointer">
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );

  return (
    <div className="pb-24 px-4 pt-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate('/farm-map')} className="p-2 rounded-xl bg-white border border-forest-100 text-carbon-600 hover:text-forest-800">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-lg font-bold text-carbon-900">Farm Details</h1>
          <p className="text-[11px] text-carbon-500">Tell us about your farming practices</p>
        </div>
      </div>

      {error && <div className="bg-rose-50 border border-rose-200 rounded-2xl p-3 mb-4 text-xs text-rose-700">{error}</div>}

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-forest-100 shadow-sm p-6 space-y-5">
        {hasPahaniPrefill && (
          <div className="bg-forest-50 border border-forest-200 rounded-xl px-3 py-2.5 text-xs font-semibold text-forest-800">
            Auto-filled from your Pahani — edit if needed.
          </div>
        )}
        <Select label="Crop Type" value={crop} onChange={setCrop} options={crops} />
        <Select label="Irrigation Method" value={irrigation} onChange={setIrrigation} options={irrigations} />
        <Select label="Soil Type" value={soil} onChange={setSoil} options={soils} />
        <Select label="Organic Practice" value={organic} onChange={setOrganic} options={organics} />

        <div>
          <label className="text-[10px] font-bold uppercase tracking-wider text-carbon-400 block mb-1.5">Tree Count (on farm)</label>
          <input type="number" min="0" value={treeCount} onChange={e => setTreeCount(parseInt(e.target.value) || 0)}
            className="w-full p-3 bg-forest-50 border border-forest-100 rounded-xl text-sm font-semibold text-carbon-800 focus:outline-none focus:border-forest-600 focus:bg-white" />
        </div>

        <div>
          <label className="text-[10px] font-bold uppercase tracking-wider text-carbon-400 block mb-1.5">Water Source</label>
          <input type="text" value={waterSource} onChange={e => setWaterSource(e.target.value)}
            className="w-full p-3 bg-forest-50 border border-forest-100 rounded-xl text-sm font-semibold text-carbon-800 focus:outline-none focus:border-forest-600 focus:bg-white" />
        </div>

        <button type="submit" disabled={loading}
          className="w-full py-3.5 bg-forest-800 text-white rounded-2xl text-sm font-bold hover:bg-forest-900 transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
          {loading ? <Loader2 size={16} className="animate-spin" /> : <><span>Continue to Satellite Scan</span><ArrowRight size={14} /></>}
        </button>
      </form>
    </div>
  );
}
