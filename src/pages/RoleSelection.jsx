import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Compass, ShieldCheck, HelpCircle, Globe, Smartphone, Landmark, Cpu, Database, Building2, BadgeCheck } from 'lucide-react';

export default function RoleSelection() {
  const navigate = useNavigate();

  const roles = [
    {
      id: 'farmer',
      title: 'Farmer',
      desc: 'Register your farm, verify land ownership, and earn carbon credits through satellite-verified sustainable practices.',
      icon: Compass,
      color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      hover: 'hover:border-emerald-400 hover:shadow-emerald-100',
    },
    {
      id: 'buyer',
      title: 'Corporate Buyer',
      desc: 'Browse verified carbon credit listings, analyze farm data, and purchase high-integrity credits from farmers.',
      icon: Building2,
      color: 'bg-sky-50 text-sky-700 border-sky-200',
      hover: 'hover:border-sky-400 hover:shadow-sky-100',
    },
    {
      id: 'verifier',
      title: 'Verifier / Govt',
      desc: 'Review KYC verifications, audit land documents, and ensure compliance across all carbon credit issuance.',
      icon: BadgeCheck,
      color: 'bg-amber-50 text-amber-700 border-amber-200',
      hover: 'hover:border-amber-400 hover:shadow-amber-100',
    },
    {
      id: 'admin',
      title: 'Admin',
      desc: 'Full platform oversight — manage users, monitor transactions, and configure system settings.',
      icon: ShieldCheck,
      color: 'bg-rose-50 text-rose-700 border-rose-200',
      hover: 'hover:border-rose-400 hover:shadow-rose-100',
    },
  ];

  return (
    <div className="min-h-screen bg-warm-white flex flex-col justify-between font-inter text-carbon-800">
      <header className="py-3 px-6 bg-white/80 backdrop-blur-md flex justify-between items-center border-b border-forest-100/60 sticky top-0 z-30 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="p-2 hover:bg-forest-50 rounded-xl text-carbon-700 transition-colors flex items-center gap-1 text-xs font-semibold"
            title="Back to Home"
          >
            <ArrowRight size={15} className="rotate-180" />
            <span className="hidden sm:inline">Home</span>
          </button>
          <span className="font-manrope font-extrabold text-xl text-forest-800 tracking-tight flex items-center gap-1.5 cursor-pointer" onClick={() => navigate('/')}>
            CarbonX
          </span>
        </div>
        <button
          onClick={() => navigate('/farmer-login')}
          className="text-xs font-semibold text-carbon-600 hover:text-forest-700 flex items-center gap-1.5 px-4 py-2 rounded-xl hover:bg-forest-50 transition-colors"
        >
          <Smartphone size={14} />
          Login
        </button>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="max-w-5xl w-full">
          <div className="text-center mb-10">
            <h1 className="font-manrope font-extrabold text-3xl sm:text-4xl text-carbon-900 mb-3">
              Choose Your Role
            </h1>
            <p className="text-sm text-carbon-500 max-w-xl mx-auto">
              CarbonX connects farmers, buyers, verifiers, and administrators on one platform for transparent carbon credit trading.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {roles.map((role) => {
              const Icon = role.icon;
              return (
                <button
                  key={role.id}
                  onClick={() => navigate(`/farmer-register?role=${role.id}`)}
                  className={`group text-left p-6 rounded-2xl border-2 bg-white transition-all duration-300 ${role.hover} hover:shadow-lg`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${role.color}`}>
                      <Icon size={22} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-manrope font-bold text-lg text-carbon-900 mb-1">
                        {role.title}
                      </h3>
                      <p className="text-xs text-carbon-500 leading-relaxed">
                        {role.desc}
                      </p>
                    </div>
                    <ArrowRight size={18} className="text-carbon-300 group-hover:text-carbon-600 group-hover:translate-x-1 transition-all" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </main>

      <footer className="py-4 px-6 text-center text-xs text-carbon-400">
        CarbonX — Satellite-verified carbon credits for Indian farmers
      </footer>
    </div>
  );
}
