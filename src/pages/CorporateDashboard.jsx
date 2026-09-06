import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Globe, CheckCircle, Download, TrendingUp, ChevronRight, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getMarketplaceListings, combinedCredits } from '../services/api';

const DEFAULTS = {
  companyName: 'Corporate Buyer', esgTarget: 1000, purchasedCredits: 0,
  complianceScore: 0, activeBids: 0, portfolio: [], offsetsTimeline: [],
};

export default function CorporateDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [corp, setCorp] = useState(DEFAULTS);
  const [downloading, setDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  useEffect(() => {
    getMarketplaceListings().then(res => {
      if (!res.success) return;
      const listings = res.listings || [];
      let purchased = 0;
      const portfolio = listings.map(l => {
        const c = combinedCredits({ carbon_tonnes: l.carbon_credits, biodiversity_credits: l.biodiversity_credits, total_credits: l.total_credits });
        purchased += c.total;
        return { id: l.id, farm: l.crop || 'Carbon Credits', state: l.location || '', size: `${c.total} tCO2e`,
          status: l.status || 'Active', purchased: c.total, price: `₹${l.price_per_credit || 520}/cr` };
      });
      setCorp({ ...DEFAULTS, companyName: user?.name || 'Corporate Buyer', purchasedCredits: Math.round(purchased),
        complianceScore: listings.length ? 92 : 0, activeBids: listings.filter(l => l.status === 'Active').length,
        portfolio, offsetsTimeline: portfolio.slice(0, 6).map((p, i) => ({ year: `Q${(i % 4) + 1}`, offset: p.purchased, target: Math.max(p.purchased * 0.8, 1) })) });
    }).catch(() => {});
  }, [user]);

  const handleDownload = () => {
    setDownloading(true);
    setTimeout(() => { setDownloading(false); setDownloadSuccess(true); setTimeout(() => setDownloadSuccess(false), 3000); }, 2000);
  };

  return (
    <div className="pb-24 px-4 pt-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-5 bg-white p-4 rounded-2xl border border-forest-100 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 bg-forest-700 text-white rounded-xl flex items-center justify-center font-bold">B</div>
          <div>
            <p className="text-xs text-carbon-500">Corporate Buyer Account</p>
            <h2 className="text-sm font-black text-carbon-900">{corp.companyName}</h2>
          </div>
        </div>
        <span className="text-[10px] bg-forest-50 text-forest-700 border border-forest-100 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">ESG</span>
      </div>

      <div className="bg-white rounded-2xl p-5 border border-forest-100 shadow-sm mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <span className="text-[10px] text-carbon-500 font-bold uppercase tracking-wider">ESG Offset Progress</span>
            <h3 className="text-2xl font-black text-carbon-900 mt-1">{corp.purchasedCredits.toLocaleString()} <span className="text-xs font-normal text-carbon-400">tCO2e</span></h3>
            <p className="text-[10px] text-forest-700 font-medium mt-1">{Math.min((corp.purchasedCredits / corp.esgTarget) * 100, 100).toFixed(1)}% of target ({corp.esgTarget.toLocaleString()} tCO2e)</p>
          </div>
          <div className="p-2.5 bg-forest-50 text-forest-700 rounded-xl"><Globe className="w-5 h-5" /></div>
        </div>
        <div className="w-full bg-forest-50 h-3.5 rounded-full overflow-hidden mb-5">
          <div className="h-full bg-gradient-to-r from-forest-600 to-forest-800 rounded-full transition-all duration-1000"
            style={{ width: `${Math.min((corp.purchasedCredits / corp.esgTarget) * 100, 100)}%` }} />
        </div>
        <div className="grid grid-cols-2 gap-4 text-xs border-t border-forest-50 pt-4">
          <div><p className="text-[9px] uppercase tracking-wider text-carbon-400">Compliance Score</p><p className="text-sm font-black text-carbon-900 mt-0.5">{corp.complianceScore}</p></div>
          <div><p className="text-[9px] uppercase tracking-wider text-carbon-400">Active Listings</p><p className="text-sm font-black text-forest-700 mt-0.5">{corp.activeBids}</p></div>
        </div>
      </div>

      {corp.offsetsTimeline.length > 0 && (
        <div className="bg-white rounded-2xl p-5 border border-forest-100 shadow-sm mb-6">
          <h4 className="text-xs font-bold text-carbon-800 flex items-center gap-1 mb-4"><TrendingUp className="w-4 h-4 text-forest-700" /> ESG Decarbonization Timeline</h4>
          <div className="h-44 w-full text-[10px] font-mono">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={corp.offsetsTimeline} margin={{ top: 5, right: 0, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="year" tickLine={false} axisLine={false} stroke="#94A3B8" />
                <YAxis tickLine={false} axisLine={false} stroke="#94A3B8" />
                <Tooltip contentStyle={{ backgroundColor: '#1E3127', border: 'none', borderRadius: '12px', color: '#FAF6F0', fontSize: '11px' }} />
                <Legend verticalAlign="top" height={24} iconType="circle" wrapperStyle={{ fontSize: '9px' }} />
                <Bar name="Offset" dataKey="offset" fill="#2C5E43" radius={[4, 4, 0, 0]} />
                <Bar name="Target" dataKey="target" fill="#E29B63" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <div className="bg-forest-900 text-white rounded-2xl p-5 border border-forest-800 mb-6">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-white/5 border border-white/10 rounded-xl text-forest-300"><FileText className="w-5 h-5" /></div>
          <div className="flex-1">
            <span className="text-[10px] text-forest-300 font-bold uppercase tracking-wider">ESG Report</span>
            <h4 className="text-sm font-bold text-white mt-0.5">Generate BRSR Audit Report</h4>
            <p className="text-[11px] text-white/60 mt-1.5 leading-relaxed">Compile audited BRSR metadata mapped with satellite land polygons.</p>
            {downloadSuccess ? (
              <div className="mt-4 p-2 bg-forest-700 border border-forest-600 text-forest-300 rounded-xl text-center text-xs font-bold flex items-center justify-center gap-1.5">
                <CheckCircle className="w-4 h-4" /><span>Report compiled!</span>
              </div>
            ) : (
              <button onClick={handleDownload} disabled={downloading}
                className="mt-4 py-2.5 px-4 rounded-xl bg-forest-500 hover:bg-forest-400 text-white font-bold text-xs flex items-center gap-2 transition-all disabled:opacity-60">
                {downloading ? <><span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" /><span>Generating...</span></>
                : <><span>Generate PDF</span><Download className="w-3.5 h-3.5" /></>}
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mb-4 px-1">
        <h4 className="text-xs font-bold text-carbon-600 uppercase tracking-wider">Available Listings ({corp.portfolio.length})</h4>
        <button onClick={() => navigate('/marketplace')} className="text-xs text-forest-700 font-bold flex items-center gap-0.5 hover:underline">
          <span>Browse All</span><ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
      <div className="space-y-4">
        {corp.portfolio.length === 0 ? (
          <div className="bg-white border border-dashed border-forest-200 rounded-2xl p-6 text-center text-xs text-carbon-400">No listings available. Check the marketplace.</div>
        ) : corp.portfolio.map(p => (
          <div key={p.id} className="bg-white rounded-2xl p-4 border border-forest-100 shadow-sm">
            <div className="flex justify-between items-start">
              <div><h5 className="text-xs font-black text-carbon-900">{p.farm}</h5><p className="text-[9px] text-carbon-400 mt-0.5">{p.state} · {p.size}</p></div>
              <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${p.status === 'Verified' ? 'bg-forest-50 text-forest-700' : 'bg-orange-50 text-orange-600'}`}>{p.status}</span>
            </div>
            <div className="grid grid-cols-2 gap-2 border-t border-forest-50 pt-3 text-[10px] mt-3">
              <div><p className="text-[8px] uppercase tracking-wider text-carbon-400 font-bold">Credits</p><p className="font-bold text-carbon-800 mt-0.5">{p.purchased}</p></div>
              <div><p className="text-[8px] uppercase tracking-wider text-carbon-400 font-bold">Price</p><p className="font-bold text-carbon-800 mt-0.5">{p.price}</p></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
