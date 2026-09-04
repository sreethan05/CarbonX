import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Compass, Cpu, Wallet, HeartHandshake, ArrowRight, ArrowLeft } from 'lucide-react';

export default function WelcomeTutorial() {
  const navigate = useNavigate();
  const [slide, setSlide] = useState(0);

  const slides = [
    {
      title: "Earn from Ecological Practices",
      desc: "By engaging in zero-tillage, planting cover crops, or planting teak trees, your farm absorbs carbon from the air. This carbon has commercial value globally.",
      icon: "🌾",
      bg: "bg-emerald-50",
      color: "text-emerald-800"
    },
    {
      title: "Geospatial Satellites Scan Your Farm",
      desc: "Our platform integrates with Sentinel-2 and Landsat GIS trackers to scan your field's vegetative index (NDVI). No paperwork or middleman inspections are needed.",
      icon: "🛰️",
      bg: "bg-sky-light/30",
      color: "text-sky-dark"
    },
    {
      title: "Tokenized Blockchain Credits",
      desc: "Your environmental impact is minting premium ERC-1155 carbon credits. These digital assets are verified by ISRO compatibility and smart-contract parameters.",
      icon: "🔗",
      bg: "bg-purple-50",
      color: "text-purple-800"
    },
    {
      title: "Direct UPI Bank Payments",
      desc: "Corporate buyers bid on your credits directly in our transparent market. Once sold, funds are instantaneously transferred to your linked UPI bank account.",
      icon: "💰",
      bg: "bg-amber-50",
      color: "text-amber-800"
    }
  ];

  return (
    <div className="min-h-screen bg-warm-white flex flex-col justify-between font-inter text-carbon-800">
      <header className="py-4 px-6 bg-white/50 backdrop-blur flex justify-between items-center border-b border-forest-100/50">
        <button onClick={() => navigate('/farmer-register')} className="text-xs font-semibold text-carbon-500 hover:text-carbon-800">
          Skip
        </button>
        <span className="font-manrope font-bold text-sm text-carbon-800">CarbonX Academy</span>
        <span className="text-xs font-bold text-forest-700">{slide + 1} / 4</span>
      </header>

      <main className="flex-1 max-w-sm mx-auto w-full px-4 py-8 flex flex-col justify-center">
        <div className="bg-white border border-forest-100 rounded-[32px] p-8 shadow-card space-y-8 flex flex-col justify-between min-h-[400px] relative overflow-hidden">
          
          {/* Card Top Icon */}
          <div className="space-y-6">
            <div className={`w-16 h-16 rounded-3xl ${slides[slide].bg} ${slides[slide].color} flex items-center justify-center text-3xl shadow-sm`}>
              {slides[slide].icon}
            </div>
            
            <div className="space-y-3">
              <h2 className="text-xl font-bold font-poppins text-carbon-900 leading-tight">
                {slides[slide].title}
              </h2>
              <p className="text-xs text-carbon-500 leading-relaxed font-medium">
                {slides[slide].desc}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-6 border-t border-forest-50">
            {slide > 0 && (
              <button 
                onClick={() => setSlide(slide - 1)}
                className="p-4 bg-warm-white border border-forest-100 hover:bg-forest-50 text-carbon-600 rounded-2xl transition-all"
              >
                <ArrowLeft size={16} />
              </button>
            )}
            <button 
              onClick={() => {
                if (slide < 3) {
                  setSlide(slide + 1);
                } else {
                  navigate('/farm-map');
                }
              }}
              className="flex-1 bg-forest-800 hover:bg-forest-900 text-white text-xs font-bold font-poppins py-4 rounded-2xl shadow-lg hover:shadow-premium flex items-center justify-center gap-1.5 transition-all"
            >
              {slide === 3 ? "Map Your Farmland" : "Next Slide"} <ArrowRight size={14} />
            </button>
          </div>

        </div>
      </main>

      <footer className="py-4 text-center text-[9px] text-carbon-400 border-t border-forest-50 bg-white/30 uppercase tracking-widest font-bold">
        🌱 Verified Climate Education Platform
      </footer>
    </div>
  );
}
