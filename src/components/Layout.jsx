import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Compass, ShoppingCart, Wallet, UserCheck, Menu, Bell, Globe, X, ChevronRight } from 'lucide-react';
import { mockFarmer } from '../data/mockData';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';

const ALL_ROUTES = [
  { category: "Auth & Onboarding", items: [
    { name: "Landing Page", path: "/" },
    { name: "Role Selection", path: "/role-selection" },
    { name: "Farmer Register", path: "/farmer-register" },
    { name: "Farmer Login", path: "/farmer-login" },
    { name: "Welcome Onboarding", path: "/onboarding" },
  ]},
  { category: "Farm Mapping & KYC", items: [
    { name: "Farm Map (Draw)", path: "/farm-map" },
    { name: "Farm Details Form", path: "/farm-details" },
    { name: "Satellite Review", path: "/satellite-preview" },
    { name: "Submission Success", path: "/submission-success" },
    { name: "Compliance Uploads", path: "/farm-verification" },
    { name: "Orbit Audit Success", path: "/verification-success" },
  ]},
  { category: "Farmer Dashboards", items: [
    { name: "Main Dashboard", path: "/farmer-dashboard" },
    { name: "Farm Analytics", path: "/farm-analytics" },
    { name: "Carbon Wallet", path: "/wallet" },
    { name: "Create Credit Listing", path: "/create-listing" },
    { name: "Support & Bot", path: "/support" },
  ]},
  { category: "Marketplace & ESG", items: [
    { name: "Corporate Portal", path: "/corporate-welcome" },
    { name: "Carbon Marketplace", path: "/marketplace" },
    { name: "Credit Deep Dive", path: "/credit-analysis/auc-01" },
    { name: "Corporate ESG Dashboard", path: "/corporate-dashboard" },
    { name: "Admin Approvals Centre", path: "/admin-dashboard" },
  ]},
];

