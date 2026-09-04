import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Compass, ShieldCheck, HelpCircle, Globe, Smartphone, Landmark, Cpu, Database } from 'lucide-react';

export default function RoleSelection() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-warm-white flex flex-col justify-between font-inter text-carbon-800">
      
      {/* Top Header Bar */}
      <header className="py-4 px-6 bg-white/50 backdrop-blur flex justify-between items-center border-b border-forest-100/50">
        <span className="font-manrope font-extrabold text-xl text-forest-800 tracking-tight flex items-center gap-1.5 cursor-pointer" onClick={() => navigate('/')}>
          🌱 CarbonX
        </span>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-forest-100 hover:bg-forest-50 text-xs font-semibold rounded-xl text-carbon-700 transition-colors">
            <Globe size={14} className="text-forest-600" />
            <span>English</span>
            <span className="text-[10px] text-carbon-400">▼</span>
          </button>
          <div className="w-8 h-8 rounded-full bg-forest-800 text-white flex items-center justify-center font-bold text-sm">
            R
          </div>
        </div>
      </header>

      {/* Main Body */}
      <main className="flex-1 max-w-lg mx-auto w-full px-4 py-8 space-y-8">
        
        {/* Title */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-extrabold font-manrope text-carbon-900 leading-tight">
            Empowering Green Futures
          </h1>
          <p className="text-xs text-carbon-500 leading-relaxed">
            Select your identity to access the CarbonX ecosystem. We connect verified sustainable farming with global carbon markets.
          </p>
        </div>

        {/* Roles Grid Cards */}
        <div className="space-y-4">
          
          {/* Farmer Card */}
          <div className="bg-white border border-forest-100 rounded-3xl p-6 shadow-card space-y-4 hover:border-forest-200 transition-all duration-300">
            <div className="flex gap-4 items-start">
              <div className="p-3 bg-forest-50 text-forest-800 rounded-2xl">
                {/* Tractor Icon Simulation */}
                <span>🚜</span>
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-carbon-800 font-poppins">Farmer</h3>
                <p className="text-xs text-carbon-500 leading-normal">
                  Register your land, track carbon sequestration, and earn credits for sustainable practices.
                </p>
              </div>
            </div>
            <button 
              onClick={() => navigate('/farmer-register')}
              className="w-full bg-carbon-800 hover:bg-carbon-900 text-white text-xs font-bold font-poppins py-3.5 rounded-2xl shadow transition-all duration-200 flex items-center justify-center gap-2"
            >
              Get Started <ArrowRight size={14} />
            </button>
          </div>

          {/* Corporate Buyer Card */}
          <div className="bg-white border border-forest-100 rounded-3xl p-6 shadow-card space-y-4 hover:border-forest-200 transition-all duration-300">
            <div className="flex gap-4 items-start">
              <div className="p-3 bg-sky-light/40 text-sky-dark rounded-2xl">
                <span>🏢</span>
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-carbon-800 font-poppins">Corporate Buyer</h3>
                <p className="text-xs text-carbon-500 leading-normal">
                  Offset emissions by purchasing verified, high-integrity carbon credits from Indian farmers.
                </p>
              </div>
            </div>
            <button 
              onClick={() => navigate('/corporate-dashboard')}
              className="w-full border border-carbon-800 hover:bg-carbon-50 text-carbon-800 text-xs font-bold font-poppins py-3.5 rounded-2xl transition-all duration-200 flex items-center justify-center gap-1.5"
            >
              Explore Market 📈
            </button>
          </div>

          {/* FPO Partner Card */}
          <div className="bg-white border border-forest-100 rounded-3xl p-6 shadow-card space-y-4 hover:border-forest-200 transition-all duration-300">
            <div className="flex gap-4 items-start">
              <div className="p-3 bg-rose-100/60 text-rose-700 rounded-2xl">
                <span>👥</span>
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-carbon-800 font-poppins">FPO Partner</h3>
                <p className="text-xs text-carbon-500 leading-normal">
                  Manage clusters of farmers, digitize records, and facilitate verification processes.
                </p>
              </div>
            </div>
            <button 
              onClick={() => navigate('/admin-dashboard')}
              className="w-full bg-forest-700 hover:bg-forest-800 text-white text-xs font-bold font-poppins py-3.5 rounded-2xl shadow transition-all duration-200 flex items-center justify-center gap-1.5"
            >
              Partner Login 💎
            </button>
          </div>

          {/* Admin Card */}
          <div className="bg-white border border-forest-100 rounded-3xl p-6 shadow-card space-y-4 hover:border-forest-200 transition-all duration-300">
            <div className="flex gap-4 items-start">
              <div className="p-3 bg-carbon-50 text-carbon-600 rounded-2xl">
                <span>🛡️</span>
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-carbon-800 font-poppins">Admin / Verifier</h3>
                <p className="text-xs text-carbon-500 leading-normal">
                  Access satellite data validation, compliance tools, and system-wide analytics.
                </p>
              </div>
            </div>
            <button 
              onClick={() => navigate('/admin-dashboard')}
              className="w-full border border-carbon-200 hover:bg-carbon-50 text-carbon-700 text-xs font-bold font-poppins py-3.5 rounded-2xl transition-all duration-200 flex items-center justify-center gap-1.5"
            >
              System Access 🔒
            </button>
          </div>

        </div>

        {/* Bottom Scientific verification card matching Screenshot 3 */}
        <div className="rounded-[28px] overflow-hidden border border-forest-100 shadow-lg relative h-48 flex items-end">
          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&q=80&w=600')` }}>
            <div className="w-full h-full bg-gradient-to-t from-forest-900/90 via-forest-900/60 to-transparent"></div>
          </div>
          <div className="relative z-10 p-6 space-y-1">
            <span className="inline-block bg-white/20 backdrop-blur-md px-2 py-0.5 rounded-md text-[9px] font-extrabold text-earth-light tracking-wide border border-white/10 uppercase mb-1">
              ✓ Scientific Verification
            </span>
            <h4 className="text-sm font-bold text-white font-poppins">Satellite-First Verification</h4>
            <p className="text-[10px] text-forest-100/90 leading-relaxed font-inter">
              Every credit on CarbonX is backed by rigorous remote sensing data and ground-level audits, ensuring unparalleled integrity in the voluntary carbon market.
            </p>
          </div>
        </div>

      </main>

      {/* Footer support badges matches Screenshot 3 */}
      <footer className="py-6 border-t border-forest-50 text-center text-[10px] text-carbon-400 font-inter bg-white/30 space-y-1">
        <p>© 2026 CarbonX. Supported by Ministry of Agriculture.</p>
        <p className="text-forest-600 font-medium">Digital Public Infrastructure (DPI) Enabled</p>
      </footer>

    </div>
  );
}
