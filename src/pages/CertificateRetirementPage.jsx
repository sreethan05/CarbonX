import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShieldCheck, Download, Lock, CheckCircle2, Globe, FileText, ArrowLeft } from 'lucide-react';

export default function CertificateRetirementPage() {
  const { certId = 'CX-2026-CERT-00123' } = useParams();
  const navigate = useNavigate();

  const [status, setStatus] = useState('HELD_IN_ESCROW');
  const [selectedScope, setSelectedScope] = useState('Scope 1 Neutrality');
  const [retireTimestamp, setRetireTimestamp] = useState(null);

  const handlePermanentRetire = () => {
    setStatus('RETIRED');
    setRetireTimestamp(new Date().toISOString());
  };

  return (
    <div className="min-h-screen bg-slate-100 font-inter text-slate-900 py-10 px-4 md:px-10 flex flex-col items-center">
      <div className="max-w-4xl w-full space-y-6">

        {/* Header Navigation */}
        <div className="flex justify-between items-center">
          <button
            onClick={() => navigate('/corporate/dashboard')}
            className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 hover:bg-slate-50 flex items-center gap-1.5 shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Corporate Dashboard</span>
          </button>

          <span className={`px-3 py-1 rounded-full text-xs font-bold font-mono border ${
            status === 'RETIRED' ? 'bg-slate-900 text-white border-slate-900' : 'bg-emerald-50 text-emerald-900 border-emerald-300'
          }`}>
            STATUS: {status}
          </span>
        </div>

        {/* Official Certificate Layout (Framed Layout on Off-White Linen Background) */}
        <div className="bg-[#F8FAFC] border-4 border-double border-slate-300 shadow-2xl rounded-2xl p-8 md:p-12 text-center space-y-6 relative overflow-hidden">
          {/* Top Stamp / Badge */}
          <div className="flex justify-between items-center border-b border-slate-200 pb-6">
            <div className="text-left">
              <span className="font-manrope font-extrabold text-xl text-slate-900 tracking-tight block">CarbonX</span>
              <span className="text-[10px] font-mono text-slate-500">Enterprise AgTech Registry Standard</span>
            </div>

            <div className="w-14 h-14 bg-emerald-50 border border-emerald-300 rounded-full flex items-center justify-center text-emerald-800">
              <ShieldCheck className="w-8 h-8" />
            </div>
          </div>

          <div className="space-y-2 py-4">
            <p className="text-xs font-bold text-emerald-800 uppercase tracking-widest">Official Carbon Offset Certificate</p>
            <h1 className="text-3xl md:text-4xl font-extrabold font-manrope text-slate-900">Certificate of Verified Offsets</h1>
            <p className="text-xs font-mono text-slate-500">Certificate ID: {certId}</p>
          </div>

          <div className="max-w-xl mx-auto space-y-3 text-xs text-slate-700 bg-white border border-slate-200 p-6 rounded-xl shadow-inner">
            <p>This certifies that</p>
            <p className="text-base font-extrabold text-slate-900 font-manrope">Telangana Sustainable Agro Pvt Ltd</p>
            <p>has acquired and holds</p>
            <p className="text-2xl font-black text-emerald-800 font-manrope">100.00 Metric Tonnes CO2e</p>
            <p className="text-[11px] text-slate-500 pt-2 border-t border-slate-100">
              Sourced from verified Telangana farmland parcels: <strong className="text-slate-800">Pochampally Survey 124/A & Mothkur Survey 88/B</strong>.
            </p>
          </div>

          {/* Immutable Verification Hash */}
          <div className="bg-slate-100 border border-slate-200 rounded-xl p-3 text-xs font-mono text-slate-700 flex justify-between items-center max-w-xl mx-auto">
            <span>Verification Hash:</span>
            <span className="font-bold text-slate-900 truncate">0x7f9a883ce42b91028471abc882</span>
          </div>

          {status === 'RETIRED' && (
            <div className="bg-[#1B4332] text-white border border-emerald-800 rounded-xl p-4 max-w-xl mx-auto text-xs space-y-1">
              <p className="font-bold text-emerald-400">PERMANENTLY RETIRED & LOCKED</p>
              <p>Retired for {selectedScope} on {new Date(retireTimestamp).toLocaleDateString()}</p>
            </div>
          )}
        </div>

        {/* Permanent Retirement Terminal */}
        <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-6 space-y-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Lock className="w-5 h-5 text-slate-800" />
            <span>Permanent Retirement Terminal</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Scope Neutrality Selection
              </label>
              <select
                value={selectedScope}
                onChange={e => setSelectedScope(e.target.value)}
                disabled={status === 'RETIRED'}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-900 focus:outline-none"
              >
                <option value="Scope 1 Neutrality">Scope 1 Neutrality (Direct Emissions)</option>
                <option value="Scope 2 Neutrality">Scope 2 Neutrality (Purchased Energy)</option>
                <option value="Scope 3 Neutrality">Scope 3 Neutrality (Supply Chain)</option>
              </select>
            </div>

            <div className="flex items-end">
              {status === 'HELD_IN_ESCROW' ? (
                <button
                  onClick={handlePermanentRetire}
                  className="w-full py-2.5 bg-rose-800 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2"
                >
                  <Lock className="w-4 h-4" />
                  <span>Permanently Retire Credits</span>
                </button>
              ) : (
                <div className="w-full py-2.5 bg-slate-100 text-slate-500 rounded-lg text-xs font-bold text-center">
                  Certificate Locked & Retired
                </div>
              )}
            </div>
          </div>

          {/* Export Controls */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-slate-100">
            <button
              onClick={() => alert('Downloading Official PDF Certificate...')}
              className="flex-1 py-2.5 bg-[#1B4332] hover:bg-[#2D6A4F] text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span>Download Official PDF</span>
            </button>

            <button
              onClick={() => alert('Exporting GIS GeoJSON Boundaries file...')}
              className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2"
            >
              <Globe className="w-4 h-4 text-emerald-700" />
              <span>Export GIS GeoJSON Boundaries</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
