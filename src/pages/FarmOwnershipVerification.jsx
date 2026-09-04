import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FileText, ShieldCheck, ArrowRight, ArrowLeft, Upload, CheckCircle2, 
  RefreshCw, Camera, AlertTriangle, Edit2, Check 
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { verifyLandDocument } from '../services/api';

export default function FarmOwnershipVerification() {
  const navigate = useNavigate();
  const { currentLang } = useLanguage();
  // Custom multi-lingual dictionary just for this page's specialized text
  const pgTrans = {
    en: {
      title: "Farm Ownership Verification",
      subtitle: "Verify your land ownership deed and satellite records under real-world ESG compliance codes.",
      landProof: "Land Ownership Proof",
      landDesc: "Pattadar passbook, survey report, 7/12 extract, or land revenue receipt.",
      dragDrop: "Drag & drop or tap to upload",
      captureCam: "Camera Capture",
      uploading: "Uploading and securing file...",
      uploadSuccess: "Upload Successful",
      ocrPreview: "AI OCR Extracted Details",
      ocrDesc: "Please review the data extracted from your documents. Correct any errors before final submission.",
      fName: "Farmer Name",
      surveyNo: "Survey Number",
      village: "Village Name",
      area: "Registered Area",
      startAiScan: "Initiate AI & Geospatial Compliance Scan",
      scanning: "Analyzing compliance protocols...",
      aiMatch: "Identity Match",
      aiOcr: "OCR Text Extraction",
      aiLand: "Land Ownership Match",
      aiGps: "GPS Consistency Check",
      aiFraud: "Fraud & Overlap Detection",
      aiComplete: "AI Verification Complete",
      statusTitle: "Compliance Audit Status",
      statusPending: "Pending Review",
      statusAiVerified: "AI Verified",
      statusManual: "Manual Review Required",
      statusRejected: "Rejected",
      statusApproved: "Approved",
      continueSuccess: "Submit for Satellite MRV Scheduling"
    },
    hi: {
      title: "कृषि भूमि स्वामित्व सत्यापन",
      subtitle: "वास्तविक वैश्विक ईएसजी अनुपालन मानकों के तहत अपने भूमि दस्तावेज और उपग्रह रिकॉर्ड को सत्यापित करें।",
      landProof: "भूमि स्वामित्व का प्रमाण",
      landDesc: "पट्टादार पासबुक, 7/12 खसरा, भूमि सर्वेक्षण रिपोर्ट, या राजस्व रसीद।",
      dragDrop: "खींचे और छोड़ें या अपलोड करने के लिए टैप करें",
      captureCam: "कैमरा से फोटो लें",
      uploading: "फाइल अपलोड और सुरक्षित की जा रही है...",
      uploadSuccess: "अपलोड सफल रहा",
      ocrPreview: "एआई ओसीआर एक्सट्रैक्टेड विवरण",
      ocrDesc: "कृपया अपने दस्तावेजों से निकाले गए डेटा की समीक्षा करें। अंतिम जमा करने से पहले गलतियों को ठीक करें।",
      fName: "किसान का नाम",
      surveyNo: "सर्वेक्षण संख्या (खसरा)",
      village: "गाँव का नाम",
      area: "पंजीकृत क्षेत्रफल",
      startAiScan: "एआई और भू-स्थानिक अनुपालन स्कैन शुरू करें",
      scanning: "अनुपालन प्रोटोकॉल का विश्लेषण किया जा रहा है...",
      aiMatch: "पहचान मिलान",
      aiOcr: "ओसीआर पाठ निष्कर्षण",
      aiLand: "भूमि स्वामित्व मिलान",
      aiGps: "जीपीएस स्थिरता जांच",
      aiFraud: "धोखाधड़ी और ओवरलैप का पता लगाना",
      aiComplete: "एआई सत्यापन पूरा हुआ",
      statusTitle: "अनुपालन ऑडिट स्थिति",
      statusPending: "लंबित समीक्षा",
      statusAiVerified: "एआई द्वारा सत्यापित",
      statusManual: "मैन्युअल समीक्षा आवश्यक",
      statusRejected: "अस्वीकृत",
      statusApproved: "स्वीकृत",
      continueSuccess: "सैटेलाइट एमआरवी शेड्यूलिंग के लिए भेजें"
    },
    te: {
      title: "వ్యవసాయ భూమి యాజమాన్య ధృవీకరణ",
      subtitle: "నిజ-ప్రపంచ ESG సమ్మతి నియమాల ప్రకారం మీ భూమి పత్రం మరియు ఉపగ్రహ రికార్డులను ధృవీకరించండి.",
      landProof: "భూమి యాజమాన్య రుజువు",
      landDesc: "పట్టాదార్ పాస్‌బుక్, సర్వే రిపోర్ట్ లేదా ల్యాండ్ రెవెన్యూ రసీదు.",
      dragDrop: "డ్రాగ్ & డ్రాప్ చేయండి లేదా అప్‌లోడ్ చేయడానికి నొక్కండి",
      captureCam: "కెమెరా క్యాప్చర్",
      uploading: "ఫైల్ అప్‌లోడ్ అవుతోంది...",
      uploadSuccess: "అప్‌లోడ్ విజయవంతమైంది",
      ocrPreview: "AI OCR సేకరించిన వివరాలు",
      ocrDesc: "దయచేసి మీ పత్రాల నుండి సేకరించిన డేటాను సమీక్షించండి. సమర్పించే ముందు తప్పులను సరిదిద్దండి.",
      fName: "రైతు పేరు",
      surveyNo: "సర్వే నంబర్",
      village: "గ్రామం పేరు",
      area: "నమోదిత వైశాల్యం",
      startAiScan: "AI & జియోస్పేషియల్ సమ్మతి స్కాన్ ప్రారంభించండి",
      scanning: "సమ్మతి ప్రోటోకాల్‌లను విశ్లేషిస్తోంది...",
      aiMatch: "గుర్తింపు సరిపోలిక",
      aiOcr: "OCR టెక్స్ట్ ఎక్స్‌ట్రాక్షన్",
      aiLand: "భూమి యాజమాన్యం మ్యాచ్",
      aiGps: "GPS అనుగుణ్యత తనిఖీ",
      aiFraud: "మోసం & అతివ్యాప్తి గుర్తింపు",
      aiComplete: "AI ధృవీకరణ పూర్తయింది",
      statusTitle: "సమ్మతి ఆడిట్ స్థితి",
      statusPending: "సమీక్ష పెండింగ్‌లో ఉంది",
      statusAiVerified: "AI ధృవీకరించబడింది",
      statusManual: "మాన్యువల్ సమీక్ష అవసరం",
      statusRejected: "తిరస్కరించబడింది",
      statusApproved: "ధృవీకరించబడింది",
      continueSuccess: "శాటిలైట్ MRV షెడ్యూలింగ్ కోసం సమర్పించు"
    }
  };

  const localT = pgTrans[currentLang] || pgTrans['en'];

  // State managers
  const [uploads, setUploads] = useState({
    land: { file: null, progress: 0, status: 'idle', name: '' },
  });
  const landFileRef = useRef(null);
  const [landDocument, setLandDocument] = useState(null);
  const [verificationResult, setVerificationResult] = useState(null);
  const [verificationError, setVerificationError] = useState('');

  const { user, farms } = useAuth();

  const [ocrData, setOcrData] = useState({
    farmerName: '',
    surveyNumber: '',
    village: '',
    area: '',
  });

  useEffect(() => {
    setOcrData({
      farmerName: user?.name || '',
      surveyNumber: '',
      village: user?.village || '',
      area: farms[0]?.area_hectares ? `${farms[0].area_hectares} Hectares` : '',
    });
  }, [user, farms]);

  const [isEditingOcr, setIsEditingOcr] = useState(false);
  const [ocrEditFields, setOcrEditFields] = useState({ ...ocrData });

  // AI scanning animation states
  const [isScanning, setIsScanning] = useState(false);
  const [scanSteps, setScanSteps] = useState([
    { key: 'aiMatch', label: localT.aiMatch, status: 'idle' },
    { key: 'aiOcr', label: localT.aiOcr, status: 'idle' },
    { key: 'aiLand', label: localT.aiLand, status: 'idle' },
    { key: 'aiGps', label: localT.aiGps, status: 'idle' },
    { key: 'aiFraud', label: localT.aiFraud, status: 'idle' },
    { key: 'aiComplete', label: localT.aiComplete, status: 'idle' },
  ]);

  // Overall compliance state
  const [complianceStatus, setComplianceStatus] = useState("Pending Review"); // Pending Review, AI Verified, Manual Review Required, Rejected, Approved
  const [scanIndex, setScanIndex] = useState(-1);

  // Sync state values on language changes
  useEffect(() => {
    setScanSteps([
      { key: 'aiMatch', label: localT.aiMatch, status: scanSteps[0].status },
      { key: 'aiOcr', label: localT.aiOcr, status: scanSteps[1].status },
      { key: 'aiLand', label: localT.aiLand, status: scanSteps[2].status },
      { key: 'aiGps', label: localT.aiGps, status: scanSteps[3].status },
      { key: 'aiFraud', label: localT.aiFraud, status: scanSteps[4].status },
      { key: 'aiComplete', label: localT.aiComplete, status: scanSteps[5].status },
    ]);
  }, [currentLang]);

  const handleResetUpload = (docKey = 'land') => {
    setUploads(prev => ({
      ...prev,
      [docKey]: { file: null, progress: 0, status: 'idle', name: '' }
    }));
    if (docKey === 'land') {
      setLandDocument(null);
      setVerificationResult(null);
      if (landFileRef.current) landFileRef.current.value = '';
    }
  };

  const handleLandFile = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) {
      setVerificationError('Choose an image smaller than 8 MB.');
      return;
    }
    setVerificationError('');
    setVerificationResult(null);
    setLandDocument(file);
    setUploads(prev => ({
      ...prev,
      land: { file, progress: 100, status: 'completed', name: file.name },
    }));
  };

  const readAsBase64 = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  // Run through scanning sequence
  const startScanningSim = async () => {
    if (!landDocument || uploads.land.status !== 'completed') {
      setVerificationError('Please upload a land record document before running verification.');
      return;
    }

    setVerificationError('');
    setIsScanning(true);
    try {
      const result = await verifyLandDocument({
        document_name: landDocument.name,
        document_content_base64: await readAsBase64(landDocument),
        survey_number: ocrData.surveyNumber,
        village: ocrData.village,
      });
      if (!result.success) throw new Error(result.message || 'Verification request failed.');
      setVerificationResult(result);
      setScanIndex(0);
      setComplianceStatus('Pending Review');
      setScanSteps(prev => prev.map(step => ({ ...step, status: 'loading' })));
    } catch (error) {
      setIsScanning(false);
      setVerificationError(error.message || 'Could not connect to the verification service.');
    }
  };

  useEffect(() => {
    if (scanIndex === -1 || !isScanning) return;

    if (scanIndex < scanSteps.length) {
      const timer = setTimeout(() => {
        setScanSteps(prev => {
          const next = [...prev];
          next[scanIndex].status = 'completed';
          return next;
        });
        setScanIndex(prev => prev + 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      // Completed scanning!
      setIsScanning(false);
      const verified = verificationResult?.status === 'VERIFIED';
      setComplianceStatus(verified ? 'AI Verified' : 'Manual Review Required');
      if (verified) localStorage.setItem('carbonx_farmer_docs_verified', 'true');
    }
  }, [scanIndex, isScanning, scanSteps.length, verificationResult]);

  const saveOcrChanges = () => {
    setOcrData({ ...ocrEditFields });
    setIsEditingOcr(false);
  };

  return (
    <div className="min-h-screen bg-warm-white text-carbon-900 font-inter pb-24">
      {/* Sticky Onboarding Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-forest-100/50 py-4 px-6 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/farm-details')} className="p-2 hover:bg-forest-50 rounded-xl text-carbon-600 transition-all">
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="font-manrope font-extrabold text-lg text-forest-800 tracking-tight">
              {localT.title}
            </h1>
            <p className="text-[10px] text-carbon-400">{localT.subtitle}</p>
          </div>
        </div>
        
        {/* Verification Status Banner */}
        <div className="flex items-center gap-2 bg-forest-50 border border-forest-100 px-3 py-1.5 rounded-full shadow-sm">
          <span className="text-[9px] font-bold text-carbon-500 uppercase">{localT.statusTitle}:</span>
          <span className={`text-[10px] font-bold uppercase inline-flex items-center gap-1.5 ${
            complianceStatus === 'Approved' ? 'text-profit font-black' :
            complianceStatus === 'AI Verified' ? 'text-blue-600 font-bold' :
            complianceStatus === 'Manual Review Required' ? 'text-amber-600' :
            complianceStatus === 'Rejected' ? 'text-rose-600' : 'text-carbon-500'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${
              complianceStatus === 'Approved' ? 'bg-profit' :
              complianceStatus === 'AI Verified' ? 'bg-blue-600 animate-ping' :
              complianceStatus === 'Manual Review Required' ? 'bg-amber-500 animate-pulse' :
              complianceStatus === 'Rejected' ? 'bg-rose-500' : 'bg-carbon-400'
            }`}></span>
            {complianceStatus === 'Pending Review' ? localT.statusPending :
             complianceStatus === 'AI Verified' ? localT.statusAiVerified :
             complianceStatus === 'Manual Review Required' ? localT.statusManual :
             complianceStatus === 'Rejected' ? localT.statusRejected : localT.statusApproved}
          </span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 mt-6 space-y-6">
        
        {/* Onboarding Journey Stepper */}
        <div className="bg-white border border-forest-100 rounded-2xl p-4 shadow-sm">
          <div className="flex flex-wrap items-center justify-between text-xs gap-2 mb-2.5">
            <span className="font-bold text-forest-700 flex items-center gap-1.5">
              <CheckCircle2 size={15} className="text-emerald-600" />
              1. Profile & Aadhaar
            </span>
            <span className="font-bold text-forest-900 flex items-center gap-1.5 bg-forest-100 px-3 py-1 rounded-full border border-forest-200 shadow-sm">
              <ShieldCheck size={15} className="text-forest-700" />
              2. Land Verification (Current)
            </span>
            <span className="font-semibold text-carbon-400 flex items-center gap-1.5">
              3. Satellite Boundary Map
            </span>
            <span className="font-semibold text-carbon-400 flex items-center gap-1.5">
              4. Carbon Dashboard
            </span>
          </div>
          <div className="w-full bg-forest-100 h-2 rounded-full overflow-hidden">
            <div className="bg-forest-700 h-full rounded-full transition-all duration-500" style={{ width: '50%' }}></div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Upload Columns */}
          <div className="space-y-4">
          
          {/* Dedicated Land Ownership Document Card */}
          <div className="bg-white border border-forest-100 rounded-[28px] p-6 shadow-sm space-y-5">
            <input ref={landFileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleLandFile} />
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-carbon-800 flex items-center gap-2">
                  📜 {localT.landProof}
                </h3>
                <p className="text-xs text-carbon-400">{localT.landDesc}</p>
              </div>
              {uploads.land.status === 'completed' && (
                <span className="bg-emerald-100 text-emerald-800 text-[9px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider">Ready</span>
              )}
            </div>

            {uploads.land.status === 'idle' ? (
              <div className="grid grid-cols-2 gap-3.5">
                <button 
                  onClick={() => landFileRef.current?.click()}
                  className="border-2 border-dashed border-forest-200 hover:border-forest-400 rounded-2xl p-5 flex flex-col items-center justify-center text-center gap-2 hover:bg-forest-50/20 transition-all group cursor-pointer"
                >
                  <Upload size={22} className="text-forest-600 group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-semibold text-carbon-600">{localT.dragDrop}</span>
                  <span className="text-[10px] text-carbon-400">JPG, PNG, WebP up to 8 MB</span>
                </button>
                <button 
                  onClick={() => landFileRef.current?.click()}
                  className="border border-forest-100 hover:border-forest-200 bg-forest-50/40 rounded-2xl p-5 flex flex-col items-center justify-center text-center gap-2 hover:bg-forest-50 transition-all group cursor-pointer"
                >
                  <Camera size={22} className="text-forest-700 group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-semibold text-carbon-700">{localT.captureCam}</span>
                  <span className="text-[10px] text-carbon-400">Camera capture photo</span>
                </button>
              </div>
            ) : (
              <div className="bg-forest-50/50 border border-forest-100 rounded-2xl p-4 flex justify-between items-center">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 bg-white border border-forest-100 rounded-xl flex items-center justify-center text-forest-700 shadow-sm">
                    <FileText size={22} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-carbon-800 truncate max-w-[200px]">{uploads.land.name}</p>
                    <p className="text-[10px] text-emerald-600 font-medium">
                      {uploads.land.status === 'uploading' ? `${uploads.land.progress}%` : localT.uploadSuccess}
                    </p>
                  </div>
                </div>
                {uploads.land.status === 'uploading' ? (
                  <div className="w-8 h-8 rounded-full border-2 border-forest-100 border-t-forest-700 animate-spin"></div>
                ) : (
                  <button onClick={() => handleResetUpload('land')} className="p-2 hover:bg-forest-100 rounded-xl text-rose-500 transition-colors" title="Change Document">
                    <RefreshCw size={16} />
                  </button>
                )}
              </div>
            )}

            {/* Document Guidelines & Accepted Records */}
            <div className="bg-forest-50/40 border border-forest-100/60 rounded-2xl p-4 text-[11px] text-carbon-500 space-y-2">
              <p className="font-semibold text-forest-800 flex items-center gap-1.5">
                <ShieldCheck size={14} className="text-forest-600" />
                Accepted Government Land Documents:
              </p>
              <ul className="list-disc pl-4 space-y-1 text-[10px] text-carbon-500">
                <li>Pattadar Passbook / Dharani / MeeSeva Record</li>
                <li>7/12 Extract / Khasra / Khatauni / Jamabandi</li>
                <li>Registered Land Revenue Tax Receipt or Registered Deed</li>
              </ul>
            </div>
          </div>

        </div>

        {/* AI verification & OCR Column */}
        <div className="space-y-6">
          
          {/* AI Scanners Screen */}
          <div className="bg-carbon-900 border border-carbon-800 text-white rounded-[32px] p-5 shadow-2xl space-y-5 relative overflow-hidden">
            <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#059669_1px,transparent_1px),linear-gradient(to_bottom,#059669_1px,transparent_1px)] [background-size:20px_20px]"></div>
            
            <div className="relative z-10 flex justify-between items-center border-b border-carbon-800 pb-3">
              <span className="text-xs font-bold text-emerald-400 tracking-wider uppercase font-mono">🤖 ISRO AI Compliance Scan Engine</span>
              <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-mono font-bold animate-pulse">● Live</span>
            </div>

            {/* Checklist */}
            <div className="relative z-10 space-y-3">
              {scanSteps.map((step, idx) => {
                const isActive = isScanning && idx === scanIndex;
                const isComplete = step.status === 'completed' || (!isScanning && scanIndex > idx);
                return (
                  <div 
                    key={step.key}
                    className={`flex items-center justify-between p-3 rounded-2xl border transition-all duration-200 ${
                      isActive ? 'bg-emerald-950/40 border-emerald-500 text-emerald-300' :
                      isComplete ? 'bg-emerald-950/20 border-emerald-900/40 text-emerald-400/80' :
                      'bg-black/20 border-carbon-800/40 text-carbon-400'
                    }`}
                  >
                    <span className="text-xs font-semibold font-mono flex items-center gap-2">
                      {isComplete ? (
                        <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />
                      ) : isActive ? (
                        <RefreshCw size={15} className="text-emerald-400 animate-spin shrink-0" />
                      ) : (
                        <span className="w-2.5 h-2.5 rounded-full bg-carbon-700 shrink-0"></span>
                      )}
                      {step.label}
                    </span>
                    <span className="text-[10px] font-bold font-mono">
                      {isComplete ? "SUCCESS" : isActive ? "SCANNING" : "WAITING"}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Action launcher */}
            <button
              onClick={startScanningSim}
              disabled={isScanning || complianceStatus === "AI Verified"}
              className={`w-full py-4 rounded-2xl text-xs font-extrabold font-poppins flex items-center justify-center gap-2 shadow-lg transition-all relative z-10 ${
                complianceStatus === "AI Verified" 
                  ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 cursor-not-allowed'
                  : 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white hover:shadow-emerald-500/10'
              }`}
            >
              {isScanning ? (
                <>
                  <RefreshCw size={16} className="animate-spin" />
                  <span>{localT.scanning}</span>
                </>
              ) : complianceStatus === "AI Verified" ? (
                <>
                  <ShieldCheck size={16} />
                  <span>{localT.aiComplete}</span>
                </>
              ) : (
                <>
                  <ShieldCheck size={16} />
                  <span>{localT.startAiScan}</span>
                </>
              )}
            </button>
            {verificationError && <p className="relative z-10 text-[10px] text-rose-300">{verificationError}</p>}
            {verificationResult && (
              <div className={`relative z-10 rounded-2xl border p-3 text-[10px] ${verificationResult.status === 'VERIFIED' ? 'border-emerald-500/40 bg-emerald-950/30 text-emerald-200' : 'border-amber-500/40 bg-amber-950/30 text-amber-100'}`}>
                <p className="font-bold">{verificationResult.status === 'VERIFIED' ? 'VERIFIED' : 'FLAGGED'} — stored against your farmer profile.</p>
                {verificationResult.reasons?.length > 0 && <ul className="mt-1 list-disc pl-4 space-y-0.5">{verificationResult.reasons.map(reason => <li key={reason}>{reason}</li>)}</ul>}
              </div>
            )}
          </div>

          {/* OCR Extracted Details Panel */}
          <div className="bg-white border border-forest-100 rounded-[32px] p-5 shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b border-forest-50 pb-2">
              <div>
                <h3 className="text-xs font-bold text-carbon-800">{localT.ocrPreview}</h3>
                <p className="text-[9px] text-carbon-400">{localT.ocrDesc}</p>
              </div>
              <button 
                onClick={() => {
                  if (isEditingOcr) {
                    saveOcrChanges();
                  } else {
                    setOcrEditFields({ ...ocrData });
                    setIsEditingOcr(true);
                  }
                }}
                className="p-2 bg-forest-50 hover:bg-forest-100 rounded-xl text-forest-800 transition-colors flex items-center gap-1 text-[10px] font-bold"
              >
                {isEditingOcr ? <Check size={14} /> : <Edit2 size={12} />}
                <span>{isEditingOcr ? "Save" : "Edit"}</span>
              </button>
            </div>

            <div className="space-y-2.5">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <span className="font-semibold text-carbon-500">{localT.fName}</span>
                {isEditingOcr ? (
                  <input 
                    type="text" 
                    value={ocrEditFields.farmerName} 
                    onChange={e => setOcrEditFields({...ocrEditFields, farmerName: e.target.value})}
                    className="p-1 text-[11px] font-bold border border-forest-200 rounded-lg focus:ring-0 focus:border-forest-400"
                  />
                ) : (
                  <span className="font-extrabold text-carbon-800">{ocrData.farmerName}</span>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-xs">
                <span className="font-semibold text-carbon-500">{localT.surveyNo}</span>
                {isEditingOcr ? (
                  <input 
                    type="text" 
                    value={ocrEditFields.surveyNumber} 
                    onChange={e => setOcrEditFields({...ocrEditFields, surveyNumber: e.target.value})}
                    className="p-1 text-[11px] font-bold border border-forest-200 rounded-lg focus:ring-0 focus:border-forest-400"
                  />
                ) : (
                  <span className="font-extrabold text-carbon-800">{ocrData.surveyNumber}</span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <span className="font-semibold text-carbon-500">{localT.village}</span>

                {isEditingOcr ? (
                  <input 
                    type="text" 
                    value={ocrEditFields.village} 
                    onChange={e => setOcrEditFields({...ocrEditFields, village: e.target.value})}
                    className="p-1 text-[11px] font-bold border border-forest-200 rounded-lg focus:ring-0 focus:border-forest-400"
                  />
                ) : (
                  <span className="font-extrabold text-carbon-800">{ocrData.village}</span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <span className="font-semibold text-carbon-500">{localT.area}</span>
                {isEditingOcr ? (
                  <input 
                    type="text" 
                    value={ocrEditFields.area} 
                    onChange={e => setOcrEditFields({...ocrEditFields, area: e.target.value})}
                    className="p-1 text-[11px] font-bold border border-forest-200 rounded-lg focus:ring-0 focus:border-forest-400"
                  />
                ) : (
                  <span className="font-extrabold text-carbon-800">{ocrData.area}</span>
                )}
              </div>
            </div>

            {/* Quick Admin Role Status Control Box (For investor demonstration) */}
            <div className="mt-4 pt-4 border-t border-forest-50/80 bg-amber-50/40 border border-amber-200/40 rounded-2xl p-3 space-y-2">
              <div className="flex items-center gap-1.5 text-amber-800">
                <AlertTriangle size={13} className="shrink-0" />
                <span className="text-[9px] font-bold uppercase tracking-wider">Demo Override Control</span>
              </div>
              <p className="text-[9px] text-amber-700 leading-tight">Force audit states for presentation and sandbox checks:</p>
              <div className="grid grid-cols-3 gap-1.5 text-[9px] font-bold">
                <button 
                  onClick={() => setComplianceStatus("Manual Review Required")}
                  className={`py-1 rounded border transition-colors ${complianceStatus === 'Manual Review Required' ? 'bg-amber-500 text-white border-amber-500' : 'bg-white hover:bg-amber-50 text-amber-700 border-amber-200'}`}
                >
                  Require Review
                </button>
                <button 
                  onClick={() => setComplianceStatus("Rejected")}
                  className={`py-1 rounded border transition-colors ${complianceStatus === 'Rejected' ? 'bg-rose-500 text-white border-rose-500' : 'bg-white hover:bg-rose-50 text-rose-700 border-rose-200'}`}
                >
                  Force Reject
                </button>
                <button 
                  onClick={() => {
                    setComplianceStatus("Approved");
                    localStorage.setItem('carbonx_farmer_docs_verified', 'true');
                  }}
                  className={`py-1 rounded border transition-colors ${complianceStatus === 'Approved' ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white hover:bg-emerald-50 text-emerald-800 border-emerald-200'}`}
                >
                  Force Approve
                </button>
              </div>
            </div>
          </div>

          {/* Continue / Next Steps buttons */}
          {(complianceStatus === "AI Verified" || complianceStatus === "Approved") && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-2 pt-2"
            >
              <button
                onClick={() => navigate('/farm-map')}
                className="w-full bg-forest-800 hover:bg-forest-900 text-white text-xs font-bold font-poppins py-4 rounded-2xl shadow-lg hover:shadow-premium transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Proceed to Farmland Boundary Mapping (Step 3)</span>
                <ArrowRight size={15} />
              </button>

              <button
                onClick={() => navigate('/verification-success')}
                className="w-full py-2.5 text-center text-xs font-semibold text-forest-700 hover:text-forest-900 hover:underline"
              >
                View Satellite Revisit Timeline
              </button>
            </motion.div>
          )}

        </div>

        </div>

      </main>
    </div>
  );
}
