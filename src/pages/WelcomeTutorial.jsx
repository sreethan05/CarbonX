import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sprout, Satellite, Link2, Wallet, ArrowRight, ArrowLeft } from 'lucide-react';

export default function WelcomeTutorial() {
  const navigate = useNavigate();
  const [slide, setSlide] = useState(0);

  const slides = [
    { title: 'Earn from Ecological Practices', desc: 'By engaging in zero-tillage, planting cover crops, or planting teak trees, your farm absorbs carbon from the air. This carbon has commercial value globally.', icon: Sprout, bg: 'bg-forest-50', color: 'text-forest-700' },
    { title: 'Geospatial Satellites Scan Your Farm', desc: 'Our platform integrates with Sentinel-2 and Landsat GIS trackers to scan your field vegetative index (NDVI). No paperwork or middleman inspections needed.', icon: Satellite, bg: 'bg-sky-50', color: 'text-sky-700' },
    { title: 'Tokenized Blockchain Credits', desc: 'Your environmental impact mints premium ERC-1155 carbon credits. These digital assets are verified by ISRO compatibility and smart-contract parameters.', icon: Link2, bg: 'bg-purple-50', color: 'text-purple-700' },
    { title: 'Direct UPI Bank Payments', desc: 'Corporate buyers bid on your credits directly in our transparent market. Once sold, funds are instantaneously transferred to your linked UPI bank account.', icon: Wallet, bg: 'bg-amber-50', color: 'text-amber-700' },
  ];

  const current = slides[slide];
  const Icon = current.icon;

  return (
    <div className="min-h-screen bg-warm-white flex flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <button onClick={() => slide > 0 ? setSlide(slide - 1) : navigate('/dashboard')} className="p-2 hover:bg-forest-50 rounded-xl text-carbon-600"><ArrowLeft size={20} /></button>
          <div className="flex gap-1.5">
            {slides.map((_, i) => (<div key={i} className={`h-1.5 rounded-full transition-all ${i === slide ? 'w-6 bg-forest-700' : 'w-1.5 bg-forest-200'}`} />))}
          </div>
          <button onClick={() => navigate('/dashboard')} className="text-xs font-bold text-carbon-400 hover:text-forest-700">Skip</button>
        </div>
        <div className="bg-white border border-forest-100 rounded-3xl p-8 shadow-card text-center">
          <div className={`w-20 h-20 ${current.bg} ${current.color} rounded-3xl flex items-center justify-center mx-auto mb-6`}><Icon size={36} /></div>
          <h2 className="text-xl font-manrope font-bold text-carbon-900 mb-3">{current.title}</h2>
          <p className="text-xs text-carbon-500 leading-relaxed">{current.desc}</p>
        </div>
        <button onClick={() => slide < slides.length - 1 ? setSlide(slide + 1) : navigate('/farm-map')}
          className="w-full mt-6 py-3.5 bg-forest-800 text-white rounded-2xl text-sm font-bold hover:bg-forest-900 transition-colors flex items-center justify-center gap-2">
          {slide < slides.length - 1 ? 'Next' : 'Start Mapping Your Farm'} <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}
