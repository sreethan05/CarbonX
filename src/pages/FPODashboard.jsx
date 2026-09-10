import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, ShieldCheck, AlertTriangle, Clock, Sprout, Leaf, TrendingUp,
  Plus, Search, X, MapPin, Phone, ChevronRight, Wallet, CheckCircle2,
  XCircle, Loader2, Building2, Award, ArrowUpRight,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getDemoFarmers, addDemoFarmer, getFpoStats } from '../data/demoData';

const STATUS_CONFIG = {
  VERIFIED: { label: 'Verified', icon: CheckCircle2, classes: 'bg-forest-50 text-forest-700 border-forest-200', dot: 'bg-forest-500' },
  PENDING:  { label: 'Pending',  icon: Clock,        classes: 'bg-amber-50 text-amber-700 border-amber-200',       dot: 'bg-amber-500' },
  FLAGGED:  { label: 'Flagged',  icon: AlertTriangle, classes: 'bg-rose-50 text-rose-700 border-rose-200',        dot: 'bg-rose-500' },
};

const RISK_CONFIG = {
  low:    { label: 'Low Risk',    classes: 'bg-forest-50 text-forest-600' },
  medium: { label: 'Medium Risk', classes: 'bg-amber-50 text-amber-600' },
  high:   { label: 'High Risk',   classes: 'bg-rose-50 text-rose-600' },
};

function StatCard({ icon: Icon, label, value, sublabel, color }) {
  return (
    <div className="bg-white border border-forest-100/60 rounded-2xl p-4 shadow-card">
      <div className="flex items-start justify-between mb-2">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
          <Icon size={20} />
        </div>
      </div>
      <p className="text-2xl font-bold text-carbon-800 font-manrope">{value}</p>
      <p className="text-xs font-semibold text-carbon-400 mt-0.5">{label}</p>
      {sublabel && <p className="text-[10px] text-carbon-300 mt-0.5">{sublabel}</p>}
    </div>
  );
}

function FarmerRow({ farmer, onClick }) {
  const status = STATUS_CONFIG[farmer.kyc_status] || STATUS_CONFIG.PENDING;
  const risk = RISK_CONFIG[farmer.risk_level] || RISK_CONFIG.medium;
  const StatusIcon = status.icon;

  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 p-3 hover:bg-forest-50/50 rounded-xl transition-colors text-left border border-transparent hover:border-forest-100"
    >
      <div className="w-10 h-10 bg-forest-100 flex items-center justify-center rounded-full text-xs font-bold text-forest-800 flex-shrink-0">
        {farmer.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-carbon-800 truncate">{farmer.name}</p>
        <p className="text-[11px] text-carbon-400 flex items-center gap-1">
          <MapPin size={10} /> {farmer.village}, {farmer.state}
        </p>
      </div>
      <div className="hidden sm:block text-right">
        <p className="text-xs font-semibold text-carbon-600">{farmer.crop_type} - {farmer.farm_area}ac</p>
        <p className="text-[10px] text-carbon-300">{farmer.total_credits > 0 ? `${farmer.total_credits} credits` : 'No credits yet'}</p>
      </div>
      <div className="flex flex-col items-end gap-1">
        <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-lg border ${status.classes}`}>
          <StatusIcon size={10} /> {status.label}
        </span>
        <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded ${risk.classes}`}>
          {risk.label}
        </span>
      </div>
      <ChevronRight size={16} className="text-carbon-300 flex-shrink-0" />
    </button>
  );
}

