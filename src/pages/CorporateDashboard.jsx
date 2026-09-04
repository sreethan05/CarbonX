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
import { mockCorporate as corporateDefaults } from '../data/mockData';
import { getMarketplaceListings, combinedCredits } from '../services/api';

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
    <div className="pb-24 px-4 pt-4 max-w-md mx-auto bg-earth-cream min-h-screen text-earth-dark font-sans">
      
      {/* Top mockCorporate profile section */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-5 bg-white p-3 rounded-2xl border border-earth-green/10 shadow-sm"
      >
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 bg-earth-green text-earth-accent rounded-xl flex items-center justify-center font-bold">
            T
          </div>
          <div>
            <p className="text-xs text-earth-muted">ESG Corporate Account</p>
            <h2 className="text-sm font-black text-earth-dark">{corporate.companyName}</h2>
          </div>
        </div>
        <span className="text-[10px] bg-earth-green/10 text-earth-green border border-earth-green/15 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
          Compliance Premium
        </span>
      </motion.div>

      {/* Main ESG Target Indicator Card */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-3xl p-5 border border-earth-green/10 shadow-sm mb-6 relative overflow-hidden"
      >
        <div className="absolute right-0 top-0 w-24 h-24 bg-earth-accent/5 rounded-full blur-xl pointer-events-none" />

        <div className="flex justify-between items-start mb-4">
          <div>
            <span className="text-[10px] text-earth-muted font-bold uppercase tracking-wider">ESG Global Offset Progress</span>
            <h3 className="text-2xl font-black text-earth-dark mt-1">
              {corporate.purchasedCredits.toLocaleString()} <span className="text-xs font-normal text-earth-muted">tCO2e Offset</span>
            </h3>
            <p className="text-[10px] text-earth-green font-medium mt-1">
              {((corporate.purchasedCredits / corporate.esgTarget) * 100).toFixed(1)}% of annual target ({corporate.esgTarget.toLocaleString()} tCO2e)
            </p>
          </div>
          <div className="p-2.5 bg-earth-green/10 text-earth-green rounded-xl">
            <Globe className="w-5 h-5" />
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-earth-green/5 h-3.5 rounded-full overflow-hidden mb-5 border border-earth-green/10">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${(corporate.purchasedCredits / corporate.esgTarget) * 100}%` }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="h-full bg-gradient-to-r from-earth-green to-earth-accent rounded-full"
          />
        </div>

        <div className="grid grid-cols-2 gap-4 text-xs border-t border-earth-green/5 pt-4">
          <div>
            <p className="text-[9px] uppercase tracking-wider text-earth-muted">Compliance Score</p>
            <p className="text-sm font-black text-earth-dark mt-0.5">{corporate.complianceScore}</p>
          </div>
          <div>
            <p className="text-[9px] uppercase tracking-wider text-earth-muted">Active Escrow Bids</p>
            <p className="text-sm font-black text-earth-accent mt-0.5">{corporate.activeBids} lot auctions</p>
          </div>
        </div>
      </motion.div>

      {/* Dynamic Projections Charts - Offsets Timeline */}
      <div className="bg-white rounded-3xl p-5 border border-earth-green/10 shadow-sm mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="text-xs font-bold text-earth-dark flex items-center gap-1">
              <TrendingUp className="w-4 h-4 text-earth-green animate-pulse" />
              Corporate ESG Decarbonization
            </h4>
            <p className="text-[9px] text-earth-muted mt-0.5">Annual offsets against ESG Targets</p>
          </div>
          <span className="text-[9px] bg-earth-green/10 text-earth-green px-2 py-0.5 rounded-full font-bold">
            UN NetZero V4
          </span>
        </div>

        {/* Recharts wrapper */}
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

      {/* Compliance Report Exporter Section */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="bg-earth-dark text-earth-cream rounded-3xl p-5 border border-earth-green/20 mb-6 relative overflow-hidden"
      >
        <div className="flex items-start gap-3">
          <div className="p-2 bg-white/5 border border-white/10 rounded-xl text-earth-accent">
            <FileText className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <span className="text-[10px] text-earth-accent font-bold uppercase tracking-wider">Corporate ESG Exporter</span>
            <h4 className="text-sm font-bold text-white mt-0.5">Generate Certified BRSR Audit</h4>
            <p className="text-[11px] text-earth-cream/70 mt-1.5 leading-relaxed">
              Instantly compile fully audited Business Responsibility and Sustainability Report (BRSR) metadata mapped with ISRO land polygons.
            </p>

            {downloadSuccess ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-4 p-2 bg-earth-green/20 border border-earth-green/30 text-earth-accent rounded-xl text-center text-xs font-bold flex items-center justify-center gap-1.5"
              >
                <CheckCircle className="w-4 h-4" />
                <span>BRSR Report Compiled & Sent to Email!</span>
              </motion.div>
            ) : (
              <button
                onClick={handleDownloadReport}
                disabled={downloading}
                className="mt-4 py-2.5 px-4 rounded-xl bg-earth-accent hover:bg-white text-earth-dark hover:scale-[1.02] active:scale-95 transition-all font-bold text-xs flex items-center gap-2"
              >
                {downloading ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-earth-dark" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Formatting BRSR PDF...</span>
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
      </motion.div>

      {/* Corporate offset portfolio */}
      <div className="flex items-center justify-between mb-4 px-1">
        <h4 className="text-xs font-bold text-earth-muted uppercase tracking-wider">Purchased Portfolio ({corporate.portfolio.length})</h4>
        <button 
          onClick={() => navigate('/marketplace')}
          className="text-xs text-earth-green font-bold flex items-center gap-0.5 hover:underline"
        >
          <span>Buy More</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="space-y-4">
        {corporate.portfolio.map((port) => (
          <div 
            key={port.id} 
            className="bg-white rounded-2xl p-4 border border-earth-green/10 shadow-sm flex flex-col gap-3.5"
          >
            <div className="flex justify-between items-start">
              <div>
                <h5 className="text-xs font-black text-earth-dark">{port.farm}</h5>
                <p className="text-[9px] text-earth-muted mt-0.5">{port.state} • {port.size}</p>
              </div>
              <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${
                port.status === 'Verified'
                  ? 'bg-earth-green/10 text-earth-green'
                  : 'bg-orange-500/10 text-orange-600 animate-pulse'
              }`}>
                {port.status}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 border-t border-earth-green/5 pt-3 text-[10px]">
              <div>
                <p className="text-[8px] uppercase tracking-wider text-earth-muted font-bold">Credits</p>
                <p className="font-bold text-earth-dark mt-0.5">{port.purchased}</p>
              </div>
              <div>
                <p className="text-[8px] uppercase tracking-wider text-earth-muted font-bold">Standard</p>
                <p className="font-bold text-earth-green mt-0.5">{port.standard}</p>
              </div>
              <div>
                <p className="text-[8px] uppercase tracking-wider text-earth-muted font-bold">Funding</p>
                <p className="font-bold text-earth-dark mt-0.5">{port.price}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Demo Quick Access: Admin Approvals Center */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-8 bg-gradient-to-r from-earth-accent/20 to-earth-green/20 border border-earth-accent/30 rounded-3xl p-5 shadow-sm space-y-3"
      >
        <div className="flex justify-between items-center">
          <div>
            <span className="text-[9px] text-earth-accent font-bold uppercase tracking-wider">Demo Sequence Bridge</span>
            <h4 className="text-xs font-bold text-earth-dark mt-0.5">Admin Approvals Center</h4>
            <p className="text-[10px] text-earth-muted mt-1 leading-relaxed">
              Verify transactions and review pending farmer audits as a platform admin.
            </p>
          </div>
          <button
            onClick={() => navigate('/admin-dashboard')}
            className="p-3 bg-earth-green hover:bg-earth-green/90 text-earth-accent rounded-2xl shadow-md transition-all shrink-0 hover:scale-105 active:scale-95 flex items-center justify-center"
          >
            <ChevronRight className="w-5 h-5 text-white" />
          </button>
        </div>
      </motion.div>
    </div>
  );
}