export default function Layout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { t, changeLanguage, currentLang } = useLanguage();
  const { user } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const displayName = user?.name || mockFarmer.name;
  const displayVillage = [user?.village, user?.district].filter(Boolean).join(', ') || mockFarmer.village;
  const initials = displayName.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase() || 'F';

  const ProfileAvatar = ({ className = '' }) => (
    <div className={`bg-forest-100 flex items-center justify-center text-xs font-bold text-forest-800 ${className}`}>
      {initials}
    </div>
  );

  const isPublicPage =
    location.pathname === '/' ||
    location.pathname === '/role-selection' ||
    location.pathname === '/farmer-register' ||
    location.pathname === '/farmer-login' ||
    location.pathname === '/onboarding' ||
    location.pathname === '/satellite-preview' ||
    location.pathname === '/submission-success';

  const navItems = [
    { name: "Home", key: "home", path: "/farmer-dashboard", icon: Home },
    { name: "Farm", key: "farm", path: "/farm-analytics", icon: Compass },
    { name: "Market", key: "market", path: "/marketplace", icon: ShoppingCart },
    { name: "Wallet", key: "wallet", path: "/wallet", icon: Wallet },
    { name: "Support", key: "support", path: "/support", icon: UserCheck }
  ];

  const getActiveTabClass = (path) => {
    return location.pathname === path ||
      (path === '/farmer-dashboard' && location.pathname === '/farmer-dashboard') ||
      (path === '/farm-analytics' && ['/farm-analytics', '/farm-map', '/farm-details', '/satellite-preview', '/submission-success'].includes(location.pathname));
  };

  const [notificationsList, setNotificationsList] = useState(() => {
    const local = localStorage.getItem('carbonx_notifications');
    if (local) return JSON.parse(local);
    const initial = [
      { id: 1, text: "Verification Successful: North Grove Plot is 100% verified.", time: "1 hr ago", type: "success" },
      { id: 2, text: "New Buyer Bid: TATA ESG offered ₹530/credit for Andhra Paddy.", time: "3 hrs ago", type: "info" },
      { id: 3, text: "Escrow Locked: ₹12,480 compliance funds secured.", time: "4 hrs ago", type: "info" },
      { id: 4, text: "UPI Payout Initiated: ₹8,000 sent to ramesh.kumar@oksbi.", time: "1 day ago", type: "payment" },
      { id: 5, text: "⚠️ Outbid Alert: Anila Devi's Sugarcane lot received a higher bid.", time: "2 days ago", type: "warning" }
    ];
    localStorage.setItem('carbonx_notifications', JSON.stringify(initial));
    return initial;
  });

  useEffect(() => {
    const interval = setInterval(() => {
      const local = localStorage.getItem('carbonx_notifications');
      if (local) setNotificationsList(JSON.parse(local));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  const handleLanguageChange = (e) => changeLanguage(e.target.value);

  const goTo = (path) => {
    navigate(path);
    setSidebarOpen(false);
  };

  if (isPublicPage) {
    return <div className="min-h-screen flex flex-col">{children}</div>;
  }

  return (
    <div className="min-h-screen bg-warm-white flex flex-col pb-24 md:pb-0 md:pl-64">

      {/* ── Mobile Top Header ── */}
      <header className="sticky top-0 z-40 bg-warm-white/95 backdrop-blur-md border-b border-forest-100/50 py-3 px-4 flex justify-between items-center md:hidden">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 hover:bg-forest-50 rounded-xl text-carbon-800 transition-colors"
            aria-label="Open menu"
          >
            <Menu size={22} />
          </button>
          <span className="font-manrope font-extrabold text-xl text-forest-800 tracking-tight flex items-center gap-1.5">
            🌱 CarbonX
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-forest-50 border border-forest-100 rounded-xl px-2 py-1 text-xs text-forest-900">
            <Globe size={12} className="text-forest-700" />
            <select
              value={currentLang}
              onChange={handleLanguageChange}
              className="bg-transparent border-none outline-none text-[10px] font-bold focus:ring-0 cursor-pointer text-forest-900"
            >
              <option value="en">EN</option>
              <option value="hi">HI</option>
              <option value="te">TE</option>
            </select>
          </div>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 hover:bg-forest-50 rounded-xl text-carbon-800 transition-colors relative"
          >
            <Bell size={20} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full"></span>
          </button>
          <button
            onClick={() => navigate('/farmer-dashboard')}
            className="w-9 h-9 rounded-full overflow-hidden border border-forest-200/80 shadow-sm"
          >
            <ProfileAvatar className="w-full h-full" />
          </button>
        </div>
      </header>

      {/* ── Desktop Sidebar ── */}
      <aside className="fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-forest-100 shadow-sm hidden md:flex flex-col justify-between overflow-y-auto">
        <div className="p-6 space-y-6">
          <div className="flex items-center gap-2.5">
            <span className="w-9 h-9 bg-forest-700 rounded-xl flex items-center justify-center text-white font-bold text-lg">🌱</span>
            <span className="font-manrope font-extrabold text-2xl text-forest-800 tracking-tight">CarbonX</span>
          </div>

          <div className="bg-forest-50/50 border border-forest-100/50 rounded-2xl p-3 flex items-center justify-between text-xs text-carbon-600">
            <span className="flex items-center gap-1.5 font-semibold text-carbon-700">
              <Globe size={14} className="text-forest-700" /> Language
            </span>
            <select
              value={currentLang}
              onChange={handleLanguageChange}
              className="bg-transparent border-none outline-none font-bold text-forest-800 focus:ring-0 cursor-pointer text-xs"
            >
              <option value="en">English</option>
              <option value="hi">हिन्दी</option>
              <option value="te">తెలుగు</option>
            </select>
          </div>

          {/* Primary nav */}
          <nav className="space-y-1.5">
            {navItems.map((item, idx) => {
              const active = getActiveTabClass(item.path);
              return (
                <button
                  key={idx}
                  onClick={() => navigate(item.path)}
                  className={`w-full py-3 px-4 rounded-2xl flex items-center gap-3.5 text-sm font-semibold transition-all duration-200 ${
                    active ? 'bg-forest-100 text-forest-900 border border-forest-200/30' : 'hover:bg-forest-50/50 text-carbon-500 hover:text-forest-800'
                  }`}
                >
                  <item.icon size={19} className={active ? "text-forest-700" : "text-carbon-400"} />
                  <span>{t(item.key)}</span>
                </button>
              );
            })}
          </nav>

          {/* All pages grouped */}
          <div className="pt-2 border-t border-forest-100/60 space-y-4">
            {ALL_ROUTES.map((cat, ci) => (
              <div key={ci}>
                <p className="text-[10px] font-bold text-forest-600 uppercase tracking-wider mb-1.5 px-1">{cat.category}</p>
                <div className="space-y-0.5">
                  {cat.items.map((item, ii) => {
                    const active = location.pathname === item.path;
                    return (
                      <button
                        key={ii}
                        onClick={() => navigate(item.path)}
                        className={`w-full text-left py-1.5 px-3 rounded-xl text-xs font-medium flex items-center justify-between transition-all ${
                          active ? 'bg-forest-100 text-forest-900' : 'text-carbon-500 hover:bg-forest-50 hover:text-forest-800'
                        }`}
                      >
                        <span>{item.name}</span>
                        {active && <ChevronRight size={12} className="text-forest-600" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Profile card */}
        <div className="p-6 border-t border-forest-100/60 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl overflow-hidden border border-forest-200 shadow-sm">
            <ProfileAvatar className="w-full h-full" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-carbon-800 truncate leading-tight">{displayName}</p>
            <p className="text-xs text-forest-600 truncate">{displayVillage}</p>
          </div>
        </div>
      </aside>

      {/* ── Mobile Slide-Out Sidebar ── */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          {/* Drawer */}
          <div className="relative w-72 max-w-[85vw] bg-white h-full flex flex-col shadow-2xl animate-in slide-in-from-left duration-250 overflow-y-auto">
            <div className="sticky top-0 bg-white z-10 px-5 py-4 flex items-center justify-between border-b border-forest-100">
              <div className="flex items-center gap-2.5">
                <span className="w-8 h-8 bg-forest-700 rounded-xl flex items-center justify-center text-white font-bold">🌱</span>
                <span className="font-manrope font-extrabold text-lg text-forest-800">CarbonX</span>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-1.5 hover:bg-forest-50 rounded-xl text-carbon-500"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 px-4 py-4 space-y-5">
              {/* Quick nav */}
              <div className="grid grid-cols-3 gap-2">
                {navItems.map((item, idx) => {
                  const active = getActiveTabClass(item.path);
                  return (
                    <button
                      key={idx}
                      onClick={() => goTo(item.path)}
                      className={`flex flex-col items-center gap-1 py-2.5 rounded-2xl text-[10px] font-bold transition-all ${
                        active ? 'bg-forest-100 text-forest-900' : 'bg-forest-50/50 text-carbon-500 hover:bg-forest-100'
                      }`}
                    >
                      <item.icon size={17} className={active ? "text-forest-700" : "text-carbon-400"} />
                      <span>{t(item.key)}</span>
                    </button>
                  );
                })}
              </div>

              <div className="border-t border-forest-100" />

              {/* All pages */}
              {ALL_ROUTES.map((cat, ci) => (
                <div key={ci}>
                  <p className="text-[10px] font-bold text-forest-600 uppercase tracking-wider mb-1.5 px-1">{cat.category}</p>
                  <div className="space-y-0.5">
                    {cat.items.map((item, ii) => {
                      const active = location.pathname === item.path;
                      return (
                        <button
                          key={ii}
                          onClick={() => goTo(item.path)}
                          className={`w-full text-left py-2 px-3 rounded-xl text-xs font-medium flex items-center justify-between transition-all ${
                            active ? 'bg-forest-100 text-forest-900 border border-forest-200/50' : 'text-carbon-600 hover:bg-forest-50 hover:text-forest-800'
                          }`}
                        >
                          <span>{item.name}</span>
                          {active && <ChevronRight size={12} className="text-forest-600" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div className="px-5 py-4 border-t border-forest-100 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl overflow-hidden border border-forest-200">
                <ProfileAvatar className="w-full h-full" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-carbon-800 truncate">{displayName}</p>
                <p className="text-[10px] text-forest-600 truncate">{displayVillage}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-4 md:py-8">
        {children}
      </main>

      {/* Notifications Drawer */}
      {showNotifications && (
        <div className="fixed top-14 right-4 z-50 w-80 bg-white/95 backdrop-blur-xl border border-forest-100 rounded-3xl p-4 shadow-2xl animate-in fade-in slide-in-from-top-4 duration-200">
          <div className="flex justify-between items-center pb-2 border-b border-forest-100 mb-2">
            <span className="text-xs font-bold text-carbon-800 uppercase tracking-wide">Notifications</span>
            <button onClick={() => setShowNotifications(false)} className="text-[10px] font-semibold text-forest-700 hover:underline">Mark read</button>
          </div>
          <div className="space-y-2">
            {notificationsList.map(n => (
              <div key={n.id} className="p-2.5 rounded-xl hover:bg-forest-50/60 text-xs transition-colors flex gap-2 border border-forest-50">
                <span className="text-base mt-0.5">
                  {n.type === 'success' ? '✅' : n.type === 'payment' ? '💰' : '🔔'}
                </span>
                <div>
                  <p className="text-carbon-700 leading-snug">{n.text}</p>
                  <span className="text-[9px] text-carbon-400 mt-1 block">{n.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Mobile Bottom Nav */}
      <nav className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-xl border-t border-forest-100/50 py-2.5 px-4 flex justify-around items-center md:hidden shadow-lg">
        {navItems.map((item, idx) => {
          const active = getActiveTabClass(item.path);
          return (
            <button
              key={idx}
              onClick={() => navigate(item.path)}
              className="flex flex-col items-center justify-center gap-1 transition-all duration-200 flex-1 relative"
            >
              {active ? (
                <div className="flex flex-col items-center justify-center">
                  <div className="px-5 py-1.5 bg-[#FFEBE7] rounded-full flex items-center justify-center shadow-sm">
                    <item.icon size={20} className="text-[#E06651]" />
                  </div>
                  <span className="text-[10px] font-bold text-carbon-800 font-poppins mt-0.5">{t(item.key)}</span>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center">
                  <div className="px-5 py-1.5 text-carbon-400">
                    <item.icon size={20} />
                  </div>
                  <span className="text-[10px] font-medium text-carbon-400 font-poppins mt-0.5">{t(item.key)}</span>
                </div>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
