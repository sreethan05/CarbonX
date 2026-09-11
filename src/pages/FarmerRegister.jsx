import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft, ArrowRight, CheckCircle2, Loader2, Phone, User, Globe, LogIn
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { sendOtp, verifyRegistrationOtp, registerUser } from '../services/api';

const isValidAadhaar = (value) => {
  const number = value.replace(/\D/g, '');
  if (number.length !== 12) return false;
  const multiplication = [
    [0,1,2,3,4,5,6,7,8,9],[1,2,3,4,0,6,7,8,9,5],
    [2,3,4,0,1,7,8,9,5,6],[3,4,0,1,2,8,9,5,6,7],
    [4,0,1,2,3,9,5,6,7,8],[5,9,8,7,6,0,4,3,2,1],
    [6,5,9,8,7,1,0,4,3,2],[7,6,5,9,8,2,1,0,4,3],
    [8,7,6,5,9,3,2,1,0,4],[9,8,7,6,5,4,3,2,1,0],
  ];
  const permutation = [
    [0,1,2,3,4,5,6,7,8,9],[1,5,7,6,2,8,3,0,9,4],
    [5,8,0,3,7,9,6,1,4,2],[8,9,1,6,0,4,3,5,2,7],
    [9,4,5,3,1,2,6,8,7,0],[4,2,8,6,5,7,3,9,0,1],
    [2,7,9,3,8,0,6,4,1,5],[7,0,4,6,9,1,3,2,5,8],
  ];
  return number.split('').reverse().reduce(
    (checksum, digit, index) => multiplication[checksum][permutation[index % 8][Number(digit)]], 0
  ) === 0;
};

