import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, ShieldCheck, ArrowRight, ArrowLeft, Upload, CheckCircle2, 
  RefreshCw, Camera, AlertTriangle, Eye, Edit2, Check, Landmark 
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';

export default function FarmOwnershipVerification() {
  const navigate = useNavigate();
  const { currentLang, t } = useLanguage();
  
  // Custom multi-lingual dictionary just for this page's specialized text
  const pgTrans = {
    en: {
      title: "Farm Ownership Verification",
      subtitle: "Verify your land deed, identity and bank account under real-world ESG compliance codes.",
      aadhaarCard: "Aadhaar Card Verification",
      aadhaarDesc: "Front + Back copy for Aadhaar KYC match.",
      landProof: "Land Ownership Proof",
      landDesc: "Pattadar passbook, survey report, or land revenue receipt.",
      bankProof: "Bank Account & UPI Verification",
      bankDesc: "Bank passbook, cancelled cheque, or instant UPI check.",
      geoPhotos: "Optional Geo-Tagged Farm Images",
      geoPhotosDesc: "Upload real-world crop pictures embedded with GPS coordinates.",
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
      aadhaarMatch: "Aadhaar UID Match Score",
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
      subtitle: "वास्तविक वैश्विक ईएसजी अनुपालन मानकों के तहत अपने भूमि दस्तावेज, पहचान और बैंक खाते को सत्यापित करें।",
      aadhaarCard: "आधार कार्ड सत्यापन",
      aadhaarDesc: "आधार केवाईसी मिलान के लिए आगे और पीछे की प्रति।",
      landProof: "भूमि स्वामित्व का प्रमाण",
      landDesc: "पट्टादार पासबुक, भूमि सर्वेक्षण रिपोर्ट, या राजस्व रसीद।",
      bankProof: "बैंक खाता और यूपीआई सत्यापन",
      bankDesc: "बैंक पासबुक, रद्द चेक, या तत्काल यूपीआई सत्यापन।",
      geoPhotos: "वैकल्पिक जियो-टैग की गई तस्वीरें",
      geoPhotosDesc: "जीपीएस निर्देशांक से लैस वास्तविक फसल की तस्वीरें अपलोड करें।",
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
      aadhaarMatch: "आधार यूआईडी मिलान स्कोर",
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
      subtitle: "నిజ-ప్రపంచ ESG సమ్మతి నియమాల ప్రకారం మీ భూమి పత్రం, గుర్తింపు మరియు బ్యాంక్ ఖాతాను ధృవీకరించండి.",
      aadhaarCard: "ఆధార్ కార్డ్ ధృవీకరణ",
      aadhaarDesc: "ఆధార్ KYC మ్యాచ్ కోసం ముందు + వెనుక కాపీ.",
      landProof: "భూమి యాజమాన్య రుజువు",
      landDesc: "పట్టాదార్ పాస్‌బుక్, సర్వే రిపోర్ట్ లేదా ల్యాండ్ రెవెన్యూ రసీదు.",
      bankProof: "బ్యాంక్ ఖాతా & UPI ధృవీకరణ",
      bankDesc: "బ్యాంక్ పాస్‌బుక్, క్యాన్సిల్డ్ చెక్ లేదా తక్షణ UPI చెక్.",
      geoPhotos: "ఐచ్ఛిక జియో-ట్యాగ్డ్ పంట చిత్రాలు",
      geoPhotosDesc: "GPS కోఆర్డినేట్‌లతో కూడిన పంట నిజ-సమయ చిత్రాలను అప్‌లోడ్ చేయండి.",
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
      aadhaarMatch: "ఆధార్ UID మ్యాచ్ స్కోరు",
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
    aadhaar: { file: null, progress: 0, status: 'idle', name: '' },
    land: { file: null, progress: 0, status: 'idle', name: '' },
    bank: { file: null, progress: 0, status: 'idle', name: '' },
    farmPhotos: { file: null, progress: 0, status: 'idle', name: '' },
  });

  const { user, farms } = useAuth();

  const [ocrData, setOcrData] = useState({
    farmerName: '',
    surveyNumber: '',
    village: '',
    area: '',
    aadhaarMatch: '—',
  });

  useEffect(() => {
    setOcrData({
      farmerName: user?.name || '',
      surveyNumber: '',
      village: user?.village || '',
      area: farms[0]?.area_hectares ? `${farms[0].area_hectares} Hectares` : '',
      aadhaarMatch: user?.aadhaar_last4 ? `****${user.aadhaar_last4}` : '—',
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

  // Simulate file upload
  const handleUploadSim = (docKey, mockName) => {
    setUploads(prev => ({
      ...prev,
      [docKey]: { file: null, progress: 10, status: 'uploading', name: mockName }
    }));

    let progress = 10;
    const interval = setInterval(() => {
      progress += 20;
      if (progress >= 100) {
        clearInterval(interval);
        setUploads(prev => ({
          ...prev,
          [docKey]: { file: 'mock_uri', progress: 100, status: 'completed', name: mockName }
        }));
      } else {
        setUploads(prev => ({
          ...prev,
          [docKey]: { ...prev[docKey], progress }
        }));
      }
    }, 250);
  };

  const handleResetUpload = (docKey) => {
    setUploads(prev => ({
      ...prev,
      [docKey]: { file: null, progress: 0, status: 'idle', name: '' }
    }));
  };

  // Run through scanning sequence
  const startScanningSim = () => {
    if (uploads.aadhaar.status !== 'completed' || uploads.land.status !== 'completed' || uploads.bank.status !== 'completed') {
      alert("Please upload at least Aadhaar, Land Ownership, and Bank credentials first!");
      return;
    }

    setIsScanning(true);
    setScanIndex(0);
    setComplianceStatus("Pending Review");

    // Reset scan step states
    setScanSteps(prev => prev.map(s => ({ ...s, status: 'loading' })));
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
      setComplianceStatus("AI Verified");
      // Store in localStorage to pass document states down
      localStorage.setItem('carbonx_farmer_docs_verified', 'true');
    }
  }, [scanIndex, isScanning]);

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

      <main className="max-w-4xl mx-auto px-4 mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Upload Columns */}
        <div className="space-y-4">
          
          {/* Card 1: Aadhaar */}
          <div className="bg-white border border-forest-100 rounded-[28px] p-5 shadow-sm space-y-4">
            <div className="flex justify-between items-start">
              <div className="space-y-0.5">
                <h3 className="text-xs font-bold text-carbon-800 flex items-center gap-1.5">
                  🪪 {localT.aadhaarCard}
                </h3>
                <p className="text-[10px] text-carbon-400">{localT.aadhaarDesc}</p>
              </div>
              {uploads.aadhaar.status === 'completed' && (
                <span className="bg-emerald-100 text-emerald-800 text-[9px] px-2 py-0.5 rounded-full font-bold uppercase">Locked</span>
              )}
            </div>

            {uploads.aadhaar.status === 'idle' ? (
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => handleUploadSim('aadhaar', 'aadhaar_ramesh_kumar.jpg')}
                  className="border border-dashed border-forest-200 hover:border-forest-400 rounded-2xl p-4 flex flex-col items-center justify-center text-center gap-2 hover:bg-forest-50/20 transition-all group"
                >
                  <Upload size={18} className="text-forest-600 group-hover:scale-110 transition-transform" />
                  <span className="text-[10px] font-semibold text-carbon-500">{localT.dragDrop}</span>
                </button>
                <button 
                  onClick={() => handleUploadSim('aadhaar', 'camera_snap_aadhaar.jpg')}
                  className="border border-forest-100 hover:border-forest-200 bg-forest-50/40 rounded-2xl p-4 flex flex-col items-center justify-center text-center gap-2 hover:bg-forest-50 transition-all group"
                >
                  <Camera size={18} className="text-forest-700" />
                  <span className="text-[10px] font-semibold text-carbon-700">{localT.captureCam}</span>
                </button>
              </div>
            ) : (
              <div className="bg-forest-50/50 border border-forest-100 rounded-2xl p-3 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white border border-forest-100 rounded-xl flex items-center justify-center text-forest-700">
                    <FileText size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-carbon-800 truncate max-w-[150px]">{uploads.aadhaar.name}</p>
                    <p className="text-[9px] text-carbon-400">
                      {uploads.aadhaar.status === 'uploading' ? `${uploads.aadhaar.progress}%` : localT.uploadSuccess}
                    </p>
                  </div>
                </div>
                {uploads.aadhaar.status === 'uploading' ? (
                  <div className="w-8 h-8 rounded-full border-2 border-forest-100 border-t-forest-700 animate-spin"></div>
                ) : (
                  <button onClick={() => handleResetUpload('aadhaar')} className="p-1.5 hover:bg-forest-100 rounded-lg text-rose-500 transition-colors">
                    <RefreshCw size={14} />
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Card 2: Land Deed */}
          <div className="bg-white border border-forest-100 rounded-[28px] p-5 shadow-sm space-y-4">
            <div className="flex justify-between items-start">
              <div className="space-y-0.5">
                <h3 className="text-xs font-bold text-carbon-800 flex items-center gap-1.5">
                  📜 {localT.landProof}
                </h3>
                <p className="text-[10px] text-carbon-400">{localT.landDesc}</p>
              </div>
              {uploads.land.status === 'completed' && (
                <span className="bg-emerald-100 text-emerald-800 text-[9px] px-2 py-0.5 rounded-full font-bold uppercase">Locked</span>
              )}
            </div>

            {uploads.land.status === 'idle' ? (
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => handleUploadSim('land', 'pattadar_passbook_scan.pdf')}
                  className="border border-dashed border-forest-200 hover:border-forest-400 rounded-2xl p-4 flex flex-col items-center justify-center text-center gap-2 hover:bg-forest-50/20 transition-all group"
                >
                  <Upload size={18} className="text-forest-600 group-hover:scale-110 transition-transform" />
                  <span className="text-[10px] font-semibold text-carbon-500">{localT.dragDrop}</span>
                </button>
                <button 
                  onClick={() => handleUploadSim('land', 'survey_record_photo.jpg')}
                  className="border border-forest-100 hover:border-forest-200 bg-forest-50/40 rounded-2xl p-4 flex flex-col items-center justify-center text-center gap-2 hover:bg-forest-50 transition-all group"
                >
                  <Camera size={18} className="text-forest-700" />
                  <span className="text-[10px] font-semibold text-carbon-700">{localT.captureCam}</span>
                </button>
              </div>
            ) : (
              <div className="bg-forest-50/50 border border-forest-100 rounded-2xl p-3 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white border border-forest-100 rounded-xl flex items-center justify-center text-forest-700">
                    <FileText size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-carbon-800 truncate max-w-[150px]">{uploads.land.name}</p>
                    <p className="text-[9px] text-carbon-400">
                      {uploads.land.status === 'uploading' ? `${uploads.land.progress}%` : localT.uploadSuccess}
                    </p>
                  </div>
                </div>
                {uploads.land.status === 'uploading' ? (
                  <div className="w-8 h-8 rounded-full border-2 border-forest-100 border-t-forest-700 animate-spin"></div>
                ) : (
                  <button onClick={() => handleResetUpload('land')} className="p-1.5 hover:bg-forest-100 rounded-lg text-rose-500 transition-colors">
                    <RefreshCw size={14} />
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Card 3: Bank Account */}
          <div className="bg-white border border-forest-100 rounded-[28px] p-5 shadow-sm space-y-4">
            <div className="flex justify-between items-start">
              <div className="space-y-0.5">
                <h3 className="text-xs font-bold text-carbon-800 flex items-center gap-1.5">
                  🏦 {localT.bankProof}
                </h3>
                <p className="text-[10px] text-carbon-400">{localT.bankDesc}</p>
              </div>
              {uploads.bank.status === 'completed' && (
                <span className="bg-emerald-100 text-emerald-800 text-[9px] px-2 py-0.5 rounded-full font-bold uppercase">Locked</span>
              )}
            </div>

            {uploads.bank.status === 'idle' ? (
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => handleUploadSim('bank', 'cancelled_cheque.jpg')}
                  className="border border-dashed border-forest-200 hover:border-forest-400 rounded-2xl p-4 flex flex-col items-center justify-center text-center gap-2 hover:bg-forest-50/20 transition-all group"
                >
                  <Upload size={18} className="text-forest-600 group-hover:scale-110 transition-transform" />
                  <span className="text-[10px] font-semibold text-carbon-500">{localT.dragDrop}</span>
                </button>
                <button 
                  onClick={() => handleUploadSim('bank', 'upi_verification.jpg')}
                  className="border border-forest-100 hover:border-forest-200 bg-forest-50/40 rounded-2xl p-4 flex flex-col items-center justify-center text-center gap-2 hover:bg-forest-50 transition-all group"
                >
                  <Landmark size={18} className="text-forest-700" />
                  <span className="text-[10px] font-semibold text-carbon-700">Verify UPI VPA</span>
                </button>
              </div>
            ) : (
              <div className="bg-forest-50/50 border border-forest-100 rounded-2xl p-3 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white border border-forest-100 rounded-xl flex items-center justify-center text-forest-700">
                    <FileText size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-carbon-800 truncate max-w-[150px]">{uploads.bank.name}</p>
                    <p className="text-[9px] text-carbon-400">
                      {uploads.bank.status === 'uploading' ? `${uploads.bank.progress}%` : localT.uploadSuccess}
                    </p>
                  </div>
                </div>
                {uploads.bank.status === 'uploading' ? (
                  <div className="w-8 h-8 rounded-full border-2 border-forest-100 border-t-forest-700 animate-spin"></div>
                ) : (
                  <button onClick={() => handleResetUpload('bank')} className="p-1.5 hover:bg-forest-100 rounded-lg text-rose-500 transition-colors">
                    <RefreshCw size={14} />
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Card 4: Farm Images (Optional) */}
          <div className="bg-white border border-forest-100 rounded-[28px] p-5 shadow-sm space-y-4">
            <div className="flex justify-between items-start">
              <div className="space-y-0.5">
                <h3 className="text-xs font-bold text-carbon-800 flex items-center gap-1.5">
                  📸 {localT.geoPhotos}
                </h3>
                <p className="text-[10px] text-carbon-400">{localT.geoPhotosDesc}</p>
              </div>
              {uploads.farmPhotos.status === 'completed' && (
                <span className="bg-emerald-100 text-emerald-800 text-[9px] px-2 py-0.5 rounded-full font-bold uppercase">Locked</span>
              )}
            </div>

            {uploads.farmPhotos.status === 'idle' ? (
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => handleUploadSim('farmPhotos', 'geotagged_rice_field.jpg')}
                  className="border border-dashed border-forest-200 hover:border-forest-400 rounded-2xl p-4 flex flex-col items-center justify-center text-center gap-2 hover:bg-forest-50/20 transition-all group"
                >
                  <Upload size={18} className="text-forest-600 group-hover:scale-110 transition-transform" />
                  <span className="text-[10px] font-semibold text-carbon-500">{localT.dragDrop}</span>
                </button>
                <button 
                  onClick={() => handleUploadSim('farmPhotos', 'cam_rice_bund.jpg')}
                  className="border border-forest-100 hover:border-forest-200 bg-forest-50/40 rounded-2xl p-4 flex flex-col items-center justify-center text-center gap-2 hover:bg-forest-50 transition-all group"
                >
                  <Camera size={18} className="text-forest-700" />
                  <span className="text-[10px] font-semibold text-carbon-700">{localT.captureCam}</span>
                </button>
              </div>
            ) : (
              <div className="bg-forest-50/50 border border-forest-100 rounded-2xl p-3 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <img src="https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&q=80&w=150" alt="thumbnail" className="w-10 h-10 object-cover border border-forest-100 rounded-xl" />
                  <div>
                    <p className="text-[10px] font-bold text-carbon-800 truncate max-w-[150px]">{uploads.farmPhotos.name}</p>
                    <p className="text-[9px] text-emerald-600 font-medium">📍 GPS: 17.9620° N, 79.5982° E</p>
                  </div>
                </div>
                <button onClick={() => handleResetUpload('farmPhotos')} className="p-1.5 hover:bg-forest-100 rounded-lg text-rose-500 transition-colors">
                  <RefreshCw size={14} />
                </button>
              </div>
            )}
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
                const isIdle = step.status === 'idle' && !isScanning;
                
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

              <div className="grid grid-cols-2 gap-2 text-xs">
                <span className="font-semibold text-carbon-500">{localT.aadhaarMatch}</span>
                <span className="font-extrabold text-profit">{ocrData.aadhaarMatch}</span>
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

          {/* Continue button */}
          {(complianceStatus === "AI Verified" || complianceStatus === "Approved") && (
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={() => navigate('/verification-success')}
              className="w-full bg-forest-800 hover:bg-forest-900 text-white text-xs font-bold font-poppins py-4 rounded-2xl shadow-lg transition-all duration-200 flex items-center justify-center gap-1.5"
            >
              <span>{localT.continueSuccess}</span>
              <ArrowRight size={14} />
            </motion.button>
          )}

        </div>

      </main>
    </div>
  );
}
