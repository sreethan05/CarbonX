import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';
import { 
  Building, 
  Globe, 
  CheckCircle, 
  ShieldAlert, 
  Download, 
  Share2, 
  TrendingUp, 
  PlusCircle, 
  ChevronRight, 
  FileText, 
  PieChart, 
  Layers,
  ChevronLeft
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { getMarketplaceListings, combinedCredits } from '../services/api';

const corporateDefaults = {
  name: 'Corporate Buyer',
  companyName: 'Corporate Buyer',
  esgScore: 0,
  esgTarget: 1000,
  purchasedCredits: 0,
  creditsPurchased: 0,
  creditsRetired: 0,
  totalSpent: 0,
  complianceScore: 0,
  activeBids: 0,
  listings: [],
  portfolio: [],
  offsetsTimeline: [],
};

export default function CorporateDashboard() {
  const navigate = useNavigate();
  const [corporate, setCorporate] = useState(corporateDefaults);
  const [downloading, setDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  useEffect(() => {
    getMarketplaceListings()
      .then((res) => {
        if (!res.success) return;
        const listings = res.listings || [];
        let purchased = 0;
        const portfolio = listings.map((l) => {
          const c = combinedCredits({
            carbon_tonnes: l.carbon_credits,
            biodiversity_credits: l.biodiversity_credits,
            total_credits: l.total_credits,
          });
          purchased += c.total;
          return {
            id: l.id,
            farm: l.crop || 'Carbon Credits',
            state: l.location || '',
            size: `${c.total} tCO2e`,
            status: l.status || 'Active',
            purchased: c.total,
            standard: 'ISO 14064',
            price: `₹${l.price_per_credit || 520}/cr`,
          };
        });
        setCorporate({
          ...corporateDefaults,
          companyName: 'Corporate Buyer',
          purchasedCredits: Math.round(purchased),
          complianceScore: listings.length ? 92 : 0,
          activeBids: listings.filter((l) => l.status === 'Active').length,
          portfolio,
          offsetsTimeline: portfolio.slice(0, 6).map((p, i) => ({
            year: `Q${(i % 4) + 1}`,
            offset: p.purchased,
            target: Math.max(p.purchased * 0.8, 1),
          })),
        });
      })
      .catch(() => {});
  }, []);

  const handleDownloadReport = () => {
    setDownloading(true);
    setTimeout(() => {
      setDownloading(false);
      setDownloadSuccess(true);
      setTimeout(() => {
        setDownloadSuccess(false);
      }, 3000);
    }, 2000);
  };

  return (
    <div className="pb-24 px-4 pt-6 max-w-4xl mx-auto">
      {/* Corporate profile section */}
      <div className="flex items-center justify-between mb-5 bg-white p-4 rounded-2xl border border-forest-100 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 bg-forest-700 text-white rounded-xl flex items-center justify-center font-bold">
            B
          </div>
          <div>
            <p className="text-xs text-carbon-500">Corporate Buyer Account</p>
            <h2 className="text-sm font-black text-carbon-900">{corporate.companyName}</h2>
          </div>
        </div>
        <span className="text-[10px] bg-forest-50 text-forest-700 border border-forest-100 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
          ESG Premium
        </span>
      </div>

      {/* Main ESG Target Indicator Card */}
      <div className="bg-white rounded-2xl p-5 border border-forest-100 shadow-sm mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <span className="text-[10px] text-carbon-500 font-bold uppercase tracking-wider">ESG Offset Progress</span>
            <h3 className="text-2xl font-black text-carbon-900 mt-1">
              {corporate.purchasedCredits.toLocaleString()} <span className="text-xs font-normal text-carbon-400">tCO2e</span>
            </h3>
            <p className="text-[10px] text-forest-700 font-medium mt-1">
              {((corporate.purchasedCredits / corporate.esgTarget) * 100).toFixed(1)}% of annual target ({corporate.esgTarget.toLocaleString()} tCO2e)
            </p>
          </div>
          <div className="p-2.5 bg-forest-50 text-forest-700 rounded-xl">
            <Globe className="w-5 h-5" />
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-forest-50 h-3.5 rounded-full overflow-hidden mb-5">
          <div 
            className="h-full bg-gradient-to-r from-forest-600 to-forest-800 rounded-full transition-all duration-1000"
            style={{ width: `${Math.min((corporate.purchasedCredits / corporate.esgTarget) * 100, 100)}%` }}
          />
        </div>

        <div className="grid grid-cols-2 gap-4 text-xs border-t border-forest-50 pt-4">
          <div>
            <p className="text-[9px] uppercase tracking-wider text-carbon-400">Compliance Score</p>
            <p className="text-sm font-black text-carbon-900 mt-0.5">{corporate.complianceScore}</p>
          </div>
          <div>
            <p className="text-[9px] uppercase tracking-wider text-carbon-400">Active Listings</p>
            <p className="text-sm font-black text-forest-700 mt-0.5">{corporate.activeBids} available</p>
          </div>
        </div>
      </div>

      {/* Offsets Timeline Chart */}
      {corporate.offsetsTimeline.length > 0 && (
        <div className="bg-white rounded-2xl p-5 border border-forest-100 shadow-sm mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-xs font-bold text-carbon-800 flex items-center gap-1">
                <TrendingUp className="w-4 h-4 text-forest-700" />
                ESG Decarbonization Timeline
              </h4>
              <p className="text-[9px] text-carbon-400 mt-0.5">Annual offsets against ESG targets</p>
            </div>
          </div>

          <div className="h-44 w-full text-[10px] font-mono">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={corporate.offsetsTimeline}
                margin={{ top: 5, right: 0, left: -25, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="year" tickLine={false} axisLine={false} stroke="#94A3B8" />
                <YAxis tickLine={false} axisLine={false} stroke="#94A3B8" />
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
                <Legend verticalAlign="top" height={24} iconType="circle" wrapperStyle={{ fontSize: '9px', paddingBottom: '10px' }} />
                <Bar name="Offset tCO2e" dataKey="offset" fill="#2C5E43" radius={[4, 4, 0, 0]} />
                <Bar name="Target tCO2e" dataKey="target" fill="#E29B63" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Compliance Report Exporter */}
      <div className="bg-forest-900 text-white rounded-2xl p-5 border border-forest-800 mb-6">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-white/5 border border-white/10 rounded-xl text-emerald-400">
            <FileText className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">ESG Report Exporter</span>
            <h4 className="text-sm font-bold text-white mt-0.5">Generate BRSR Audit Report</h4>
            <p className="text-[11px] text-white/60 mt-1.5 leading-relaxed">
              Compile audited Business Responsibility and Sustainability Report metadata mapped with satellite land polygons.
            </p>

            {downloadSuccess ? (
              <div className="mt-4 p-2 bg-forest-700 border border-forest-600 text-emerald-400 rounded-xl text-center text-xs font-bold flex items-center justify-center gap-1.5">
                <CheckCircle className="w-4 h-4" />
                <span>Report compiled successfully!</span>
              </div>
            ) : (
              <button
                onClick={handleDownloadReport}
                disabled={downloading}
                className="mt-4 py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-xs flex items-center gap-2 transition-all disabled:opacity-60"
              >
                {downloading ? (
                  <>
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Generating PDF...</span>
                  </>
                ) : (
                  <>
                    <span>Generate BRSR PDF</span>
                    <Download className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Corporate offset portfolio */}
      <div className="flex items-center justify-between mb-4 px-1">
        <h4 className="text-xs font-bold text-carbon-600 uppercase tracking-wider">Available Listings ({corporate.portfolio.length})</h4>
        <button 
          onClick={() => navigate('/marketplace')}
          className="text-xs text-forest-700 font-bold flex items-center gap-0.5 hover:underline"
        >
          <span>Browse All</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="space-y-4">
        {corporate.portfolio.length === 0 ? (
          <div className="bg-white border border-dashed border-forest-200 rounded-2xl p-6 text-center text-xs text-carbon-400">
            No listings available yet. Check the marketplace for carbon credits.
          </div>
        ) : (
          corporate.portfolio.map((port) => (
            <div key={port.id} className="bg-white rounded-2xl p-4 border border-forest-100 shadow-sm">
              <div className="flex justify-between items-start">
                <div>
                  <h5 className="text-xs font-black text-carbon-900">{port.farm}</h5>
                  <p className="text-[9px] text-carbon-400 mt-0.5">{port.state} · {port.size}</p>
                </div>
                <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${
                  port.status === 'Verified'
                    ? 'bg-forest-50 text-forest-700'
                    : 'bg-orange-50 text-orange-600'
                }`}>
                  {port.status}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 border-t border-forest-50 pt-3 text-[10px] mt-3">
                <div>
                  <p className="text-[8px] uppercase tracking-wider text-carbon-400 font-bold">Credits</p>
                  <p className="font-bold text-carbon-800 mt-0.5">{port.purchased}</p>
                </div>
                <div>
                  <p className="text-[8px] uppercase tracking-wider text-carbon-400 font-bold">Standard</p>
                  <p className="font-bold text-forest-700 mt-0.5">{port.standard}</p>
                </div>
                <div>
                  <p className="text-[8px] uppercase tracking-wider text-carbon-400 font-bold">Price</p>
                  <p className="font-bold text-carbon-800 mt-0.5">{port.price}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
