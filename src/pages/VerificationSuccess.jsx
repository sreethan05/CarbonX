import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, ShieldCheck, Calendar, ArrowRight, ArrowLeft, RefreshCw, Cpu } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function VerificationSuccess() {
  const navigate = useNavigate();
  const { currentLang } = useLanguage();

  const pgTrans = {
    en: {
      congrats: "Verification Initiated",
      sub: "Your land records, bank connections, and biometric markers are securely saved.",
      estTitle: "Satellite Pass & MRV Revisit Timeline",
      estDesc: "Our automated system checks your farm's soil organic carbon and canopy density during scheduled satellite orbits.",
      orbitStatus: "Orbit Transit Tracker",
      satellite: "Active Satellite",
      nextTransit: "Next Scheduled Revisit",
      revisitCount: "Est. Sequestration Audit",
      step1: "1. Land Deed Indexed",
      step1Desc: "Land record matching complete with PM-Kisan & Bhuvan Cadastral indices.",
      step2: "2. Soil Baseline Scanned",
      step2Desc: "Historic NDVI calculations mapped back to 2023.",
      step3: "3. Blockchain Credit Minting",
      step3Desc: "Sequestration results tokenized as ERC-1155 credits.",
      cta: "Continue to Dashboard"
    },
    hi: {
      congrats: "सत्यापन शुरू हो गया है",
      sub: "आपके भूमि रिकॉर्ड, बैंक कनेक्शन और बायोमेट्रिक मार्कर सुरक्षित रूप से सहेज लिए गए हैं।",
      estTitle: "सैटेलाइट पास और एमआरवी पुनरावृत्ति समयरेखा",
      estDesc: "हमारा स्वचालित सिस्टम निर्धारित उपग्रह कक्षाओं के दौरान आपके खेत की मिट्टी के जैविक कार्बन और चंदवा घनत्व की जांच करता है।",
      orbitStatus: "ऑर्बिट ट्रांजिट ट्रैकर",
      satellite: "सक्रिय उपग्रह",
      nextTransit: "अगला निर्धारित दौरा",
      revisitCount: "अनुमानित संचय ऑडिट",
      step1: "1. भूमि विलेख अनुक्रमित",
      step1Desc: "पीएम-किसान और भुवन कैडस्ट्रल सूचकांकों के साथ भूमि रिकॉर्ड मिलान पूरा हुआ।",
      step2: "2. मृदा बेसलाइन स्कैन की गई",
      step2Desc: "ऐतिहासिक एनडीवीआई गणनाएँ 2023 तक मैप की गईं।",
      step3: "3. ब्लॉकचेन क्रेडिट मिंटिंग",
      step3Desc: "स्थिरीकरण परिणामों को ईआरसी -1155 क्रेडिट के रूप में टोकन दिया गया।",
      cta: "डैशबोर्ड पर जाएँ"
    },
    te: {
      congrats: "ధృవీకరణ ప్రారంభించబడింది",
      sub: "మీ భూమి రికార్డులు, బ్యాంక్ కనెక్షన్లు మరియు బయోమెట్రిక్ గుర్తులు సురక్షితంగా సేవ్ చేయబడ్డాయి.",
      estTitle: "శాటిలైట్ పాస్ & MRV రీవిజిట్ టైమ్‌లైన్",
      estDesc: "షెడ్యూల్ చేయబడిన ఉపగ్రహ కక్ష్యలలో మా స్వయంచాలక వ్యవస్థ మీ పొలంలోని సేంద్రీయ కర్బనాన్ని మరియు సాంద్రతను తనిఖీ చేస్తుంది.",
      orbitStatus: "కక్ష్య రవాణా ట్రాకర్",
      satellite: "క్రియాశీల శాటిలైట్",
      nextTransit: "తదుపరి షెడ్యూల్డ్ సందర్శన",
      revisitCount: "అంచనా ఆడిట్ గడువు",
      step1: "1. భూమి దస్తావేజు సూచిక",
      step1Desc: "పీఎం-కిసాన్ & భువన్ క్యాడస్ట్రల్ సూచీలతో భూమి రికార్డు సరిపోలిక పూర్తయింది.",
      step2: "2. నేల బేస్ లైన్ స్కాన్",
      step2Desc: "చారిత్రక NDVI లెక్కలు 2023 నాటికి మ్యాప్ చేయబడ్డాయి.",
      step3: "3. బ్లాక్‌చైన్ క్రెడిట్ మింటింగ్",
      step3Desc: "కార్బన్ ఫలితాలు ERC-1155 క్రెడిట్‌లుగా టోకనైజ్ చేయబడతాయి.",
      cta: "డాష్‌బోర్డ్‌కు వెళ్లండి"
    }
  };

  const localT = pgTrans[currentLang] || pgTrans['en'];

  // Countdown timer simulation for orbital revisit
  const [countdown, setCountdown] = useState({ hours: 14, minutes: 42, seconds: 58 });

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        clearInterval(interval);
        return prev;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-warm-white flex flex-col justify-between font-inter text-carbon-800 pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-forest-100/50 py-4 px-6 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/farm-verification')} className="p-2 hover:bg-forest-50 rounded-xl text-carbon-600 transition-all">
            <ArrowLeft size={18} />
          </button>
          <span className="font-manrope font-extrabold text-lg text-forest-800 tracking-tight">
            🛡️ CarbonX Compliance Secure
          </span>
        </div>
        <span className="text-[10px] bg-emerald-100 text-emerald-800 px-3 py-1.5 rounded-full font-bold uppercase">
          KYC LEVEL 2
        </span>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-md mx-auto w-full px-4 py-8 flex flex-col justify-center space-y-6">
        
        <div className="bg-white border border-forest-100 rounded-[32px] p-6 shadow-card text-center space-y-6 animate-in zoom-in-95 duration-500">
          
          {/* Glowing Verification badge */}
          <div className="relative w-20 h-20 mx-auto">
            <div className="absolute inset-0 bg-emerald-400/20 rounded-full animate-ping"></div>
            <div className="absolute inset-2 bg-emerald-100/80 rounded-full"></div>
            <div className="relative w-full h-full flex items-center justify-center text-emerald-600">
              <ShieldCheck size={44} />
            </div>
          </div>
          
          <div className="space-y-1.5">
            <h2 className="text-xl font-bold font-poppins text-carbon-900 leading-tight">
              {localT.congrats}
            </h2>
            <p className="text-xs text-carbon-500 leading-relaxed px-2">
              {localT.sub}
            </p>
          </div>

          {/* Satellite scan estimated timeline */}
          <div className="bg-carbon-900 border border-carbon-800 text-left rounded-2xl p-4 text-white space-y-3 relative overflow-hidden">
            <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-wide font-mono flex items-center gap-1.5">
              <Cpu size={12} className="animate-spin text-emerald-400" />
              {localT.orbitStatus}
            </span>
            
            <div className="space-y-2">
              <div className="flex justify-between border-b border-carbon-800 pb-1.5 text-xs font-mono">
                <span className="text-carbon-400">{localT.satellite}</span>
                <span className="font-extrabold text-emerald-300">ISRO Sentinel-2B</span>
              </div>
              <div className="flex justify-between border-b border-carbon-800 pb-1.5 text-xs font-mono">
                <span className="text-carbon-400">{localT.nextTransit}</span>
                <span className="font-extrabold text-white">
                  {countdown.hours}h {countdown.minutes}m {countdown.seconds}s
                </span>
              </div>
              <div className="flex justify-between text-xs font-mono">
                <span className="text-carbon-400">{localT.revisitCount}</span>
                <span className="font-extrabold text-emerald-400">Scheduled (12 days)</span>
              </div>
            </div>
          </div>

          {/* Stepper overview */}
          <div className="text-left space-y-3.5 pt-2">
            <div className="flex gap-3">
              <div className="w-5 h-5 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0">✓</div>
              <div>
                <p className="text-xs font-bold text-carbon-800">{localT.step1}</p>
                <p className="text-[10px] text-carbon-400 mt-0.5">{localT.step1Desc}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-5 h-5 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0">✓</div>
              <div>
                <p className="text-xs font-bold text-carbon-800">{localT.step2}</p>
                <p className="text-[10px] text-carbon-400 mt-0.5">{localT.step2Desc}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-5 h-5 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0">⏰</div>
              <div>
                <p className="text-xs font-bold text-carbon-800">{localT.step3}</p>
                <p className="text-[10px] text-carbon-400 mt-0.5">{localT.step3Desc}</p>
              </div>
            </div>
          </div>

          <button 
            onClick={() => navigate('/farmer-dashboard')}
            className="w-full bg-forest-800 hover:bg-forest-900 text-white text-xs font-bold font-poppins py-4 rounded-2xl shadow-lg hover:shadow-premium transition-all duration-200 flex items-center justify-center gap-1.5"
          >
            <span>{localT.cta}</span>
            <ArrowRight size={14} />
          </button>

        </div>

      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-[9px] text-carbon-400 border-t border-forest-50 bg-white/30 uppercase tracking-widest font-bold">
        🛰️ CarbonX Climate Public Infrastructure • ISRO Bhuvan Coordinated
      </footer>
    </div>
  );
}