function FarmerDetailPanel({ farmer, onClose }) {
  const status = STATUS_CONFIG[farmer.kyc_status] || STATUS_CONFIG.PENDING;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40" onClick={onClose}>
      <div
        className="bg-white w-full sm:max-w-md sm:rounded-3xl rounded-t-3xl max-h-[85vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white border-b border-forest-100 p-4 flex items-center justify-between z-10">
          <h3 className="font-bold text-carbon-800">Farmer Details</h3>
          <button onClick={onClose} className="p-2 hover:bg-forest-50 rounded-xl"><X size={18} /></button>
        </div>

        <div className="p-4 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 bg-forest-100 flex items-center justify-center rounded-full text-base font-bold text-forest-800">
              {farmer.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
            </div>
            <div>
              <p className="text-lg font-bold text-carbon-800">{farmer.name}</p>
              <p className="text-xs text-carbon-400 flex items-center gap-1">
                <Phone size={11} /> +91 {farmer.phone}
              </p>
            </div>
            <span className={`ml-auto inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-lg border ${status.classes}`}>
              {status.label}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <InfoBox label="Village" value={farmer.village} />
            <InfoBox label="District" value={farmer.district} />
            <InfoBox label="Farm Area" value={`${farmer.farm_area} acres`} />
            <InfoBox label="Crop Type" value={farmer.crop_type} />
            <InfoBox label="Irrigation" value={farmer.irrigation} />
            <InfoBox label="Risk Level" value={RISK_CONFIG[farmer.risk_level]?.label || 'Medium'} />
          </div>

          {farmer.ndvi_score && (
            <div className="bg-forest-50 rounded-2xl p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-forest-700">NDVI Score</span>
                <span className="text-lg font-bold text-forest-800">{farmer.ndvi_score}</span>
              </div>
              <div className="w-full h-2 bg-forest-100 rounded-full overflow-hidden">
                <div className="h-full bg-forest-500 rounded-full" style={{ width: `${farmer.ndvi_score * 100}%` }} />
              </div>
            </div>
          )}

          {farmer.total_credits > 0 && (
            <div className="grid grid-cols-3 gap-2">
              <CreditBox label="Carbon" value={farmer.carbon_credits} icon={Leaf} />
              <CreditBox label="Biodiversity" value={Math.round(farmer.total_credits - farmer.carbon_credits)} icon={Sprout} />
              <CreditBox label="Total" value={farmer.total_credits} icon={Wallet} />
            </div>
          )}

          {farmer.kyc_status === 'FLAGGED' && farmer.kyc_reasons && (
            <div className="bg-rose-50 border border-rose-100 rounded-2xl p-3">
              <p className="text-xs font-bold text-rose-700 mb-2 flex items-center gap-1">
                <AlertTriangle size={12} /> KYC Flag Reasons
              </p>
              <ul className="space-y-1">
                {farmer.kyc_reasons.map((r, i) => (
                  <li key={i} className="text-xs text-rose-600 flex items-start gap-1.5">
                    <span className="w-1 h-1 bg-rose-400 rounded-full mt-1.5 flex-shrink-0" /> {r}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {farmer.kyc_status === 'PENDING' && (
            <div className="bg-amber-50 border border-amber-100 rounded-2xl p-3">
              <p className="text-xs font-bold text-amber-700 flex items-center gap-1">
                <Clock size={12} /> KYC verification in progress. Awaiting digital checks.
              </p>
            </div>
          )}

          {farmer.kyc_status === 'VERIFIED' && (
            <div className="bg-forest-50 border border-forest-100 rounded-2xl p-3">
              <p className="text-xs font-bold text-forest-700 flex items-center gap-1">
                <ShieldCheck size={12} /> Land ownership verified on {new Date(farmer.kyc_date).toLocaleDateString('en-IN')}
              </p>
            </div>
          )}

          <div className="text-[10px] text-carbon-300 text-center pt-2">
            Onboarded: {new Date(farmer.onboarded_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoBox({ label, value }) {
  return (
    <div className="bg-warm-white rounded-xl p-2.5">
      <p className="text-[10px] font-semibold text-carbon-300 uppercase tracking-wide">{label}</p>
      <p className="text-xs font-bold text-carbon-700 mt-0.5">{value}</p>
    </div>
  );
}

function CreditBox({ label, value, icon: Icon }) {
  return (
    <div className="bg-white border border-forest-100 rounded-xl p-2.5 text-center">
      <Icon size={14} className="text-forest-500 mx-auto mb-1" />
      <p className="text-sm font-bold text-carbon-800">{value}</p>
      <p className="text-[9px] text-carbon-400">{label}</p>
    </div>
  );
}

function OnboardFarmerModal({ onClose, onSubmit }) {
  const [form, setForm] = useState({
    name: '', phone: '', aadhaar: '', village: '', district: '',
    farm_area: '', crop_type: 'Cotton', irrigation: 'Drip',
  });
  const [submitting, setSubmitting] = useState(false);

  const crops = ['Cotton', 'Paddy', 'Maize', 'Turmeric', 'Red Gram', 'Soybean', 'Groundnut', 'Sugarcane'];
  const irrigations = ['Drip', 'Sprinkler', 'Flood', 'Rain-fed'];

  const handleSubmit = async () => {
    if (!form.name || !form.phone || !form.aadhaar || !form.village) return;
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 800));
    onSubmit({
      ...form,
      farm_area: parseFloat(form.farm_area) || 1,
      state: 'Telangana',
      kyc_status: 'PENDING',
      kyc_date: null,
      farm_id: null,
      ndvi_score: null,
      carbon_credits: 0,
      biodiversity_score: null,
      total_credits: 0,
      risk_level: 'medium',
    });
    setSubmitting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40" onClick={onClose}>
      <div
        className="bg-white w-full sm:max-w-md sm:rounded-3xl rounded-t-3xl max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white border-b border-forest-100 p-4 flex items-center justify-between z-10">
          <h3 className="font-bold text-carbon-800">Onboard New Farmer</h3>
          <button onClick={onClose} className="p-2 hover:bg-forest-50 rounded-xl"><X size={18} /></button>
        </div>

        <div className="p-4 space-y-3">
          <Field label="Farmer Name" value={form.name} onChange={v => setForm({ ...form, name: v })} placeholder="e.g. Ramesh Reddy" />
          <Field label="Phone Number" value={form.phone} onChange={v => setForm({ ...form, phone: v })} placeholder="10-digit mobile" />
          <Field label="Aadhaar Number" value={form.aadhaar} onChange={v => setForm({ ...form, aadhaar: v })} placeholder="12-digit Aadhaar" />
          <Field label="Village" value={form.village} onChange={v => setForm({ ...form, village: v })} placeholder="e.g. Pochampally" />
          <Field label="District" value={form.district} onChange={v => setForm({ ...form, district: v })} placeholder="e.g. Yadadri Bhuvanagiri" />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold text-carbon-400 uppercase tracking-wide">Farm Area (acres)</label>
              <input
                type="number" step="0.1" value={form.farm_area}
                onChange={e => setForm({ ...form, farm_area: e.target.value })}
                placeholder="2.5"
                className="w-full mt-1 px-3 py-2 text-sm border border-forest-100 rounded-xl focus:ring-2 focus:ring-forest-200 focus:border-forest-300 outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-carbon-400 uppercase tracking-wide">Crop Type</label>
              <select
                value={form.crop_type}
                onChange={e => setForm({ ...form, crop_type: e.target.value })}
                className="w-full mt-1 px-3 py-2 text-sm border border-forest-100 rounded-xl focus:ring-2 focus:ring-forest-200 outline-none bg-white"
              >
                {crops.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold text-carbon-400 uppercase tracking-wide">Irrigation Type</label>
            <select
              value={form.irrigation}
              onChange={e => setForm({ ...form, irrigation: e.target.value })}
              className="w-full mt-1 px-3 py-2 text-sm border border-forest-100 rounded-xl focus:ring-2 focus:ring-forest-200 outline-none bg-white"
            >
              {irrigations.map(i => <option key={i} value={i}>{i}</option>)}
            </select>
          </div>

          <div className="bg-forest-50 rounded-xl p-3 mt-2">
            <p className="text-[11px] text-forest-700 flex items-start gap-1.5">
              <ShieldCheck size={12} className="mt-0.5 flex-shrink-0" />
              After onboarding, the farmer's KYC verification will begin automatically. You can track the status in the table below.
            </p>
          </div>

          <button
            onClick={handleSubmit}
            disabled={!form.name || !form.phone || submitting}
            className="w-full bg-forest-600 hover:bg-forest-700 disabled:bg-carbon-200 text-white font-bold text-sm py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            {submitting ? (
              <><Loader2 size={16} className="animate-spin" /> Onboarding...</>
            ) : (
              <><Plus size={16} /> Onboard Farmer</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, placeholder }) {
  return (
    <div>
      <label className="text-[10px] font-bold text-carbon-400 uppercase tracking-wide">{label}</label>
      <input
        type="text" value={value} placeholder={placeholder}
        onChange={e => onChange(e.target.value)}
        className="w-full mt-1 px-3 py-2 text-sm border border-forest-100 rounded-xl focus:ring-2 focus:ring-forest-200 focus:border-forest-300 outline-none"
      />
    </div>
  );
}

export default function FPODashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [farmers, setFarmers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('ALL');
  const [selectedFarmer, setSelectedFarmer] = useState(null);
  const [showOnboard, setShowOnboard] = useState(false);

  useEffect(() => {
    try {
      const demo = getDemoFarmers();
      setFarmers(demo);
    } catch {}
    setLoading(false);
  }, []);

  const stats = useMemo(() => getFpoStats(farmers), [farmers]);

  const filtered = useMemo(() => {
    return farmers.filter(f => {
      if (filter !== 'ALL' && f.kyc_status !== filter) return false;
      if (search) {
        const q = search.toLowerCase();
        return f.name.toLowerCase().includes(q) || f.village.toLowerCase().includes(q) || f.phone.includes(q);
      }
      return true;
    });
  }, [farmers, search, filter]);

  const handleOnboard = (farmer) => {
    const updated = addDemoFarmer(farmer);
    setFarmers(updated);
  };

  const fpoName = user?.name || user?.fpo_name || 'Sri Lakshmi FPO';

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 size={32} className="animate-spin text-forest-500" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-4">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Building2 size={18} className="text-forest-600" />
            <h1 className="text-xl font-bold text-carbon-800 font-manrope">{fpoName}</h1>
          </div>
          <p className="text-xs text-carbon-400">FPO Dashboard - Onboard & manage farmers</p>
        </div>
        <button
          onClick={() => setShowOnboard(true)}
          className="bg-forest-600 hover:bg-forest-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 transition-colors shadow-sm"
        >
          <Plus size={16} /> Onboard Farmer
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard icon={Users} label="Total Farmers" value={stats.totalFarmers} color="bg-forest-100 text-forest-700" />
        <StatCard icon={ShieldCheck} label="Verified" value={stats.verified} sublabel={`${stats.pending} pending`} color="bg-sky-100 text-sky-700" />
        <StatCard icon={Leaf} label="Carbon Credits" value={stats.totalCredits} sublabel={`${stats.totalCarbon}t CO2`} color="bg-earth-light/20 text-forest-600" />
        <StatCard icon={Sprout} label="Total Acres" value={stats.totalAcres} sublabel={`Avg NDVI: ${stats.avgNdvi}`} color="bg-amber-100 text-amber-700" />
      </div>

      {stats.flagged > 0 && (
        <div className="bg-rose-50 border border-rose-100 rounded-2xl p-3 flex items-center gap-3">
          <div className="w-9 h-9 bg-rose-100 rounded-xl flex items-center justify-center">
            <AlertTriangle size={18} className="text-rose-600" />
          </div>
          <div className="flex-1">
            <p className="text-xs font-bold text-rose-700">{stats.flagged} farmer(s) flagged for review</p>
            <p className="text-[11px] text-rose-500">KYC verification detected issues that need attention</p>
          </div>
          <button onClick={() => setFilter('FLAGGED')} className="text-xs font-bold text-rose-700 px-3 py-1.5 bg-white rounded-lg hover:bg-rose-100">
            Review
          </button>
        </div>
      )}

      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-carbon-300" />
          <input
            type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search farmer name, village, phone..."
            className="w-full pl-9 pr-3 py-2 text-xs border border-forest-100 rounded-xl focus:ring-2 focus:ring-forest-200 outline-none bg-white"
          />
        </div>
        <div className="flex gap-1">
          {['ALL', 'VERIFIED', 'PENDING', 'FLAGGED'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`text-[10px] font-bold px-3 py-2 rounded-xl transition-colors ${
                filter === f ? 'bg-forest-600 text-white' : 'bg-white text-carbon-400 border border-forest-100 hover:bg-forest-50'
              }`}
            >
              {f === 'ALL' ? 'All' : STATUS_CONFIG[f]?.label}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white border border-forest-100/60 rounded-2xl p-2 shadow-card">
        {filtered.length === 0 ? (
          <div className="text-center py-12">
            <Users size={32} className="text-carbon-200 mx-auto mb-2" />
            <p className="text-sm text-carbon-400">No farmers found</p>
          </div>
        ) : (
          <div className="space-y-1">
            {filtered.map(farmer => (
              <FarmerRow key={farmer.id} farmer={farmer} onClick={() => setSelectedFarmer(farmer)} />
            ))}
          </div>
        )}
      </div>

      <div className="bg-forest-50 rounded-2xl p-4 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Award size={16} className="text-forest-600" />
          <p className="text-xs text-forest-700 font-semibold">
            {stats.verified} of {stats.totalFarmers} farmers verified - {stats.totalCredits} carbon credits generated
          </p>
        </div>
        <button
          onClick={() => navigate('/marketplace')}
          className="text-xs font-bold text-forest-700 flex items-center gap-1 hover:text-forest-900"
        >
          View Marketplace <ArrowUpRight size={12} />
        </button>
      </div>

      {selectedFarmer && <FarmerDetailPanel farmer={selectedFarmer} onClose={() => setSelectedFarmer(null)} />}
      {showOnboard && <OnboardFarmerModal onClose={() => setShowOnboard(false)} onSubmit={handleOnboard} />}
    </div>
  );
}
