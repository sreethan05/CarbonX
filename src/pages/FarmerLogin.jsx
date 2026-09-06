import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Globe, HelpCircle, Loader2, Phone, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { sendLoginOtp, loginUser } from '../services/api';

export default function FarmerLogin() {
  const navigate = useNavigate();
  const { t, changeLanguage, currentLang } = useLanguage();
  const { login } = useAuth();

  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [devOtp, setDevOtp] = useState('');
  const [resendTimer, setResendTimer] = useState(0);

  const startResendTimer = () => {
    setResendTimer(30);
    const iv = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) { clearInterval(iv); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError('');
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length !== 10) return setError(t('invalidPhone') || 'Enter a valid 10-digit mobile number');
    setLoading(true);
    try {
      const res = await sendLoginOtp(cleanPhone);
      if (res.success) {
        setDevOtp(res.dev_otp || '');
        setOtpSent(true);
        startResendTimer();
      } else {
        setError(res.message || t('otpFailed') || 'Failed to send OTP');
      }
    } catch {
      setError(t('backendDown') || 'Could not reach server. Please ensure backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    if (otp.length < 4) return setError(t('enterOtp') || 'Enter the complete OTP code');
    setLoading(true);
    try {
      const cleanPhone = phone.replace(/\D/g, '');
      const res = await loginUser(cleanPhone, otp);
      if (res.success) {
        await login(res.token, res.user);
        if (res.user?.preferred_language) changeLanguage(res.user.preferred_language);
        navigate('/dashboard');
      } else {
        setError(res.message || t('serverError') || 'Invalid OTP or login failed');
      }
    } catch {
      setError(t('serverError') || 'Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] flex flex-col justify-between font-inter text-carbon-800">
      <header className="py-3.5 px-4 md:px-8 bg-white/90 backdrop-blur-md sticky top-0 z-30 border-b border-forest-100/60 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => navigate('/')} className="p-2 hover:bg-forest-50 rounded-xl text-carbon-700 transition-colors flex items-center gap-1.5 text-xs font-semibold">
            <ArrowLeft size={16} />
            <span className="hidden sm:inline">Back to Home</span>
          </button>
          <span className="font-manrope font-extrabold text-lg text-forest-800 tracking-tight cursor-pointer" onClick={() => navigate('/')}>CarbonX</span>
        </div>
        <div className="flex items-center gap-1.5 bg-forest-50/80 border border-forest-100 rounded-xl px-2.5 py-1 text-xs text-forest-900 font-semibold">
          <Globe size={13} className="text-forest-700" />
          <select value={currentLang} onChange={(e) => changeLanguage(e.target.value)} className="bg-transparent border-none outline-none text-xs font-bold text-forest-900 focus:ring-0 cursor-pointer">
            <option value="en">English</option>
            <option value="hi">हिन्दी</option>
            <option value="te">తెలుగు</option>
          </select>
        </div>
      </header>

      <main className="flex-1 max-w-md mx-auto w-full px-4 py-8 md:py-12 flex flex-col justify-center">
        <div className="bg-forest-100/70 p-1 rounded-2xl flex gap-1 mb-6 border border-forest-200/50">
          <button type="button" className="flex-1 py-2.5 rounded-xl text-xs font-bold transition-all bg-white text-forest-900 shadow-sm">Sign In</button>
          <button type="button" onClick={() => navigate('/farmer-register')} className="flex-1 py-2.5 rounded-xl text-xs font-semibold transition-all text-carbon-500 hover:text-forest-900 hover:bg-white/50">Register New Account</button>
        </div>

        <div className="bg-white border border-forest-100 rounded-3xl p-6 sm:p-8 shadow-card space-y-6">
          <div className="space-y-1.5">
            <div className="w-11 h-11 bg-forest-50 text-forest-700 rounded-2xl flex items-center justify-center mb-3 border border-forest-100">
              <Phone size={22} />
            </div>
            <h1 className="text-2xl font-extrabold font-manrope text-carbon-900 tracking-tight">{t('loginWelcome') || 'Welcome Back'}</h1>
            <p className="text-xs text-carbon-500 leading-relaxed">{t('loginDesc') || 'Enter your registered mobile number to access your dashboard.'}</p>
          </div>

          {error && (
            <div className="bg-rose-50 border border-rose-200 rounded-2xl px-4 py-3 text-xs text-rose-700 flex items-start gap-2">
              <span className="font-bold">!</span><span>{error}</span>
            </div>
          )}

          {!otpSent ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-carbon-700 uppercase tracking-wide">{t('registeredPhone') || 'Registered Mobile Number'}</label>
                <div className="flex bg-warm-white border border-forest-200 focus-within:border-forest-600 focus-within:ring-2 focus-within:ring-forest-100 rounded-2xl p-3 items-center transition-all">
                  <div className="flex items-center gap-1.5 pr-2.5 border-r border-forest-200 mr-2.5 text-xs font-bold text-carbon-700">
                    <span>+91</span>
                  </div>
                  <input type="tel" placeholder="98480 22334" value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    className="w-full text-sm font-semibold bg-transparent border-none outline-none focus:ring-0 text-carbon-900 placeholder:text-carbon-300" autoFocus required />
                </div>
                <p className="text-[10px] text-carbon-400">We will send a 6-digit OTP to verify your identity.</p>
              </div>
              <button type="submit" disabled={loading}
                className="w-full bg-forest-800 hover:bg-forest-900 text-white text-xs font-bold py-4 rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer">
                {loading ? <Loader2 size={16} className="animate-spin" /> : <><span>{t('sendOtp') || 'Send Verification OTP'}</span><ArrowRight size={14} /></>}
              </button>
            </form>
          ) : (
            <form onSubmit={handleLogin} className="space-y-5">
              {devOtp ? (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 text-xs text-amber-900 flex justify-between items-center gap-2">
                  <div>
                    <span className="font-semibold block text-[11px]">Testing OTP:</span>
                    <span className="font-mono font-black text-sm tracking-wider text-amber-800">{devOtp}</span>
                  </div>
                  <button type="button" onClick={() => setOtp(devOtp)}
                    className="bg-amber-200/80 hover:bg-amber-300 text-amber-900 px-3 py-1.5 rounded-xl text-[11px] font-bold transition-colors cursor-pointer">Autofill</button>
                </div>
              ) : (
                <div className="bg-forest-50 border border-forest-200 rounded-2xl p-3 text-xs text-forest-800 flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-forest-600 shrink-0" />
                  <span>OTP sent to <strong>+91 {phone}</strong></span>
                </div>
              )}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-carbon-700 uppercase tracking-wide">{t('enterOtp') || 'Enter 6-Digit OTP'}</label>
                  <button type="button" className="text-[11px] font-bold text-forest-700 hover:underline cursor-pointer"
                    onClick={() => { setOtpSent(false); setDevOtp(''); setOtp(''); }}>Change Number</button>
                </div>
                <input type="text" placeholder="------" maxLength={6} value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  className="w-full bg-warm-white border border-forest-200 focus:border-forest-600 focus:ring-2 focus:ring-forest-100 rounded-2xl p-3.5 text-center text-lg font-mono font-bold tracking-[0.4em] text-carbon-900" autoFocus required />
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-carbon-400">Didn't receive the code?</span>
                <button type="button" disabled={resendTimer > 0 || loading} onClick={handleSendOtp}
                  className="font-bold text-forest-800 hover:underline disabled:text-carbon-400 cursor-pointer disabled:cursor-not-allowed">
                  {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend OTP'}
                </button>
              </div>
              <button type="submit" disabled={loading}
                className="w-full bg-forest-800 hover:bg-forest-900 text-white text-xs font-bold py-4 rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer">
                {loading ? <Loader2 size={16} className="animate-spin" /> : <><span>Verify & Enter Dashboard</span><ArrowRight size={14} /></>}
              </button>
            </form>
          )}

          <div className="pt-4 border-t border-forest-50 text-center space-y-2">
            <p className="text-xs text-carbon-500">New to CarbonX?</p>
            <button type="button" onClick={() => navigate('/role-selection')}
              className="w-full py-3 bg-forest-50 hover:bg-forest-100 text-forest-800 border border-forest-100 rounded-2xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer">
              <span>Choose Your Role & Register</span><ArrowRight size={13} />
            </button>
          </div>
        </div>

        <div className="mt-8 text-center">
          <div className="flex justify-center items-center gap-4 text-[11px] text-carbon-500 font-medium">
            <span>256-bit Encrypted</span><span>·</span><span>DPI Compliant</span><span>·</span><span>UPI Payouts</span>
          </div>
        </div>
      </main>

      <footer className="py-4 px-6 text-center text-xs text-carbon-400 border-t border-forest-100/60 bg-white/60 flex flex-col sm:flex-row justify-center items-center gap-2 sm:gap-4">
        <span>Helpline: <strong>1800-420-2026</strong> (Toll-Free)</span>
        <span className="hidden sm:inline">·</span>
        <button onClick={() => navigate('/support')} className="text-forest-700 hover:underline flex items-center gap-1 font-semibold">
          <HelpCircle size={13} /> Need help?
        </button>
      </footer>
    </div>
  );
}
