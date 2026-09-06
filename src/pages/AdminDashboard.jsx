import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldAlert, 
  CheckCircle, 
  XCircle, 
  Activity, 
  Map, 
  Layers, 
  AlertTriangle, 
  DollarSign, 
  Cpu, 
  TrendingUp, 
  Database,
  ChevronDown,
  ChevronUp,
  FileText,
  MapPin,
  Building,
  UserCheck,
  ArrowLeft,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';


export default function AdminDashboard() {
  const navigate = useNavigate();
  const [queue, setQueue] = useState([]);
  const [revenue, setRevenue] = useState({ totalVolume: 0, blockchainGasAverage: '0.001 ETH' });
  const [approvedCount, setApprovedCount] = useState(0);
  const [activeDetections, setActiveDetections] = useState(0);
  const [expandedId, setExpandedId] = useState(null);

  // Load and enrich the manual review queue
  useEffect(() => {
    const rameshVerified = localStorage.getItem('carbonx_farmer_docs_verified') === 'true';

    const baseQueue = [
      {
        id: "q1",
        farmer: "K. Ranga Rao",
        farm: "Nalgonda Paddy Farm",
        area: "3.5 Ha",
        confidence: "94.2%",
        date: "20 May 2026",
        status: "Needs Review",
        documents: {
          aadhaar: "aadhaar_ranga_rao.jpg",
          aadhaarMatch: "94.2%",
          deed: "pattadar_deed_nalgonda.pdf",
          deedNo: "8829/2022",
          bank: "sbi_cheque_ranga.jpg",
          upiId: "ranga.rao@oksbi",
          cropPhotos: "paddy_field_geotag.jpg",
          gps: "17.1512 N, 79.1623 E"
        },
        ocrMetrics: {
          nameMatch: "94.2% (Matches Database)",
          surveyMatch: "98.5% (Match)",
          boundaries: "Aligns with Nalgonda Revenue Map boundaries"
        },
        fraudRisk: {
          level: "Low Risk",
          score: 8,
          details: "Zero overlapping claims registered. Clean historical agricultural usage."
        }
      },
      {
        id: "q2",
        farmer: "M. Chennappa",
        farm: "Mahbubnagar Cotton Cluster",
        area: "4.8 Ha",
        confidence: "81.5%",
        date: "19 May 2026",
        status: "Flagged (NDVI Divergence)",
        documents: {
          aadhaar: "aadhaar_chennappa.jpg",
          aadhaarMatch: "81.5% (Typo in surname)",
          deed: "deed_mahbubnagar_cotton.pdf",
          deedNo: "9901/2021",
          bank: "cbi_passbook.jpg",
          upiId: "chennappa@okaxis",
          cropPhotos: "cotton_geotag.jpg",
          gps: "16.7321 N, 78.0054 E"
        },
        ocrMetrics: {
          nameMatch: "81.5% (Deed lists 'M. Chennaiah' vs Aadhaar 'M. Chennappa')",
          surveyMatch: "91.2% (Plot dimensions differ by 12%)",
          boundaries: "Boundary buffer overlaps adjacent forestry plot by 0.12 Hectares"
        },
        fraudRisk: {
          level: "High Risk",
          score: 81,
          details: "CRITICAL: NDVI curve shows active deforestation indicators. High boundary overlap with state reserve forest."
        }
      },
      {
        id: "q3",
        farmer: "P. Lakshmi",
        farm: "Khammam Agroforestry Plot",
        area: "2.1 Ha",
        confidence: "98.9%",
        date: "19 May 2026",
        status: "Pending Verification",
        documents: {
          aadhaar: "aadhaar_lakshmi.jpg",
          aadhaarMatch: "98.9%",
          deed: "khammam_deed_882.pdf",
          deedNo: "1240/2023",
          bank: "hdfc_passbook.jpg",
          upiId: "lakshmi.p@okhdfc",
          cropPhotos: "teak_geotag.jpg",
          gps: "17.2452 N, 80.1425 E"
        },
        ocrMetrics: {
          nameMatch: "98.9% (Perfect match)",
          surveyMatch: "99.8% (Exact Cadastral Index matches)",
          boundaries: "Perfect containment within cadastral survey"
        },
        fraudRisk: {
          level: "Low Risk",
          score: 4,
          details: "Verified permanent teak plantation canopy. Strong carbon storage profile."
        }
      }
    ];

    const rameshItem = {
      id: "q_ramesh",
      farmer: "Ramesh Kumar",
      farm: "North Grove Plot",
      area: "4.28 Ha",
      confidence: "99.4%",
      date: "21 May 2026",
      status: rameshVerified ? "Needs Review" : "Draft Uploads Awaiting Onboarding",
      documents: {
        aadhaar: "aadhaar_ramesh_kumar.jpg",
        aadhaarMatch: "99.4% (Perfect)",
        deed: "pattadar_passbook_scan.pdf",
        deedNo: "184/A/2",
        bank: "upi_verification.jpg",
        upiId: "ramesh.kumar@oksbi",
        cropPhotos: "geotagged_rice_field.jpg",
        gps: "17.9620 N, 79.5982 E"
      },
      ocrMetrics: {
        nameMatch: "99.4% (Aadhaar & Bank KYC Match)",
        surveyMatch: "99.2% (Survey Number 184/A/2 matches Bhuvan DB)",
        boundaries: "Coherent boundary maps with zero buffer leakage"
      },
      fraudRisk: {
        level: "Low Risk",
        score: 2,
        details: "Zero double-selling indicators. Landsat NDVI history confirms 100% active paddy sequence since 2023."
      }
    };

    setQueue([rameshItem, ...baseQueue]);
  }, []);

  const handleAction = (id, type) => {
    if (type === 'approve') {
      setApprovedCount(prev => prev + 1);
      setQueue(prev => prev.filter(q => q.id !== id));
      if (id === 'q_ramesh') {
        localStorage.setItem('carbonx_farmer_docs_verified', 'approved');
      }
    } else if (type === 'reject') {
      setActiveDetections(prev => Math.max(0, prev - 1));
      setQueue(prev => prev.filter(q => q.id !== id));
      if (id === 'q_ramesh') {
        localStorage.setItem('carbonx_farmer_docs_verified', 'rejected');
      }
    }
    setExpandedId(null);
  };

  const toggleExpand = (id) => {
    setExpandedId(prev => prev === id ? null : id);
  };

  return (
    <div className="pb-24 px-4 pt-6 max-w-4xl mx-auto">
      
      {/* Top Title Bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6 bg-white p-4 rounded-2xl border border-forest-100 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center font-bold">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] text-carbon-400 font-bold uppercase tracking-wider">Compliance Console</span>
            <h1 className="text-lg font-extrabold text-forest-800">Verification & Governance</h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] bg-rose-50 text-rose-600 border border-rose-100 px-3 py-1 rounded-full font-bold uppercase tracking-wider">
            Verifier Access
          </span>
        </div>
      </div>

      {/* Main Admin Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-5 rounded-2xl border border-forest-100 shadow-sm">
          <span className="text-[9px] text-carbon-400 font-bold tracking-wider uppercase">Farms Approved</span>
          <h3 className="text-3xl font-black text-forest-800 mt-1">{approvedCount.toLocaleString()}</h3>
          <p className="text-[10px] text-emerald-600 font-bold mt-1.5 flex items-center gap-1">
            <ShieldCheck size={12} /> Smart Contracts Issued
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-rose-100 shadow-sm">
          <span className="text-[9px] text-rose-500 font-bold tracking-wider uppercase flex items-center gap-1">
            <AlertTriangle size={11} /> Active Flags
          </span>
          <h3 className="text-3xl font-black text-rose-600 mt-1">{activeDetections}</h3>
          <p className="text-[10px] text-rose-500 font-medium mt-1.5">Sentinel Alert Active</p>
        </div>

        <div className="bg-forest-900 text-white p-5 rounded-2xl shadow-sm relative overflow-hidden">
          <span className="text-[9px] text-forest-300 font-bold tracking-wider uppercase flex items-center gap-1">
            <Cpu className="w-3.5 h-3.5" /> Market Volume
          </span>
          <h3 className="text-3xl font-black text-emerald-300 mt-1">{revenue.totalVolume}</h3>
          <p className="text-[10px] text-forest-300 font-medium mt-1.5">Avg Gas: {revenue.blockchainGasAverage}</p>
        </div>
      </div>

      {/* Verification Queue header */}
      <div className="flex items-center justify-between mb-4 px-1">
        <h4 className="text-xs font-bold text-carbon-500 uppercase tracking-wider">Review Queue ({queue.length})</h4>
        <span className="text-[9px] bg-forest-50 border border-forest-100 text-forest-800 px-3 py-1 rounded-full font-bold">
          OCR V2.4 · GIS-ALIGN 98%
        </span>
      </div>

      {/* Verification cards list */}
      <div className="space-y-4">
        {queue.length === 0 ? (
          <div className="p-12 bg-white rounded-2xl text-center border border-forest-100 text-carbon-500 text-sm shadow-sm">
            <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
            <p className="font-bold">Review Queue is Clear</p>
            <p className="text-xs text-carbon-400 mt-1">All farm plots verified and mapped.</p>
          </div>
        ) : (
          queue.map((item) => {
            const isFlagged = item.status.includes('Flagged');
            const isDraft = item.status.includes('Draft');
            const isExpanded = expandedId === item.id;
            
            return (
              <div
                key={item.id}
                className={`bg-white rounded-2xl border shadow-sm transition-all duration-300 overflow-hidden ${
                  isExpanded ? 'ring-2 ring-forest-400 border-forest-300 shadow-md' : 
                  isFlagged ? 'border-rose-200 hover:border-rose-300' : 'border-forest-100 hover:border-forest-200'
                }`}
              >
                {/* Header Summary */}
                <div 
                  onClick={() => toggleExpand(item.id)}
                  className="p-5 flex justify-between items-center cursor-pointer select-none"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h5 className="text-sm font-extrabold text-carbon-800">{item.farm}</h5>
                      {item.id === 'q_ramesh' && (
                        <span className="bg-emerald-100 text-emerald-800 text-[8px] font-extrabold px-1.5 py-0.2 rounded-full uppercase">Your Farmer</span>
                      )}
                    </div>
                    <p className="text-xs text-carbon-400">
                      Farmer: <span className="font-bold text-carbon-700">{item.farmer}</span> · Area: <span className="font-bold text-carbon-700">{item.area}</span> · {item.date}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`text-[9px] px-2.5 py-1 rounded-full font-bold uppercase ${
                      isFlagged ? 'bg-rose-100 text-rose-800 border border-rose-200' : 
                      isDraft ? 'bg-amber-100 text-amber-800 border border-amber-200' : 
                      'bg-forest-50 text-forest-800 border border-forest-100'
                    }`}>
                      {item.status}
                    </span>
                    {isExpanded ? <ChevronUp size={16} className="text-carbon-400" /> : <ChevronDown size={16} className="text-carbon-400" />}
                  </div>
                </div>

                {/* Collapsed short stats bar */}
                {!isExpanded && (
                  <div className="px-5 pb-5 grid grid-cols-3 gap-2 text-xs border-t border-forest-50 pt-3">
                    <div>
                      <span className="text-[9px] uppercase tracking-wider text-carbon-400 font-bold">OCR Confidence</span>
                      <p className={`font-bold mt-0.5 ${isFlagged ? 'text-rose-600' : 'text-emerald-600'}`}>{item.confidence}</p>
                    </div>
                    <div>
                      <span className="text-[9px] uppercase tracking-wider text-carbon-400 font-bold">Risk Profile</span>
                      <p className={`font-bold mt-0.5 ${item.fraudRisk.score > 50 ? 'text-rose-600' : 'text-emerald-600'}`}>
                        {item.fraudRisk.level} ({item.fraudRisk.score}%)
                      </p>
                    </div>
                    <div>
                      <span className="text-[9px] uppercase tracking-wider text-carbon-400 font-bold">Action</span>
                      <p className="font-semibold text-forest-600 mt-0.5">Click to audit docs</p>
                    </div>
                  </div>
                )}

                {/* Expanded Detailed Audit Panel */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div 
                      initial={{ height: 0 }}
                      animate={{ height: 'auto' }}
                      exit={{ height: 0 }}
                      className="border-t border-forest-100 bg-forest-50/20"
                    >
                      <div className="p-5 space-y-5">
                        
                        {/* Section 1: Uploaded Compliance Proofs */}
                        <div className="space-y-2">
                          <h6 className="text-[10px] font-bold text-forest-800 uppercase tracking-wider">
                            Uploaded Compliance Documents
                          </h6>
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                            <div className="bg-white border border-forest-100 p-3 rounded-xl flex flex-col justify-between h-24">
                              <span className="text-[9px] font-bold text-carbon-400">Aadhaar Card KYC</span>
                              <div className="flex items-center gap-1.5 text-xs text-forest-800 font-bold">
                                <FileText size={14} className="text-forest-600" />
                                <span className="truncate max-w-[120px]">{item.documents.aadhaar}</span>
                              </div>
                              <span className="text-[8px] bg-emerald-50 text-emerald-800 px-1.5 py-0.5 rounded font-mono font-bold self-start mt-1">
                                OCR: {item.documents.aadhaarMatch}
                              </span>
                            </div>

                            <div className="bg-white border border-forest-100 p-3 rounded-xl flex flex-col justify-between h-24">
                              <span className="text-[9px] font-bold text-carbon-400">Pattadar Land Deed</span>
                              <div className="flex items-center gap-1.5 text-xs text-forest-800 font-bold">
                                <FileText size={14} className="text-forest-600" />
                                <span className="truncate max-w-[120px]">{item.documents.deed}</span>
                              </div>
                              <span className="text-[8px] bg-forest-50 text-forest-800 px-1.5 py-0.5 rounded font-mono font-bold self-start mt-1">
                                DEED: {item.documents.deedNo}
                              </span>
                            </div>

                            <div className="bg-white border border-forest-100 p-3 rounded-xl flex flex-col justify-between h-24">
                              <span className="text-[9px] font-bold text-carbon-400">Bank / UPI Verification</span>
                              <div className="flex items-center gap-1.5 text-xs text-forest-800 font-bold">
                                <Building size={14} className="text-forest-600" />
                                <span className="truncate max-w-[120px]">{item.documents.upiId}</span>
                              </div>
                              <span className="text-[8px] bg-emerald-50 text-emerald-800 px-1.5 py-0.5 rounded font-mono font-bold self-start mt-1">
                                UPI VERIFIED
                              </span>
                            </div>

                            <div className="bg-white border border-forest-100 p-3 rounded-xl flex flex-col justify-between h-24">
                              <span className="text-[9px] font-bold text-carbon-400">Geo-Tagged Crop Images</span>
                              <div className="flex items-center gap-1.5 text-xs text-forest-800 font-bold">
                                <MapPin size={14} className="text-forest-600" />
                                <span className="truncate max-w-[120px]">{item.documents.cropPhotos}</span>
                              </div>
                              <span className="text-[8px] bg-blue-50 text-blue-800 px-1.5 py-0.5 rounded font-mono font-bold self-start mt-1 truncate max-w-[150px]">
                                GPS: {item.documents.gps}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Section 2: AI OCR Log Comparer */}
                        <div className="bg-white border border-forest-100 rounded-xl p-4 space-y-3">
                          <h6 className="text-[10px] font-bold text-forest-800 uppercase tracking-wider">
                            AI OCR Extraction Results
                          </h6>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                            <div className="bg-forest-50/40 p-2.5 rounded-xl border border-forest-100">
                              <span className="text-[8px] uppercase tracking-wider text-carbon-400 font-bold">Aadhaar Identity Match</span>
                              <p className="font-extrabold text-carbon-800 mt-1">{item.ocrMetrics.nameMatch}</p>
                            </div>
                            <div className="bg-forest-50/40 p-2.5 rounded-xl border border-forest-100">
                              <span className="text-[8px] uppercase tracking-wider text-carbon-400 font-bold">Survey Registry Match</span>
                              <p className="font-extrabold text-carbon-800 mt-1">{item.ocrMetrics.surveyMatch}</p>
                            </div>
                            <div className="bg-forest-50/40 p-2.5 rounded-xl border border-forest-100">
                              <span className="text-[8px] uppercase tracking-wider text-carbon-400 font-bold">GIS Coordinate Overlaps</span>
                              <p className="font-extrabold text-carbon-800 mt-1">{item.ocrMetrics.boundaries}</p>
                            </div>
                          </div>
                        </div>

                        {/* Section 3: Fraud Risk Meter */}
                        <div className={`border rounded-xl p-4 space-y-3 bg-white ${
                          item.fraudRisk.score > 50 ? 'border-rose-200' : 'border-forest-100'
                        }`}>
                          <div className="flex justify-between items-center">
                            <h6 className="text-[10px] font-bold text-forest-800 uppercase tracking-wider">
                              Satellite Biomass & Fraud Index
                            </h6>
                            <span className={`text-[10px] font-black uppercase ${
                              item.fraudRisk.score > 50 ? 'text-rose-600' : 'text-emerald-600'
                            }`}>
                              {item.fraudRisk.level}
                            </span>
                          </div>

                          {/* Risk Meter Bar */}
                          <div className="space-y-1">
                            <div className="w-full h-2 bg-carbon-100 rounded-full overflow-hidden">
                              <div 
                                className={`h-full rounded-full transition-all duration-500 ${
                                  item.fraudRisk.score > 50 ? 'bg-gradient-to-r from-orange-500 to-rose-600' : 'bg-gradient-to-r from-emerald-500 to-teal-500'
                                }`}
                                style={{ width: `${item.fraudRisk.score}%` }}
                              />
                            </div>
                            <div className="flex justify-between text-[9px] text-carbon-400 font-bold font-mono">
                              <span>LOW (0%)</span>
                              <span>MID (50%)</span>
                              <span>HIGH (100%)</span>
                            </div>
                          </div>

                          <p className={`text-xs leading-relaxed ${
                            item.fraudRisk.score > 50 ? 'text-rose-600 bg-rose-50/30 p-2.5 rounded-xl border border-rose-100 font-medium' : 'text-carbon-500'
                          }`}>
                            {item.fraudRisk.score > 50 ? 'ALERT: ' : 'OK: '}{item.fraudRisk.details}
                          </p>
                        </div>

                        {/* Quick Action buttons */}
                        {!isDraft && (
                          <div className="grid grid-cols-2 gap-3 pt-3 border-t border-forest-100">
                            <button
                              onClick={() => handleAction(item.id, 'reject')}
                              className="py-3 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 transition-all text-xs font-bold flex items-center justify-center gap-1.5"
                            >
                              <XCircle className="w-4 h-4 shrink-0" />
                              <span>Reject & Flag</span>
                            </button>

                            <button
                              onClick={() => handleAction(item.id, 'approve')}
                              className="py-3 rounded-xl bg-forest-800 text-white hover:bg-forest-900 transition-all text-xs font-bold flex items-center justify-center gap-1.5"
                            >
                              <CheckCircle className="w-4 h-4 shrink-0" />
                              <span>Approve & Sync Ledger</span>
                            </button>
                          </div>
                        )}

                        {isDraft && (
                          <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl text-center text-xs text-amber-800 font-medium leading-relaxed">
                            Farmer has not submitted documents yet. Documents will appear here once KYC verification is completed.
                          </div>
                        )}

                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
