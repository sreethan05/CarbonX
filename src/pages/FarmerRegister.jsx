import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, ArrowRight, ShieldCheck, Landmark, Globe, Loader2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { sendOtp, registerUser } from '../services/api';

export default function FarmerRegister() {
  const navigate = useNavigate();
  const { t, changeLanguage, currentLang } = useLanguage();
  const { login } = useAuth();

  const [step, setStep] = useState(1);
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [aadhaar, setAadhaar] = useState("");
  const [otp, setOtp] = useState("");
  const [state, setState] = useState("Telangana");
  const [district, setDistrict] = useState("Warangal");
  const [village, setVillage] = useState("Venkateshwara Pally");
  const [upi, setUpi] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [devOtp, setDevOtp] = useState("");
  const [resendTimer, setResendTimer] = useState(0);

  const startResendTimer = () => {
    setResendTimer(30);
    const iv = setInterval(() => {
      setResendTimer(t => {
        if (t <= 1) { clearInterval(iv); return 0; }
        return t - 1;
      });
    }, 1000);
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError("");
    if (phone.length !== 10) return setError("Enter a valid 10-digit phone number");
    setLoading(true);
    try {
      const res = await sendOtp(phone);
      if (res.success) {
        setDevOtp(res.dev_otp || "");
        setStep(2);
        startResendTimer();
      } else {
        setError(res.message || "Failed to send OTP");
      }
    } catch {
      setError("Could not reach server. Make sure the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendTimer > 0) return;
    setLoading(true);
    try {
      const res = await sendOtp(phone);
      if (res.success) {
        setDevOtp(res.dev_otp || "");
        startResendTimer();
        setOtp("");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    if (otp.length < 4) return setError("Enter the 6-digit OTP");
    setError("");
    setStep(3);
  };

  const handleBasicDetails = (e) => {
    e.preventDefault();
    if (!name || !aadhaar) return setError("Please fill in your Name and Aadhaar");
    setError("");
    setStep(4);
  };

  const handleBankDetails = async (e) => {
    e.preventDefault();
    if (!upi) return setError("Please enter your UPI ID");
    setError("");
    setLoading(true);
    try {
      const res = await registerUser({ phone, otp, name, aadhaar, state, district, village, upi, preferred_language: currentLang });
      if (res.success) {
        await login(res.token, res.user);
        if (res.user?.preferred_language) changeLanguage(res.user.preferred_language);
        setStep(5);
      } else {
        setError(res.message || "Registration failed");
        if (res.message?.includes("OTP")) setStep(2);
      }
    } catch {
      setError("Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex flex-col justify-between font-inter text-carbon-800 overflow-hidden">
      <div className="absolute inset-0 z-0 bg-cover bg-center filter brightness-[0.45] saturate-[1.1]"
        style={{ backgroundImage: `url('https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&q=80&w=1920')` }} />
      <div className="absolute inset-0 z-0 bg-gradient-to-tr from-emerald-950/85 via-emerald-900/60 to-orange-950/40 backdrop-blur-[2px]" />

      <header className="relative z-10 py-4 px-6 bg-white/10 backdrop-blur-md flex justify-between items-center border-b border-white/10">
        <div className="flex items-center gap-3">
          <button onClick={() => step > 1 ? setStep(step - 1) : navigate('/role-selection')}
            className="p-2.5 hover:bg-white/10 rounded-xl text-white transition-colors">
            <ArrowLeft size={18} />
          </button>
          <span className="font-manrope font-bold text-sm text-white tracking-wide">{t('registerFarmProfile')}</span>
        </div>
        <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl px-2.5 py-1 text-xs text-white">
          <Globe size={13} className="text-emerald-300" />
          <select value={currentLang} onChange={e => changeLanguage(e.target.value)}
            className="bg-transparent border-none outline-none text-xs font-bold text-white focus:ring-0 cursor-pointer">
            <option value="en" className="text-carbon-800">English</option>
            <option value="hi" className="text-carbon-800">हिन्दी (Hindi)</option>
            <option value="te" className="text-carbon-800">తెలుగు (Telugu)</option>
          </select>
        </div>
      </header>

      <main className="relative z-10 flex-1 max-w-md mx-auto w-full px-4 py-8 flex flex-col justify-center">
        <div className="flex gap-2 justify-center mb-8">
          {[1,2,3,4,5].map(i => (
            <span key={i} className={`h-1.5 rounded-full transition-all duration-300 ${step >= i ? 'bg-emerald-400 w-8 shadow-sm shadow-emerald-400/50' : 'bg-white/25 w-4'}`} />
          ))}
        </div>

        {error && (
          <div className="mb-4 bg-red-900/80 border border-red-500/50 rounded-2xl px-4 py-2.5 text-xs text-red-200 text-center">
            {error}
          </div>
        )}

        {step === 1 && (
          <div className="bg-white/95 backdrop-blur-xl border border-white/60 rounded-3xl p-6 shadow-2xl space-y-6 animate-in fade-in duration-300">
            <div>
              <h2 className="text-xl font-bold font-poppins text-carbon-900">{t('verifyMobile')}</h2>
              <p className="text-xs text-carbon-500 leading-normal mt-1">{t('verifyMobileDesc')}</p>
            </div>
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-carbon-500 uppercase tracking-wide">{t('phone')}</label>
                <div className="flex bg-warm-white border border-forest-100 rounded-2xl p-3 items-center shadow-inner">
                  <span className="text-xs font-bold text-carbon-500 mr-2 border-r border-forest-100 pr-2">+91</span>
                  <input type="tel" placeholder="Enter 10 digit number" value={phone}
                    onChange={e => setPhone(e.target.value.replace(/\D/g,'').slice(0,10))}
                    className="w-full text-xs font-semibold bg-transparent border-none outline-none focus:ring-0" required />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-carbon-500 uppercase tracking-wide">{t('preferredLang')}</label>
                <select value={currentLang} onChange={e => changeLanguage(e.target.value)}
                  className="w-full bg-warm-white border border-forest-100 rounded-2xl p-3 text-xs font-semibold focus:ring-0 focus:border-forest-400 shadow-sm cursor-pointer">
                  <option value="en">English</option>
                  <option value="hi">Hindi (हिन्दी)</option>
                  <option value="te">Telugu (తెలుగు)</option>
                </select>
              </div>
              <button type="submit" disabled={loading}
                className="w-full bg-forest-800 hover:bg-forest-900 text-white text-xs font-bold font-poppins py-4 rounded-2xl shadow-lg transition-all flex items-center justify-center gap-1.5 disabled:opacity-60">
                {loading ? <Loader2 size={16} className="animate-spin" /> : <>{t('sendOtp')} <ArrowRight size={14} /></>}
              </button>
            </form>
          </div>
        )}

        {step === 2 && (
          <div className="bg-white/95 backdrop-blur-xl border border-white/60 rounded-3xl p-6 shadow-2xl space-y-6 animate-in fade-in duration-300">
            <div>
              <h2 className="text-xl font-bold font-poppins text-carbon-900">{t('enterOtp')}</h2>
              <p className="text-xs text-carbon-500 leading-normal mt-1">{t('smsSent')} {phone}</p>
            </div>
            {devOtp ? (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-2.5 text-xs text-amber-800 text-center font-mono">
                Dev OTP (SMS unavailable): <span className="font-black text-amber-900 text-sm">{devOtp}</span>
              </div>
            ) : (
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl px-4 py-2.5 text-xs text-emerald-800 text-center">
                📱 {t('smsSent')} {phone}
              </div>
            )}
            <form onSubmit={handleVerifyOtp} className="space-y-6">
              <div className="flex justify-center gap-4">
                {[0,1,2,3,4,5].map(i => (
                  <input key={i} type="text" maxLength={1} value={otp[i] || ''}
                    onChange={e => {
                      const val = e.target.value;
                      if (/^\d?$/.test(val)) {
                        const next = otp.split('');
                        next[i] = val;
                        setOtp(next.join(''));
                        if (val && i < 5) e.target.nextSibling?.focus();
                      }
                    }}
                    className="w-10 h-12 bg-warm-white border border-forest-100 rounded-xl text-center text-lg font-bold text-carbon-800 focus:border-forest-400 focus:ring-0 shadow-inner" />
                ))}
              </div>
              <div className="text-center">
                <button type="button" onClick={handleResend} disabled={resendTimer > 0}
                  className="text-xs font-semibold text-forest-700 hover:underline disabled:text-carbon-400">
                  {resendTimer > 0 ? `${t('resendIn')} ${resendTimer}s` : t('resendOtp')}
                </button>
              </div>
              <button type="submit"
                className="w-full bg-forest-800 hover:bg-forest-900 text-white text-xs font-bold font-poppins py-4 rounded-2xl shadow-lg">
                {t('continue')}
              </button>
            </form>
          </div>
        )}

        {step === 3 && (
          <div className="bg-white/95 backdrop-blur-xl border border-white/60 rounded-3xl p-6 shadow-2xl space-y-6 animate-in fade-in duration-300">
            <div>
              <h2 className="text-xl font-bold font-poppins text-carbon-900">{t('farmlandProfile')}</h2>
              <p className="text-xs text-carbon-500 leading-normal mt-1">{t('aadhaarDesc')}</p>
            </div>
            <form onSubmit={handleBasicDetails} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-carbon-500 uppercase tracking-wide">{t('fullName')}</label>
                <input type="text" placeholder="Ramesh Kumar" value={name} onChange={e => setName(e.target.value)}
                  className="w-full bg-warm-white border border-forest-100 rounded-2xl p-3 text-xs font-semibold focus:ring-0 shadow-inner" required />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-carbon-500 uppercase tracking-wide">{t('aadhaarNumber')}</label>
                <div className="relative">
                  <input type="text" placeholder="XXXX-XXXX-XXXX" value={aadhaar}
                    onChange={e => setAadhaar(e.target.value.replace(/\D/g,'').slice(0,12))}
                    className="w-full bg-warm-white border border-forest-100 rounded-2xl p-3 text-xs font-semibold pr-10 focus:ring-0 shadow-inner" required />
                  <ShieldCheck size={18} className="absolute right-3 top-3.5 text-forest-600" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-carbon-500 uppercase tracking-wide">{t('state')}</label>
                  <input type="text" value={state} onChange={e => setState(e.target.value)}
                    className="w-full bg-warm-white border border-forest-100 rounded-2xl p-3 text-xs font-semibold focus:ring-0 shadow-inner" required />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-carbon-500 uppercase tracking-wide">{t('district')}</label>
                  <input type="text" value={district} onChange={e => setDistrict(e.target.value)}
                    className="w-full bg-warm-white border border-forest-100 rounded-2xl p-3 text-xs font-semibold focus:ring-0 shadow-inner" required />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-carbon-500 uppercase tracking-wide">{t('village')}</label>
                <input type="text" value={village} onChange={e => setVillage(e.target.value)}
                  className="w-full bg-warm-white border border-forest-100 rounded-2xl p-3 text-xs font-semibold focus:ring-0 shadow-inner" required />
              </div>
              <button type="submit"
                className="w-full bg-forest-800 hover:bg-forest-900 text-white text-xs font-bold font-poppins py-4 rounded-2xl shadow-lg">
                {t('verifyAadhaar')}
              </button>
            </form>
          </div>
        )}

        {step === 4 && (
          <div className="bg-white/95 backdrop-blur-xl border border-white/60 rounded-3xl p-6 shadow-2xl space-y-6 animate-in fade-in duration-300">
            <div>
              <h2 className="text-xl font-bold font-poppins text-carbon-900">{t('directBank')}</h2>
              <p className="text-xs text-carbon-500 leading-normal mt-1">{t('bankDesc')}</p>
            </div>
            <form onSubmit={handleBankDetails} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-carbon-500 uppercase tracking-wide">{t('upiId')}</label>
                <div className="relative">
                  <input type="text" placeholder="example@oksbi" value={upi} onChange={e => setUpi(e.target.value)}
                    className="w-full bg-warm-white border border-forest-100 rounded-2xl p-3 text-xs font-semibold pr-10 focus:ring-0 shadow-inner" required />
                  <Landmark size={18} className="absolute right-3 top-3.5 text-forest-600" />
                </div>
                <p className="text-[10px] text-carbon-400 mt-1">{t('bankInfo')}</p>
              </div>
              <div className="p-4 bg-forest-50 border border-forest-100/50 rounded-2xl text-[10px] text-forest-800 leading-normal">
                {t('upiSecured')}
              </div>
              <button type="submit" disabled={loading}
                className="w-full bg-forest-800 hover:bg-forest-900 text-white text-xs font-bold font-poppins py-4 rounded-2xl shadow-lg flex items-center justify-center gap-2 disabled:opacity-60">
                {loading ? <><Loader2 size={16} className="animate-spin" /> Creating Account...</> : t('linkAccount')}
              </button>
            </form>
          </div>
        )}

        {step === 5 && (
          <div className="bg-white/95 backdrop-blur-xl border border-white/60 rounded-3xl p-6 shadow-2xl text-center space-y-6 animate-in zoom-in-95 duration-500">
            <div className="w-16 h-16 bg-forest-100 rounded-full flex items-center justify-center text-forest-800 mx-auto">
              <CheckCircle2 size={36} />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-bold font-poppins text-carbon-900">{t('profileVerified')}</h2>
              <p className="text-xs text-carbon-500 leading-relaxed px-4">{t('profileVerifiedDesc')}</p>
            </div>
            <button onClick={() => navigate('/onboarding')}
              className="w-full bg-forest-800 hover:bg-forest-900 text-white text-xs font-bold font-poppins py-4 rounded-2xl shadow-lg transition-all">
              {t('startTutorial')}
            </button>
          </div>
        )}
      </main>

      <footer className="relative z-10 py-4 text-center text-[9px] text-white/80 border-t border-white/10 bg-black/20 backdrop-blur-sm">
        🔒 SSL Secured Encrypted Aadhaar & UPI Verification Public Infrastructure
      </footer>
    </div>
  );
}
