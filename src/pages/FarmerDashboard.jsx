import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Leaf, PlusCircle, ArrowUpRight, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { combinedCredits } from '../services/api';

export default function FarmerDashboard() {
  const navigate = useNavigate();
  const { t, changeLanguage, currentLang } = useLanguage();
  const { user, farms, logout } = useAuth();

  const displayName = user?.name || t('farmerRole');
  const displayVillage = [user?.village, user?.district].filter(Boolean).join(', ') || t('village');

  let totalCarbon = 0;
  let totalBio = 0;
  let totalCombined = 0;
  let totalArea = 0;

  farms.forEach((f) => {
    const c = combinedCredits(f);
    totalCarbon += c.carbon;
    totalBio += c.biodiversity;
    totalCombined += c.total;
    totalArea += parseFloat(f.area_hectares) || 0;
  });

  return (
    <div className="pb-24 px-4 pt-4 max-w-md mx-auto bg-warm-white min-h-screen text-carbon-800">
      <header className="bg-white rounded-2xl border border-forest-100 p-4 mb-4 shadow-sm flex justify-between items-start">
        <div>
          <p className="text-xs text-carbon-500">{t('dashGreeting')} 🙏</p>
          <h1 className="text-lg font-bold text-carbon-900">{displayName}</h1>
          <p className="text-[10px] text-carbon-500 flex items-center gap-1 mt-1">
            <MapPin size={10} /> {displayVillage}
          </p>
          {user?.phone && <p className="text-[10px] font-mono text-carbon-400 mt-1">+91 {user.phone}</p>}
        </div>
        <div className="flex flex-col items-end gap-2">
          <select value={currentLang} onChange={(e) => changeLanguage(e.target.value)}
            className="text-[10px] border border-forest-100 rounded-lg px-2 py-1 bg-warm-white">
            <option value="en">English</option>
            <option value="hi">हिन्दी</option>
            <option value="te">తెలుగు</option>
          </select>
          <button type="button" onClick={logout} className="text-[10px] text-red-500 flex items-center gap-1">
            <LogOut size={12} /> {t('logout')}
          </button>
        </div>
      </header>

      <section className="grid grid-cols-3 gap-2 mb-4 text-center">
        <div className="bg-white border border-forest-100 rounded-2xl p-3 shadow-sm">
          <p className="text-[9px] text-carbon-400 uppercase font-bold">{t('carbonLabel')}</p>
          <p className="text-lg font-black text-amber-800">{totalCarbon.toFixed(1)}</p>
          <p className="text-[9px] text-carbon-500">tCO2e</p>
        </div>
        <div className="bg-white border border-forest-100 rounded-2xl p-3 shadow-sm">
          <p className="text-[9px] text-carbon-400 uppercase font-bold">{t('bioLabel')}</p>
          <p className="text-lg font-black text-purple-800">{totalBio.toFixed(1)}</p>
          <p className="text-[9px] text-carbon-500">{t('credits')}</p>
        </div>
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3 shadow-sm">
          <p className="text-[9px] text-emerald-700 uppercase font-bold">{t('combinedLabel')}</p>
          <p className="text-lg font-black text-emerald-900">{totalCombined.toFixed(1)}</p>
          <p className="text-[9px] text-emerald-600">{t('totalCredits')}</p>
        </div>
      </section>

      <p className="text-[10px] text-carbon-500 mb-2">
        {farms.length} {t('farmsMapped')} · {totalArea.toFixed(2)} ha
      </p>

      {farms.length === 0 ? (
        <div className="bg-white border border-dashed border-forest-200 rounded-2xl p-6 text-center text-sm text-carbon-500 mb-4">
          {t('noFarmsYet')}
        </div>
      ) : (
        <ul className="space-y-2 mb-4">
          {farms.map((farm, i) => {
            const c = combinedCredits(farm);
            return (
              <li key={farm.id || i} className="bg-white border border-forest-100 rounded-xl px-3 py-2.5 flex justify-between items-center text-xs">
                <div>
                  <p className="font-bold">{farm.name || 'My Farm'}</p>
                  <p className="text-[10px] text-carbon-500">{farm.area_hectares} ha · NDVI {farm.ndvi}</p>
                </div>
                <div className="text-right">
                  <p className="font-black text-emerald-800">{c.total} t</p>
                  <p className="text-[9px] text-carbon-400">C {c.carbon} + B {c.biodiversity}</p>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <div className="grid grid-cols-2 gap-3">
        <button type="button" onClick={() => navigate('/farm-map')}
          className="flex flex-col items-start p-4 bg-forest-800 text-white rounded-2xl text-left">
          <PlusCircle className="w-5 h-5 mb-2" />
          <span className="text-xs font-bold">{t('mapFarmGee')}</span>
          <span className="text-[10px] opacity-80 mt-1">{t('mapFarmDesc')}</span>
        </button>
        <button type="button" onClick={() => navigate('/marketplace')}
          className="flex flex-col items-start p-4 bg-white border border-forest-100 rounded-2xl text-left shadow-sm">
          <ArrowUpRight className="w-5 h-5 mb-2 text-forest-800" />
          <span className="text-xs font-bold">{t('marketplaceTitle')}</span>
          <span className="text-[10px] text-carbon-500 mt-1">{t('marketplaceDesc')}</span>
        </button>
        <button type="button" onClick={() => navigate('/create-listing')}
          className="col-span-2 flex items-center justify-center gap-2 py-3 bg-emerald-600 text-white rounded-2xl text-xs font-bold">
          <Leaf size={14} /> {t('listOnChain')}
        </button>
      </div>
    </div>
  );
}
