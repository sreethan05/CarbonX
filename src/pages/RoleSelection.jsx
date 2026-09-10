import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ArrowLeft, Compass, Building2, BadgeCheck, ShieldCheck, Users } from 'lucide-react';

export default function RoleSelection() {
  const navigate = useNavigate();

  const roles = [
    { id: 'farmer', title: 'Farmer', desc: 'Register your farm, verify land ownership, and earn carbon credits through satellite-verified sustainable practices.', icon: Compass, color: 'bg-forest-50 text-forest-700 border-forest-200', hover: 'hover:border-forest-400' },
    { id: 'buyer', title: 'Corporate Buyer', desc: 'Browse verified carbon credit listings, analyze farm data, and purchase high-integrity credits from farmers.', icon: Building2, color: 'bg-sky-50 text-sky-700 border-sky-200', hover: 'hover:border-sky-400' },
    { id: 'verifier', title: 'Verifier / Govt', desc: 'Review KYC verifications, audit land documents, and ensure compliance across all carbon credit issuance.', icon: BadgeCheck, color: 'bg-amber-50 text-amber-700 border-amber-200', hover: 'hover:border-amber-400' },
    { id: 'admin', title: 'Admin', desc: 'Full platform oversight — manage users, monitor transactions, and configure system settings.', icon: ShieldCheck, color: 'bg-rose-50 text-rose-700 border-rose-200', hover: 'hover:border-rose-400' },
    { id: 'fpo', title: 'FPO / Cooperative', desc: 'Onboard multiple farmers at scale, manage KYC verification, and track aggregate carbon credits across all member farms.', icon: Users, color: 'bg-violet-50 text-violet-700 border-violet-200', hover: 'hover:border-violet-400' },
  ];

  return (
    <div className="min-h-screen bg-warm-white flex flex-col items-center px-4 py-8">
      <button onClick={() => navigate('/')} className="self-start flex items-center gap-1.5 text-xs font-semibold text-carbon-600 hover:text-forest-800 mb-6">
        <ArrowLeft size={14} /> Back to Home
      </button>
      <div className="text-center mb-8">
        <h1 className="text-2xl font-manrope font-extrabold text-carbon-900 tracking-tight">Select Your Role</h1>
        <p className="text-xs text-carbon-500 mt-2">Choose how you want to interact with CarbonX</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl w-full">
        {roles.map((r) => {
          const Icon = r.icon;
          return (
            <button key={r.id} onClick={() => navigate(`/farmer-register?role=${r.id}`)}
              className={`text-left bg-white border-2 ${r.color.split(' ')[2]} ${r.hover} rounded-2xl p-6 transition-all hover:shadow-md`}>
              <div className={`w-12 h-12 ${r.color} rounded-xl flex items-center justify-center mb-4 border ${r.color.split(' ')[2]}`}><Icon size={24} /></div>
              <h3 className="text-lg font-bold text-carbon-900 mb-1">{r.title}</h3>
              <p className="text-xs text-carbon-500 leading-relaxed mb-3">{r.desc}</p>
              <span className={`inline-flex items-center gap-1 text-xs font-bold ${r.color.split(' ')[1]}`}>Continue <ArrowRight size={13} /></span>
            </button>
          );
        })}
      </div>
      <p className="text-[11px] text-carbon-400 mt-8 text-center">
        Already have an account? <button onClick={() => navigate('/farmer-login')} className="text-forest-700 font-bold hover:underline">Login here</button>
      </p>
    </div>
  );
}