export default function FarmerRegister() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const selectedRole = searchParams.get('role') || 'farmer';
  const { changeLanguage, currentLang } = useLanguage();
  const { login } = useAuth();

  const [step, setStep] = useState(1);
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpVerificationToken, setOtpVerificationToken] = useState('');
  const [devOtp, setDevOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [name, setName] = useState('');
  const [aadhaar, setAadhaar] = useState('');
  const [state, setState] = useState('Telangana');
  const [district, setDistrict] = useState('');
  const [village, setVillage] = useState('');
  const [upiId, setUpiId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const roleLabel = { farmer: 'Farmer', buyer: 'Corporate Buyer', verifier: 'Verifier / Govt', admin: 'Admin' }[selectedRole];

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError('');
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length !== 10) return setError('Enter a valid 10-digit mobile number');
    setLoading(true);
    try {
      const res = await sendOtp(cleanPhone);
      if (res.success) {
        setOtp('');
        setOtpVerificationToken('');
        setDevOtp(res.dev_otp || '');
        setOtpSent(true);
      } else {
        setError(res.message || 'Failed to send OTP');
      }
    } catch {
      setError('Could not reach server. Ensure backend is running.');
    }
    setLoading(false);
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    if (otp.length !== 6) return setError('Enter the complete 6-digit OTP');
    setLoading(true);
    try {
      const res = await verifyRegistrationOtp(phone.replace(/\D/g, ''), otp);
      if (!res.success) {
        setError(res.message || 'Invalid or expired OTP');
        return;
      }
      if (!res.verification_token) {
        setError('OTP verification did not complete. Please request a new OTP.');
        return;
      }
      setOtpVerificationToken(res.verification_token);
      setStep(2);
    } catch {
      setError('Could not verify OTP. Ensure backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleAadhaar = (e) => {
    e.preventDefault();
    setError('');
    if (!name.trim()) return setError('Enter your full name');
    if (!isValidAadhaar(aadhaar)) return setError('Invalid Aadhaar number (failed Verhoeff checksum)');
    setStep(3);
  };

  const handleBank = async (e) => {
    e.preventDefault();
    setError('');
    if (!upiId.trim()) return setError('Enter your UPI ID');
    setLoading(true);
    try {
      const res = await registerUser({
        phone: phone.replace(/\D/g, ''),
        otp,
        otp_verification_token: otpVerificationToken,
        name,
        aadhaar,
        state,
        district,
        village,
        upi: upiId,
        role: selectedRole,
        preferred_language: currentLang,
      });
      if (res.success) {
        await login(res.token, res.user);
        setStep(4);
      } else {
        setError(res.message || 'Registration failed');
      }
    } catch {
      setError('Could not reach server. Ensure backend is running.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] flex flex-col font-inter text-carbon-800">
      <header className="py-3.5 px-4 bg-white/90 backdrop-blur-md sticky top-0 z-30 border-b border-forest-100/60 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/')} className="p-2 hover:bg-forest-50 rounded-xl text-carbon-700">
            <ArrowLeft size={16} />
          </button>
          <span className="font-manrope font-extrabold text-lg text-forest-800 cursor-pointer" onClick={() => navigate('/')}>CarbonX</span>
          <span className="text-[10px] bg-forest-50 text-forest-700 px-2 py-0.5 rounded-lg font-bold uppercase">{roleLabel}</span>
        </div>
        <div className="flex items-center gap-1.5 bg-forest-50/80 border border-forest-100 rounded-xl px-2.5 py-1 text-xs font-semibold">
          <Globe size={13} className="text-forest-700" />
          <select value={currentLang} onChange={(e) => changeLanguage(e.target.value)} className="bg-transparent border-none outline-none text-xs font-bold text-forest-900 cursor-pointer">
            <option value="en">English</option>
            <option value="hi">हिन्दी</option>
            <option value="te">తెలుగు</option>
          </select>
        </div>
      </header>

      <main className="flex-1 max-w-md mx-auto w-full px-4 py-8 flex flex-col justify-center">
        <div className="bg-forest-100/70 p-1 rounded-2xl flex gap-1 mb-6 border border-forest-200/50">
          <button type="button" onClick={() => navigate('/farmer-login')} className="flex-1 py-2.5 rounded-xl text-xs font-semibold transition-all text-carbon-500 hover:text-forest-900 hover:bg-white/50">Sign In</button>
          <button type="button" className="flex-1 py-2.5 rounded-xl text-xs font-bold transition-all bg-white text-forest-900 shadow-sm">Register New Account</button>
        </div>

        <div className="flex items-center gap-1.5 mb-6">
          {[1,2,3,4].map(s => (
            <div key={s} className={`h-1.5 rounded-full transition-all ${step >= s ? 'flex-1 bg-forest-600' : 'w-1.5 bg-forest-200'}`} />
          ))}
        </div>

        {error && <div className="bg-rose-50 border border-rose-200 rounded-2xl px-4 py-3 text-xs text-rose-700 mb-4 flex items-start gap-2"><span className="font-bold">!</span><span>{error}</span></div>}

        {step === 1 && (
          <div className="bg-white border border-forest-100 rounded-3xl p-6 shadow-card space-y-5">
            <div>
              <div className="w-11 h-11 bg-forest-50 text-forest-700 rounded-2xl flex items-center justify-center mb-3 border border-forest-100"><Phone size={22} /></div>
              <h1 className="text-xl font-extrabold font-manrope text-carbon-900">Verify Mobile</h1>
              <p className="text-xs text-carbon-500 mt-1">Enter your mobile number to receive a secure OTP.</p>
            </div>
            {!otpSent ? (
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div className="flex bg-warm-white border border-forest-200 focus-within:border-forest-600 focus-within:ring-2 focus-within:ring-forest-100 rounded-2xl p-3 items-center">
                  <span className="pr-2.5 border-r border-forest-200 mr-2.5 text-xs font-bold text-carbon-700">+91</span>
                  <input type="tel" placeholder="98480 22334" value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g,'').slice(0,10))} className="w-full text-sm font-semibold bg-transparent border-none outline-none text-carbon-900" autoFocus required />
                </div>
                <button type="submit" disabled={loading} className="w-full bg-forest-800 text-white text-xs font-bold py-4 rounded-2xl flex items-center justify-center gap-2 disabled:opacity-60">
                  {loading ? <Loader2 size={16} className="animate-spin" /> : <><span>Send OTP</span><ArrowRight size={14} /></>}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                {devOtp && <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 text-xs text-amber-900 flex justify-between items-center"><span>Testing OTP: <strong className="font-mono">{devOtp}</strong></span><button type="button" onClick={() => setOtp(devOtp)} className="bg-amber-200 px-2 py-1 rounded-lg font-bold text-[10px]">Autofill</button></div>}
                <input type="text" placeholder="------" maxLength={6} value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g,''))} className="w-full bg-warm-white border border-forest-200 rounded-2xl p-3.5 text-center text-lg font-mono font-bold tracking-[0.4em]" autoFocus required />
                <button type="submit" className="w-full bg-forest-800 text-white text-xs font-bold py-4 rounded-2xl flex items-center justify-center gap-2">Verify & Continue <ArrowRight size={14} /></button>
              </form>
            )}

            <div className="pt-3 border-t border-forest-50 text-center">
              <p className="text-xs text-carbon-500">
                Already have an account?{' '}
                <button type="button" onClick={() => navigate('/farmer-login')} className="text-forest-700 font-bold hover:underline">
                  Sign in here
                </button>
              </p>
            </div>
          </div>
        )}

        {step === 2 && (
          <form onSubmit={handleAadhaar} className="bg-white border border-forest-100 rounded-3xl p-6 shadow-card space-y-5">
            <div>
              <div className="w-11 h-11 bg-forest-50 text-forest-700 rounded-2xl flex items-center justify-center mb-3 border border-forest-100"><User size={22} /></div>
              <h1 className="text-xl font-extrabold font-manrope text-carbon-900">Identity & Address</h1>
              <p className="text-xs text-carbon-500 mt-1">Enter your Aadhaar and farm location details.</p>
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-carbon-400 block mb-1.5">Full Name (as in Aadhaar)</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full p-3 bg-forest-50 border border-forest-100 rounded-xl text-sm font-semibold focus:outline-none focus:border-forest-600 focus:bg-white" required />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-carbon-400 block mb-1.5">Aadhaar Number (12 digits)</label>
              <input type="text" value={aadhaar} onChange={e => setAadhaar(e.target.value.replace(/\D/g,'').slice(0,12))} placeholder="XXXX XXXX XXXX" className="w-full p-3 bg-forest-50 border border-forest-100 rounded-xl text-sm font-mono font-semibold tracking-wider focus:outline-none focus:border-forest-600 focus:bg-white" required />
              <p className="text-[9px] text-carbon-400 mt-1">Validated with Verhoeff checksum algorithm.</p>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-[10px] font-bold uppercase text-carbon-400 block mb-1">State</label>
                <select value={state} onChange={e => setState(e.target.value)} className="w-full p-2.5 bg-forest-50 border border-forest-100 rounded-xl text-xs font-semibold cursor-pointer">
                  <option>Telangana</option><option>Andhra Pradesh</option><option>Karnataka</option><option>Maharashtra</option><option>Tamil Nadu</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase text-carbon-400 block mb-1">District</label>
                <input type="text" value={district} onChange={e => setDistrict(e.target.value)} className="w-full p-2.5 bg-forest-50 border border-forest-100 rounded-xl text-xs font-semibold focus:outline-none focus:border-forest-600" />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase text-carbon-400 block mb-1">Village</label>
                <input type="text" value={village} onChange={e => setVillage(e.target.value)} className="w-full p-2.5 bg-forest-50 border border-forest-100 rounded-xl text-xs font-semibold focus:outline-none focus:border-forest-600" />
              </div>
            </div>
            <button type="submit" className="w-full bg-forest-800 text-white text-xs font-bold py-4 rounded-2xl flex items-center justify-center gap-2">Continue <ArrowRight size={14} /></button>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={handleBank} className="bg-white border border-forest-100 rounded-3xl p-6 shadow-card space-y-5">
            <div>
              <div className="w-11 h-11 bg-forest-50 text-forest-700 rounded-2xl flex items-center justify-center mb-3 border border-forest-100"><LogIn size={22} /></div>
              <h1 className="text-xl font-extrabold font-manrope text-carbon-900">UPI Payout Setup</h1>
              <p className="text-xs text-carbon-500 mt-1">Link your UPI ID for instant carbon credit payouts.</p>
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-carbon-400 block mb-1.5">UPI ID / VPA</label>
              <input type="text" value={upiId} onChange={e => setUpiId(e.target.value)} placeholder="yourname@oksbi" className="w-full p-3 bg-forest-50 border border-forest-100 rounded-xl text-sm font-semibold focus:outline-none focus:border-forest-600 focus:bg-white" required />
              <p className="text-[9px] text-carbon-400 mt-1">Funds will be sent here when buyers purchase your credits.</p>
            </div>
            <button type="submit" disabled={loading} className="w-full bg-forest-800 text-white text-xs font-bold py-4 rounded-2xl flex items-center justify-center gap-2 disabled:opacity-60">
              {loading ? <Loader2 size={16} className="animate-spin" /> : <><span>Complete Registration</span><ArrowRight size={14} /></>}
            </button>
          </form>
        )}

        {step === 4 && (
          <div className="bg-white border border-forest-100 rounded-3xl p-8 shadow-card text-center space-y-5">
            <div className="w-16 h-16 bg-forest-100 rounded-full flex items-center justify-center mx-auto"><CheckCircle2 size={36} className="text-forest-700" /></div>
            <div>
              <h1 className="text-xl font-extrabold font-manrope text-carbon-900">Profile Verified!</h1>
              <p className="text-xs text-carbon-500 mt-2">Your account is ready. You can now map your farm and start earning carbon credits.</p>
            </div>
            <button onClick={() => navigate('/dashboard')} className="w-full bg-forest-800 text-white text-xs font-bold py-4 rounded-2xl flex items-center justify-center gap-2">
              Go to Dashboard <ArrowRight size={14} />
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
