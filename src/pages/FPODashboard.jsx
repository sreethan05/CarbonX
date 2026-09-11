import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2, Users, FileText, AlertTriangle, CheckCircle2, XCircle, Search,
  PlusCircle, Download, ExternalLink, Shield, Layers, Filter, Check, X, RefreshCw
} from 'lucide-react';
import VerificationBadge from '../components/VerificationBadge';
import { useAuth } from '../context/AuthContext';

export default function FPODashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('farmers');

  // FPO Org Context Switcher
  const [fpoContext, setFpoContext] = useState('Yaadadri Laxmi Narsimha FPC Ltd');

  // Search & Filter for Tab 1
  const [searchTerm, setSearchTerm] = useState('');
  const [badgeFilter, setBadgeFilter] = useState('ALL');

  // Tab 2: Onboarding Form State
  const [onboardData, setOnboardData] = useState({
    name: '',
    phone: '',
    survey_number: '',
    acreage: '',
    mandal: 'Pochampally',
    village: 'Pochampally'
  });
  const [onboardSuccess, setOnboardSuccess] = useState(false);

  // Tab 4: Flagged Audit State
  const [auditNotes, setAuditNotes] = useState('');
  const [auditActionDone, setAuditActionDone] = useState(null);

  // Mock initial member dataset
  const [farmersList, setFarmersList] = useState([
    { id: 'F-001', name: 'K. Ramesh', phone: '9876543210', survey: '124/A', acres: 2.50, badge: 'REGISTRY', credits: 12.5, status: 'VERIFIED' },
    { id: 'F-002', name: 'B. Lakshmi', phone: '9876543211', survey: '88/B', acres: 1.80, badge: 'REGISTRY_DOC', credits: 9.0, status: 'VERIFIED' },
    { id: 'F-003', name: 'M. Narsimha', phone: '9876543212', survey: '45/1', acres: 3.10, badge: 'DOCUMENT', credits: 15.5, status: 'VERIFIED' },
    { id: 'F-004', name: 'Padma Bai', phone: '9876543213', survey: '124/B', acres: 2.20, badge: 'PENDING', credits: 0.0, status: 'FLAGGED' },
    { id: 'F-005', name: 'S. Yadaiah', phone: '9876543214', survey: '201/C', acres: 4.00, badge: 'FPO', credits: 20.0, status: 'VERIFIED' }
  ]);

  // Tab 3: Pending Queue
  const [pendingQueue, setPendingQueue] = useState([
    { id: 'P-101', name: 'G. Mallesh', phone: '9876543215', village: 'Pochampally', survey: '90/A', acres: 1.5, date: '2026-09-08' },
    { id: 'P-102', name: 'T. Swapna', phone: '9876543216', village: 'Mothkur', survey: '33/C', acres: 2.8, date: '2026-09-09' }
  ]);

  const handleOnboardSubmit = (e) => {
    e.preventDefault();
    if (!onboardData.name || !onboardData.phone || !onboardData.survey_number) return;

    const newFarmer = {
      id: `F-00${farmersList.length + 1}`,
      name: onboardData.name,
      phone: onboardData.phone,
      survey: onboardData.survey_number,
      acres: parseFloat(onboardData.acreage) || 2.0,
      badge: 'FPO',
      credits: (parseFloat(onboardData.acreage) || 2.0) * 5.0,
      status: 'VERIFIED'
    };

    setFarmersList([newFarmer, ...farmersList]);
    setOnboardSuccess(true);
    setOnboardData({ name: '', phone: '', survey_number: '', acreage: '', mandal: 'Pochampally', village: 'Pochampally' });
    setTimeout(() => setOnboardSuccess(false), 4000);
  };

  const handleApprovePending = (id) => {
    const item = pendingQueue.find(p => p.id === id);
    if (item) {
      setFarmersList([
        { id: `F-${Date.now()}`, name: item.name, phone: item.phone, survey: item.survey, acres: item.acres, badge: 'FPO', credits: item.acres * 5.0, status: 'VERIFIED' },
        ...farmersList
      ]);
      setPendingQueue(pendingQueue.filter(p => p.id !== id));
    }
  };

  const handleRejectPending = (id) => {
    setPendingQueue(pendingQueue.filter(p => p.id !== id));
  };

  const handleAuditApprove = () => {
    setFarmersList(farmersList.map(f => f.name === 'Padma Bai' ? { ...f, badge: 'FPO', status: 'VERIFIED', credits: 11.0 } : f));
    setAuditActionDone('APPROVED_FPO');
  };

  const handleAuditReject = () => {
    setFarmersList(farmersList.map(f => f.name === 'Padma Bai' ? { ...f, badge: 'PENDING', status: 'BLOCKED' } : f));
    setAuditActionDone('REJECTED');
  };

  const filteredFarmers = farmersList.filter(f => {
    const matchesSearch = f.name.toLowerCase().includes(searchTerm.toLowerCase()) || f.survey.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesBadge = badgeFilter === 'ALL' || f.badge === badgeFilter;
    return matchesSearch && matchesBadge;
  });

  return (
    <div className="min-h-screen bg-surface font-inter py-8 px-4 md:px-10 text-agriText-main">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Institutional Header */}
        <div className="bg-white border border-forest-100 shadow-card rounded-2xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-surface-sage border border-forest-200 rounded-2xl flex items-center justify-center text-primary shadow-xs">
              <Building2 className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-bold text-primary uppercase tracking-wider bg-surface-sage border border-forest-200 px-2.5 py-0.5 rounded-full">
                  FPO Command Desk
                </span>

                {/* FPO Context Switcher Toggle */}
                <select
                  value={fpoContext}
                  onChange={(e) => setFpoContext(e.target.value)}
                  className="text-[10px] font-bold text-carbon-800 bg-warm-cream border border-forest-200 rounded px-2 py-0.5 focus:outline-none cursor-pointer"
                >
                  <option value="Yaadadri Laxmi Narsimha FPC Ltd">Yaadadri FPC (Pochampally Cluster)</option>
                  <option value="Telangana Cotton Farmer Coop">Telangana Cotton Coop (Warangal Cluster)</option>
                </select>
              </div>
              <h1 className="text-2xl font-extrabold text-carbon-900 font-manrope">{fpoContext}</h1>
              <p className="text-xs text-agriText-muted mt-0.5">Registration: FPO-TEL-2024-0894 | District: Yadadri Bhuvanagiri</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 w-full md:w-auto">
            <div className="bg-surface-sage/50 border border-forest-200 border-l-4 border-l-emerald-600 rounded-xl p-3 text-center">
              <p className="text-[10px] font-semibold text-agriText-subtle uppercase">Members</p>
              <p className="text-xl font-bold text-carbon-900 mt-0.5">{farmersList.length}</p>
            </div>
            <div className="bg-surface-sage/50 border border-forest-200 border-l-4 border-l-emerald-600 rounded-xl p-3 text-center">
              <p className="text-[10px] font-semibold text-agriText-subtle uppercase">Total Acreage</p>
              <p className="text-xl font-bold text-carbon-900 mt-0.5">342.5 Acres</p>
            </div>
            <div className="bg-surface-sage/50 border border-forest-200 border-l-4 border-l-emerald-600 rounded-xl p-3 text-center">
              <p className="text-[10px] font-semibold text-agriText-subtle uppercase">Pooled Credits</p>
              <p className="text-xl font-bold text-primary mt-0.5">1,420 MT</p>
            </div>
          </div>
        </div>

        {/* 5 Tab Navigation Ribbon */}
        <div className="bg-white border border-forest-100 shadow-card rounded-2xl p-2 flex flex-wrap gap-2">
          {[
            { id: 'farmers', label: 'My Farmers', icon: Users, count: farmersList.length },
            { id: 'onboard', label: 'Bulk Member Onboarding', icon: PlusCircle },
            { id: 'pending', label: 'Pending Queue', icon: FileText, count: pendingQueue.length },
            { id: 'audit', label: 'Flagged Reviews (Padma Bai)', icon: AlertTriangle, count: 1, highlight: true },
            { id: 'certificates', label: 'FPO Certificates', icon: Shield }
          ].map(tab => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  active
                    ? 'bg-[#1B4332] text-white shadow-xs'
                    : tab.highlight
                    ? 'bg-amber-50 text-amber-900 hover:bg-amber-100 border border-amber-200'
                    : 'text-carbon-800 hover:bg-surface-sage'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span className={`px-2 py-0.5 rounded-full text-[10px] ${active ? 'bg-[#2D6A4F] text-white' : 'bg-surface-sage text-carbon-800'}`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* TAB 1: MY FARMERS */}
        {activeTab === 'farmers' && (
          <div className="bg-white border border-forest-100 shadow-card rounded-2xl p-6 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-lg font-bold text-carbon-900">Registered Cooperative Members</h2>
                <p className="text-xs text-agriText-muted">Inspect member verification status, survey details, and carbon credits.</p>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-64">
                  <Search className="w-4 h-4 text-agriText-subtle absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search name or survey..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-surface-sage/40 border border-forest-200 rounded-xl text-xs text-carbon-900 focus:outline-none"
                  />
                </div>

                <select
                  value={badgeFilter}
                  onChange={e => setBadgeFilter(e.target.value)}
                  className="bg-surface-sage/40 border border-forest-200 rounded-xl text-xs text-carbon-900 px-3 py-2 font-medium focus:outline-none"
                >
                  <option value="ALL">All Badges</option>
                  <option value="REGISTRY">REGISTRY</option>
                  <option value="REGISTRY_DOC">REGISTRY_DOC</option>
                  <option value="DOCUMENT">DOCUMENT</option>
                  <option value="FPO">FPO</option>
                  <option value="PENDING">PENDING</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-forest-100 bg-[#F8FAF8] text-agriText-muted font-semibold uppercase tracking-wider">
                    <th className="py-3 px-4">Farmer ID</th>
                    <th className="py-3 px-4">Legal Name</th>
                    <th className="py-3 px-4">Phone (+91)</th>
                    <th className="py-3 px-4">Survey Number</th>
                    <th className="py-3 px-4">Parcel Acreage</th>
                    <th className="py-3 px-4">Verification Badge</th>
                    <th className="py-3 px-4">Carbon Credits</th>
                    <th className="py-3 px-4">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-forest-50">
                  {filteredFarmers.map((f) => (
                    <tr
                      key={f.id}
                      onClick={() => navigate('/farmer/dashboard', {
                        state: {
                          farmerName: f.name,
                          surveyNumber: f.survey,
                          acres: f.acres,
                          badge: f.badge,
                          credits: f.credits,
                          phone: f.phone,
                          village: 'Pochampally',
                          district: 'Yadadri Bhuvanagiri'
                        }
                      })}
                      className="even:bg-[#F9FAF9] odd:bg-white hover:bg-emerald-50/60 transition-colors cursor-pointer"
                    >
                      <td className="py-3 px-4 font-mono text-agriText-muted">{f.id}</td>
                      <td className="py-3 px-4 font-bold text-carbon-900">{f.name}</td>
                      <td className="py-3 px-4 font-mono text-agriText-muted">{f.phone}</td>
                      <td className="py-3 px-4 font-medium text-carbon-800">{f.survey}</td>
                      <td className="py-3 px-4 font-semibold text-carbon-900">{f.acres} Acres</td>
                      <td className="py-3 px-4">
                        <VerificationBadge badge={f.badge} size="sm" />
                      </td>
                      <td className="py-3 px-4 font-bold text-primary">{f.credits} MT</td>
                      <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => navigate('/farmer/dashboard', {
                              state: {
                                farmerName: f.name,
                                surveyNumber: f.survey,
                                acres: f.acres,
                                badge: f.badge,
                                credits: f.credits,
                                phone: f.phone,
                                village: 'Pochampally',
                                district: 'Yadadri Bhuvanagiri'
                              }
                            })}
                            className="text-xs font-semibold text-[#1B4332] hover:underline flex items-center gap-1"
                          >
                            <span>Dashboard</span>
                            <ExternalLink className="w-3 h-3" />
                          </button>

                          <button
                            onClick={() => navigate(`/farmer/passport/${f.id}`)}
                            className="text-xs font-semibold text-slate-500 hover:text-slate-800 hover:underline flex items-center gap-1"
                          >
                            <span>Passport</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: BULK ONBOARDING */}
        {activeTab === 'onboard' && (
          <div className="bg-white border border-forest-100 shadow-card rounded-2xl p-6 space-y-6">
            <div>
              <h2 className="text-lg font-bold text-carbon-900">Direct FPO Member Onboarding</h2>
              <p className="text-xs text-agriText-muted">Register cooperative farmers directly to assign FPO Badge (₹300 benchmark price).</p>
            </div>

            {onboardSuccess && (
              <div className="bg-surface-sage border border-forest-200 text-primary p-4 rounded-xl text-xs flex items-center gap-3 font-semibold">
                <CheckCircle2 className="w-5 h-5 text-primary" />
                <span>Farmer successfully onboarded under FPO Attestation with FPO Verification Badge.</span>
              </div>
            )}

            <form onSubmit={handleOnboardSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
              <div>
                <label className="block text-xs font-bold text-carbon-800 mb-1">Legal Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. K. Venu Gopal"
                  value={onboardData.name}
                  onChange={e => setOnboardData({ ...onboardData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-surface-sage/40 border border-forest-200 rounded-xl text-xs text-carbon-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-carbon-800 mb-1">Mobile Phone (+91)</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 9876543217"
                  value={onboardData.phone}
                  onChange={e => setOnboardData({ ...onboardData, phone: e.target.value })}
                  className="w-full px-3 py-2 bg-surface-sage/40 border border-forest-200 rounded-xl text-xs text-carbon-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-carbon-800 mb-1">Survey Parcel Number</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 155/A"
                  value={onboardData.survey_number}
                  onChange={e => setOnboardData({ ...onboardData, survey_number: e.target.value })}
                  className="w-full px-3 py-2 bg-surface-sage/40 border border-forest-200 rounded-xl text-xs text-carbon-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-carbon-800 mb-1">Parcel Acreage</label>
                <input
                  type="number"
                  step="0.1"
                  required
                  placeholder="e.g. 2.50"
                  value={onboardData.acreage}
                  onChange={e => setOnboardData({ ...onboardData, acreage: e.target.value })}
                  className="w-full px-3 py-2 bg-surface-sage/40 border border-forest-200 rounded-xl text-xs text-carbon-900 focus:outline-none"
                />
              </div>

              <div className="md:col-span-2 pt-2">
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-2"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Onboard Member & Issue FPO Badge</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TAB 3: PENDING QUEUE */}
        {activeTab === 'pending' && (
          <div className="bg-white border border-forest-100 shadow-card rounded-2xl p-6 space-y-6">
            <div>
              <h2 className="text-lg font-bold text-carbon-900">Pending Self-Registration Queue</h2>
              <p className="text-xs text-agriText-muted">Review self-registered farmers awaiting FPO cooperative confirmation.</p>
            </div>

            {pendingQueue.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-forest-200 rounded-2xl">
                <CheckCircle2 className="w-10 h-10 text-primary mx-auto mb-2" />
                <p className="text-sm font-bold text-carbon-900">Queue Cleared</p>
                <p className="text-xs text-agriText-muted">No pending self-registrations awaiting review.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingQueue.map(p => (
                  <div key={p.id} className="bg-surface-sage/40 border border-forest-200 rounded-xl p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-mono font-bold text-agriText-subtle">{p.id}</span>
                        <h3 className="text-sm font-bold text-carbon-900">{p.name}</h3>
                        <VerificationBadge badge="PENDING" size="sm" />
                      </div>
                      <p className="text-xs text-agriText-muted mt-1">
                        Phone: {p.phone} | Village: {p.village} | Survey: {p.survey} | Area: {p.acres} Acres
                      </p>
                    </div>

                    <div className="flex items-center gap-2 w-full md:w-auto">
                      <button
                        onClick={() => handleApprovePending(p.id)}
                        className="flex-1 md:flex-none px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-xs"
                      >
                        <Check className="w-4 h-4" />
                        <span>Approve under FPO Badge</span>
                      </button>
                      <button
                        onClick={() => handleRejectPending(p.id)}
                        className="flex-1 md:flex-none px-4 py-2 bg-red-50 border border-red-200 text-red-700 hover:bg-red-100 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                      >
                        <X className="w-4 h-4" />
                        <span>Reject</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: FLAGGED REVIEWS (PADMA BAI) */}
        {activeTab === 'audit' && (
          <div className="bg-white border border-forest-100 shadow-card rounded-2xl p-6 space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-bold text-amber-900 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  Ground-Truth Audit Inspector
                </span>
                <h2 className="text-lg font-bold text-carbon-900 mt-1">Flagged Review : Padma Bai (Survey 124/B)</h2>
                <p className="text-xs text-agriText-muted">PostGIS Spatial Boundary Discrepancy Review Desk</p>
              </div>

              <VerificationBadge badge="PENDING" size="lg" />
            </div>

            {auditActionDone ? (
              <div className={`p-4 rounded-xl border text-xs flex items-center gap-3 ${
                auditActionDone === 'APPROVED_FPO' ? 'bg-surface-sage border border-forest-200 text-primary' : 'bg-red-50 border border-red-200 text-red-900'
              }`}>
                <CheckCircle2 className="w-5 h-5" />
                <span className="font-semibold">
                  {auditActionDone === 'APPROVED_FPO'
                    ? 'Audit Action: Approved under FPO Attestation Badge (₹300 benchmark rate).'
                    : 'Audit Action: Farm flagged & blocked from credit earning.'}
                </span>
              </div>
            ) : null}

            {/* Audit Warning Banner */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-amber-900 text-xs flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">PostGIS Spatial Variance Flagged</p>
                <p className="mt-0.5 text-amber-800">
                  ST_Intersects boundary collision detected with neighboring survey parcel 124/A (K. Ramesh). Document area: 2.20 Acres vs Polygon area: 2.85 Acres (29.5% area discrepancy exceeds ±20% tolerance).
                </p>
              </div>
            </div>

            {/* Audit Notes & Control Panel */}
            <div className="bg-surface-sage/40 border border-forest-200 rounded-xl p-4 space-y-4">
              <h3 className="text-xs font-bold text-carbon-900">FPO Ground-Truth Field Audit Notes</h3>
              <textarea
                rows={2}
                placeholder="Enter physical field inspection notes..."
                value={auditNotes}
                onChange={e => setAuditNotes(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-forest-200 rounded-xl text-xs text-carbon-900 focus:outline-none"
              />

              <div className="flex items-center gap-3">
                <button
                  onClick={handleAuditApprove}
                  className="px-5 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-xs"
                >
                  <Check className="w-4 h-4" />
                  <span>Approve under FPO Badge (₹300)</span>
                </button>

                <button
                  onClick={handleAuditReject}
                  className="px-5 py-2.5 bg-red-700 hover:bg-red-800 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-xs"
                >
                  <X className="w-4 h-4" />
                  <span>Reject & Block</span>
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
