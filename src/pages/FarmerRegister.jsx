import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  ArrowLeft, CheckCircle2, ArrowRight, ShieldCheck, Landmark, 
  Globe, Loader2, Phone, User, Check, AlertCircle, LogIn 
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { sendOtp, registerUser } from '../services/api';

// Verhoeff checksum algorithm for 12-digit Indian Aadhaar validation
const isValidAadhaar = (value) => {
  const number = value.replace(/\D/g, '');
  if (number.length !== 12) return false;

  const multiplication = [
    [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], [1, 2, 3, 4, 0, 6, 7, 8, 9, 5],
    [2, 3, 4, 0, 1, 7, 8, 9, 5, 6], [3, 4, 0, 1, 2, 8, 9, 5, 6, 7],
    [4, 0, 1, 2, 3, 9, 5, 6, 7, 8], [5, 9, 8, 7, 6, 0, 4, 3, 2, 1],
    [6, 5, 9, 8, 7, 1, 0, 4, 3, 2], [7, 6, 5, 9, 8, 2, 1, 0, 4, 3],
    [8, 7, 6, 5, 9, 3, 2, 1, 0, 4], [9, 8, 7, 6, 5, 4, 3, 2, 1, 0],
  ];
  const permutation = [
    [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], [1, 5, 7, 6, 2, 8, 3, 0, 9, 4],
    [5, 8, 0, 3, 7, 9, 6, 1, 4, 2], [8, 9, 1, 6, 0, 4, 3, 5, 2, 7],
    [9, 4, 5, 3, 1, 2, 6, 8, 7, 0], [4, 2, 8, 6, 5, 7, 3, 9, 0, 1],
    [2, 7, 9, 3, 8, 0, 6, 4, 1, 5], [7, 0, 4, 6, 9, 1, 3, 2, 5, 8],
  ];

  return number.split('').reverse().reduce(
    (checksum, digit, index) => multiplication[checksum][permutation[index % 8][Number(digit)]],
    0,
  ) === 0;
};

