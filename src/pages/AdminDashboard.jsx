import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, CheckCircle, XCircle, Cpu, ChevronDown, ChevronUp, FileText, MapPin, Building, ShieldCheck, AlertTriangle } from 'lucide-react';

export default function AdminDashboard() {
  const [queue, setQueue] = useState([]);
  const [approvedCount, setApprovedCount] = useState(0);
  const [activeFlags, setActiveFlags] = useState(0);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    const rameshVerified = localStorage.getItem('carbonx_farmer_docs_verified') === 'true';
    const baseQueue = [
      { id: 'q1', farmer: 'K. Ranga Rao', farm: 'Nalgonda Paddy Farm', area: '3.5 Ha', confidence: '94.2%', date: '20 May 2026', status: 'Needs Review',
        documents: { aadhaar: 'aadhaar_ranga.jpg', aadhaarMatch: '94.2%', deed: 'pattadar_deed.pdf', deedNo: '8829/2022', upiId: 'ranga.rao@oksbi', cropPhotos: 'paddy_geotag.jpg', gps: '17.15 N, 79.16 E' },
        ocrMetrics: { nameMatch: '94.2% (Matches DB)', surveyMatch: '98.5% (Match)', boundaries: 'Aligns with Nalgonda Revenue Map' },
        fraudRisk: { level: 'Low Risk', score: 8, details: 'Zero overlapping claims. Clean agricultural usage.' } },
      { id: 'q2', farmer: 'M. Chennappa', farm: 'Mahbubnagar Cotton', area: '4.8 Ha', confidence: '81.5%', date: '19 May 2026', status: 'Flagged (NDVI)',
        documents: { aadhaar: 'aadhaar_chennappa.jpg', aadhaarMatch: '81.5% (Typo)', deed: 'deed_cotton.pdf', deedNo: '9901/2021', upiId: 'chennappa@okaxis', cropPhotos: 'cotton_geotag.jpg', gps: '16.73 N, 78.00 E' },
        ocrMetrics: { nameMatch: '81.5% (Surname mismatch)', surveyMatch: '91.2% (12% dimension diff)', boundaries: '0.12 Ha overlap with forest' },
        fraudRisk: { level: 'High Risk', score: 81, details: 'NDVI shows deforestation. Boundary overlap with reserve forest.' } },
      { id: 'q3', farmer: 'P. Lakshmi', farm: 'Khammam Agroforestry', area: '2.1 Ha', confidence: '98.9%', date: '19 May 2026', status: 'Pending Verification',
        documents: { aadhaar: 'aadhaar_lakshmi.jpg', aadhaarMatch: '98.9%', deed: 'khammam_deed.pdf', deedNo: '1240/2023', upiId: 'lakshmi.p@okhdfc', cropPhotos: 'teak_geotag.jpg', gps: '17.24 N, 80.14 E' },
        ocrMetrics: { nameMatch: '98.9% (Perfect)', surveyMatch: '99.8% (Exact match)', boundaries: 'Perfect containment' },
        fraudRisk: { level: 'Low Risk', score: 4, details: 'Verified teak plantation. Strong carbon profile.' } },
    ];
    const rameshItem = {
      id: 'q_ramesh', farmer: 'Ramesh Kumar', farm: 'North Grove Plot', area: '4.28 Ha', confidence: '99.4%', date: '21 May 2026',
      status: rameshVerified ? 'Needs Review' : 'Draft - Awaiting Onboarding',
      documents: { aadhaar: 'aadhaar_ramesh.jpg', aadhaarMatch: '99.4%', deed: 'pattadar_passbook.pdf', deedNo: '184/A/2', upiId: 'ramesh.kumar@oksbi', cropPhotos: 'rice_geotag.jpg', gps: '17.96 N, 79.59 E' },
      ocrMetrics: { nameMatch: '99.4% (Aadhaar & Bank match)', surveyMatch: '99.2% (Survey 184/A/2 matches Bhuvan)', boundaries: 'Coherent boundaries, zero leakage' },
      fraudRisk: { level: 'Low Risk', score: 2, details: 'Zero double-selling. NDVI confirms active paddy since 2023.' },
    };
    setQueue([rameshItem, ...baseQueue]);
  }, []);

  const handleAction = (id, type) => {
    if (type === 'approve') { setApprovedCount(p => p + 1); setQueue(p => p.filter(q => q.id !== id)); }
    else if (type === 'reject') { setActiveFlags(p => Math.max(0, p - 1)); setQueue(p => p.filter(q => q.id !== id)); }
    setExpandedId(null);
  };

  return (
    <div className="pb-24 px-4 pt-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6 bg-white p-4 rounded-2xl border border-forest-100 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center"><ShieldAlert className="w-6 h-6" /></div>
          <div>
            <span className="text-[10px] text-carbon-400 font-bold uppercase tracking-wider">Compliance Console</span>
            <h1 className="text-lg font-extrabold text-forest-800">Verification & Governance</h1>
          </div>
        </div>
        <span className="text-[10px] bg-rose-50 text-rose-600 border border-rose-100 px-3 py-1 rounded-full font-bold uppercase tracking-wider">Verifier</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-5 rounded-2xl border border-forest-100 shadow-sm">
          <span className="text-[9px] text-carbon-400 font-bold tracking-wider uppercase">Farms Approved</span>
          <h3 className="text-3xl font-black text-forest-800 mt-1">{approvedCount}</h3>
          <p className="text-[10px] text-forest-600 font-bold mt-1.5 flex items-center gap-1"><ShieldCheck size={12} /> Contracts Issued</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-rose-100 shadow-sm">
          <span className="text-[9px] text-rose-500 font-bold tracking-wider uppercase flex items-center gap-1"><AlertTriangle size={11} /> Active Flags</span>
          <h3 className="text-3xl font-black text-rose-600 mt-1">{activeFlags}</h3>
          <p className="text-[10px] text-rose-500 mt-1.5">Sentinel Alerts</p>
        </div>
        <div className="bg-forest-900 text-white p-5 rounded-2xl shadow-sm">
          <span className="text-[9px] text-forest-300 font-bold tracking-wider uppercase flex items-center gap-1"><Cpu className="w-3.5 h-3.5" /> Market Volume</span>
          <h3 className="text-3xl font-black text-forest-300 mt-1">0</h3>
          <p className="text-[10px] text-forest-300 mt-1.5">Credits Traded</p>
        </div>
      </div>

      <div className="flex items-center justify-between mb-4 px-1">
        <h4 className="text-xs font-bold text-carbon-500 uppercase tracking-wider">Review Queue ({queue.length})</h4>
        <span className="text-[9px] bg-forest-50 border border-forest-100 text-forest-800 px-3 py-1 rounded-full font-bold">OCR V2.4</span>
      </div>

      <div className="space-y-4">
        {queue.length === 0 ? (
          <div className="p-12 bg-white rounded-2xl text-center border border-forest-100 text-carbon-500 text-sm shadow-sm">
            <CheckCircle className="w-12 h-12 text-forest-500 mx-auto mb-3" />
            <p className="font-bold">Review Queue is Clear</p>
            <p className="text-xs text-carbon-400 mt-1">All farm plots verified and mapped.</p>
          </div>
        ) : queue.map(item => {
          const isFlagged = item.status.includes('Flagged');
          const isDraft = item.status.includes('Draft');
          const isExpanded = expandedId === item.id;
          return (
            <div key={item.id} className={`bg-white rounded-2xl border shadow-sm transition-all overflow-hidden ${isExpanded ? 'ring-2 ring-forest-400 border-forest-300' : isFlagged ? 'border-rose-200' : 'border-forest-100'}`}>
              <div onClick={() => setExpandedId(prev => prev === item.id ? null : item.id)} className="p-5 flex justify-between items-center cursor-pointer select-none">
                <div>
                  <div className="flex items-center gap-2">
                    <h5 className="text-sm font-extrabold text-carbon-800">{item.farm}</h5>
                    {item.id === 'q_ramesh' && <span className="bg-forest-100 text-forest-800 text-[8px] font-bold px-1.5 py-0.2 rounded-full uppercase">Your Farmer</span>}
                  </div>
                  <p className="text-xs text-carbon-400 mt-0.5">Farmer: <span className="font-bold text-carbon-700">{item.farmer}</span> · {item.area} · {item.date}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-[9px] px-2.5 py-1 rounded-full font-bold uppercase ${isFlagged ? 'bg-rose-100 text-rose-800' : isDraft ? 'bg-amber-100 text-amber-800' : 'bg-forest-50 text-forest-800'}`}>{item.status}</span>
                  {isExpanded ? <ChevronUp size={16} className="text-carbon-400" /> : <ChevronDown size={16} className="text-carbon-400" />}
                </div>
              </div>

              {!isExpanded && (
                <div className="px-5 pb-5 grid grid-cols-3 gap-2 text-xs border-t border-forest-50 pt-3">
                  <div><span className="text-[9px] uppercase tracking-wider text-carbon-400 font-bold">OCR Confidence</span><p className={`font-bold mt-0.5 ${isFlagged ? 'text-rose-600' : 'text-forest-600'}`}>{item.confidence}</p></div>
                  <div><span className="text-[9px] uppercase tracking-wider text-carbon-400 font-bold">Risk</span><p className={`font-bold mt-0.5 ${item.fraudRisk.score > 50 ? 'text-rose-600' : 'text-forest-600'}`}>{item.fraudRisk.level}</p></div>
                  <div><span className="text-[9px] uppercase tracking-wider text-carbon-400 font-bold">Action</span><p className="font-semibold text-forest-600 mt-0.5">Click to audit</p></div>
                </div>
              )}

              <AnimatePresence>
                {isExpanded && (
                  <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="border-t border-forest-100 bg-forest-50/20">
                    <div className="p-5 space-y-5">
                      <div>
                        <h6 className="text-[10px] font-bold text-forest-800 uppercase tracking-wider mb-2">Uploaded Documents</h6>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                          {[
                            { label: 'Aadhaar KYC', icon: FileText, value: item.documents.aadhaar, badge: `OCR: ${item.documents.aadhaarMatch}` },
                            { label: 'Land Deed', icon: FileText, value: item.documents.deed, badge: `Deed: ${item.documents.deedNo}` },
                            { label: 'Bank/UPI', icon: Building, value: item.documents.upiId, badge: 'UPI OK' },
                            { label: 'Geo-Tagged Photos', icon: MapPin, value: item.documents.cropPhotos, badge: `GPS: ${item.documents.gps}` },
                          ].map((d, i) => (
                            <div key={i} className="bg-white border border-forest-100 p-3 rounded-xl h-24 flex flex-col justify-between">
                              <span className="text-[9px] font-bold text-carbon-400">{d.label}</span>
                              <div className="flex items-center gap-1.5 text-xs text-forest-800 font-bold"><d.icon size={14} className="text-forest-600" /><span className="truncate max-w-[100px]">{d.value}</span></div>
                              <span className="text-[8px] bg-forest-50 text-forest-800 px-1.5 py-0.5 rounded font-mono font-bold self-start">{d.badge}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="bg-white border border-forest-100 rounded-xl p-4">
                        <h6 className="text-[10px] font-bold text-forest-800 uppercase tracking-wider mb-3">AI OCR Results</h6>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                          <div className="bg-forest-50/40 p-2.5 rounded-xl"><span className="text-[8px] uppercase text-carbon-400 font-bold">Name Match</span><p className="font-bold text-carbon-800 mt-1">{item.ocrMetrics.nameMatch}</p></div>
                          <div className="bg-forest-50/40 p-2.5 rounded-xl"><span className="text-[8px] uppercase text-carbon-400 font-bold">Survey Match</span><p className="font-bold text-carbon-800 mt-1">{item.ocrMetrics.surveyMatch}</p></div>
                          <div className="bg-forest-50/40 p-2.5 rounded-xl"><span className="text-[8px] uppercase text-carbon-400 font-bold">GIS Overlaps</span><p className="font-bold text-carbon-800 mt-1">{item.ocrMetrics.boundaries}</p></div>
                        </div>
                      </div>

                      <div className={`border rounded-xl p-4 bg-white ${item.fraudRisk.score > 50 ? 'border-rose-200' : 'border-forest-100'}`}>
                        <div className="flex justify-between items-center mb-3">
                          <h6 className="text-[10px] font-bold text-forest-800 uppercase tracking-wider">Fraud Risk Index</h6>
                          <span className={`text-[10px] font-black uppercase ${item.fraudRisk.score > 50 ? 'text-rose-600' : 'text-forest-600'}`}>{item.fraudRisk.level}</span>
                        </div>
                        <div className="w-full h-2 bg-carbon-50 rounded-full overflow-hidden mb-2">
                          <div className={`h-full rounded-full ${item.fraudRisk.score > 50 ? 'bg-gradient-to-r from-orange-500 to-rose-600' : 'bg-gradient-to-r from-forest-500 to-teal-500'}`}
                            style={{ width: `${item.fraudRisk.score}%` }} />
                        </div>
                        <p className={`text-xs ${item.fraudRisk.score > 50 ? 'text-rose-600' : 'text-carbon-500'}`}>{item.fraudRisk.details}</p>
                      </div>

                      {!isDraft ? (
                        <div className="grid grid-cols-2 gap-3 pt-3 border-t border-forest-100">
                          <button onClick={() => handleAction(item.id, 'reject')} className="py-3 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 transition-all text-xs font-bold flex items-center justify-center gap-1.5">
                            <XCircle className="w-4 h-4" /><span>Reject & Flag</span>
                          </button>
                          <button onClick={() => handleAction(item.id, 'approve')} className="py-3 rounded-xl bg-forest-800 text-white hover:bg-forest-900 transition-all text-xs font-bold flex items-center justify-center gap-1.5">
                            <CheckCircle className="w-4 h-4" /><span>Approve & Sync</span>
                          </button>
                        </div>
                      ) : (
                        <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl text-center text-xs text-amber-800">
                          Farmer has not submitted documents yet. Documents will appear here once KYC is completed.
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}
