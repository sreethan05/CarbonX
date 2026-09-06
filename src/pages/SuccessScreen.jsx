import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, ArrowRight, Satellite, Leaf, Wallet } from 'lucide-react';
import { combinedCredits } from '../services/api';

const CREDIT_PRICE = 520;

export default function SuccessScreen() {
  const navigate = useNavigate();
  const [analysis, setAnalysis] = useState(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('carbonx_last_analysis');
      if (saved) setAnalysis(JSON.parse(saved));
    } catch {}
  }, []);

  const credits = analysis ? combinedCredits(analysis).total : 0;
  const annualValue = Math.round(credits * CREDIT_PRICE);

  return (
    <div className="min-h-screen bg-warm-white flex flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="bg-white border border-forest-100 rounded-3xl p-8 shadow-card text-center">
          <div className="w-16 h-16 bg-forest-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <CheckCircle2 size={36} className="text-forest-700" />
          </div>
          <h2 className="text-xl font-manrope font-bold text-carbon-900">Satellite Scan Complete</h2>
          <p className="text-xs text-carbon-500 mt-2 leading-relaxed">
            Your farmland boundary was analyzed with Sentinel-2 satellite imagery and ML biodiversity scoring.
          </p>

          {analysis && (
            <div className="grid grid-cols-3 gap-3 mt-6">
              <div className="bg-forest-50/50 rounded-xl p-3">
                <Satellite size={18} className="mx-auto text-forest-600 mb-1" />
                <p className="text-[9px] uppercase text-carbon-400 font-bold">NDVI</p>
                <p className="text-sm font-black text-carbon-900">{analysis.ndvi || '0.52'}</p>
              </div>
              <div className="bg-forest-50/50 rounded-xl p-3">
                <Leaf size={18} className="mx-auto text-forest-600 mb-1" />
                <p className="text-[9px] uppercase text-carbon-400 font-bold">Credits</p>
                <p className="text-sm font-black text-carbon-900">{credits}</p>
              </div>
              <div className="bg-forest-50/50 rounded-xl p-3">
                <Wallet size={18} className="mx-auto text-forest-600 mb-1" />
                <p className="text-[9px] uppercase text-carbon-400 font-bold">Value/yr</p>
                <p className="text-sm font-black text-carbon-900">₹{annualValue.toLocaleString('en-IN')}</p>
              </div>
            </div>
          )}

          <div className="mt-6 pt-6 border-t border-forest-50">
            <p className="text-[10px] text-carbon-400 uppercase tracking-wider font-bold mb-3">Next Steps</p>
            <p className="text-xs text-carbon-500 leading-relaxed">
              Complete KYC verification to mint your carbon credits and start earning.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mt-4">
          <button onClick={() => navigate('/farm-verification')} className="py-3.5 bg-forest-800 text-white rounded-2xl text-xs font-bold hover:bg-forest-900 transition-colors flex items-center justify-center gap-1.5">
            Verify KYC <ArrowRight size={14} />
          </button>
          <button onClick={() => navigate('/dashboard')} className="py-3.5 bg-white border border-forest-200 text-carbon-800 rounded-2xl text-xs font-bold hover:bg-forest-50 transition-colors">
            Go to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
