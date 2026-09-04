import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Layers, ChevronRight, Menu, X, Settings, User, TrendingUp, Wallet, ShieldAlert, BadgeHelp, Globe } from 'lucide-react';

export default function PrototypeNav() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const routes = [
    { category: "Public & Auth", items: [
      { name: "1. Landing Page", path: "/" },
      { name: "2. Role Selection", path: "/role-selection" },
      { name: "3. Farmer Register", path: "/farmer-register" },
      { name: "4. Farmer Login", path: "/farmer-login" },
      { name: "5. Welcome Onboarding", path: "/onboarding" },
    ]},
    { category: "Farmer Mapping & KYC", items: [
      { name: "6. Bhuvan Map Draw", path: "/farm-map" },
      { name: "7. Farm Details Form", path: "/farm-details" },
      { name: "8. Satellite Review", path: "/satellite-preview" },
      { name: "9. Submission Success", path: "/submission-success" },
      { name: "10. Compliance Uploads", path: "/farm-verification" },
      { name: "11. Orbit Audit Success", path: "/verification-success" },
    ]},
    { category: "Farmer Dashboards", items: [
      { name: "12. Main Dashboard", path: "/farmer-dashboard" },
      { name: "13. Farm Analytics", path: "/farm-analytics" },
      { name: "14. Carbon Wallet", path: "/wallet" },
      { name: "15. Create Credit Listing", path: "/create-listing" },
      { name: "16. Support & Bot", path: "/support" },
    ]},
    { category: "Marketplace & ESG Floors", items: [
      { name: "17. Corporate Portal Welcome", path: "/corporate-welcome" },
      { name: "18. Carbon Marketplace", path: "/marketplace" },
      { name: "19. Satellite Credit Deep Dive", path: "/credit-analysis/auc-01" },
      { name: "20. Corporate ESG Dashboard", path: "/corporate-dashboard" },
      { name: "21. Admin Approvals Center", path: "/admin-dashboard" },
    ]}
  ];

  return (
    <>
      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-24 right-4 z-50 p-3.5 bg-forest-800 hover:bg-forest-900 text-white rounded-full shadow-2xl transition-all duration-300 transform hover:scale-105 border border-forest-600 flex items-center gap-2"
        title="Interactive Demo Navigator"
      >
        {isOpen ? <X size={20} /> : <Layers size={20} />}
        <span className="text-xs font-semibold font-poppins pr-1">Demo Navigator</span>
      </button>

      {/* Side drawer */}
      {isOpen && (
        <div className="fixed inset-y-0 right-0 w-80 bg-white/95 backdrop-blur-xl border-l border-forest-100 z-50 shadow-2xl flex flex-col p-6 overflow-y-auto animate-in slide-in-from-right duration-300">
          <div className="flex justify-between items-center pb-4 border-b border-forest-100 mb-4">
            <div>
              <h3 className="text-forest-800 font-bold text-lg font-poppins flex items-center gap-2">
                <Layers size={18} className="text-forest-500" />
                CarbonX Flows
              </h3>
              <p className="text-[10px] text-carbon-500 font-inter">Investor & Demo-Day Sandbox Mode</p>
            </div>
            <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-forest-50 rounded-lg text-carbon-500 hover:text-forest-700">
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 space-y-5">
            {routes.map((cat, idx) => (
              <div key={idx} className="space-y-2">
                <h4 className="text-xs font-bold text-forest-700 tracking-wider uppercase font-poppins">{cat.category}</h4>
                <div className="space-y-1">
                  {cat.items.map((item, key) => {
                    const isActive = location.pathname === item.path;
                    return (
                      <button
                        key={key}
                        onClick={() => {
                          navigate(item.path);
                          setIsOpen(false);
                        }}
                        className={`w-full text-left py-2 px-3 rounded-xl text-xs font-medium font-inter flex items-center justify-between transition-all duration-200 ${
                          isActive 
                            ? 'bg-forest-100 text-forest-900 shadow-sm border border-forest-200/50' 
                            : 'hover:bg-forest-50/50 text-carbon-600 hover:text-forest-800'
                        }`}
                      >
                        <span>{item.name}</span>
                        {isActive && <ChevronRight size={14} className="text-forest-600" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-forest-100 mt-4 text-[10px] text-carbon-400 space-y-1">
            <p>🔄 Built for Android Mobile-First & Desktop ESG Viewports</p>
            <p>🌱 Theme: Nature + Trust + Space Technology</p>
          </div>
        </div>
      )}
    </>
  );
}