export default function FarmerRegister() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const selectedRole = searchParams.get('role') || 'farmer';
  const { t, changeLanguage, currentLang } = useLanguage();
  const { login } = useAuth();

  // 3-step structured flow: 1 = Mobile & OTP, 2 = Profile & Land, 3 = UPI Payout
  const [step, setStep] = useState(1);
  const [otpSent, setOtpSent] = useState(false);
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [name, setName] = useState("");
  const [aadhaar, setAadhaar] = useState("");
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
      setResendTimer((t) => {
        if (t <= 1) { clearInterval(iv); return 0; }
        return t - 1;
      });
    }, 1000);
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError("");
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length !== 10) return setError("Please enter a valid 10-digit mobile number");
    setLoading(true);
    try {
      const res = await sendOtp(cleanPhone);
      if (res.success) {
        setDevOtp(res.dev_otp || "");
        setOtpSent(true);
        startResendTimer();
      } else {
        setError(res.message || "Failed to send OTP");
      }
    } catch {
      setError("Could not reach server. Please make sure the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    if (otp.length < 4) return setError("Please enter the 6-digit verification code");
    setError("");
    setStep(2);
  };

  const handleAutofillDevOtp = () => {
    if (devOtp) {
      setOtp(devOtp);
    }
  };

  const handleBasicDetails = (e) => {
    e.preventDefault();
    if (!name.trim()) return setError("Please enter your Full Name as per government records");
    const cleanAadhaar = aadhaar.replace(/\D/g, '');
    if (cleanAadhaar.length !== 12) return setError("Please enter a complete 12-digit Aadhaar number");
    if (!isValidAadhaar(cleanAadhaar)) return setError("Invalid Aadhaar number checksum. Please recheck the 12 digits.");
    if (!village.trim() || !district.trim() || !state.trim()) return setError("Please enter your State, District, and Village");
    setError("");
    setStep(3);
  };

  const handleBankDetails = async (e) => {
    e.preventDefault();
    if (!upi.trim()) return setError("Please enter your UPI ID (e.g. yourname@oksbi or phone@paytm)");
    if (!upi.includes('@')) return setError("Please enter a valid UPI format containing '@' (e.g. mobile@upi)");
    setError("");
    setLoading(true);
    try {
      const res = await registerUser({ 
        phone: phone.replace(/\D/g, ''), 
        otp, 
        name: name.trim(), 
        aadhaar: aadhaar.replace(/\D/g, ''), 
        state: state.trim(), 
        district: district.trim(), 
        village: village.trim(), 
        upi: upi.trim(), 
        preferred_language: currentLang,
        role: selectedRole
      });
      if (res.success) {
        await login(res.token, res.user);
        if (res.user?.preferred_language) changeLanguage(res.user.preferred_language);
        // Farmer goes to KYC verification, others go to dashboard
        navigate(selectedRole === 'farmer' ? '/farm-verification' : '/dashboard');
      } else {
        setError(res.message || "Registration failed");
        if (res.message?.includes("OTP")) {
          setStep(1);
          setOtpSent(true);
        }
        if (res.message?.includes("Aadhaar")) {
          setStep(2);
        }
      }
    } catch {
      setError("Server error. Please verify backend connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  const isAadhaarValid = isValidAadhaar(aadhaar);

  return (
    <div className="min-h-screen bg-[#FAF8F5] flex flex-col justify-between font-inter text-carbon-800">
      
      {/* Top Header */}
      <header className="py-3.5 px-4 md:px-8 bg-white/90 backdrop-blur-md sticky top-0 z-30 border-b border-forest-100/60 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-3">
          <button 
            type="button" 
            onClick={() => step > 1 ? setStep(step - 1) : navigate('/')} 
            className="p-2 hover:bg-forest-50 rounded-xl text-carbon-700 transition-colors flex items-center gap-1.5 text-xs font-semibold"
          >
            <ArrowLeft size={16} />
            <span className="hidden sm:inline">{step > 1 ? "Previous Step" : "Back to Home"}</span>
          </button>
          <div className="h-4 w-px bg-forest-200 hidden sm:block"></div>
          <span 
            className="font-manrope font-extrabold text-lg text-forest-800 tracking-tight flex items-center gap-1.5 cursor-pointer" 
            onClick={() => navigate('/')}
          >
            CarbonX
          </span>
          {selectedRole !== 'farmer' && (
            <span className="text-[10px] font-bold text-forest-600 bg-forest-50 px-2 py-1 rounded-lg uppercase tracking-wide">
              {selectedRole}
            </span>
          )}
        </div>

        {/* Language selector & quick login */}
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/farmer-login')}
            className="text-xs font-bold text-forest-800 hover:text-forest-900 px-3 py-1.5 rounded-xl hover:bg-forest-50 transition-colors hidden sm:flex items-center gap-1"
          >
            <LogIn size={13} />
            <span>Already Registered? Sign In</span>
          </button>
          
          <div className="flex items-center gap-1 bg-forest-50/80 border border-forest-100 rounded-xl px-2.5 py-1 text-xs text-forest-900 font-semibold">
            <Globe size={13} className="text-forest-700" />
            <select 
              value={currentLang} 
              onChange={e => changeLanguage(e.target.value)}
              className="bg-transparent border-none outline-none text-xs font-bold text-forest-900 focus:ring-0 cursor-pointer"
            >
              <option value="en">English</option>
              <option value="hi">हिन्दी (Hindi)</option>
              <option value="te">తెలుగు (Telugu)</option>
            </select>
          </div>
        </div>
      </header>

      {/* Main Form Container */}
      <main className="flex-1 max-w-lg mx-auto w-full px-4 py-8 md:py-10 flex flex-col justify-center">
        
        {/* Tab Switcher: Register vs Sign In */}
        <div className="bg-forest-100/70 p-1 rounded-2xl flex gap-1 mb-6 border border-forest-200/50 shadow-inner">
          <button 
            type="button"
            className="flex-1 py-2.5 rounded-xl text-xs font-bold font-poppins transition-all bg-white text-forest-900 shadow-sm flex items-center justify-center gap-1.5"
          >
            <span>Register New Account</span>
          </button>
          <button 
            type="button"
            onClick={() => navigate('/farmer-login')}
            className="flex-1 py-2.5 rounded-xl text-xs font-semibold font-poppins transition-all text-carbon-500 hover:text-forest-900 hover:bg-white/50 flex items-center justify-center gap-1.5"
          >
            <span>Existing User Login</span>
          </button>
        </div>

        {/* 3-Step Progress Indicator */}
        <div className="mb-6 bg-white border border-forest-100 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-[11px] font-bold mb-2.5">
            <span className={step >= 1 ? "text-forest-800" : "text-carbon-400"}>1. Phone & OTP</span>
            <span className={step >= 2 ? "text-forest-800" : "text-carbon-400"}>2. Profile & Location</span>
            <span className={step >= 3 ? "text-forest-800" : "text-carbon-400"}>3. UPI Setup</span>
          </div>
          <div className="w-full bg-forest-100/80 h-2 rounded-full overflow-hidden flex">
            <div 
              className="bg-forest-700 h-full rounded-full transition-all duration-300"
              style={{ width: step === 1 ? '33%' : step === 2 ? '66%' : '100%' }}
            ></div>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 bg-rose-50 border border-rose-200 rounded-2xl p-3.5 text-xs text-rose-700 flex items-start gap-2.5">
            <AlertCircle size={16} className="text-rose-600 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Card */}
        <div className="bg-white border border-forest-100 rounded-3xl p-6 sm:p-8 shadow-card space-y-6">
          
          {/* STEP 1: Mobile Number & OTP Verification */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="space-y-1">
                <div className="w-10 h-10 bg-forest-50 text-forest-700 rounded-2xl flex items-center justify-center mb-2 border border-forest-100">
                  <Phone size={20} />
                </div>
                <h1 className="text-xl font-bold font-manrope text-carbon-900">
                  {otpSent ? "Verify Your Mobile Number" : "Enter Mobile Number"}
                </h1>
                <p className="text-xs text-carbon-500 leading-relaxed">
                  {otpSent ? `Enter the 6-digit OTP sent via SMS to +91 ${phone}` : "We will send an SMS OTP to link your profile securely."}
                </p>
              </div>

              {!otpSent ? (
                <form onSubmit={handleSendOtp} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-carbon-700 uppercase tracking-wide">Mobile Number</label>
                    <div className="flex bg-warm-white border border-forest-200 focus-within:border-forest-600 focus-within:ring-2 focus-within:ring-forest-100 rounded-2xl p-3 items-center transition-all shadow-inner">
                      <div className="flex items-center gap-1.5 pr-2.5 border-r border-forest-200 mr-2.5 text-xs font-bold text-carbon-700">
                        <span>+91</span>
                      </div>
                      <input 
                        type="tel" 
                        placeholder="98480 22334" 
                        value={phone}
                        onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                        className="w-full text-sm font-semibold bg-transparent border-none outline-none focus:ring-0 text-carbon-900" 
                        autoFocus
                        required 
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-carbon-700 uppercase tracking-wide">Preferred Language</label>
                    <select 
                      value={currentLang} 
                      onChange={e => changeLanguage(e.target.value)}
                      className="w-full bg-warm-white border border-forest-200 rounded-2xl p-3 text-xs font-semibold focus:ring-2 focus:ring-forest-100 focus:border-forest-600 shadow-inner cursor-pointer"
                    >
                      <option value="en">English</option>
                      <option value="hi">हिन्दी (Hindi)</option>
                      <option value="te">తెలుగు (Telugu)</option>
                    </select>
                  </div>

                  <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full bg-forest-800 hover:bg-forest-900 text-white text-xs font-bold font-poppins py-4 rounded-2xl shadow-lg hover:shadow-premium transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
                  >
                    {loading ? <Loader2 size={16} className="animate-spin" /> : (
                      <>
                        <span>Send OTP Verification Code</span>
                        <ArrowRight size={14} />
                      </>
                    )}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp} className="space-y-5">
                  {devOtp && (
                    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 text-xs text-amber-900 flex justify-between items-center gap-2">
                      <div>
                        <span className="font-semibold block text-[11px]">Testing OTP Available:</span>
                        <span className="font-mono font-black text-sm tracking-wider text-amber-800">{devOtp}</span>
                      </div>
                      <button 
                        type="button" 
                        onClick={handleAutofillDevOtp}
                        className="bg-amber-200/80 hover:bg-amber-300 text-amber-900 px-3 py-1.5 rounded-xl text-[11px] font-bold transition-colors cursor-pointer"
                      >
                        Autofill OTP
                      </button>
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-bold text-carbon-700 uppercase tracking-wide">Enter 6-Digit OTP</label>
                      <button 
                        type="button" 
                        className="text-[11px] font-bold text-forest-700 hover:underline" 
                        onClick={() => { setOtpSent(false); setDevOtp(''); setOtp(''); }}
                      >
                        Change Number
                      </button>
                    </div>

                    <input 
                      type="text" 
                      placeholder="••••••" 
                      maxLength={6} 
                      value={otp}
                      onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                      className="w-full bg-warm-white border border-forest-200 focus:border-forest-600 focus:ring-2 focus:ring-forest-100 rounded-2xl p-3.5 text-center text-lg font-mono font-bold tracking-[0.4em] text-carbon-900 shadow-inner" 
                      autoFocus
                      required 
                    />
                  </div>

                  <div className="flex justify-between items-center text-xs">
                    <span className="text-carbon-400">Didn't receive code?</span>
                    <button 
                      type="button" 
                      disabled={resendTimer > 0 || loading} 
                      onClick={handleSendOtp}
                      className="font-bold text-forest-800 hover:underline disabled:text-carbon-400 cursor-pointer disabled:cursor-not-allowed"
                    >
                      {resendTimer > 0 ? `Resend in ${resendTimer}s` : "Resend OTP"}
                    </button>
                  </div>

                  <button 
                    type="submit" 
                    className="w-full bg-forest-800 hover:bg-forest-900 text-white text-xs font-bold font-poppins py-4 rounded-2xl shadow-lg hover:shadow-premium transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Verify & Continue to Profile</span>
                    <ArrowRight size={14} />
                  </button>
                </form>
              )}
            </div>
          )}

          {/* STEP 2: Profile & Land Details */}
          {step === 2 && (
            <form onSubmit={handleBasicDetails} className="space-y-5">
              <div className="space-y-1">
                <div className="w-10 h-10 bg-forest-50 text-forest-700 rounded-2xl flex items-center justify-center mb-2 border border-forest-100">
                  <User size={20} />
                </div>
                <h1 className="text-xl font-bold font-manrope text-carbon-900">Profile & Location Details</h1>
                <p className="text-xs text-carbon-500 leading-relaxed">
                  Enter your details as recorded in your land records.
                </p>
              </div>

              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-carbon-700 uppercase tracking-wide">
                  Full Name (as on Land Records)
                </label>
                <input 
                  type="text" 
                  placeholder="e.g. Ramesh Kumar" 
                  value={name} 
                  onChange={e => setName(e.target.value)}
                  className="w-full bg-warm-white border border-forest-200 focus:border-forest-600 focus:ring-2 focus:ring-forest-100 rounded-2xl p-3 text-xs font-semibold shadow-inner" 
                  required 
                />
              </div>

              {/* Aadhaar Number with Instant Validation */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-carbon-700 uppercase tracking-wide">
                    12-Digit Aadhaar Number
                  </label>
                  {aadhaar.replace(/\D/g, '').length === 12 && (
                    <span className={`text-[10px] font-bold flex items-center gap-1 ${isAadhaarValid ? 'text-emerald-700' : 'text-rose-600'}`}>
                      {isAadhaarValid ? <><Check size={12} /> Valid Aadhaar</> : <><AlertCircle size={12} /> Invalid Checksum</>}
                    </span>
                  )}
                </div>
                <div className="relative">
                  <input 
                    type="text" 
                    placeholder="XXXX XXXX XXXX" 
                    maxLength={14}
                    value={aadhaar}
                    onChange={e => {
                      const raw = e.target.value.replace(/\D/g, '').slice(0, 12);
                      const formatted = raw.replace(/(\d{4})(?=\d)/g, '$1 ');
                      setAadhaar(formatted);
                    }}
                    className="w-full bg-warm-white border border-forest-200 focus:border-forest-600 focus:ring-2 focus:ring-forest-100 rounded-2xl p-3 text-xs font-mono font-bold tracking-wider pr-10 shadow-inner" 
                    required 
                  />
                  <ShieldCheck size={18} className={`absolute right-3 top-3.5 ${isAadhaarValid ? 'text-emerald-600' : 'text-carbon-400'}`} />
                </div>
                <p className="text-[10px] text-carbon-400">Used strictly for land deed owner matching. Never shared with third parties.</p>
              </div>

              {/* Location: State, District, Village */}
              <div className="space-y-3 pt-1 border-t border-forest-50">
                <p className="text-xs font-bold text-carbon-800">Location</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-carbon-600">State</label>
                    <input 
                      type="text" 
                      value={state} 
                      onChange={e => setState(e.target.value)}
                      className="w-full bg-warm-white border border-forest-200 focus:border-forest-600 rounded-2xl p-2.5 text-xs font-semibold shadow-inner" 
                      required 
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-carbon-600">District</label>
                    <input 
                      type="text" 
                      value={district} 
                      onChange={e => setDistrict(e.target.value)}
                      className="w-full bg-warm-white border border-forest-200 focus:border-forest-600 rounded-2xl p-2.5 text-xs font-semibold shadow-inner" 
                      required 
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-carbon-600">Village</label>
                  <input 
                    type="text" 
                    value={village} 
                    onChange={e => setVillage(e.target.value)}
                    className="w-full bg-warm-white border border-forest-200 focus:border-forest-600 rounded-2xl p-2.5 text-xs font-semibold shadow-inner" 
                    required 
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button 
                  type="button" 
                  onClick={() => setStep(1)}
                  className="px-5 py-4 border border-forest-200 text-carbon-700 hover:bg-forest-50 rounded-2xl text-xs font-bold transition-all"
                >
                  Back
                </button>
                <button 
                  type="submit" 
                  className="flex-1 bg-forest-800 hover:bg-forest-900 text-white text-xs font-bold font-poppins py-4 rounded-2xl shadow-lg hover:shadow-premium transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Continue to UPI Setup</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </form>
          )}

          {/* STEP 3: UPI Direct Payout Account */}
          {step === 3 && (
            <form onSubmit={handleBankDetails} className="space-y-6">
              <div className="space-y-1">
                <div className="w-10 h-10 bg-forest-50 text-forest-700 rounded-2xl flex items-center justify-center mb-2 border border-forest-100">
                  <Landmark size={20} />
                </div>
                <h1 className="text-xl font-bold font-manrope text-carbon-900">UPI Payment Setup</h1>
                <p className="text-xs text-carbon-500 leading-relaxed">
                  {selectedRole === 'farmer' 
                    ? "When corporate buyers buy your verified carbon credits, payments are credited straight to your bank via UPI."
                    : "Link your UPI ID for receiving payments and transactions on CarbonX."
                  }
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-carbon-700 uppercase tracking-wide">Your UPI ID (VPA)</label>
                <div className="relative">
                  <input 
                    type="text" 
                    placeholder="e.g. 9848022334@upi or name@oksbi" 
                    value={upi} 
                    onChange={e => setUpi(e.target.value)}
                    className="w-full bg-warm-white border border-forest-200 focus:border-forest-600 focus:ring-2 focus:ring-forest-100 rounded-2xl p-3.5 text-xs font-semibold pr-10 shadow-inner" 
                    autoFocus
                    required 
                  />
                  <Landmark size={18} className="absolute right-3.5 top-3.5 text-forest-600" />
                </div>
                <p className="text-[10px] text-carbon-400">Accepted formats: Google Pay, PhonePe, Paytm, BHIM, or any bank UPI handle.</p>
              </div>

              {/* Instant settlement explanation card */}
              {selectedRole === 'farmer' && (
                <div className="p-4 bg-emerald-50/70 border border-emerald-200/70 rounded-2xl text-xs text-emerald-900 space-y-2">
                  <p className="font-bold flex items-center gap-1.5 text-emerald-950">
                    <CheckCircle2 size={16} className="text-emerald-700 shrink-0" />
                    Zero Commission Direct Settlements:
                  </p>
                  <p className="text-[11px] text-emerald-800 leading-relaxed">
                    CarbonX operates with zero middleman deductions. 100% of the agreed corporate credit sale price will be transferred to your linked bank account.
                  </p>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button 
                  type="button" 
                  onClick={() => setStep(2)}
                  className="px-5 py-4 border border-forest-200 text-carbon-700 hover:bg-forest-50 rounded-2xl text-xs font-bold transition-all"
                >
                  Back
                </button>
                <button 
                  type="submit" 
                  disabled={loading}
                  className="flex-1 bg-forest-800 hover:bg-forest-900 text-white text-xs font-bold font-poppins py-4 rounded-2xl shadow-lg hover:shadow-premium transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
                >
                  {loading ? (
                    <><Loader2 size={16} className="animate-spin" /> Creating Account...</>
                  ) : (
                    <>
                      <span>Complete Registration</span>
                      <ArrowRight size={14} />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* Already registered prompt */}
          <div className="pt-4 border-t border-forest-50 text-center space-y-1.5">
            <p className="text-xs text-carbon-500">Already have a registered CarbonX account?</p>
            <button 
              type="button" 
              onClick={() => navigate('/farmer-login')}
              className="text-xs font-bold text-forest-800 hover:underline"
            >
              Sign In to Your Account
            </button>
          </div>

        </div>

        {/* Support Help */}
        <div className="mt-8 text-center text-xs text-carbon-500 space-y-1">
          <p>Need assistance with your land records? Call our farmer helpline at <strong>1800-420-2026</strong> (Toll-Free).</p>
        </div>

      </main>

      {/* Footer */}
      <footer className="py-4 px-6 text-center text-xs text-carbon-400 border-t border-forest-100/60 bg-white/60 backdrop-blur-sm">
        256-Bit SSL Encrypted Public Infrastructure
      </footer>

    </div>
  );
}
